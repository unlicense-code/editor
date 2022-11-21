/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as assert from 'assert';
import { Position } from 'vs/editor/common/core/position';
import { MirrorTextModel } from 'vs/editor/common/model/mirrorTextModel';
import { createTextModel } from 'vs/editor/test/common/testTextModel';
export function testApplyEditsWithSyncedModels(original, edits, expected, inputEditsAreInvalid = false) {
    const originalStr = original.join('\n');
    const expectedStr = expected.join('\n');
    assertSyncedModels(originalStr, (model, assertMirrorModels) => {
        // Apply edits & collect inverse edits
        const inverseEdits = model.applyEdits(edits, true);
        // Assert edits produced expected result
        assert.deepStrictEqual(model.getValue(1 /* EndOfLinePreference.LF */), expectedStr);
        assertMirrorModels();
        // Apply the inverse edits
        const inverseInverseEdits = model.applyEdits(inverseEdits, true);
        // Assert the inverse edits brought back model to original state
        assert.deepStrictEqual(model.getValue(1 /* EndOfLinePreference.LF */), originalStr);
        if (!inputEditsAreInvalid) {
            const simplifyEdit = (edit) => {
                return {
                    range: edit.range,
                    text: edit.text,
                    forceMoveMarkers: edit.forceMoveMarkers || false
                };
            };
            // Assert the inverse of the inverse edits are the original edits
            assert.deepStrictEqual(inverseInverseEdits.map(simplifyEdit), edits.map(simplifyEdit));
        }
        assertMirrorModels();
    });
}
var AssertDocumentLineMappingDirection;
(function (AssertDocumentLineMappingDirection) {
    AssertDocumentLineMappingDirection[AssertDocumentLineMappingDirection["OffsetToPosition"] = 0] = "OffsetToPosition";
    AssertDocumentLineMappingDirection[AssertDocumentLineMappingDirection["PositionToOffset"] = 1] = "PositionToOffset";
})(AssertDocumentLineMappingDirection || (AssertDocumentLineMappingDirection = {}));
function assertOneDirectionLineMapping(model, direction, msg) {
    const allText = model.getValue();
    let line = 1, column = 1, previousIsCarriageReturn = false;
    for (let offset = 0; offset <= allText.length; offset++) {
        // The position coordinate system cannot express the position between \r and \n
        const position = new Position(line, column + (previousIsCarriageReturn ? -1 : 0));
        if (direction === 0 /* AssertDocumentLineMappingDirection.OffsetToPosition */) {
            const actualPosition = model.getPositionAt(offset);
            assert.strictEqual(actualPosition.toString(), position.toString(), msg + ' - getPositionAt mismatch for offset ' + offset);
        }
        else {
            // The position coordinate system cannot express the position between \r and \n
            const expectedOffset = offset + (previousIsCarriageReturn ? -1 : 0);
            const actualOffset = model.getOffsetAt(position);
            assert.strictEqual(actualOffset, expectedOffset, msg + ' - getOffsetAt mismatch for position ' + position.toString());
        }
        if (allText.charAt(offset) === '\n') {
            line++;
            column = 1;
        }
        else {
            column++;
        }
        previousIsCarriageReturn = (allText.charAt(offset) === '\r');
    }
}
function assertLineMapping(model, msg) {
    assertOneDirectionLineMapping(model, 1 /* AssertDocumentLineMappingDirection.PositionToOffset */, msg);
    assertOneDirectionLineMapping(model, 0 /* AssertDocumentLineMappingDirection.OffsetToPosition */, msg);
}
export function assertSyncedModels(text, callback, setup = null) {
    const model = createTextModel(text);
    model.setEOL(0 /* EndOfLineSequence.LF */);
    assertLineMapping(model, 'model');
    if (setup) {
        setup(model);
        assertLineMapping(model, 'model');
    }
    const mirrorModel2 = new MirrorTextModel(null, model.getLinesContent(), model.getEOL(), model.getVersionId());
    let mirrorModel2PrevVersionId = model.getVersionId();
    model.onDidChangeContent((e) => {
        const versionId = e.versionId;
        if (versionId < mirrorModel2PrevVersionId) {
            console.warn('Model version id did not advance between edits (2)');
        }
        mirrorModel2PrevVersionId = versionId;
        mirrorModel2.onEvents(e);
    });
    const assertMirrorModels = () => {
        assertLineMapping(model, 'model');
        assert.strictEqual(mirrorModel2.getText(), model.getValue(), 'mirror model 2 text OK');
        assert.strictEqual(mirrorModel2.version, model.getVersionId(), 'mirror model 2 version OK');
    };
    callback(model, assertMirrorModels);
    model.dispose();
    mirrorModel2.dispose();
}

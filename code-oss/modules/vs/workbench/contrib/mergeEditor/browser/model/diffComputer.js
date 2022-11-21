/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { assertFn, checkAdjacentItems } from 'vs/base/common/assert';
import { observableFromEvent } from 'vs/base/common/observable';
import { isDefined } from 'vs/base/common/types';
import { Range } from 'vs/editor/common/core/range';
import { IEditorWorkerService } from 'vs/editor/common/services/editorWorker';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { LineRange } from 'vs/workbench/contrib/mergeEditor/browser/model/lineRange';
import { DetailedLineRangeMapping, RangeMapping } from 'vs/workbench/contrib/mergeEditor/browser/model/mapping';
let MergeDiffComputer = class MergeDiffComputer {
    editorWorkerService;
    configurationService;
    mergeAlgorithm = observableFromEvent(this.configurationService.onDidChangeConfiguration, () => /** @description config: mergeAlgorithm.diffAlgorithm */ this.configurationService.getValue('mergeEditor.diffAlgorithm'));
    constructor(editorWorkerService, configurationService) {
        this.editorWorkerService = editorWorkerService;
        this.configurationService = configurationService;
    }
    async computeDiff(textModel1, textModel2, reader) {
        const diffAlgorithm = this.mergeAlgorithm.read(reader);
        const result = await this.editorWorkerService.computeDiff(textModel1.uri, textModel2.uri, {
            ignoreTrimWhitespace: false,
            maxComputationTimeMs: 0,
        }, diffAlgorithm);
        if (!result) {
            throw new Error('Diff computation failed');
        }
        if (textModel1.isDisposed() || textModel2.isDisposed()) {
            return { diffs: null };
        }
        const changes = result.changes.map(c => new DetailedLineRangeMapping(toLineRange(c.originalRange), textModel1, toLineRange(c.modifiedRange), textModel2, c.innerChanges?.map(ic => normalizeRangeMapping(toRangeMapping(ic), textModel1, textModel2)).filter(isDefined)));
        assertFn(() => {
            return checkAdjacentItems(changes, (m1, m2) => m2.inputRange.startLineNumber - m1.inputRange.endLineNumberExclusive === m2.outputRange.startLineNumber - m1.outputRange.endLineNumberExclusive &&
                // There has to be an unchanged line in between (otherwise both diffs should have been joined)
                m1.inputRange.endLineNumberExclusive < m2.inputRange.startLineNumber &&
                m1.outputRange.endLineNumberExclusive < m2.outputRange.startLineNumber);
        });
        return {
            diffs: changes
        };
    }
};
MergeDiffComputer = __decorate([
    __param(0, IEditorWorkerService),
    __param(1, IConfigurationService)
], MergeDiffComputer);
export { MergeDiffComputer };
export function toLineRange(range) {
    return new LineRange(range.startLineNumber, range.length);
}
export function toRangeMapping(mapping) {
    return new RangeMapping(mapping.originalRange, mapping.modifiedRange);
}
export function normalizeRangeMapping(rangeMapping, inputTextModel, outputTextModel) {
    const inputRangeEmpty = rangeMapping.inputRange.isEmpty();
    const outputRangeEmpty = rangeMapping.outputRange.isEmpty();
    if (inputRangeEmpty && outputRangeEmpty) {
        return undefined;
    }
    if (rangeMapping.inputRange.startLineNumber > inputTextModel.getLineCount()
        || rangeMapping.outputRange.startLineNumber > outputTextModel.getLineCount()) {
        return rangeMapping;
    }
    const originalStartsAtEndOfLine = isAtEndOfLine(rangeMapping.inputRange.startLineNumber, rangeMapping.inputRange.startColumn, inputTextModel);
    const modifiedStartsAtEndOfLine = isAtEndOfLine(rangeMapping.outputRange.startLineNumber, rangeMapping.outputRange.startColumn, outputTextModel);
    if (!inputRangeEmpty && !outputRangeEmpty && originalStartsAtEndOfLine && modifiedStartsAtEndOfLine) {
        // a b c [\n] x y z \n
        // d e f [\n a] \n
        // ->
        // a b c \n [] x y z \n
        // d e f \n [a] \n
        return new RangeMapping(rangeMapping.inputRange.setStartPosition(rangeMapping.inputRange.startLineNumber + 1, 1), rangeMapping.outputRange.setStartPosition(rangeMapping.outputRange.startLineNumber + 1, 1));
    }
    if (modifiedStartsAtEndOfLine &&
        originalStartsAtEndOfLine &&
        ((inputRangeEmpty && rangeEndsAtEndOfLine(rangeMapping.outputRange, outputTextModel)) ||
            (outputRangeEmpty && rangeEndsAtEndOfLine(rangeMapping.inputRange, inputTextModel)))) {
        // o: a b c [] \n x y z \n
        // m: d e f [\n a] \n
        // ->
        // o: a b c \n [] x y z \n
        // m: d e f \n [a \n]
        // or
        // a b c [\n x y z] \n
        // d e f [] \n a \n
        // ->
        // a b c \n [x y z \n]
        // d e f \n [] a \n
        return new RangeMapping(moveRange(rangeMapping.inputRange), moveRange(rangeMapping.outputRange));
    }
    return rangeMapping;
}
function isAtEndOfLine(lineNumber, column, model) {
    return column >= model.getLineMaxColumn(lineNumber);
}
function rangeEndsAtEndOfLine(range, model) {
    return isAtEndOfLine(range.endLineNumber, range.endColumn, model);
}
function moveRange(range) {
    return new Range(range.startLineNumber + 1, 1, range.endLineNumber + 1, 1);
}

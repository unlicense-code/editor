/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as assert from 'assert';
import { instantiateTestCodeEditor, createCodeEditorServices } from 'vs/editor/test/browser/testCodeEditor';
import { instantiateTextModel } from 'vs/editor/test/common/testTextModel';
import { DisposableStore } from 'vs/base/common/lifecycle';
export function testCommand(lines, languageId, selection, commandFactory, expectedLines, expectedSelection, forceTokenization, prepare) {
    const disposables = new DisposableStore();
    const instantiationService = createCodeEditorServices(disposables);
    if (prepare) {
        instantiationService.invokeFunction(prepare, disposables);
    }
    const model = disposables.add(instantiateTextModel(instantiationService, lines.join('\n'), languageId));
    const editor = disposables.add(instantiateTestCodeEditor(instantiationService, model));
    const viewModel = editor.getViewModel();
    if (forceTokenization) {
        model.tokenization.forceTokenization(model.getLineCount());
    }
    viewModel.setSelections('tests', [selection]);
    const command = instantiationService.invokeFunction((accessor) => commandFactory(accessor, viewModel.getSelection()));
    viewModel.executeCommand(command, 'tests');
    assert.deepStrictEqual(model.getLinesContent(), expectedLines);
    const actualSelection = viewModel.getSelection();
    assert.deepStrictEqual(actualSelection.toString(), expectedSelection.toString());
    disposables.dispose();
}
/**
 * Extract edit operations if command `command` were to execute on model `model`
 */
export function getEditOperation(model, command) {
    const operations = [];
    const editOperationBuilder = {
        addEditOperation: (range, text, forceMoveMarkers = false) => {
            operations.push({
                range: range,
                text: text,
                forceMoveMarkers: forceMoveMarkers
            });
        },
        addTrackedEditOperation: (range, text, forceMoveMarkers = false) => {
            operations.push({
                range: range,
                text: text,
                forceMoveMarkers: forceMoveMarkers
            });
        },
        trackSelection: (selection) => {
            return '';
        }
    };
    command.getEditOperations(model, editOperationBuilder);
    return operations;
}

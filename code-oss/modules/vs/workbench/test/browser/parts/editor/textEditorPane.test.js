/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as assert from 'assert';
import { toResource } from 'vs/base/test/common/utils';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { workbenchInstantiationService, TestServiceAccessor, registerTestFileEditor, createEditorPart } from 'vs/workbench/test/browser/workbenchTestServices';
import { IEditorGroupsService } from 'vs/workbench/services/editor/common/editorGroupsService';
import { DisposableStore } from 'vs/base/common/lifecycle';
import { EditorService } from 'vs/workbench/services/editor/browser/editorService';
import { isEditorPaneWithSelection } from 'vs/workbench/common/editor';
import { DeferredPromise } from 'vs/base/common/async';
import { TextEditorPaneSelection } from 'vs/workbench/browser/parts/editor/textEditor';
import { Selection } from 'vs/editor/common/core/selection';
suite('TextEditorPane', () => {
    const disposables = new DisposableStore();
    setup(() => {
        disposables.add(registerTestFileEditor());
    });
    teardown(() => {
        disposables.clear();
    });
    async function createServices() {
        const instantiationService = workbenchInstantiationService(undefined, disposables);
        const part = await createEditorPart(instantiationService, disposables);
        instantiationService.stub(IEditorGroupsService, part);
        const editorService = instantiationService.createInstance(EditorService);
        instantiationService.stub(IEditorService, editorService);
        return instantiationService.createInstance(TestServiceAccessor);
    }
    test('editor pane selection', async function () {
        const accessor = await createServices();
        const resource = toResource.call(this, '/path/index.txt');
        let pane = await accessor.editorService.openEditor({ resource });
        assert.ok(pane && isEditorPaneWithSelection(pane));
        const onDidFireSelectionEventOfEditType = new DeferredPromise();
        pane.onDidChangeSelection(e => {
            if (e.reason === 3 /* EditorPaneSelectionChangeReason.EDIT */) {
                onDidFireSelectionEventOfEditType.complete(e);
            }
        });
        // Changing model reports selection change
        // of EDIT kind
        const model = await accessor.textFileService.files.resolve(resource);
        model.textEditorModel.setValue('Hello World');
        const event = await onDidFireSelectionEventOfEditType.p;
        assert.strictEqual(event.reason, 3 /* EditorPaneSelectionChangeReason.EDIT */);
        // getSelection() works and can be restored
        //
        // Note: this is a bit bogus because in tests our code editors have
        //       no view and no cursor can be set as such. So the selection
        //       will always report for the first line and column.
        pane.setSelection(new Selection(1, 1, 1, 1), 2 /* EditorPaneSelectionChangeReason.USER */);
        const selection = pane.getSelection();
        assert.ok(selection);
        await pane.group?.closeAllEditors();
        const options = selection.restore({});
        pane = await accessor.editorService.openEditor({ resource, options });
        assert.ok(pane && isEditorPaneWithSelection(pane));
        const newSelection = pane.getSelection();
        assert.ok(newSelection);
        assert.strictEqual(newSelection.compare(selection), 1 /* EditorPaneSelectionCompareResult.IDENTICAL */);
    });
    test('TextEditorPaneSelection', function () {
        const sel1 = new TextEditorPaneSelection(new Selection(1, 1, 2, 2));
        const sel2 = new TextEditorPaneSelection(new Selection(5, 5, 6, 6));
        const sel3 = new TextEditorPaneSelection(new Selection(50, 50, 60, 60));
        const sel4 = { compare: () => { throw new Error(); }, restore: (options) => options };
        assert.strictEqual(sel1.compare(sel1), 1 /* EditorPaneSelectionCompareResult.IDENTICAL */);
        assert.strictEqual(sel1.compare(sel2), 2 /* EditorPaneSelectionCompareResult.SIMILAR */);
        assert.strictEqual(sel1.compare(sel3), 3 /* EditorPaneSelectionCompareResult.DIFFERENT */);
        assert.strictEqual(sel1.compare(sel4), 3 /* EditorPaneSelectionCompareResult.DIFFERENT */);
    });
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as assert from 'assert';
import { Emitter } from 'vs/base/common/event';
import { Disposable, DisposableStore } from 'vs/base/common/lifecycle';
import { ContributedStatusBarItemController } from 'vs/workbench/contrib/notebook/browser/contrib/cellStatusBar/contributedStatusBarItemController';
import { INotebookCellStatusBarService } from 'vs/workbench/contrib/notebook/common/notebookCellStatusBarService';
import { CellKind } from 'vs/workbench/contrib/notebook/common/notebookCommon';
import { withTestNotebook } from 'vs/workbench/contrib/notebook/test/browser/testNotebookEditor';
suite('Notebook Statusbar', () => {
    const testDisposables = new DisposableStore();
    teardown(() => {
        testDisposables.clear();
    });
    test('Calls item provider', async function () {
        await withTestNotebook([
            ['var b = 1;', 'javascript', CellKind.Code, [], {}],
            ['# header a', 'markdown', CellKind.Markup, [], {}],
        ], async (editor, viewModel, accessor) => {
            const cellStatusbarSvc = accessor.get(INotebookCellStatusBarService);
            testDisposables.add(accessor.createInstance(ContributedStatusBarItemController, editor));
            const provider = testDisposables.add(new class extends Disposable {
                provideCalls = 0;
                _onProvideCalled = this._register(new Emitter());
                onProvideCalled = this._onProvideCalled.event;
                _onDidChangeStatusBarItems = this._register(new Emitter());
                onDidChangeStatusBarItems = this._onDidChangeStatusBarItems.event;
                async provideCellStatusBarItems(_uri, index, _token) {
                    if (index === 0) {
                        this.provideCalls++;
                        this._onProvideCalled.fire(this.provideCalls);
                    }
                    return { items: [] };
                }
                viewType = editor.textModel.viewType;
            });
            const providePromise1 = asPromise(provider.onProvideCalled);
            testDisposables.add(cellStatusbarSvc.registerCellStatusBarItemProvider(provider));
            assert.strictEqual(await providePromise1, 1, 'should call provider on registration');
            const providePromise2 = asPromise(provider.onProvideCalled);
            const cell0 = editor.textModel.cells[0];
            cell0.metadata = { ...cell0.metadata, ...{ newMetadata: true } };
            assert.strictEqual(await providePromise2, 2, 'should call provider on registration');
            const providePromise3 = asPromise(provider.onProvideCalled);
            cell0.language = 'newlanguage';
            assert.strictEqual(await providePromise3, 3, 'should call provider on registration');
            const providePromise4 = asPromise(provider.onProvideCalled);
            provider._onDidChangeStatusBarItems.fire();
            assert.strictEqual(await providePromise4, 4, 'should call provider on registration');
        });
    });
});
async function asPromise(event, timeout = 5000) {
    const error = new Error('asPromise TIMEOUT reached');
    return new Promise((resolve, reject) => {
        const handle = setTimeout(() => {
            sub.dispose();
            reject(error);
        }, timeout);
        const sub = event(e => {
            clearTimeout(handle);
            sub.dispose();
            resolve(e);
        });
    });
}

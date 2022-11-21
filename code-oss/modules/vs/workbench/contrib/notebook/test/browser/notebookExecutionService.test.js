/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as assert from 'assert';
import * as sinon from 'sinon';
import { Event } from 'vs/base/common/event';
import { DisposableStore } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
import { mock } from 'vs/base/test/common/mock';
import { assertThrowsAsync } from 'vs/base/test/common/utils';
import { PLAINTEXT_LANGUAGE_ID } from 'vs/editor/common/languages/modesRegistry';
import { IMenuService } from 'vs/platform/actions/common/actions';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { ExtensionIdentifier } from 'vs/platform/extensions/common/extensions';
import { insertCellAtIndex } from 'vs/workbench/contrib/notebook/browser/controller/cellOperations';
import { NotebookExecutionService } from 'vs/workbench/contrib/notebook/browser/services/notebookExecutionServiceImpl';
import { NotebookKernelService } from 'vs/workbench/contrib/notebook/browser/services/notebookKernelServiceImpl';
import { CellKind } from 'vs/workbench/contrib/notebook/common/notebookCommon';
import { INotebookExecutionStateService } from 'vs/workbench/contrib/notebook/common/notebookExecutionStateService';
import { INotebookKernelService } from 'vs/workbench/contrib/notebook/common/notebookKernelService';
import { INotebookService } from 'vs/workbench/contrib/notebook/common/notebookService';
import { setupInstantiationService, withTestNotebook as _withTestNotebook } from 'vs/workbench/contrib/notebook/test/browser/testNotebookEditor';
suite('NotebookExecutionService', () => {
    let instantiationService;
    let contextKeyService;
    let kernelService;
    let disposables;
    setup(function () {
        disposables = new DisposableStore();
        instantiationService = setupInstantiationService(disposables);
        instantiationService.stub(INotebookService, new class extends mock() {
            onDidAddNotebookDocument = Event.None;
            onWillRemoveNotebookDocument = Event.None;
            getNotebookTextModels() { return []; }
        });
        instantiationService.stub(IMenuService, new class extends mock() {
            createMenu() {
                return new class extends mock() {
                    onDidChange = Event.None;
                    getActions() { return []; }
                    dispose() { }
                };
            }
        });
        kernelService = instantiationService.createInstance(NotebookKernelService);
        instantiationService.set(INotebookKernelService, kernelService);
        contextKeyService = instantiationService.get(IContextKeyService);
    });
    teardown(() => {
        disposables.dispose();
    });
    async function withTestNotebook(cells, callback) {
        return _withTestNotebook(cells, (editor, viewModel) => callback(viewModel, viewModel.notebookDocument));
    }
    // test('ctor', () => {
    // 	instantiationService.createInstance(NotebookEditorKernelManager, { activeKernel: undefined, viewModel: undefined });
    // 	const contextKeyService = instantiationService.get(IContextKeyService);
    // 	assert.strictEqual(contextKeyService.getContextKeyValue(NOTEBOOK_KERNEL_COUNT.key), 0);
    // });
    test('cell is not runnable when no kernel is selected', async () => {
        await withTestNotebook([], async (viewModel, textModel) => {
            const executionService = instantiationService.createInstance(NotebookExecutionService);
            const cell = insertCellAtIndex(viewModel, 1, 'var c = 3', 'javascript', CellKind.Code, {}, [], true, true);
            await assertThrowsAsync(async () => await executionService.executeNotebookCells(textModel, [cell.model], contextKeyService));
        });
    });
    test('cell is not runnable when kernel does not support the language', async () => {
        await withTestNotebook([], async (viewModel, textModel) => {
            kernelService.registerKernel(new TestNotebookKernel({ languages: ['testlang'] }));
            const executionService = instantiationService.createInstance(NotebookExecutionService);
            const cell = insertCellAtIndex(viewModel, 1, 'var c = 3', 'javascript', CellKind.Code, {}, [], true, true);
            await assertThrowsAsync(async () => await executionService.executeNotebookCells(textModel, [cell.model], contextKeyService));
        });
    });
    test('cell is runnable when kernel does support the language', async () => {
        await withTestNotebook([], async (viewModel, textModel) => {
            const kernel = new TestNotebookKernel({ languages: ['javascript'] });
            kernelService.registerKernel(kernel);
            const executionService = instantiationService.createInstance(NotebookExecutionService);
            const executeSpy = sinon.spy();
            kernel.executeNotebookCellsRequest = executeSpy;
            const cell = insertCellAtIndex(viewModel, 0, 'var c = 3', 'javascript', CellKind.Code, {}, [], true, true);
            await executionService.executeNotebookCells(viewModel.notebookDocument, [cell.model], contextKeyService);
            assert.strictEqual(executeSpy.calledOnce, true);
        });
    });
    test('select kernel when running cell', async function () {
        // https://github.com/microsoft/vscode/issues/121904
        return withTestNotebook([], async (viewModel, textModel) => {
            assert.strictEqual(kernelService.getMatchingKernel(textModel).all.length, 0);
            let didExecute = false;
            const kernel = new class extends TestNotebookKernel {
                constructor() {
                    super({ languages: ['javascript'] });
                    this.id = 'mySpecialId';
                }
                async executeNotebookCellsRequest() {
                    didExecute = true;
                    return;
                }
            };
            kernelService.registerKernel(kernel);
            const executionService = instantiationService.createInstance(NotebookExecutionService);
            let event;
            kernelService.onDidChangeSelectedNotebooks(e => event = e);
            const cell = insertCellAtIndex(viewModel, 0, 'var c = 3', 'javascript', CellKind.Code, {}, [], true, true);
            await executionService.executeNotebookCells(textModel, [cell.model], contextKeyService);
            assert.strictEqual(didExecute, true);
            assert.ok(event !== undefined);
            assert.strictEqual(event.newKernel, kernel.id);
            assert.strictEqual(event.oldKernel, undefined);
        });
    });
    test('Completes unconfirmed executions', async function () {
        return withTestNotebook([], async (viewModel, textModel) => {
            let didExecute = false;
            const kernel = new class extends TestNotebookKernel {
                constructor() {
                    super({ languages: ['javascript'] });
                    this.id = 'mySpecialId';
                }
                async executeNotebookCellsRequest() {
                    didExecute = true;
                    return;
                }
            };
            kernelService.registerKernel(kernel);
            const executionService = instantiationService.createInstance(NotebookExecutionService);
            const exeStateService = instantiationService.get(INotebookExecutionStateService);
            const cell = insertCellAtIndex(viewModel, 0, 'var c = 3', 'javascript', CellKind.Code, {}, [], true, true);
            await executionService.executeNotebookCells(textModel, [cell.model], contextKeyService);
            assert.strictEqual(didExecute, true);
            assert.strictEqual(exeStateService.getCellExecution(cell.uri), undefined);
        });
    });
});
class TestNotebookKernel {
    id = 'test';
    label = '';
    viewType = '*';
    onDidChange = Event.None;
    extension = new ExtensionIdentifier('test');
    localResourceRoot = URI.file('/test');
    description;
    detail;
    preloadUris = [];
    preloadProvides = [];
    supportedLanguages = [];
    executeNotebookCellsRequest() {
        throw new Error('Method not implemented.');
    }
    cancelNotebookCellExecution() {
        throw new Error('Method not implemented.');
    }
    constructor(opts) {
        this.supportedLanguages = opts?.languages ?? [PLAINTEXT_LANGUAGE_ID];
    }
    kind;
    implementsInterrupt;
    implementsExecutionOrder;
}

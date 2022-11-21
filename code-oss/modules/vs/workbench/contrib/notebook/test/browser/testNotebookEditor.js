/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as DOM from 'vs/base/browser/dom';
import { VSBuffer } from 'vs/base/common/buffer';
import { NotImplementedError } from 'vs/base/common/errors';
import { Emitter, Event } from 'vs/base/common/event';
import { DisposableStore } from 'vs/base/common/lifecycle';
import { ResourceMap } from 'vs/base/common/map';
import { Mimes } from 'vs/base/common/mime';
import { URI } from 'vs/base/common/uri';
import { mock } from 'vs/base/test/common/mock';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { ILanguageConfigurationService } from 'vs/editor/common/languages/languageConfigurationRegistry';
import { LanguageService } from 'vs/editor/common/services/languageService';
import { IModelService } from 'vs/editor/common/services/model';
import { ModelService } from 'vs/editor/common/services/modelService';
import { ITextModelService } from 'vs/editor/common/services/resolverService';
import { TestLanguageConfigurationService } from 'vs/editor/test/common/modes/testLanguageConfigurationService';
import { IClipboardService } from 'vs/platform/clipboard/common/clipboardService';
import { TestClipboardService } from 'vs/platform/clipboard/test/common/testClipboardService';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { TestConfigurationService } from 'vs/platform/configuration/test/common/testConfigurationService';
import { ContextKeyService } from 'vs/platform/contextkey/browser/contextKeyService';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { TestInstantiationService } from 'vs/platform/instantiation/test/common/instantiationServiceMock';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { MockKeybindingService } from 'vs/platform/keybinding/test/common/mockKeybindingService';
import { ILayoutService } from 'vs/platform/layout/browser/layoutService';
import { IListService, ListService } from 'vs/platform/list/browser/listService';
import { ILogService, NullLogService } from 'vs/platform/log/common/log';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { TestThemeService } from 'vs/platform/theme/test/common/testThemeService';
import { IUndoRedoService } from 'vs/platform/undoRedo/common/undoRedo';
import { UndoRedoService } from 'vs/platform/undoRedo/common/undoRedoService';
import { IWorkspaceTrustRequestService } from 'vs/platform/workspace/common/workspaceTrust';
import { EditorModel } from 'vs/workbench/common/editor/editorModel';
import { NotebookCellStatusBarService } from 'vs/workbench/contrib/notebook/browser/services/notebookCellStatusBarServiceImpl';
import { ListViewInfoAccessor, NotebookCellList } from 'vs/workbench/contrib/notebook/browser/view/notebookCellList';
import { NotebookEventDispatcher } from 'vs/workbench/contrib/notebook/browser/viewModel/eventDispatcher';
import { NotebookViewModel } from 'vs/workbench/contrib/notebook/browser/viewModel/notebookViewModelImpl';
import { ViewContext } from 'vs/workbench/contrib/notebook/browser/viewModel/viewContext';
import { NotebookCellTextModel } from 'vs/workbench/contrib/notebook/common/model/notebookCellTextModel';
import { NotebookTextModel } from 'vs/workbench/contrib/notebook/common/model/notebookTextModel';
import { INotebookCellStatusBarService } from 'vs/workbench/contrib/notebook/common/notebookCellStatusBarService';
import { CellUri, NotebookCellExecutionState, SelectionStateType } from 'vs/workbench/contrib/notebook/common/notebookCommon';
import { INotebookExecutionStateService } from 'vs/workbench/contrib/notebook/common/notebookExecutionStateService';
import { NotebookOptions } from 'vs/workbench/contrib/notebook/common/notebookOptions';
import { TextModelResolverService } from 'vs/workbench/services/textmodelResolver/common/textModelResolverService';
import { TestWorkspaceTrustRequestService } from 'vs/workbench/services/workspaces/test/common/testWorkspaceTrustService';
import { TestLayoutService } from 'vs/workbench/test/browser/workbenchTestServices';
import { TestStorageService } from 'vs/workbench/test/common/workbenchTestServices';
export class TestCell extends NotebookCellTextModel {
    viewType;
    source;
    constructor(viewType, handle, source, language, cellKind, outputs, languageService) {
        super(CellUri.generate(URI.parse('test:///fake/notebook'), handle), handle, source, language, Mimes.text, cellKind, outputs, undefined, undefined, undefined, { transientCellMetadata: {}, transientDocumentMetadata: {}, transientOutputs: false, cellContentMetadata: {} }, languageService);
        this.viewType = viewType;
        this.source = source;
    }
}
export class NotebookEditorTestModel extends EditorModel {
    _notebook;
    _dirty = false;
    _onDidSave = this._register(new Emitter());
    onDidSave = this._onDidSave.event;
    _onDidChangeDirty = this._register(new Emitter());
    onDidChangeDirty = this._onDidChangeDirty.event;
    onDidChangeOrphaned = Event.None;
    onDidChangeReadonly = Event.None;
    _onDidChangeContent = this._register(new Emitter());
    onDidChangeContent = this._onDidChangeContent.event;
    get viewType() {
        return this._notebook.viewType;
    }
    get resource() {
        return this._notebook.uri;
    }
    get notebook() {
        return this._notebook;
    }
    constructor(_notebook) {
        super();
        this._notebook = _notebook;
        if (_notebook && _notebook.onDidChangeContent) {
            this._register(_notebook.onDidChangeContent(() => {
                this._dirty = true;
                this._onDidChangeDirty.fire();
                this._onDidChangeContent.fire();
            }));
        }
    }
    isReadonly() {
        return false;
    }
    isOrphaned() {
        return false;
    }
    hasAssociatedFilePath() {
        return false;
    }
    isDirty() {
        return this._dirty;
    }
    getNotebook() {
        return this._notebook;
    }
    async load() {
        return this;
    }
    async save() {
        if (this._notebook) {
            this._dirty = false;
            this._onDidChangeDirty.fire();
            this._onDidSave.fire({});
            // todo, flush all states
            return true;
        }
        return false;
    }
    saveAs() {
        throw new NotImplementedError();
    }
    revert() {
        throw new NotImplementedError();
    }
}
export function setupInstantiationService(disposables = new DisposableStore()) {
    const instantiationService = new TestInstantiationService();
    instantiationService.stub(ILanguageService, disposables.add(new LanguageService()));
    instantiationService.stub(IUndoRedoService, instantiationService.createInstance(UndoRedoService));
    instantiationService.stub(IConfigurationService, new TestConfigurationService());
    instantiationService.stub(IThemeService, new TestThemeService());
    instantiationService.stub(ILanguageConfigurationService, new TestLanguageConfigurationService());
    instantiationService.stub(IModelService, instantiationService.createInstance(ModelService));
    instantiationService.stub(ITextModelService, instantiationService.createInstance(TextModelResolverService));
    instantiationService.stub(IContextKeyService, instantiationService.createInstance(ContextKeyService));
    instantiationService.stub(IListService, instantiationService.createInstance(ListService));
    instantiationService.stub(ILayoutService, new TestLayoutService());
    instantiationService.stub(ILogService, new NullLogService());
    instantiationService.stub(IClipboardService, TestClipboardService);
    instantiationService.stub(IStorageService, new TestStorageService());
    instantiationService.stub(IWorkspaceTrustRequestService, new TestWorkspaceTrustRequestService(true));
    instantiationService.stub(INotebookExecutionStateService, new TestNotebookExecutionStateService());
    instantiationService.stub(IKeybindingService, new MockKeybindingService());
    instantiationService.stub(INotebookCellStatusBarService, new NotebookCellStatusBarService());
    return instantiationService;
}
function _createTestNotebookEditor(instantiationService, cells) {
    const viewType = 'notebook';
    const notebook = instantiationService.createInstance(NotebookTextModel, viewType, URI.parse('test'), cells.map((cell) => {
        return {
            source: cell[0],
            mime: undefined,
            language: cell[1],
            cellKind: cell[2],
            outputs: cell[3] ?? [],
            metadata: cell[4]
        };
    }), {}, { transientCellMetadata: {}, transientDocumentMetadata: {}, cellContentMetadata: {}, transientOutputs: false });
    const model = new NotebookEditorTestModel(notebook);
    const notebookOptions = new NotebookOptions(instantiationService.get(IConfigurationService), instantiationService.get(INotebookExecutionStateService));
    const viewContext = new ViewContext(notebookOptions, new NotebookEventDispatcher(), () => ({}));
    const viewModel = instantiationService.createInstance(NotebookViewModel, viewType, model.notebook, viewContext, null, { isReadOnly: false });
    const cellList = createNotebookCellList(instantiationService, viewContext);
    cellList.attachViewModel(viewModel);
    const listViewInfoAccessor = new ListViewInfoAccessor(cellList);
    const notebookEditor = new class extends mock() {
        dispose() {
            viewModel.dispose();
        }
        notebookOptions = notebookOptions;
        onDidChangeModel = new Emitter().event;
        _getViewModel() {
            return viewModel;
        }
        textModel = viewModel.notebookDocument;
        hasModel() {
            return !!viewModel;
        }
        getLength() { return viewModel.length; }
        getFocus() { return viewModel.getFocus(); }
        getSelections() { return viewModel.getSelections(); }
        setFocus(focus) {
            viewModel.updateSelectionsState({
                kind: SelectionStateType.Index,
                focus: focus,
                selections: viewModel.getSelections()
            });
        }
        setSelections(selections) {
            viewModel.updateSelectionsState({
                kind: SelectionStateType.Index,
                focus: viewModel.getFocus(),
                selections: selections
            });
        }
        getViewIndexByModelIndex(index) { return listViewInfoAccessor.getViewIndex(viewModel.viewCells[index]); }
        getCellRangeFromViewRange(startIndex, endIndex) { return listViewInfoAccessor.getCellRangeFromViewRange(startIndex, endIndex); }
        revealCellRangeInView() { }
        setHiddenAreas(_ranges) {
            return cellList.setHiddenAreas(_ranges, true);
        }
        getActiveCell() {
            const elements = cellList.getFocusedElements();
            if (elements && elements.length) {
                return elements[0];
            }
            return undefined;
        }
        hasOutputTextSelection() {
            return false;
        }
        changeModelDecorations() { return null; }
        focusElement() { }
        setCellEditorSelection() { }
        async revealRangeInCenterIfOutsideViewportAsync() { }
        async layoutNotebookCell() { }
        async removeInset() { }
        async focusNotebookCell() { }
        cellAt(index) { return viewModel.cellAt(index); }
        getCellIndex(cell) { return viewModel.getCellIndex(cell); }
        getCellsInRange(range) { return viewModel.getCellsInRange(range); }
        getCellByHandle(handle) { return viewModel.getCellByHandle(handle); }
        getNextVisibleCellIndex(index) { return viewModel.getNextVisibleCellIndex(index); }
        getControl() { return this; }
        get onDidChangeSelection() { return viewModel.onDidChangeSelection; }
        get onDidChangeOptions() { return viewModel.onDidChangeOptions; }
        get onDidChangeViewCells() { return viewModel.onDidChangeViewCells; }
        async find(query, options) {
            const findMatches = viewModel.find(query, options).filter(match => match.matches.length > 0);
            return findMatches;
        }
        deltaCellDecorations() { return []; }
        onDidChangeVisibleRanges = Event.None;
        visibleRanges = [{ start: 0, end: 100 }];
    };
    return { editor: notebookEditor, viewModel };
}
export function createTestNotebookEditor(instantiationService, cells) {
    return _createTestNotebookEditor(instantiationService, cells);
}
export async function withTestNotebookDiffModel(originalCells, modifiedCells, callback) {
    const disposables = new DisposableStore();
    const instantiationService = setupInstantiationService(disposables);
    const originalNotebook = createTestNotebookEditor(instantiationService, originalCells);
    const modifiedNotebook = createTestNotebookEditor(instantiationService, modifiedCells);
    const originalResource = new class extends mock() {
        get notebook() {
            return originalNotebook.viewModel.notebookDocument;
        }
    };
    const modifiedResource = new class extends mock() {
        get notebook() {
            return modifiedNotebook.viewModel.notebookDocument;
        }
    };
    const model = new class extends mock() {
        get original() {
            return originalResource;
        }
        get modified() {
            return modifiedResource;
        }
    };
    const res = await callback(model, instantiationService);
    if (res instanceof Promise) {
        res.finally(() => {
            originalNotebook.editor.dispose();
            originalNotebook.viewModel.dispose();
            modifiedNotebook.editor.dispose();
            modifiedNotebook.viewModel.dispose();
            disposables.dispose();
        });
    }
    else {
        originalNotebook.editor.dispose();
        originalNotebook.viewModel.dispose();
        modifiedNotebook.editor.dispose();
        modifiedNotebook.viewModel.dispose();
        disposables.dispose();
    }
    return res;
}
export async function withTestNotebook(cells, callback, accessor) {
    const disposables = new DisposableStore();
    const instantiationService = accessor ?? setupInstantiationService(disposables);
    const notebookEditor = _createTestNotebookEditor(instantiationService, cells);
    const res = await callback(notebookEditor.editor, notebookEditor.viewModel, instantiationService);
    if (res instanceof Promise) {
        res.finally(() => {
            notebookEditor.editor.dispose();
            notebookEditor.viewModel.dispose();
            disposables.dispose();
        });
    }
    else {
        notebookEditor.editor.dispose();
        notebookEditor.viewModel.dispose();
        disposables.dispose();
    }
    return res;
}
export function createNotebookCellList(instantiationService, viewContext) {
    const delegate = {
        getHeight(element) { return element.getHeight(17); },
        getTemplateId() { return 'template'; }
    };
    const renderer = {
        templateId: 'template',
        renderTemplate() { return {}; },
        renderElement() { },
        disposeTemplate() { }
    };
    const cellList = instantiationService.createInstance(NotebookCellList, 'NotebookCellList', DOM.$('container'), viewContext ?? new ViewContext(new NotebookOptions(instantiationService.get(IConfigurationService), instantiationService.get(INotebookExecutionStateService)), new NotebookEventDispatcher(), () => ({})), delegate, [renderer], instantiationService.get(IContextKeyService), {
        supportDynamicHeights: true,
        multipleSelectionSupport: true,
    });
    return cellList;
}
export function valueBytesFromString(value) {
    return VSBuffer.fromString(value);
}
class TestCellExecution {
    notebook;
    cellHandle;
    onComplete;
    constructor(notebook, cellHandle, onComplete) {
        this.notebook = notebook;
        this.cellHandle = cellHandle;
        this.onComplete = onComplete;
    }
    state = NotebookCellExecutionState.Unconfirmed;
    didPause = false;
    isPaused = false;
    confirm() {
    }
    update(updates) {
    }
    complete(complete) {
        this.onComplete();
    }
}
class TestNotebookExecutionStateService {
    _serviceBrand;
    _executions = new ResourceMap();
    onDidChangeCellExecution = new Emitter().event;
    onDidChangeLastRunFailState = new Emitter().event;
    forceCancelNotebookExecutions(notebookUri) {
    }
    getCellExecutionsForNotebook(notebook) {
        return [];
    }
    getCellExecution(cellUri) {
        return this._executions.get(cellUri);
    }
    createCellExecution(notebook, cellHandle) {
        const onComplete = () => this._executions.delete(CellUri.generate(notebook, cellHandle));
        const exe = new TestCellExecution(notebook, cellHandle, onComplete);
        this._executions.set(CellUri.generate(notebook, cellHandle), exe);
        return exe;
    }
    getCellExecutionsByHandleForNotebook(notebook) {
        return;
    }
    getLastFailedCellForNotebook(notebook) {
        return;
    }
}

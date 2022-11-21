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
import { Schemas } from 'vs/base/common/network';
import { Disposable, DisposableStore, dispose } from 'vs/base/common/lifecycle';
import { parse } from 'vs/base/common/marshalling';
import { isEqual } from 'vs/base/common/resources';
import { assertType } from 'vs/base/common/types';
import { URI } from 'vs/base/common/uri';
import { toFormattedString } from 'vs/base/common/jsonFormatter';
import { IModelService } from 'vs/editor/common/services/model';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { ITextModelService } from 'vs/editor/common/services/resolverService';
import * as nls from 'vs/nls';
import { Extensions } from 'vs/platform/configuration/common/configurationRegistry';
import { SyncDescriptor } from 'vs/platform/instantiation/common/descriptors';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { Registry } from 'vs/platform/registry/common/platform';
import { EditorPaneDescriptor } from 'vs/workbench/browser/editor';
import { Extensions as WorkbenchExtensions } from 'vs/workbench/common/contributions';
import { EditorExtensions } from 'vs/workbench/common/editor';
import { NotebookEditor } from 'vs/workbench/contrib/notebook/browser/notebookEditor';
import { isCompositeNotebookEditorInput, NotebookEditorInput } from 'vs/workbench/contrib/notebook/common/notebookEditorInput';
import { INotebookService } from 'vs/workbench/contrib/notebook/common/notebookService';
import { NotebookService } from 'vs/workbench/contrib/notebook/browser/services/notebookServiceImpl';
import { CellKind, CellUri, NotebookWorkingCopyTypeIdentifier, NotebookSetting } from 'vs/workbench/contrib/notebook/common/notebookCommon';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IUndoRedoService } from 'vs/platform/undoRedo/common/undoRedo';
import { INotebookEditorModelResolverService } from 'vs/workbench/contrib/notebook/common/notebookEditorModelResolverService';
import { NotebookDiffEditorInput } from 'vs/workbench/contrib/notebook/common/notebookDiffEditorInput';
import { NotebookTextDiffEditor } from 'vs/workbench/contrib/notebook/browser/diff/notebookDiffEditor';
import { INotebookEditorWorkerService } from 'vs/workbench/contrib/notebook/common/services/notebookWorkerService';
import { NotebookEditorWorkerServiceImpl } from 'vs/workbench/contrib/notebook/browser/services/notebookWorkerServiceImpl';
import { INotebookCellStatusBarService } from 'vs/workbench/contrib/notebook/common/notebookCellStatusBarService';
import { NotebookCellStatusBarService } from 'vs/workbench/contrib/notebook/browser/services/notebookCellStatusBarServiceImpl';
import { INotebookEditorService } from 'vs/workbench/contrib/notebook/browser/services/notebookEditorService';
import { NotebookEditorWidgetService } from 'vs/workbench/contrib/notebook/browser/services/notebookEditorServiceImpl';
import { Extensions as JSONExtensions } from 'vs/platform/jsonschemas/common/jsonContributionRegistry';
import { Event } from 'vs/base/common/event';
import { getFormattedMetadataJSON, getStreamOutputData } from 'vs/workbench/contrib/notebook/browser/diff/diffElementViewModel';
import { NotebookModelResolverServiceImpl } from 'vs/workbench/contrib/notebook/common/notebookEditorModelResolverServiceImpl';
import { INotebookKernelService } from 'vs/workbench/contrib/notebook/common/notebookKernelService';
import { NotebookKernelService } from 'vs/workbench/contrib/notebook/browser/services/notebookKernelServiceImpl';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { IWorkingCopyEditorService } from 'vs/workbench/services/workingCopy/common/workingCopyEditorService';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { ILabelService } from 'vs/platform/label/common/label';
import { IWorkingCopyBackupService } from 'vs/workbench/services/workingCopy/common/workingCopyBackup';
import { IEditorGroupsService } from 'vs/workbench/services/editor/common/editorGroupsService';
import { NotebookRendererMessagingService } from 'vs/workbench/contrib/notebook/browser/services/notebookRendererMessagingServiceImpl';
import { INotebookRendererMessagingService } from 'vs/workbench/contrib/notebook/common/notebookRendererMessagingService';
// Editor Controller
import 'vs/workbench/contrib/notebook/browser/controller/coreActions';
import 'vs/workbench/contrib/notebook/browser/controller/insertCellActions';
import 'vs/workbench/contrib/notebook/browser/controller/executeActions';
import 'vs/workbench/contrib/notebook/browser/controller/layoutActions';
import 'vs/workbench/contrib/notebook/browser/controller/editActions';
import 'vs/workbench/contrib/notebook/browser/controller/apiActions';
import 'vs/workbench/contrib/notebook/browser/controller/foldingController';
// Editor Contribution
import 'vs/workbench/contrib/notebook/browser/contrib/clipboard/notebookClipboard';
import 'vs/workbench/contrib/notebook/browser/contrib/find/notebookFind';
import 'vs/workbench/contrib/notebook/browser/contrib/format/formatting';
import 'vs/workbench/contrib/notebook/browser/contrib/gettingStarted/notebookGettingStarted';
import 'vs/workbench/contrib/notebook/browser/contrib/layout/layoutActions';
import 'vs/workbench/contrib/notebook/browser/contrib/marker/markerProvider';
import 'vs/workbench/contrib/notebook/browser/contrib/navigation/arrow';
import 'vs/workbench/contrib/notebook/browser/contrib/outline/notebookOutline';
import 'vs/workbench/contrib/notebook/browser/contrib/profile/notebookProfile';
import 'vs/workbench/contrib/notebook/browser/contrib/cellStatusBar/statusBarProviders';
import 'vs/workbench/contrib/notebook/browser/contrib/cellStatusBar/contributedStatusBarItemController';
import 'vs/workbench/contrib/notebook/browser/contrib/cellStatusBar/executionStatusBarItemController';
import 'vs/workbench/contrib/notebook/browser/contrib/editorStatusBar/editorStatusBar';
import 'vs/workbench/contrib/notebook/browser/contrib/undoRedo/notebookUndoRedo';
import 'vs/workbench/contrib/notebook/browser/contrib/cellCommands/cellCommands';
import 'vs/workbench/contrib/notebook/browser/contrib/viewportCustomMarkdown/viewportCustomMarkdown';
import 'vs/workbench/contrib/notebook/browser/contrib/troubleshoot/layout';
import 'vs/workbench/contrib/notebook/browser/contrib/breakpoints/notebookBreakpoints';
import 'vs/workbench/contrib/notebook/browser/contrib/execute/executionEditorProgress';
// Diff Editor Contribution
import 'vs/workbench/contrib/notebook/browser/diff/notebookDiffActions';
// Services
import { editorOptionsRegistry } from 'vs/editor/common/config/editorOptions';
import { NotebookExecutionStateService } from 'vs/workbench/contrib/notebook/browser/services/notebookExecutionStateServiceImpl';
import { NotebookExecutionService } from 'vs/workbench/contrib/notebook/browser/services/notebookExecutionServiceImpl';
import { INotebookExecutionService } from 'vs/workbench/contrib/notebook/common/notebookExecutionService';
import { INotebookKeymapService } from 'vs/workbench/contrib/notebook/common/notebookKeymapService';
import { NotebookKeymapService } from 'vs/workbench/contrib/notebook/browser/services/notebookKeymapServiceImpl';
import { PLAINTEXT_LANGUAGE_ID } from 'vs/editor/common/languages/modesRegistry';
import { INotebookExecutionStateService } from 'vs/workbench/contrib/notebook/common/notebookExecutionStateService';
import { ILanguageFeaturesService } from 'vs/editor/common/services/languageFeatures';
import { COMMENTEDITOR_DECORATION_KEY } from 'vs/workbench/contrib/comments/browser/commentReply';
import { ICodeEditorService } from 'vs/editor/browser/services/codeEditorService';
/*--------------------------------------------------------------------------------------------- */
Registry.as(EditorExtensions.EditorPane).registerEditorPane(EditorPaneDescriptor.create(NotebookEditor, NotebookEditor.ID, 'Notebook Editor'), [
    new SyncDescriptor(NotebookEditorInput)
]);
Registry.as(EditorExtensions.EditorPane).registerEditorPane(EditorPaneDescriptor.create(NotebookTextDiffEditor, NotebookTextDiffEditor.ID, 'Notebook Diff Editor'), [
    new SyncDescriptor(NotebookDiffEditorInput)
]);
class NotebookDiffEditorSerializer {
    canSerialize() {
        return true;
    }
    serialize(input) {
        assertType(input instanceof NotebookDiffEditorInput);
        return JSON.stringify({
            resource: input.resource,
            originalResource: input.original.resource,
            name: input.getName(),
            originalName: input.original.getName(),
            textDiffName: input.getName(),
            viewType: input.viewType,
        });
    }
    deserialize(instantiationService, raw) {
        const data = parse(raw);
        if (!data) {
            return undefined;
        }
        const { resource, originalResource, name, viewType } = data;
        if (!data || !URI.isUri(resource) || !URI.isUri(originalResource) || typeof name !== 'string' || typeof viewType !== 'string') {
            return undefined;
        }
        const input = NotebookDiffEditorInput.create(instantiationService, resource, name, undefined, originalResource, viewType);
        return input;
    }
    static canResolveBackup(editorInput, backupResource) {
        return false;
    }
}
class NotebookEditorSerializer {
    canSerialize() {
        return true;
    }
    serialize(input) {
        assertType(input instanceof NotebookEditorInput);
        const data = {
            resource: input.resource,
            viewType: input.viewType,
            options: input.options
        };
        return JSON.stringify(data);
    }
    deserialize(instantiationService, raw) {
        const data = parse(raw);
        if (!data) {
            return undefined;
        }
        const { resource, viewType, options } = data;
        if (!data || !URI.isUri(resource) || typeof viewType !== 'string') {
            return undefined;
        }
        const input = NotebookEditorInput.create(instantiationService, resource, viewType, options);
        return input;
    }
}
Registry.as(EditorExtensions.EditorFactory).registerEditorSerializer(NotebookEditorInput.ID, NotebookEditorSerializer);
Registry.as(EditorExtensions.EditorFactory).registerEditorSerializer(NotebookDiffEditorInput.ID, NotebookDiffEditorSerializer);
let NotebookContribution = class NotebookContribution extends Disposable {
    codeEditorService;
    _uriComparisonKeyComputer;
    constructor(undoRedoService, configurationService, codeEditorService) {
        super();
        this.codeEditorService = codeEditorService;
        this.updateCellUndoRedoComparisonKey(configurationService, undoRedoService);
        // Watch for changes to undoRedoPerCell setting
        this._register(configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration(NotebookSetting.undoRedoPerCell)) {
                this.updateCellUndoRedoComparisonKey(configurationService, undoRedoService);
            }
        }));
        // register comment decoration
        this.codeEditorService.registerDecorationType('comment-controller', COMMENTEDITOR_DECORATION_KEY, {});
    }
    // Add or remove the cell undo redo comparison key based on the user setting
    updateCellUndoRedoComparisonKey(configurationService, undoRedoService) {
        const undoRedoPerCell = configurationService.getValue(NotebookSetting.undoRedoPerCell);
        if (!undoRedoPerCell) {
            // Add comparison key to map cell => main document
            if (!this._uriComparisonKeyComputer) {
                this._uriComparisonKeyComputer = undoRedoService.registerUriComparisonKeyComputer(CellUri.scheme, {
                    getComparisonKey: (uri) => {
                        if (undoRedoPerCell) {
                            return uri.toString();
                        }
                        return NotebookContribution._getCellUndoRedoComparisonKey(uri);
                    }
                });
            }
        }
        else {
            // Dispose comparison key
            this._uriComparisonKeyComputer?.dispose();
            this._uriComparisonKeyComputer = undefined;
        }
    }
    static _getCellUndoRedoComparisonKey(uri) {
        const data = CellUri.parse(uri);
        if (!data) {
            return uri.toString();
        }
        return data.notebook.toString();
    }
    dispose() {
        super.dispose();
        this._uriComparisonKeyComputer?.dispose();
    }
};
NotebookContribution = __decorate([
    __param(0, IUndoRedoService),
    __param(1, IConfigurationService),
    __param(2, ICodeEditorService)
], NotebookContribution);
export { NotebookContribution };
let CellContentProvider = class CellContentProvider {
    _modelService;
    _languageService;
    _notebookModelResolverService;
    _registration;
    constructor(textModelService, _modelService, _languageService, _notebookModelResolverService) {
        this._modelService = _modelService;
        this._languageService = _languageService;
        this._notebookModelResolverService = _notebookModelResolverService;
        this._registration = textModelService.registerTextModelContentProvider(CellUri.scheme, this);
    }
    dispose() {
        this._registration.dispose();
    }
    async provideTextContent(resource) {
        const existing = this._modelService.getModel(resource);
        if (existing) {
            return existing;
        }
        const data = CellUri.parse(resource);
        // const data = parseCellUri(resource);
        if (!data) {
            return null;
        }
        const ref = await this._notebookModelResolverService.resolve(data.notebook);
        let result = null;
        for (const cell of ref.object.notebook.cells) {
            if (cell.uri.toString() === resource.toString()) {
                const bufferFactory = {
                    create: (defaultEOL) => {
                        const newEOL = (defaultEOL === 2 /* DefaultEndOfLine.CRLF */ ? '\r\n' : '\n');
                        cell.textBuffer.setEOL(newEOL);
                        return { textBuffer: cell.textBuffer, disposable: Disposable.None };
                    },
                    getFirstLineText: (limit) => {
                        return cell.textBuffer.getLineContent(1).substring(0, limit);
                    }
                };
                const languageId = this._languageService.getLanguageIdByLanguageName(cell.language);
                const languageSelection = languageId ? this._languageService.createById(languageId) : (cell.cellKind === CellKind.Markup ? this._languageService.createById('markdown') : this._languageService.createByFilepathOrFirstLine(resource, cell.textBuffer.getLineContent(1)));
                result = this._modelService.createModel(bufferFactory, languageSelection, resource);
                break;
            }
        }
        if (!result) {
            ref.dispose();
            return null;
        }
        const once = Event.any(result.onWillDispose, ref.object.notebook.onWillDispose)(() => {
            once.dispose();
            ref.dispose();
        });
        return result;
    }
};
CellContentProvider = __decorate([
    __param(0, ITextModelService),
    __param(1, IModelService),
    __param(2, ILanguageService),
    __param(3, INotebookEditorModelResolverService)
], CellContentProvider);
let CellInfoContentProvider = class CellInfoContentProvider {
    _modelService;
    _languageService;
    _labelService;
    _notebookModelResolverService;
    _disposables = [];
    constructor(textModelService, _modelService, _languageService, _labelService, _notebookModelResolverService) {
        this._modelService = _modelService;
        this._languageService = _languageService;
        this._labelService = _labelService;
        this._notebookModelResolverService = _notebookModelResolverService;
        this._disposables.push(textModelService.registerTextModelContentProvider(Schemas.vscodeNotebookCellMetadata, {
            provideTextContent: this.provideMetadataTextContent.bind(this)
        }));
        this._disposables.push(textModelService.registerTextModelContentProvider(Schemas.vscodeNotebookCellOutput, {
            provideTextContent: this.provideOutputTextContent.bind(this)
        }));
        this._disposables.push(this._labelService.registerFormatter({
            scheme: Schemas.vscodeNotebookCellMetadata,
            formatting: {
                label: '${path} (metadata)',
                separator: '/'
            }
        }));
        this._disposables.push(this._labelService.registerFormatter({
            scheme: Schemas.vscodeNotebookCellOutput,
            formatting: {
                label: '${path} (output)',
                separator: '/'
            }
        }));
    }
    dispose() {
        dispose(this._disposables);
    }
    async provideMetadataTextContent(resource) {
        const existing = this._modelService.getModel(resource);
        if (existing) {
            return existing;
        }
        const data = CellUri.parseCellPropertyUri(resource, Schemas.vscodeNotebookCellMetadata);
        if (!data) {
            return null;
        }
        const ref = await this._notebookModelResolverService.resolve(data.notebook);
        let result = null;
        const mode = this._languageService.createById('json');
        for (const cell of ref.object.notebook.cells) {
            if (cell.handle === data.handle) {
                const metadataSource = getFormattedMetadataJSON(ref.object.notebook, cell.metadata, cell.language);
                result = this._modelService.createModel(metadataSource, mode, resource);
                break;
            }
        }
        if (!result) {
            ref.dispose();
            return null;
        }
        const once = result.onWillDispose(() => {
            once.dispose();
            ref.dispose();
        });
        return result;
    }
    parseStreamOutput(op) {
        if (!op) {
            return;
        }
        const streamOutputData = getStreamOutputData(op.outputs);
        if (streamOutputData) {
            return {
                content: streamOutputData,
                mode: this._languageService.createById(PLAINTEXT_LANGUAGE_ID)
            };
        }
        return;
    }
    _getResult(data, cell) {
        let result = undefined;
        const mode = this._languageService.createById('json');
        const op = cell.outputs.find(op => op.outputId === data.outputId);
        const streamOutputData = this.parseStreamOutput(op);
        if (streamOutputData) {
            result = streamOutputData;
            return result;
        }
        const obj = cell.outputs.map(output => ({
            metadata: output.metadata,
            outputItems: output.outputs.map(opit => ({
                mimeType: opit.mime,
                data: opit.data.toString()
            }))
        }));
        const outputSource = toFormattedString(obj, {});
        result = {
            content: outputSource,
            mode
        };
        return result;
    }
    async provideOutputTextContent(resource) {
        const existing = this._modelService.getModel(resource);
        if (existing) {
            return existing;
        }
        const data = CellUri.parseCellOutputUri(resource);
        if (!data) {
            return null;
        }
        const ref = await this._notebookModelResolverService.resolve(data.notebook);
        const cell = ref.object.notebook.cells.find(cell => !!cell.outputs.find(op => op.outputId === data.outputId));
        if (!cell) {
            ref.dispose();
            return null;
        }
        const result = this._getResult(data, cell);
        if (!result) {
            ref.dispose();
            return null;
        }
        const model = this._modelService.createModel(result.content, result.mode, resource);
        const cellModelListener = Event.any(cell.onDidChangeOutputs ?? Event.None, cell.onDidChangeOutputItems ?? Event.None)(() => {
            const newResult = this._getResult(data, cell);
            if (!newResult) {
                return;
            }
            model.setValue(newResult.content);
            model.setMode(newResult.mode.languageId);
        });
        const once = model.onWillDispose(() => {
            once.dispose();
            cellModelListener.dispose();
            ref.dispose();
        });
        return model;
    }
};
CellInfoContentProvider = __decorate([
    __param(0, ITextModelService),
    __param(1, IModelService),
    __param(2, ILanguageService),
    __param(3, ILabelService),
    __param(4, INotebookEditorModelResolverService)
], CellInfoContentProvider);
class RegisterSchemasContribution extends Disposable {
    constructor() {
        super();
        this.registerMetadataSchemas();
    }
    registerMetadataSchemas() {
        const jsonRegistry = Registry.as(JSONExtensions.JSONContribution);
        const metadataSchema = {
            properties: {
                ['language']: {
                    type: 'string',
                    description: 'The language for the cell'
                }
            },
            // patternProperties: allSettings.patternProperties,
            additionalProperties: true,
            allowTrailingCommas: true,
            allowComments: true
        };
        jsonRegistry.registerSchema('vscode://schemas/notebook/cellmetadata', metadataSchema);
    }
}
let NotebookEditorManager = class NotebookEditorManager {
    _editorService;
    _notebookEditorModelService;
    _disposables = new DisposableStore();
    constructor(_editorService, _notebookEditorModelService, notebookService, editorGroups) {
        this._editorService = _editorService;
        this._notebookEditorModelService = _notebookEditorModelService;
        this._disposables.add(Event.debounce(this._notebookEditorModelService.onDidChangeDirty, (last, current) => !last ? [current] : [...last, current], 100)(this._openMissingDirtyNotebookEditors, this));
        // CLOSE notebook editor for models that have no more serializer
        this._disposables.add(notebookService.onWillRemoveViewType(e => {
            for (const group of editorGroups.groups) {
                const staleInputs = group.editors.filter(input => input instanceof NotebookEditorInput && input.viewType === e);
                group.closeEditors(staleInputs);
            }
        }));
        // CLOSE editors when we are about to open conflicting notebooks
        this._disposables.add(_notebookEditorModelService.onWillFailWithConflict(e => {
            for (const group of editorGroups.groups) {
                const conflictInputs = group.editors.filter(input => input instanceof NotebookEditorInput && input.viewType !== e.viewType && isEqual(input.resource, e.resource));
                const p = group.closeEditors(conflictInputs);
                e.waitUntil(p);
            }
        }));
    }
    dispose() {
        this._disposables.dispose();
    }
    _openMissingDirtyNotebookEditors(models) {
        const result = [];
        for (const model of models) {
            if (model.isDirty() && !this._editorService.isOpened({ resource: model.resource, typeId: NotebookEditorInput.ID, editorId: model.viewType }) && model.resource.scheme !== Schemas.vscodeInteractive) {
                result.push({
                    resource: model.resource,
                    options: { inactive: true, preserveFocus: true, pinned: true, override: model.viewType }
                });
            }
        }
        if (result.length > 0) {
            this._editorService.openEditors(result);
        }
    }
};
NotebookEditorManager = __decorate([
    __param(0, IEditorService),
    __param(1, INotebookEditorModelResolverService),
    __param(2, INotebookService),
    __param(3, IEditorGroupsService)
], NotebookEditorManager);
let SimpleNotebookWorkingCopyEditorHandler = class SimpleNotebookWorkingCopyEditorHandler extends Disposable {
    _instantiationService;
    _workingCopyEditorService;
    _extensionService;
    constructor(_instantiationService, _workingCopyEditorService, _extensionService) {
        super();
        this._instantiationService = _instantiationService;
        this._workingCopyEditorService = _workingCopyEditorService;
        this._extensionService = _extensionService;
        this._installHandler();
    }
    async _installHandler() {
        await this._extensionService.whenInstalledExtensionsRegistered();
        this._register(this._workingCopyEditorService.registerHandler({
            handles: workingCopy => typeof this._getViewType(workingCopy) === 'string',
            isOpen: (workingCopy, editor) => editor instanceof NotebookEditorInput && editor.viewType === this._getViewType(workingCopy) && isEqual(workingCopy.resource, editor.resource),
            createEditor: workingCopy => NotebookEditorInput.create(this._instantiationService, workingCopy.resource, this._getViewType(workingCopy))
        }));
    }
    _getViewType(workingCopy) {
        return NotebookWorkingCopyTypeIdentifier.parse(workingCopy.typeId);
    }
};
SimpleNotebookWorkingCopyEditorHandler = __decorate([
    __param(0, IInstantiationService),
    __param(1, IWorkingCopyEditorService),
    __param(2, IExtensionService)
], SimpleNotebookWorkingCopyEditorHandler);
let ComplexNotebookWorkingCopyEditorHandler = class ComplexNotebookWorkingCopyEditorHandler extends Disposable {
    _instantiationService;
    _workingCopyEditorService;
    _extensionService;
    _workingCopyBackupService;
    constructor(_instantiationService, _workingCopyEditorService, _extensionService, _workingCopyBackupService) {
        super();
        this._instantiationService = _instantiationService;
        this._workingCopyEditorService = _workingCopyEditorService;
        this._extensionService = _extensionService;
        this._workingCopyBackupService = _workingCopyBackupService;
        this._installHandler();
    }
    async _installHandler() {
        await this._extensionService.whenInstalledExtensionsRegistered();
        this._register(this._workingCopyEditorService.registerHandler({
            handles: workingCopy => workingCopy.resource.scheme === Schemas.vscodeNotebook,
            isOpen: (workingCopy, editor) => {
                if (isCompositeNotebookEditorInput(editor)) {
                    return !!editor.editorInputs.find(input => isEqual(URI.from({ scheme: Schemas.vscodeNotebook, path: input.resource.toString() }), workingCopy.resource));
                }
                return editor instanceof NotebookEditorInput && isEqual(URI.from({ scheme: Schemas.vscodeNotebook, path: editor.resource.toString() }), workingCopy.resource);
            },
            createEditor: async (workingCopy) => {
                // TODO this is really bad and should adopt the `typeId`
                // for backups instead of storing that information in the
                // backup.
                // But since complex notebooks are deprecated, not worth
                // pushing for it and should eventually delete this code
                // entirely.
                const backup = await this._workingCopyBackupService.resolve(workingCopy);
                if (!backup?.meta) {
                    throw new Error(`No backup found for Notebook editor: ${workingCopy.resource}`);
                }
                return NotebookEditorInput.create(this._instantiationService, workingCopy.resource, backup.meta.viewType, { startDirty: true });
            }
        }));
    }
};
ComplexNotebookWorkingCopyEditorHandler = __decorate([
    __param(0, IInstantiationService),
    __param(1, IWorkingCopyEditorService),
    __param(2, IExtensionService),
    __param(3, IWorkingCopyBackupService)
], ComplexNotebookWorkingCopyEditorHandler);
let NotebookLanguageSelectorScoreRefine = class NotebookLanguageSelectorScoreRefine {
    _notebookService;
    constructor(_notebookService, languageFeaturesService) {
        this._notebookService = _notebookService;
        languageFeaturesService.setNotebookTypeResolver(this._getNotebookInfo.bind(this));
    }
    _getNotebookInfo(uri) {
        const cellUri = CellUri.parse(uri);
        if (!cellUri) {
            return undefined;
        }
        const notebook = this._notebookService.getNotebookTextModel(cellUri.notebook);
        if (!notebook) {
            return undefined;
        }
        return {
            uri: notebook.uri,
            type: notebook.viewType
        };
    }
};
NotebookLanguageSelectorScoreRefine = __decorate([
    __param(0, INotebookService),
    __param(1, ILanguageFeaturesService)
], NotebookLanguageSelectorScoreRefine);
const workbenchContributionsRegistry = Registry.as(WorkbenchExtensions.Workbench);
workbenchContributionsRegistry.registerWorkbenchContribution(NotebookContribution, 1 /* LifecyclePhase.Starting */);
workbenchContributionsRegistry.registerWorkbenchContribution(CellContentProvider, 1 /* LifecyclePhase.Starting */);
workbenchContributionsRegistry.registerWorkbenchContribution(CellInfoContentProvider, 1 /* LifecyclePhase.Starting */);
workbenchContributionsRegistry.registerWorkbenchContribution(RegisterSchemasContribution, 1 /* LifecyclePhase.Starting */);
workbenchContributionsRegistry.registerWorkbenchContribution(NotebookEditorManager, 2 /* LifecyclePhase.Ready */);
workbenchContributionsRegistry.registerWorkbenchContribution(NotebookLanguageSelectorScoreRefine, 2 /* LifecyclePhase.Ready */);
workbenchContributionsRegistry.registerWorkbenchContribution(SimpleNotebookWorkingCopyEditorHandler, 2 /* LifecyclePhase.Ready */);
workbenchContributionsRegistry.registerWorkbenchContribution(ComplexNotebookWorkingCopyEditorHandler, 2 /* LifecyclePhase.Ready */);
registerSingleton(INotebookService, NotebookService, 1 /* InstantiationType.Delayed */);
registerSingleton(INotebookEditorWorkerService, NotebookEditorWorkerServiceImpl, 1 /* InstantiationType.Delayed */);
registerSingleton(INotebookEditorModelResolverService, NotebookModelResolverServiceImpl, 1 /* InstantiationType.Delayed */);
registerSingleton(INotebookCellStatusBarService, NotebookCellStatusBarService, 1 /* InstantiationType.Delayed */);
registerSingleton(INotebookEditorService, NotebookEditorWidgetService, 1 /* InstantiationType.Delayed */);
registerSingleton(INotebookKernelService, NotebookKernelService, 1 /* InstantiationType.Delayed */);
registerSingleton(INotebookExecutionService, NotebookExecutionService, 1 /* InstantiationType.Delayed */);
registerSingleton(INotebookExecutionStateService, NotebookExecutionStateService, 1 /* InstantiationType.Delayed */);
registerSingleton(INotebookRendererMessagingService, NotebookRendererMessagingService, 1 /* InstantiationType.Delayed */);
registerSingleton(INotebookKeymapService, NotebookKeymapService, 1 /* InstantiationType.Delayed */);
const schemas = {};
function isConfigurationPropertySchema(x) {
    return (typeof x.type !== 'undefined' || typeof x.anyOf !== 'undefined');
}
for (const editorOption of editorOptionsRegistry) {
    const schema = editorOption.schema;
    if (schema) {
        if (isConfigurationPropertySchema(schema)) {
            schemas[`editor.${editorOption.name}`] = schema;
        }
        else {
            for (const key in schema) {
                if (Object.hasOwnProperty.call(schema, key)) {
                    schemas[key] = schema[key];
                }
            }
        }
    }
}
const editorOptionsCustomizationSchema = {
    description: nls.localize('notebook.editorOptions.experimentalCustomization', 'Settings for code editors used in notebooks. This can be used to customize most editor.* settings.'),
    default: {},
    allOf: [
        {
            properties: schemas,
        }
        // , {
        // 	patternProperties: {
        // 		'^\\[.*\\]$': {
        // 			type: 'object',
        // 			default: {},
        // 			properties: schemas
        // 		}
        // 	}
        // }
    ],
    tags: ['notebookLayout']
};
const configurationRegistry = Registry.as(Extensions.Configuration);
configurationRegistry.registerConfiguration({
    id: 'notebook',
    order: 100,
    title: nls.localize('notebookConfigurationTitle', "Notebook"),
    type: 'object',
    properties: {
        [NotebookSetting.displayOrder]: {
            description: nls.localize('notebook.displayOrder.description', "Priority list for output mime types"),
            type: 'array',
            items: {
                type: 'string'
            },
            default: []
        },
        [NotebookSetting.cellToolbarLocation]: {
            description: nls.localize('notebook.cellToolbarLocation.description', "Where the cell toolbar should be shown, or whether it should be hidden."),
            type: 'object',
            additionalProperties: {
                markdownDescription: nls.localize('notebook.cellToolbarLocation.viewType', "Configure the cell toolbar position for for specific file types"),
                type: 'string',
                enum: ['left', 'right', 'hidden']
            },
            default: {
                'default': 'right'
            },
            tags: ['notebookLayout']
        },
        [NotebookSetting.showCellStatusBar]: {
            description: nls.localize('notebook.showCellStatusbar.description', "Whether the cell status bar should be shown."),
            type: 'string',
            enum: ['hidden', 'visible', 'visibleAfterExecute'],
            enumDescriptions: [
                nls.localize('notebook.showCellStatusbar.hidden.description', "The cell Status bar is always hidden."),
                nls.localize('notebook.showCellStatusbar.visible.description', "The cell Status bar is always visible."),
                nls.localize('notebook.showCellStatusbar.visibleAfterExecute.description', "The cell Status bar is hidden until the cell has executed. Then it becomes visible to show the execution status.")
            ],
            default: 'visible',
            tags: ['notebookLayout']
        },
        [NotebookSetting.textDiffEditorPreview]: {
            description: nls.localize('notebook.diff.enablePreview.description', "Whether to use the enhanced text diff editor for notebook."),
            type: 'boolean',
            default: true,
            tags: ['notebookLayout']
        },
        [NotebookSetting.cellToolbarVisibility]: {
            markdownDescription: nls.localize('notebook.cellToolbarVisibility.description', "Whether the cell toolbar should appear on hover or click."),
            type: 'string',
            enum: ['hover', 'click'],
            default: 'click',
            tags: ['notebookLayout']
        },
        [NotebookSetting.undoRedoPerCell]: {
            description: nls.localize('notebook.undoRedoPerCell.description', "Whether to use separate undo/redo stack for each cell."),
            type: 'boolean',
            default: true,
            tags: ['notebookLayout']
        },
        [NotebookSetting.compactView]: {
            description: nls.localize('notebook.compactView.description', "Control whether the notebook editor should be rendered in a compact form. For example, when turned on, it will decrease the left margin width."),
            type: 'boolean',
            default: true,
            tags: ['notebookLayout']
        },
        [NotebookSetting.focusIndicator]: {
            description: nls.localize('notebook.focusIndicator.description', "Controls where the focus indicator is rendered, either along the cell borders or on the left gutter."),
            type: 'string',
            enum: ['border', 'gutter'],
            default: 'gutter',
            tags: ['notebookLayout']
        },
        [NotebookSetting.insertToolbarLocation]: {
            description: nls.localize('notebook.insertToolbarPosition.description', "Control where the insert cell actions should appear."),
            type: 'string',
            enum: ['betweenCells', 'notebookToolbar', 'both', 'hidden'],
            enumDescriptions: [
                nls.localize('insertToolbarLocation.betweenCells', "A toolbar that appears on hover between cells."),
                nls.localize('insertToolbarLocation.notebookToolbar', "The toolbar at the top of the notebook editor."),
                nls.localize('insertToolbarLocation.both', "Both toolbars."),
                nls.localize('insertToolbarLocation.hidden', "The insert actions don't appear anywhere."),
            ],
            default: 'both',
            tags: ['notebookLayout']
        },
        [NotebookSetting.globalToolbar]: {
            description: nls.localize('notebook.globalToolbar.description', "Control whether to render a global toolbar inside the notebook editor."),
            type: 'boolean',
            default: true,
            tags: ['notebookLayout']
        },
        [NotebookSetting.consolidatedOutputButton]: {
            description: nls.localize('notebook.consolidatedOutputButton.description', "Control whether outputs action should be rendered in the output toolbar."),
            type: 'boolean',
            default: true,
            tags: ['notebookLayout']
        },
        [NotebookSetting.showFoldingControls]: {
            description: nls.localize('notebook.showFoldingControls.description', "Controls when the Markdown header folding arrow is shown."),
            type: 'string',
            enum: ['always', 'never', 'mouseover'],
            enumDescriptions: [
                nls.localize('showFoldingControls.always', "The folding controls are always visible."),
                nls.localize('showFoldingControls.never', "Never show the folding controls and reduce the gutter size."),
                nls.localize('showFoldingControls.mouseover', "The folding controls are visible only on mouseover."),
            ],
            default: 'mouseover',
            tags: ['notebookLayout']
        },
        [NotebookSetting.dragAndDropEnabled]: {
            description: nls.localize('notebook.dragAndDrop.description', "Control whether the notebook editor should allow moving cells through drag and drop."),
            type: 'boolean',
            default: true,
            tags: ['notebookLayout']
        },
        [NotebookSetting.consolidatedRunButton]: {
            description: nls.localize('notebook.consolidatedRunButton.description', "Control whether extra actions are shown in a dropdown next to the run button."),
            type: 'boolean',
            default: false,
            tags: ['notebookLayout']
        },
        [NotebookSetting.globalToolbarShowLabel]: {
            description: nls.localize('notebook.globalToolbarShowLabel', "Control whether the actions on the notebook toolbar should render label or not."),
            type: 'string',
            enum: ['always', 'never', 'dynamic'],
            default: 'always',
            tags: ['notebookLayout']
        },
        [NotebookSetting.textOutputLineLimit]: {
            description: nls.localize('notebook.textOutputLineLimit', "Control how many lines of text in a text output is rendered."),
            type: 'number',
            default: 30,
            tags: ['notebookLayout']
        },
        [NotebookSetting.markupFontSize]: {
            markdownDescription: nls.localize('notebook.markup.fontSize', "Controls the font size in pixels of rendered markup in notebooks. When set to {0}, 120% of {1} is used.", '`0`', '`#editor.fontSize#`'),
            type: 'number',
            default: 0,
            tags: ['notebookLayout']
        },
        [NotebookSetting.cellEditorOptionsCustomizations]: editorOptionsCustomizationSchema,
        [NotebookSetting.interactiveWindowCollapseCodeCells]: {
            markdownDescription: nls.localize('notebook.interactiveWindow.collapseCodeCells', "Controls whether code cells in the interactive window are collapsed by default."),
            type: 'string',
            enum: ['always', 'never', 'fromEditor'],
            default: 'fromEditor'
        },
        [NotebookSetting.outputLineHeight]: {
            markdownDescription: nls.localize('notebook.outputLineHeight', "Line height of the output text for notebook cells.\n - Values between 0 and 8 will be used as a multiplier with the font size.\n - Values greater than or equal to 8 will be used as effective values."),
            type: 'number',
            default: 22,
            tags: ['notebookLayout']
        },
        [NotebookSetting.outputFontSize]: {
            markdownDescription: nls.localize('notebook.outputFontSize', "Font size for the output text for notebook cells. When set to 0, {0} is used.", '`#editor.fontSize#`'),
            type: 'number',
            default: 0,
            tags: ['notebookLayout']
        },
        [NotebookSetting.outputFontFamily]: {
            markdownDescription: nls.localize('notebook.outputFontFamily', "The font family for the output text for notebook cells. When set to empty, the {0} is used.", '`#editor.fontFamily#`'),
            type: 'string',
            tags: ['notebookLayout']
        },
        [NotebookSetting.kernelPickerType]: {
            markdownDescription: nls.localize('notebook.kernelPickerType', "Controls the type of kernel picker to use."),
            type: 'string',
            enum: ['all', 'mru'],
            enumDescriptions: [
                nls.localize('notebook.kernelPickerType.all', "Show all kernels."),
                nls.localize('notebook.kernelPickerType.mru', "Experiment: show recently used kernels."),
            ],
            tags: ['notebookLayout'],
            default: 'all'
        }
    }
});

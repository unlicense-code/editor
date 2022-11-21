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
import { VSBuffer } from 'vs/base/common/buffer';
import { Iterable } from 'vs/base/common/iterator';
import { Disposable } from 'vs/base/common/lifecycle';
import { parse } from 'vs/base/common/marshalling';
import { Schemas } from 'vs/base/common/network';
import { extname } from 'vs/base/common/resources';
import { isFalsyOrWhitespace } from 'vs/base/common/strings';
import { assertType } from 'vs/base/common/types';
import { URI } from 'vs/base/common/uri';
import { IBulkEditService } from 'vs/editor/browser/services/bulkEditService';
import { EditOperation } from 'vs/editor/common/core/editOperation';
import { PLAINTEXT_LANGUAGE_ID } from 'vs/editor/common/languages/modesRegistry';
import { IModelService } from 'vs/editor/common/services/model';
import { ITextModelService } from 'vs/editor/common/services/resolverService';
import { peekViewBorder /*, peekViewEditorBackground, peekViewResultsBackground */ } from 'vs/editor/contrib/peekView/browser/peekView';
import { Context as SuggestContext } from 'vs/editor/contrib/suggest/browser/suggest';
import { localize } from 'vs/nls';
import { Action2, MenuId, registerAction2 } from 'vs/platform/actions/common/actions';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { Extensions as ConfigurationExtensions } from 'vs/platform/configuration/common/configurationRegistry';
import { ContextKeyExpr } from 'vs/platform/contextkey/common/contextkey';
import { EditorActivation } from 'vs/platform/editor/common/editor';
import { ExtensionIdentifier } from 'vs/platform/extensions/common/extensions';
import { SyncDescriptor } from 'vs/platform/instantiation/common/descriptors';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ILogService } from 'vs/platform/log/common/log';
import { Registry } from 'vs/platform/registry/common/platform';
import { contrastBorder, listInactiveSelectionBackground, registerColor, transparent } from 'vs/platform/theme/common/colorRegistry';
import { registerThemingParticipant } from 'vs/platform/theme/common/themeService';
import { EditorPaneDescriptor } from 'vs/workbench/browser/editor';
import { Extensions as WorkbenchExtensions } from 'vs/workbench/common/contributions';
import { EditorExtensions } from 'vs/workbench/common/editor';
// import { Color } from 'vs/base/common/color';
import { PANEL_BORDER } from 'vs/workbench/common/theme';
import { ResourceNotebookCellEdit } from 'vs/workbench/contrib/bulkEdit/browser/bulkCellEdits';
import { InteractiveWindowSetting, INTERACTIVE_INPUT_CURSOR_BOUNDARY } from 'vs/workbench/contrib/interactive/browser/interactiveCommon';
import { IInteractiveDocumentService, InteractiveDocumentService } from 'vs/workbench/contrib/interactive/browser/interactiveDocumentService';
import { InteractiveEditor } from 'vs/workbench/contrib/interactive/browser/interactiveEditor';
import { InteractiveEditorInput } from 'vs/workbench/contrib/interactive/browser/interactiveEditorInput';
import { IInteractiveHistoryService, InteractiveHistoryService } from 'vs/workbench/contrib/interactive/browser/interactiveHistoryService';
import { NOTEBOOK_EDITOR_WIDGET_ACTION_WEIGHT } from 'vs/workbench/contrib/notebook/browser/controller/coreActions';
import * as icons from 'vs/workbench/contrib/notebook/browser/notebookIcons';
import { INotebookEditorService } from 'vs/workbench/contrib/notebook/browser/services/notebookEditorService';
import { CellKind, CellUri, INTERACTIVE_WINDOW_EDITOR_ID } from 'vs/workbench/contrib/notebook/common/notebookCommon';
import { INotebookKernelService } from 'vs/workbench/contrib/notebook/common/notebookKernelService';
import { INotebookService } from 'vs/workbench/contrib/notebook/common/notebookService';
import { columnToEditorGroup } from 'vs/workbench/services/editor/common/editorGroupColumn';
import { IEditorGroupsService } from 'vs/workbench/services/editor/common/editorGroupsService';
import { IEditorResolverService, RegisteredEditorPriority } from 'vs/workbench/services/editor/common/editorResolverService';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
const interactiveWindowCategory = { value: localize('interactiveWindow', 'Interactive Window'), original: 'Interactive Window' };
Registry.as(EditorExtensions.EditorPane).registerEditorPane(EditorPaneDescriptor.create(InteractiveEditor, INTERACTIVE_WINDOW_EDITOR_ID, 'Interactive Window'), [
    new SyncDescriptor(InteractiveEditorInput)
]);
let InteractiveDocumentContribution = class InteractiveDocumentContribution extends Disposable {
    constructor(notebookService, editorResolverService, editorService) {
        super();
        const contentOptions = {
            transientOutputs: true,
            transientCellMetadata: {},
            transientDocumentMetadata: {},
            cellContentMetadata: {}
        };
        const controller = {
            get options() {
                return contentOptions;
            },
            set options(newOptions) {
                contentOptions.transientCellMetadata = newOptions.transientCellMetadata;
                contentOptions.transientDocumentMetadata = newOptions.transientDocumentMetadata;
                contentOptions.transientOutputs = newOptions.transientOutputs;
            },
            open: async (_uri, _backupId, _untitledDocumentData, _token) => {
                if (_backupId instanceof VSBuffer) {
                    const backup = _backupId.toString();
                    try {
                        const document = JSON.parse(backup);
                        return {
                            data: {
                                metadata: {},
                                cells: document.cells.map(cell => ({
                                    source: cell.content,
                                    language: cell.language,
                                    cellKind: cell.kind,
                                    mime: cell.mime,
                                    outputs: cell.outputs
                                        ? cell.outputs.map(output => ({
                                            outputId: output.outputId,
                                            outputs: output.outputs.map(ot => ({
                                                mime: ot.mime,
                                                data: ot.data
                                            }))
                                        }))
                                        : [],
                                    metadata: cell.metadata
                                }))
                            },
                            transientOptions: contentOptions
                        };
                    }
                    catch (_e) { }
                }
                return {
                    data: {
                        metadata: {},
                        cells: []
                    },
                    transientOptions: contentOptions
                };
            },
            backup: async (uri, token) => {
                const doc = notebookService.listNotebookDocuments().find(document => document.uri.toString() === uri.toString());
                if (doc) {
                    const cells = doc.cells.map(cell => ({
                        kind: cell.cellKind,
                        language: cell.language,
                        metadata: cell.metadata,
                        mine: cell.mime,
                        outputs: cell.outputs.map(output => {
                            return {
                                outputId: output.outputId,
                                outputs: output.outputs.map(ot => ({
                                    mime: ot.mime,
                                    data: ot.data
                                }))
                            };
                        }),
                        content: cell.getValue()
                    }));
                    const buffer = VSBuffer.fromString(JSON.stringify({
                        cells: cells
                    }));
                    return buffer;
                }
                else {
                    return '';
                }
            }
        };
        this._register(notebookService.registerNotebookController('interactive', {
            id: new ExtensionIdentifier('interactive.builtin'),
            location: undefined
        }, controller));
        const info = notebookService.getContributedNotebookType('interactive');
        // We need to contribute a notebook type for the Interactive Window to provide notebook models.
        // Don't add a file selector for the notebook type to avoid having the notebook Service create an editor for it.
        // The IW editor is registered below, and we don't want it overwritten by the notebook Service.
        if (!info) {
            this._register(notebookService.registerContributedNotebookType('interactive', {
                providerDisplayName: 'Interactive Notebook',
                displayName: 'Interactive',
                filenamePattern: ['*.interactive'],
                exclusive: true
            }));
        }
        editorResolverService.registerEditor(`${Schemas.vscodeInteractiveInput}:/**`, {
            id: 'vscode-interactive-input',
            label: 'Interactive Editor',
            priority: RegisteredEditorPriority.exclusive
        }, {
            canSupportResource: uri => uri.scheme === Schemas.vscodeInteractiveInput,
            singlePerResource: true
        }, {
            createEditorInput: ({ resource }) => {
                const editorInput = editorService.getEditors(1 /* EditorsOrder.SEQUENTIAL */).find(editor => editor.editor instanceof InteractiveEditorInput && editor.editor.inputResource.toString() === resource.toString());
                return editorInput;
            }
        });
        editorResolverService.registerEditor(`*.interactive`, {
            id: 'interactive',
            label: 'Interactive Editor',
            priority: RegisteredEditorPriority.exclusive
        }, {
            canSupportResource: uri => uri.scheme === Schemas.vscodeInteractive || (uri.scheme === Schemas.vscodeNotebookCell && extname(uri) === '.interactive'),
            singlePerResource: true
        }, {
            createEditorInput: ({ resource, options }) => {
                const data = CellUri.parse(resource);
                let notebookUri = resource;
                let cellOptions;
                if (data) {
                    notebookUri = data.notebook;
                    cellOptions = { resource, options };
                }
                const notebookOptions = { ...options, cellOptions };
                const editorInput = editorService.getEditors(1 /* EditorsOrder.SEQUENTIAL */).find(editor => editor.editor instanceof InteractiveEditorInput && editor.editor.resource?.toString() === notebookUri.toString());
                return {
                    editor: editorInput.editor,
                    options: notebookOptions
                };
            }
        });
    }
};
InteractiveDocumentContribution = __decorate([
    __param(0, INotebookService),
    __param(1, IEditorResolverService),
    __param(2, IEditorService)
], InteractiveDocumentContribution);
export { InteractiveDocumentContribution };
let InteractiveInputContentProvider = class InteractiveInputContentProvider {
    _modelService;
    _registration;
    constructor(textModelService, _modelService) {
        this._modelService = _modelService;
        this._registration = textModelService.registerTextModelContentProvider(Schemas.vscodeInteractiveInput, this);
    }
    dispose() {
        this._registration.dispose();
    }
    async provideTextContent(resource) {
        const existing = this._modelService.getModel(resource);
        if (existing) {
            return existing;
        }
        const result = this._modelService.createModel('', null, resource, false);
        return result;
    }
};
InteractiveInputContentProvider = __decorate([
    __param(0, ITextModelService),
    __param(1, IModelService)
], InteractiveInputContentProvider);
const workbenchContributionsRegistry = Registry.as(WorkbenchExtensions.Workbench);
workbenchContributionsRegistry.registerWorkbenchContribution(InteractiveDocumentContribution, 2 /* LifecyclePhase.Ready */);
workbenchContributionsRegistry.registerWorkbenchContribution(InteractiveInputContentProvider, 2 /* LifecyclePhase.Ready */);
let InteractiveEditorSerializer = class InteractiveEditorSerializer {
    configurationService;
    static ID = InteractiveEditorInput.ID;
    constructor(configurationService) {
        this.configurationService = configurationService;
    }
    canSerialize() {
        return this.configurationService.getValue(InteractiveWindowSetting.interactiveWindowRestore);
    }
    serialize(input) {
        assertType(input instanceof InteractiveEditorInput);
        return JSON.stringify({
            resource: input.primary.resource,
            inputResource: input.inputResource,
            name: input.getName(),
            data: input.getSerialization()
        });
    }
    deserialize(instantiationService, raw) {
        if (!this.canSerialize()) {
            return undefined;
        }
        const data = parse(raw);
        if (!data) {
            return undefined;
        }
        const { resource, inputResource } = data;
        if (!data || !URI.isUri(resource) || !URI.isUri(inputResource)) {
            return undefined;
        }
        const input = InteractiveEditorInput.create(instantiationService, resource, inputResource);
        input.restoreSerialization(data.data);
        return input;
    }
};
InteractiveEditorSerializer = __decorate([
    __param(0, IConfigurationService)
], InteractiveEditorSerializer);
export { InteractiveEditorSerializer };
Registry.as(EditorExtensions.EditorFactory)
    .registerEditorSerializer(InteractiveEditorSerializer.ID, InteractiveEditorSerializer);
registerSingleton(IInteractiveHistoryService, InteractiveHistoryService, 1 /* InstantiationType.Delayed */);
registerSingleton(IInteractiveDocumentService, InteractiveDocumentService, 1 /* InstantiationType.Delayed */);
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: '_interactive.open',
            title: { value: localize('interactive.open', "Open Interactive Window"), original: 'Open Interactive Window' },
            f1: false,
            category: interactiveWindowCategory,
            description: {
                description: localize('interactive.open', "Open Interactive Window"),
                args: [
                    {
                        name: 'showOptions',
                        description: 'Show Options',
                        schema: {
                            type: 'object',
                            properties: {
                                'viewColumn': {
                                    type: 'number',
                                    default: -1
                                },
                                'preserveFocus': {
                                    type: 'boolean',
                                    default: true
                                }
                            },
                        }
                    },
                    {
                        name: 'resource',
                        description: 'Interactive resource Uri',
                        isOptional: true
                    },
                    {
                        name: 'controllerId',
                        description: 'Notebook controller Id',
                        isOptional: true
                    },
                    {
                        name: 'title',
                        description: 'Notebook editor title',
                        isOptional: true
                    }
                ]
            }
        });
    }
    async run(accessor, showOptions, resource, id, title) {
        const editorService = accessor.get(IEditorService);
        const editorGroupService = accessor.get(IEditorGroupsService);
        const historyService = accessor.get(IInteractiveHistoryService);
        const kernelService = accessor.get(INotebookKernelService);
        const logService = accessor.get(ILogService);
        const configurationService = accessor.get(IConfigurationService);
        const group = columnToEditorGroup(editorGroupService, configurationService, typeof showOptions === 'number' ? showOptions : showOptions?.viewColumn);
        const editorOptions = {
            activation: EditorActivation.PRESERVE,
            preserveFocus: typeof showOptions !== 'number' ? (showOptions?.preserveFocus ?? false) : false
        };
        if (resource && resource.scheme === Schemas.vscodeInteractive) {
            logService.debug('Open interactive window from resource:', resource.toString());
            const resourceUri = URI.revive(resource);
            const editors = editorService.findEditors(resourceUri).filter(id => id.editor instanceof InteractiveEditorInput && id.editor.resource?.toString() === resourceUri.toString());
            if (editors.length) {
                logService.debug('Find existing interactive window:', resource.toString());
                const editorInput = editors[0].editor;
                const currentGroup = editors[0].groupId;
                const editor = await editorService.openEditor(editorInput, editorOptions, currentGroup);
                const editorControl = editor?.getControl();
                return {
                    notebookUri: editorInput.resource,
                    inputUri: editorInput.inputResource,
                    notebookEditorId: editorControl?.notebookEditor?.getId()
                };
            }
        }
        const existingNotebookDocument = new Set();
        editorService.getEditors(1 /* EditorsOrder.SEQUENTIAL */).forEach(editor => {
            if (editor.editor.resource) {
                existingNotebookDocument.add(editor.editor.resource.toString());
            }
        });
        let notebookUri = undefined;
        let inputUri = undefined;
        let counter = 1;
        do {
            notebookUri = URI.from({ scheme: Schemas.vscodeInteractive, path: `Interactive-${counter}.interactive` });
            inputUri = URI.from({ scheme: Schemas.vscodeInteractiveInput, path: `/InteractiveInput-${counter}` });
            counter++;
        } while (existingNotebookDocument.has(notebookUri.toString()));
        logService.debug('Open new interactive window:', notebookUri.toString(), inputUri.toString());
        if (id) {
            const allKernels = kernelService.getMatchingKernel({ uri: notebookUri, viewType: 'interactive' }).all;
            const preferredKernel = allKernels.find(kernel => kernel.id === id);
            if (preferredKernel) {
                kernelService.preselectKernelForNotebook(preferredKernel, { uri: notebookUri, viewType: 'interactive' });
            }
        }
        const editorInput = InteractiveEditorInput.create(accessor.get(IInstantiationService), notebookUri, inputUri, title);
        historyService.clearHistory(notebookUri);
        const editorPane = await editorService.openEditor(editorInput, editorOptions, group);
        const editorControl = editorPane?.getControl();
        // Extensions must retain references to these URIs to manipulate the interactive editor
        logService.debug('New interactive window opened. Notebook editor id', editorControl?.notebookEditor?.getId());
        return { notebookUri, inputUri, notebookEditorId: editorControl?.notebookEditor?.getId() };
    }
});
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: 'interactive.execute',
            title: { value: localize('interactive.execute', "Execute Code"), original: 'Execute Code' },
            category: interactiveWindowCategory,
            keybinding: {
                // when: NOTEBOOK_CELL_LIST_FOCUSED,
                when: ContextKeyExpr.equals('resourceScheme', Schemas.vscodeInteractive),
                primary: 256 /* KeyMod.WinCtrl */ | 3 /* KeyCode.Enter */,
                win: {
                    primary: 2048 /* KeyMod.CtrlCmd */ | 3 /* KeyCode.Enter */
                },
                weight: NOTEBOOK_EDITOR_WIDGET_ACTION_WEIGHT
            },
            menu: [
                {
                    id: MenuId.InteractiveInputExecute
                }
            ],
            icon: icons.executeIcon,
            f1: false,
            description: {
                description: 'Execute the Contents of the Input Box',
                args: [
                    {
                        name: 'resource',
                        description: 'Interactive resource Uri',
                        isOptional: true
                    }
                ]
            }
        });
    }
    async run(accessor, context) {
        const editorService = accessor.get(IEditorService);
        const bulkEditService = accessor.get(IBulkEditService);
        const historyService = accessor.get(IInteractiveHistoryService);
        const notebookEditorService = accessor.get(INotebookEditorService);
        let editorControl;
        if (context) {
            if (context.scheme === Schemas.vscodeInteractive) {
                const resourceUri = URI.revive(context);
                const editors = editorService.findEditors(resourceUri).filter(id => id.editor instanceof InteractiveEditorInput && id.editor.resource?.toString() === resourceUri.toString());
                if (editors.length) {
                    const editorInput = editors[0].editor;
                    const currentGroup = editors[0].groupId;
                    const editor = await editorService.openEditor(editorInput, currentGroup);
                    editorControl = editor?.getControl();
                }
            }
        }
        else {
            editorControl = editorService.activeEditorPane?.getControl();
        }
        if (editorControl && editorControl.notebookEditor && editorControl.codeEditor) {
            const notebookDocument = editorControl.notebookEditor.textModel;
            const textModel = editorControl.codeEditor.getModel();
            const activeKernel = editorControl.notebookEditor.activeKernel;
            const language = activeKernel?.supportedLanguages[0] ?? PLAINTEXT_LANGUAGE_ID;
            if (notebookDocument && textModel) {
                const index = notebookDocument.length;
                const value = textModel.getValue();
                if (isFalsyOrWhitespace(value)) {
                    return;
                }
                historyService.addToHistory(notebookDocument.uri, '');
                textModel.setValue('');
                const collapseState = editorControl.notebookEditor.notebookOptions.getLayoutConfiguration().interactiveWindowCollapseCodeCells === 'fromEditor' ?
                    {
                        inputCollapsed: false,
                        outputCollapsed: false
                    } :
                    undefined;
                await bulkEditService.apply([
                    new ResourceNotebookCellEdit(notebookDocument.uri, {
                        editType: 1 /* CellEditType.Replace */,
                        index: index,
                        count: 0,
                        cells: [{
                                cellKind: CellKind.Code,
                                mime: undefined,
                                language,
                                source: value,
                                outputs: [],
                                metadata: {},
                                collapseState
                            }]
                    })
                ]);
                // reveal the cell into view first
                const range = { start: index, end: index + 1 };
                editorControl.notebookEditor.revealCellRangeInView(range);
                await editorControl.notebookEditor.executeNotebookCells(editorControl.notebookEditor.getCellsInRange({ start: index, end: index + 1 }));
                // update the selection and focus in the extension host model
                const editor = notebookEditorService.getNotebookEditor(editorControl.notebookEditor.getId());
                if (editor) {
                    editor.setSelections([range]);
                    editor.setFocus(range);
                }
            }
        }
    }
});
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: 'interactive.input.clear',
            title: { value: localize('interactive.input.clear', "Clear the interactive window input editor contents"), original: 'Clear the interactive window input editor contents' },
            category: interactiveWindowCategory,
            f1: false
        });
    }
    async run(accessor) {
        const editorService = accessor.get(IEditorService);
        const editorControl = editorService.activeEditorPane?.getControl();
        if (editorControl && editorControl.notebookEditor && editorControl.codeEditor) {
            const notebookDocument = editorControl.notebookEditor.textModel;
            const textModel = editorControl.codeEditor.getModel();
            const range = editorControl.codeEditor.getModel()?.getFullModelRange();
            if (notebookDocument && textModel && range) {
                editorControl.codeEditor.executeEdits('', [EditOperation.replace(range, null)]);
            }
        }
    }
});
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: 'interactive.history.previous',
            title: { value: localize('interactive.history.previous', "Previous value in history"), original: 'Previous value in history' },
            category: interactiveWindowCategory,
            f1: false,
            keybinding: {
                when: ContextKeyExpr.and(ContextKeyExpr.equals('resourceScheme', Schemas.vscodeInteractive), INTERACTIVE_INPUT_CURSOR_BOUNDARY.notEqualsTo('bottom'), INTERACTIVE_INPUT_CURSOR_BOUNDARY.notEqualsTo('none'), SuggestContext.Visible.toNegated()),
                primary: 16 /* KeyCode.UpArrow */,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */
            },
        });
    }
    async run(accessor) {
        const editorService = accessor.get(IEditorService);
        const historyService = accessor.get(IInteractiveHistoryService);
        const editorControl = editorService.activeEditorPane?.getControl();
        if (editorControl && editorControl.notebookEditor && editorControl.codeEditor) {
            const notebookDocument = editorControl.notebookEditor.textModel;
            const textModel = editorControl.codeEditor.getModel();
            if (notebookDocument && textModel) {
                const previousValue = historyService.getPreviousValue(notebookDocument.uri);
                if (previousValue) {
                    textModel.setValue(previousValue);
                }
            }
        }
    }
});
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: 'interactive.history.next',
            title: { value: localize('interactive.history.next', "Next value in history"), original: 'Next value in history' },
            category: interactiveWindowCategory,
            f1: false,
            keybinding: {
                when: ContextKeyExpr.and(ContextKeyExpr.equals('resourceScheme', Schemas.vscodeInteractive), INTERACTIVE_INPUT_CURSOR_BOUNDARY.notEqualsTo('top'), INTERACTIVE_INPUT_CURSOR_BOUNDARY.notEqualsTo('none'), SuggestContext.Visible.toNegated()),
                primary: 18 /* KeyCode.DownArrow */,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */
            },
        });
    }
    async run(accessor) {
        const editorService = accessor.get(IEditorService);
        const historyService = accessor.get(IInteractiveHistoryService);
        const editorControl = editorService.activeEditorPane?.getControl();
        if (editorControl && editorControl.notebookEditor && editorControl.codeEditor) {
            const notebookDocument = editorControl.notebookEditor.textModel;
            const textModel = editorControl.codeEditor.getModel();
            if (notebookDocument && textModel) {
                const previousValue = historyService.getNextValue(notebookDocument.uri);
                if (previousValue) {
                    textModel.setValue(previousValue);
                }
            }
        }
    }
});
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: 'interactive.scrollToTop',
            title: localize('interactiveScrollToTop', 'Scroll to Top'),
            keybinding: {
                when: ContextKeyExpr.equals('resourceScheme', Schemas.vscodeInteractive),
                primary: 2048 /* KeyMod.CtrlCmd */ | 14 /* KeyCode.Home */,
                mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 16 /* KeyCode.UpArrow */ },
                weight: 200 /* KeybindingWeight.WorkbenchContrib */
            },
            category: interactiveWindowCategory,
        });
    }
    async run(accessor) {
        const editorService = accessor.get(IEditorService);
        const editorControl = editorService.activeEditorPane?.getControl();
        if (editorControl && editorControl.notebookEditor && editorControl.codeEditor) {
            if (editorControl.notebookEditor.getLength() === 0) {
                return;
            }
            editorControl.notebookEditor.revealCellRangeInView({ start: 0, end: 1 });
        }
    }
});
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: 'interactive.scrollToBottom',
            title: localize('interactiveScrollToBottom', 'Scroll to Bottom'),
            keybinding: {
                when: ContextKeyExpr.equals('resourceScheme', Schemas.vscodeInteractive),
                primary: 2048 /* KeyMod.CtrlCmd */ | 13 /* KeyCode.End */,
                mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 18 /* KeyCode.DownArrow */ },
                weight: 200 /* KeybindingWeight.WorkbenchContrib */
            },
            category: interactiveWindowCategory,
        });
    }
    async run(accessor) {
        const editorService = accessor.get(IEditorService);
        const editorControl = editorService.activeEditorPane?.getControl();
        if (editorControl && editorControl.notebookEditor && editorControl.codeEditor) {
            if (editorControl.notebookEditor.getLength() === 0) {
                return;
            }
            const len = editorControl.notebookEditor.getLength();
            editorControl.notebookEditor.revealCellRangeInView({ start: len - 1, end: len });
        }
    }
});
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: 'interactive.input.focus',
            title: { value: localize('interactive.input.focus', "Focus Input Editor"), original: 'Focus Input Editor' },
            category: interactiveWindowCategory,
            f1: true
        });
    }
    async run(accessor) {
        const editorService = accessor.get(IEditorService);
        const editorControl = editorService.activeEditorPane?.getControl();
        if (editorControl && editorControl.notebookEditor && editorControl.codeEditor) {
            editorService.activeEditorPane?.focus();
        }
        else {
            // find and open the most recent interactive window
            const openEditors = editorService.getEditors(0 /* EditorsOrder.MOST_RECENTLY_ACTIVE */);
            const interactiveWindow = Iterable.find(openEditors, identifier => { return identifier.editor.typeId === InteractiveEditorInput.ID; });
            if (interactiveWindow) {
                const editorInput = interactiveWindow.editor;
                const currentGroup = interactiveWindow.groupId;
                const editor = await editorService.openEditor(editorInput, currentGroup);
                const editorControl = editor?.getControl();
                if (editorControl && editorControl.notebookEditor && editorControl.codeEditor) {
                    editorService.activeEditorPane?.focus();
                }
            }
        }
    }
});
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: 'interactive.history.focus',
            title: { value: localize('interactive.history.focus', "Focus History"), original: 'Focus History' },
            category: interactiveWindowCategory,
            f1: true,
            precondition: ContextKeyExpr.equals('resourceScheme', Schemas.vscodeInteractive),
        });
    }
    async run(accessor) {
        const editorService = accessor.get(IEditorService);
        const editorControl = editorService.activeEditorPane?.getControl();
        if (editorControl && editorControl.notebookEditor && editorControl.codeEditor) {
            editorControl.notebookEditor.focus();
        }
    }
});
registerThemingParticipant((theme) => {
    registerColor('interactive.activeCodeBorder', {
        dark: theme.getColor(peekViewBorder) ?? '#007acc',
        light: theme.getColor(peekViewBorder) ?? '#007acc',
        hcDark: contrastBorder,
        hcLight: contrastBorder
    }, localize('interactive.activeCodeBorder', 'The border color for the current interactive code cell when the editor has focus.'));
    // registerColor('interactive.activeCodeBackground', {
    // 	dark: (theme.getColor(peekViewEditorBackground) ?? Color.fromHex('#001F33')).transparent(0.25),
    // 	light: (theme.getColor(peekViewEditorBackground) ?? Color.fromHex('#F2F8FC')).transparent(0.25),
    // 	hc: Color.black
    // }, localize('interactive.activeCodeBackground', 'The background color for the current interactive code cell when the editor has focus.'));
    registerColor('interactive.inactiveCodeBorder', {
        dark: theme.getColor(listInactiveSelectionBackground) ?? transparent(listInactiveSelectionBackground, 1),
        light: theme.getColor(listInactiveSelectionBackground) ?? transparent(listInactiveSelectionBackground, 1),
        hcDark: PANEL_BORDER,
        hcLight: PANEL_BORDER
    }, localize('interactive.inactiveCodeBorder', 'The border color for the current interactive code cell when the editor does not have focus.'));
    // registerColor('interactive.inactiveCodeBackground', {
    // 	dark: (theme.getColor(peekViewResultsBackground) ?? Color.fromHex('#252526')).transparent(0.25),
    // 	light: (theme.getColor(peekViewResultsBackground) ?? Color.fromHex('#F3F3F3')).transparent(0.25),
    // 	hc: Color.black
    // }, localize('interactive.inactiveCodeBackground', 'The backgorund color for the current interactive code cell when the editor does not have focus.'));
});
Registry.as(ConfigurationExtensions.Configuration).registerConfiguration({
    id: 'interactiveWindow',
    order: 100,
    type: 'object',
    'properties': {
        [InteractiveWindowSetting.interactiveWindowAlwaysScrollOnNewCell]: {
            type: 'boolean',
            default: true,
            markdownDescription: localize('interactiveWindow.alwaysScrollOnNewCell', "Automatically scroll the interactive window to show the output of the last statement executed. If this value is false, the window will only scroll if the last cell was already the one scrolled to.")
        },
        [InteractiveWindowSetting.interactiveWindowRestore]: {
            type: 'boolean',
            default: false,
            markdownDescription: localize('interactiveWindow.restore', "Controls whether the Interactive Window sessions/history should be restored across window reloads. Whether the state of controllers used in Interactive Windows is persisted across window reloads are controlled by extensions contributing controllers.")
        }
    }
});

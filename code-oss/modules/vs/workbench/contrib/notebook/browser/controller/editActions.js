/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Mimes } from 'vs/base/common/mime';
import { URI } from 'vs/base/common/uri';
import { EditorContextKeys } from 'vs/editor/common/editorContextKeys';
import { getIconClasses } from 'vs/editor/common/services/getIconClasses';
import { IModelService } from 'vs/editor/common/services/model';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { localize } from 'vs/nls';
import { MenuId, registerAction2 } from 'vs/platform/actions/common/actions';
import { ContextKeyExpr } from 'vs/platform/contextkey/common/contextkey';
import { InputFocusedContext, InputFocusedContextKey } from 'vs/platform/contextkey/common/contextkeys';
import { IQuickInputService } from 'vs/platform/quickinput/common/quickInput';
import { changeCellToKind, runDeleteAction } from 'vs/workbench/contrib/notebook/browser/controller/cellOperations';
import { CELL_TITLE_CELL_GROUP_ID, CELL_TITLE_OUTPUT_GROUP_ID, executeNotebookCondition, NotebookAction, NotebookCellAction, NOTEBOOK_EDITOR_WIDGET_ACTION_WEIGHT } from 'vs/workbench/contrib/notebook/browser/controller/coreActions';
import { NOTEBOOK_CELL_EDITABLE, NOTEBOOK_CELL_HAS_OUTPUTS, NOTEBOOK_CELL_LIST_FOCUSED, NOTEBOOK_CELL_MARKDOWN_EDIT_MODE, NOTEBOOK_CELL_TYPE, NOTEBOOK_EDITOR_EDITABLE, NOTEBOOK_EDITOR_FOCUSED, NOTEBOOK_HAS_OUTPUTS, NOTEBOOK_IS_ACTIVE_EDITOR, NOTEBOOK_USE_CONSOLIDATED_OUTPUT_BUTTON } from 'vs/workbench/contrib/notebook/common/notebookContextKeys';
import { CellEditState, CHANGE_CELL_LANGUAGE, DETECT_CELL_LANGUAGE, QUIT_EDIT_CELL_COMMAND_ID } from 'vs/workbench/contrib/notebook/browser/notebookBrowser';
import * as icons from 'vs/workbench/contrib/notebook/browser/notebookIcons';
import { CellKind, NotebookCellExecutionState } from 'vs/workbench/contrib/notebook/common/notebookCommon';
import { ILanguageDetectionService } from 'vs/workbench/services/languageDetection/common/languageDetectionWorkerService';
import { INotebookExecutionStateService } from 'vs/workbench/contrib/notebook/common/notebookExecutionStateService';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { INotebookKernelService } from 'vs/workbench/contrib/notebook/common/notebookKernelService';
const CLEAR_ALL_CELLS_OUTPUTS_COMMAND_ID = 'notebook.clearAllCellsOutputs';
const EDIT_CELL_COMMAND_ID = 'notebook.cell.edit';
const DELETE_CELL_COMMAND_ID = 'notebook.cell.delete';
const CLEAR_CELL_OUTPUTS_COMMAND_ID = 'notebook.cell.clearOutputs';
registerAction2(class EditCellAction extends NotebookCellAction {
    constructor() {
        super({
            id: EDIT_CELL_COMMAND_ID,
            title: localize('notebookActions.editCell', "Edit Cell"),
            keybinding: {
                when: ContextKeyExpr.and(NOTEBOOK_CELL_LIST_FOCUSED, ContextKeyExpr.not(InputFocusedContextKey), NOTEBOOK_EDITOR_EDITABLE.isEqualTo(true)),
                primary: 3 /* KeyCode.Enter */,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */
            },
            menu: {
                id: MenuId.NotebookCellTitle,
                when: ContextKeyExpr.and(NOTEBOOK_EDITOR_EDITABLE.isEqualTo(true), NOTEBOOK_CELL_TYPE.isEqualTo('markup'), NOTEBOOK_CELL_MARKDOWN_EDIT_MODE.toNegated(), NOTEBOOK_CELL_EDITABLE),
                order: 0 /* CellToolbarOrder.EditCell */,
                group: CELL_TITLE_CELL_GROUP_ID
            },
            icon: icons.editIcon,
        });
    }
    async runWithContext(accessor, context) {
        if (!context.notebookEditor.hasModel() || context.notebookEditor.isReadOnly) {
            return;
        }
        await context.notebookEditor.focusNotebookCell(context.cell, 'editor');
    }
});
const quitEditCondition = ContextKeyExpr.and(NOTEBOOK_EDITOR_FOCUSED, InputFocusedContext);
registerAction2(class QuitEditCellAction extends NotebookCellAction {
    constructor() {
        super({
            id: QUIT_EDIT_CELL_COMMAND_ID,
            title: localize('notebookActions.quitEdit', "Stop Editing Cell"),
            menu: {
                id: MenuId.NotebookCellTitle,
                when: ContextKeyExpr.and(NOTEBOOK_CELL_TYPE.isEqualTo('markup'), NOTEBOOK_CELL_MARKDOWN_EDIT_MODE, NOTEBOOK_CELL_EDITABLE),
                order: 3 /* CellToolbarOrder.SaveCell */,
                group: CELL_TITLE_CELL_GROUP_ID
            },
            icon: icons.stopEditIcon,
            keybinding: [
                {
                    when: ContextKeyExpr.and(quitEditCondition, EditorContextKeys.hoverVisible.toNegated(), EditorContextKeys.hasNonEmptySelection.toNegated(), EditorContextKeys.hasMultipleSelections.toNegated()),
                    primary: 9 /* KeyCode.Escape */,
                    weight: NOTEBOOK_EDITOR_WIDGET_ACTION_WEIGHT - 5
                },
                {
                    when: ContextKeyExpr.and(quitEditCondition, NOTEBOOK_CELL_TYPE.isEqualTo('markup')),
                    primary: 256 /* KeyMod.WinCtrl */ | 3 /* KeyCode.Enter */,
                    win: {
                        primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 3 /* KeyCode.Enter */
                    },
                    weight: NOTEBOOK_EDITOR_WIDGET_ACTION_WEIGHT - 5
                },
            ]
        });
    }
    async runWithContext(accessor, context) {
        if (context.cell.cellKind === CellKind.Markup) {
            context.cell.updateEditState(CellEditState.Preview, QUIT_EDIT_CELL_COMMAND_ID);
        }
        await context.notebookEditor.focusNotebookCell(context.cell, 'container', { skipReveal: true });
    }
});
registerAction2(class DeleteCellAction extends NotebookCellAction {
    constructor() {
        super({
            id: DELETE_CELL_COMMAND_ID,
            title: localize('notebookActions.deleteCell', "Delete Cell"),
            keybinding: {
                primary: 20 /* KeyCode.Delete */,
                mac: {
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1 /* KeyCode.Backspace */
                },
                when: ContextKeyExpr.and(NOTEBOOK_EDITOR_FOCUSED, ContextKeyExpr.not(InputFocusedContextKey)),
                weight: 200 /* KeybindingWeight.WorkbenchContrib */
            },
            menu: [
                {
                    id: MenuId.NotebookCellDelete,
                    when: NOTEBOOK_EDITOR_EDITABLE,
                    group: CELL_TITLE_CELL_GROUP_ID
                },
                {
                    id: MenuId.InteractiveCellDelete,
                    group: CELL_TITLE_CELL_GROUP_ID
                }
            ],
            icon: icons.deleteCellIcon
        });
    }
    async runWithContext(accessor, context) {
        if (!context.notebookEditor.hasModel()) {
            return;
        }
        runDeleteAction(context.notebookEditor, context.cell);
    }
});
registerAction2(class ClearCellOutputsAction extends NotebookCellAction {
    constructor() {
        super({
            id: CLEAR_CELL_OUTPUTS_COMMAND_ID,
            title: localize('clearCellOutputs', 'Clear Cell Outputs'),
            menu: [
                {
                    id: MenuId.NotebookCellTitle,
                    when: ContextKeyExpr.and(NOTEBOOK_CELL_TYPE.isEqualTo('code'), executeNotebookCondition, NOTEBOOK_CELL_HAS_OUTPUTS, NOTEBOOK_EDITOR_EDITABLE, NOTEBOOK_CELL_EDITABLE, NOTEBOOK_USE_CONSOLIDATED_OUTPUT_BUTTON.toNegated()),
                    order: 5 /* CellToolbarOrder.ClearCellOutput */,
                    group: CELL_TITLE_OUTPUT_GROUP_ID
                },
                {
                    id: MenuId.NotebookOutputToolbar,
                    when: ContextKeyExpr.and(NOTEBOOK_CELL_HAS_OUTPUTS, NOTEBOOK_EDITOR_EDITABLE, NOTEBOOK_CELL_EDITABLE)
                },
            ],
            keybinding: {
                when: ContextKeyExpr.and(NOTEBOOK_EDITOR_FOCUSED, ContextKeyExpr.not(InputFocusedContextKey), NOTEBOOK_CELL_HAS_OUTPUTS, NOTEBOOK_EDITOR_EDITABLE, NOTEBOOK_CELL_EDITABLE),
                primary: 512 /* KeyMod.Alt */ | 20 /* KeyCode.Delete */,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */
            },
            icon: icons.clearIcon
        });
    }
    async runWithContext(accessor, context) {
        const notebookExecutionStateService = accessor.get(INotebookExecutionStateService);
        const editor = context.notebookEditor;
        if (!editor.hasModel() || !editor.textModel.length) {
            return;
        }
        const cell = context.cell;
        const index = editor.textModel.cells.indexOf(cell.model);
        if (index < 0) {
            return;
        }
        const computeUndoRedo = !editor.isReadOnly;
        editor.textModel.applyEdits([{ editType: 2 /* CellEditType.Output */, index, outputs: [] }], true, undefined, () => undefined, undefined, computeUndoRedo);
        const runState = notebookExecutionStateService.getCellExecution(context.cell.uri)?.state;
        if (runState !== NotebookCellExecutionState.Executing) {
            context.notebookEditor.textModel.applyEdits([{
                    editType: 9 /* CellEditType.PartialInternalMetadata */, index, internalMetadata: {
                        runStartTime: null,
                        runStartTimeAdjustment: null,
                        runEndTime: null,
                        executionOrder: null,
                        lastRunSuccess: null
                    }
                }], true, undefined, () => undefined, undefined, computeUndoRedo);
        }
    }
});
registerAction2(class ClearAllCellOutputsAction extends NotebookAction {
    constructor() {
        super({
            id: CLEAR_ALL_CELLS_OUTPUTS_COMMAND_ID,
            title: localize('clearAllCellsOutputs', 'Clear Outputs of All Cells'),
            precondition: NOTEBOOK_HAS_OUTPUTS,
            menu: [
                {
                    id: MenuId.EditorTitle,
                    when: ContextKeyExpr.and(NOTEBOOK_IS_ACTIVE_EDITOR, ContextKeyExpr.notEquals('config.notebook.globalToolbar', true)),
                    group: 'navigation',
                    order: 0
                },
                {
                    id: MenuId.NotebookToolbar,
                    when: ContextKeyExpr.and(executeNotebookCondition, ContextKeyExpr.equals('config.notebook.globalToolbar', true)),
                    group: 'navigation/execute',
                    order: 0
                }
            ],
            icon: icons.clearIcon
        });
    }
    async runWithContext(accessor, context) {
        const notebookExecutionStateService = accessor.get(INotebookExecutionStateService);
        const editor = context.notebookEditor;
        if (!editor.hasModel() || !editor.textModel.length) {
            return;
        }
        const computeUndoRedo = !editor.isReadOnly;
        editor.textModel.applyEdits(editor.textModel.cells.map((cell, index) => ({
            editType: 2 /* CellEditType.Output */, index, outputs: []
        })), true, undefined, () => undefined, undefined, computeUndoRedo);
        const clearExecutionMetadataEdits = editor.textModel.cells.map((cell, index) => {
            const runState = notebookExecutionStateService.getCellExecution(cell.uri)?.state;
            if (runState !== NotebookCellExecutionState.Executing) {
                return {
                    editType: 9 /* CellEditType.PartialInternalMetadata */, index, internalMetadata: {
                        runStartTime: null,
                        runStartTimeAdjustment: null,
                        runEndTime: null,
                        executionOrder: null,
                        lastRunSuccess: null
                    }
                };
            }
            else {
                return undefined;
            }
        }).filter(edit => !!edit);
        if (clearExecutionMetadataEdits.length) {
            context.notebookEditor.textModel.applyEdits(clearExecutionMetadataEdits, true, undefined, () => undefined, undefined, computeUndoRedo);
        }
    }
});
registerAction2(class ChangeCellLanguageAction extends NotebookCellAction {
    constructor() {
        super({
            id: CHANGE_CELL_LANGUAGE,
            title: localize('changeLanguage', 'Change Cell Language'),
            description: {
                description: localize('changeLanguage', 'Change Cell Language'),
                args: [
                    {
                        name: 'range',
                        description: 'The cell range',
                        schema: {
                            'type': 'object',
                            'required': ['start', 'end'],
                            'properties': {
                                'start': {
                                    'type': 'number'
                                },
                                'end': {
                                    'type': 'number'
                                }
                            }
                        }
                    },
                    {
                        name: 'language',
                        description: 'The target cell language',
                        schema: {
                            'type': 'string'
                        }
                    }
                ]
            }
        });
    }
    getCellContextFromArgs(accessor, context, ...additionalArgs) {
        if (!context || typeof context.start !== 'number' || typeof context.end !== 'number' || context.start >= context.end) {
            return;
        }
        const language = additionalArgs.length && typeof additionalArgs[0] === 'string' ? additionalArgs[0] : undefined;
        const activeEditorContext = this.getEditorContextFromArgsOrActive(accessor);
        if (!activeEditorContext || !activeEditorContext.notebookEditor.hasModel() || context.start >= activeEditorContext.notebookEditor.getLength()) {
            return;
        }
        // TODO@rebornix, support multiple cells
        return {
            notebookEditor: activeEditorContext.notebookEditor,
            cell: activeEditorContext.notebookEditor.cellAt(context.start),
            language
        };
    }
    async runWithContext(accessor, context) {
        if (context.language) {
            await this.setLanguage(context, context.language);
        }
        else {
            await this.showLanguagePicker(accessor, context);
        }
    }
    async showLanguagePicker(accessor, context) {
        const topItems = [];
        const mainItems = [];
        const languageService = accessor.get(ILanguageService);
        const modelService = accessor.get(IModelService);
        const quickInputService = accessor.get(IQuickInputService);
        const languageDetectionService = accessor.get(ILanguageDetectionService);
        const providerLanguages = new Set([
            ...(context.notebookEditor.activeKernel?.supportedLanguages ?? languageService.getRegisteredLanguageIds()),
            'markdown'
        ]);
        providerLanguages.forEach(languageId => {
            let description;
            if (context.cell.cellKind === CellKind.Markup ? (languageId === 'markdown') : (languageId === context.cell.language)) {
                description = localize('languageDescription', "({0}) - Current Language", languageId);
            }
            else {
                description = localize('languageDescriptionConfigured', "({0})", languageId);
            }
            const languageName = languageService.getLanguageName(languageId);
            if (!languageName) {
                // Notebook has unrecognized language
                return;
            }
            const item = {
                label: languageName,
                iconClasses: getIconClasses(modelService, languageService, this.getFakeResource(languageName, languageService)),
                description,
                languageId
            };
            if (languageId === 'markdown' || languageId === context.cell.language) {
                topItems.push(item);
            }
            else {
                mainItems.push(item);
            }
        });
        mainItems.sort((a, b) => {
            return a.description.localeCompare(b.description);
        });
        // Offer to "Auto Detect"
        const autoDetectMode = {
            label: localize('autoDetect', "Auto Detect")
        };
        const picks = [
            autoDetectMode,
            { type: 'separator', label: localize('languagesPicks', "languages (identifier)") },
            ...topItems,
            { type: 'separator' },
            ...mainItems
        ];
        const selection = await quickInputService.pick(picks, { placeHolder: localize('pickLanguageToConfigure', "Select Language Mode") });
        const languageId = selection === autoDetectMode
            ? await languageDetectionService.detectLanguage(context.cell.uri)
            : selection?.languageId;
        if (languageId) {
            await this.setLanguage(context, languageId);
        }
    }
    async setLanguage(context, languageId) {
        await setCellToLanguage(languageId, context);
    }
    /**
     * Copied from editorStatus.ts
     */
    getFakeResource(lang, languageService) {
        let fakeResource;
        const languageId = languageService.getLanguageIdByLanguageName(lang);
        if (languageId) {
            const extensions = languageService.getExtensions(languageId);
            if (extensions.length) {
                fakeResource = URI.file(extensions[0]);
            }
            else {
                const filenames = languageService.getFilenames(languageId);
                if (filenames.length) {
                    fakeResource = URI.file(filenames[0]);
                }
            }
        }
        return fakeResource;
    }
});
registerAction2(class DetectCellLanguageAction extends NotebookCellAction {
    constructor() {
        super({
            id: DETECT_CELL_LANGUAGE,
            title: { value: localize('detectLanguage', 'Accept Detected Language for Cell'), original: 'Accept Detected Language for Cell' },
            f1: true,
            precondition: ContextKeyExpr.and(NOTEBOOK_EDITOR_EDITABLE, NOTEBOOK_CELL_EDITABLE),
            keybinding: { primary: 34 /* KeyCode.KeyD */ | 512 /* KeyMod.Alt */ | 1024 /* KeyMod.Shift */, weight: 200 /* KeybindingWeight.WorkbenchContrib */ }
        });
    }
    async runWithContext(accessor, context) {
        const languageDetectionService = accessor.get(ILanguageDetectionService);
        const notificationService = accessor.get(INotificationService);
        const kernelService = accessor.get(INotebookKernelService);
        const kernel = kernelService.getSelectedOrSuggestedKernel(context.notebookEditor.textModel);
        const providerLanguages = [...kernel?.supportedLanguages ?? []];
        providerLanguages.push('markdown');
        const detection = await languageDetectionService.detectLanguage(context.cell.uri, providerLanguages);
        if (detection) {
            setCellToLanguage(detection, context);
        }
        else {
            notificationService.warn(localize('noDetection', "Unable to detect cell language"));
        }
    }
});
async function setCellToLanguage(languageId, context) {
    if (languageId === 'markdown' && context.cell?.language !== 'markdown') {
        const idx = context.notebookEditor.getCellIndex(context.cell);
        await changeCellToKind(CellKind.Markup, { cell: context.cell, notebookEditor: context.notebookEditor, ui: true }, 'markdown', Mimes.markdown);
        const newCell = context.notebookEditor.cellAt(idx);
        if (newCell) {
            await context.notebookEditor.focusNotebookCell(newCell, 'editor');
        }
    }
    else if (languageId !== 'markdown' && context.cell?.cellKind === CellKind.Markup) {
        await changeCellToKind(CellKind.Code, { cell: context.cell, notebookEditor: context.notebookEditor, ui: true }, languageId);
    }
    else {
        const index = context.notebookEditor.textModel.cells.indexOf(context.cell.model);
        context.notebookEditor.textModel.applyEdits([{ editType: 4 /* CellEditType.CellLanguage */, index, language: languageId }], true, undefined, () => undefined, undefined, !context.notebookEditor.isReadOnly);
    }
}

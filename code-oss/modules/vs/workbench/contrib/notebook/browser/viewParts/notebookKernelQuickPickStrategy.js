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
import 'vs/css!./notebookKernelActionViewItem';
import { groupBy } from 'vs/base/common/arrays';
import { createCancelablePromise } from 'vs/base/common/async';
import { CancellationToken } from 'vs/base/common/cancellation';
import { Codicon } from 'vs/base/common/codicons';
import { Event } from 'vs/base/common/event';
import { compareIgnoreCase, uppercaseFirstLetter } from 'vs/base/common/strings';
import { localize } from 'vs/nls';
import { ExtensionIdentifier } from 'vs/platform/extensions/common/extensions';
import { ILabelService } from 'vs/platform/label/common/label';
import { ILogService } from 'vs/platform/log/common/log';
import { IProductService } from 'vs/platform/product/common/productService';
import { IQuickInputService } from 'vs/platform/quickinput/common/quickInput';
import { IExtensionsWorkbenchService, VIEWLET_ID as EXTENSION_VIEWLET_ID } from 'vs/workbench/contrib/extensions/common/extensions';
import { getNotebookEditorFromEditorPane, JUPYTER_EXTENSION_ID, KERNEL_RECOMMENDATIONS } from 'vs/workbench/contrib/notebook/browser/notebookBrowser';
import { INotebookKernelService } from 'vs/workbench/contrib/notebook/common/notebookKernelService';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { IPaneCompositePartService } from 'vs/workbench/services/panecomposite/browser/panecomposite';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { DisposableStore } from 'vs/base/common/lifecycle';
import { ThemeIcon } from 'vs/platform/theme/common/themeService';
import { executingStateIcon, selectKernelIcon } from 'vs/workbench/contrib/notebook/browser/notebookIcons';
function isKernelPick(item) {
    return 'kernel' in item;
}
function isSourcePick(item) {
    return 'action' in item;
}
function isInstallExtensionPick(item) {
    return item.id === 'installSuggested' && 'extensionId' in item;
}
const KERNEL_PICKER_UPDATE_DEBOUNCE = 200;
function getEditorFromContext(editorService, context) {
    let editor;
    if (context !== undefined && 'notebookEditorId' in context) {
        const editorId = context.notebookEditorId;
        const matchingEditor = editorService.visibleEditorPanes.find((editorPane) => {
            const notebookEditor = getNotebookEditorFromEditorPane(editorPane);
            return notebookEditor?.getId() === editorId;
        });
        editor = getNotebookEditorFromEditorPane(matchingEditor);
    }
    else if (context !== undefined && 'notebookEditor' in context) {
        editor = context?.notebookEditor;
    }
    else {
        editor = getNotebookEditorFromEditorPane(editorService.activeEditorPane);
    }
    return editor;
}
function toQuickPick(kernel, selected) {
    const res = {
        kernel,
        picked: kernel.id === selected?.id,
        label: kernel.label,
        description: kernel.description,
        detail: kernel.detail
    };
    if (kernel.id === selected?.id) {
        if (!res.description) {
            res.description = localize('current1', "Currently Selected");
        }
        else {
            res.description = localize('current2', "{0} - Currently Selected", res.description);
        }
    }
    return res;
}
class KernelPickerStrategyBase {
    _notebookKernelService;
    _editorService;
    _productService;
    _quickInputService;
    _labelService;
    _logService;
    _paneCompositePartService;
    _extensionWorkbenchService;
    _extensionService;
    _commandService;
    constructor(_notebookKernelService, _editorService, _productService, _quickInputService, _labelService, _logService, _paneCompositePartService, _extensionWorkbenchService, _extensionService, _commandService) {
        this._notebookKernelService = _notebookKernelService;
        this._editorService = _editorService;
        this._productService = _productService;
        this._quickInputService = _quickInputService;
        this._labelService = _labelService;
        this._logService = _logService;
        this._paneCompositePartService = _paneCompositePartService;
        this._extensionWorkbenchService = _extensionWorkbenchService;
        this._extensionService = _extensionService;
        this._commandService = _commandService;
    }
    async showQuickPick(context) {
        const editor = getEditorFromContext(this._editorService, context);
        if (!editor || !editor.hasModel()) {
            return false;
        }
        let controllerId = context && 'id' in context ? context.id : undefined;
        let extensionId = context && 'extension' in context ? context.extension : undefined;
        if (controllerId && (typeof controllerId !== 'string' || typeof extensionId !== 'string')) {
            // validate context: id & extension MUST be strings
            controllerId = undefined;
            extensionId = undefined;
        }
        const notebook = editor.textModel;
        const scopedContextKeyService = editor.scopedContextKeyService;
        const matchResult = this._notebookKernelService.getMatchingKernel(notebook);
        const { selected, all } = matchResult;
        if (selected && controllerId && selected.id === controllerId && ExtensionIdentifier.equals(selected.extension, extensionId)) {
            // current kernel is wanted kernel -> done
            return true;
        }
        let newKernel;
        if (controllerId) {
            const wantedId = `${extensionId}/${controllerId}`;
            for (const candidate of all) {
                if (candidate.id === wantedId) {
                    newKernel = candidate;
                    break;
                }
            }
            if (!newKernel) {
                this._logService.warn(`wanted kernel DOES NOT EXIST, wanted: ${wantedId}, all: ${all.map(k => k.id)}`);
                return false;
            }
        }
        if (newKernel) {
            this._notebookKernelService.selectKernelForNotebook(newKernel, notebook);
            return true;
        }
        const quickPick = this._quickInputService.createQuickPick();
        const quickPickItems = this._getKernelPickerQuickPickItems(notebook, matchResult, this._notebookKernelService, scopedContextKeyService);
        quickPick.items = quickPickItems;
        quickPick.canSelectMany = false;
        quickPick.placeholder = selected
            ? localize('prompt.placeholder.change', "Change kernel for '{0}'", this._labelService.getUriLabel(notebook.uri, { relative: true }))
            : localize('prompt.placeholder.select', "Select kernel for '{0}'", this._labelService.getUriLabel(notebook.uri, { relative: true }));
        quickPick.busy = this._notebookKernelService.getKernelDetectionTasks(notebook).length > 0;
        const kernelDetectionTaskListener = this._notebookKernelService.onDidChangeKernelDetectionTasks(() => {
            quickPick.busy = this._notebookKernelService.getKernelDetectionTasks(notebook).length > 0;
        });
        // run extension recommendataion task if quickPickItems is empty
        const extensionRecommendataionPromise = quickPickItems.length === 0
            ? createCancelablePromise(token => this._showInstallKernelExtensionRecommendation(notebook, quickPick, this._extensionWorkbenchService, token))
            : undefined;
        const kernelChangeEventListener = Event.debounce(Event.any(this._notebookKernelService.onDidChangeSourceActions, this._notebookKernelService.onDidAddKernel, this._notebookKernelService.onDidRemoveKernel, this._notebookKernelService.onDidChangeNotebookAffinity), (last, _current) => last, KERNEL_PICKER_UPDATE_DEBOUNCE)(async () => {
            // reset quick pick progress
            quickPick.busy = false;
            extensionRecommendataionPromise?.cancel();
            const currentActiveItems = quickPick.activeItems;
            const matchResult = this._notebookKernelService.getMatchingKernel(notebook);
            const quickPickItems = this._getKernelPickerQuickPickItems(notebook, matchResult, this._notebookKernelService, scopedContextKeyService);
            quickPick.keepScrollPosition = true;
            // recalcuate active items
            const activeItems = [];
            for (const item of currentActiveItems) {
                if (isKernelPick(item)) {
                    const kernelId = item.kernel.id;
                    const sameItem = quickPickItems.find(pi => isKernelPick(pi) && pi.kernel.id === kernelId);
                    if (sameItem) {
                        activeItems.push(sameItem);
                    }
                }
                else if (isSourcePick(item)) {
                    const sameItem = quickPickItems.find(pi => isSourcePick(pi) && pi.action.action.id === item.action.action.id);
                    if (sameItem) {
                        activeItems.push(sameItem);
                    }
                }
            }
            quickPick.items = quickPickItems;
            quickPick.activeItems = activeItems;
        }, this);
        const pick = await new Promise((resolve, reject) => {
            quickPick.onDidAccept(() => {
                const item = quickPick.selectedItems[0];
                if (item) {
                    resolve(item);
                }
                else {
                    reject();
                }
                quickPick.hide();
            });
            quickPick.onDidHide(() => () => {
                kernelDetectionTaskListener.dispose();
                kernelChangeEventListener.dispose();
                quickPick.dispose();
                reject();
            });
            quickPick.show();
        });
        if (pick) {
            return await this._handleQuickPick(notebook, pick, context);
        }
        return false;
    }
    async _handleQuickPick(notebook, pick, context) {
        if (isKernelPick(pick)) {
            const newKernel = pick.kernel;
            this._notebookKernelService.selectKernelForNotebook(newKernel, notebook);
            return true;
        }
        // actions
        if (pick.id === 'install') {
            await this._showKernelExtension(this._paneCompositePartService, this._extensionWorkbenchService, this._extensionService, notebook.viewType);
            // suggestedExtension must be defined for this option to be shown, but still check to make TS happy
        }
        else if (isInstallExtensionPick(pick)) {
            await this._showKernelExtension(this._paneCompositePartService, this._extensionWorkbenchService, this._extensionService, notebook.viewType, pick.extensionId, this._productService.quality !== 'stable');
        }
        else if (isSourcePick(pick)) {
            // selected explicilty, it should trigger the execution?
            pick.action.runAction();
        }
        return true;
    }
    async _showKernelExtension(paneCompositePartService, extensionWorkbenchService, extensionService, viewType, extId, isInsiders) {
        // If extension id is provided attempt to install the extension as the user has requested the suggested ones be installed
        if (extId) {
            const extension = (await extensionWorkbenchService.getExtensions([{ id: extId }], CancellationToken.None))[0];
            const canInstall = await extensionWorkbenchService.canInstall(extension);
            // If we can install then install it, otherwise we will fall out into searching the viewlet
            if (canInstall) {
                await extensionWorkbenchService.install(extension, {
                    installPreReleaseVersion: isInsiders ?? false,
                    context: { skipWalkthrough: true }
                }, 15 /* ProgressLocation.Notification */);
                await extensionService.activateByEvent(`onNotebook:${viewType}`);
                return;
            }
        }
        const viewlet = await paneCompositePartService.openPaneComposite(EXTENSION_VIEWLET_ID, 0 /* ViewContainerLocation.Sidebar */, true);
        const view = viewlet?.getViewPaneContainer();
        const pascalCased = viewType.split(/[^a-z0-9]/ig).map(uppercaseFirstLetter).join('');
        view?.search(`@tag:notebookKernel${pascalCased}`);
    }
    async _showInstallKernelExtensionRecommendation(notebookTextModel, quickPick, extensionWorkbenchService, token) {
        quickPick.busy = true;
        const newQuickPickItems = await this._getKernelRecommendationsQuickPickItems(notebookTextModel, extensionWorkbenchService);
        quickPick.busy = false;
        if (token.isCancellationRequested) {
            return;
        }
        if (newQuickPickItems && quickPick.items.length === 0) {
            quickPick.items = newQuickPickItems;
        }
    }
    async _getKernelRecommendationsQuickPickItems(notebookTextModel, extensionWorkbenchService) {
        const quickPickItems = [];
        const language = this.getSuggestedLanguage(notebookTextModel);
        const suggestedExtension = language ? this.getSuggestedKernelFromLanguage(notebookTextModel.viewType, language) : undefined;
        if (suggestedExtension) {
            await extensionWorkbenchService.queryLocal();
            const extension = extensionWorkbenchService.installed.find(e => e.identifier.id === suggestedExtension.extensionId);
            if (extension) {
                // it's installed but might be detecting kernels
                return undefined;
            }
            // We have a suggested kernel, show an option to install it
            quickPickItems.push({
                id: 'installSuggested',
                description: suggestedExtension.displayName ?? suggestedExtension.extensionId,
                label: `$(${Codicon.lightbulb.id}) ` + localize('installSuggestedKernel', 'Install suggested extensions'),
                extensionId: suggestedExtension.extensionId
            });
        }
        // there is no kernel, show the install from marketplace
        quickPickItems.push({
            id: 'install',
            label: localize('searchForKernels', "Browse marketplace for kernel extensions"),
        });
        return quickPickItems;
    }
    /**
     * Examine the most common language in the notebook
     * @param notebookTextModel The notebook text model
     * @returns What the suggested language is for the notebook. Used for kernal installing
     */
    getSuggestedLanguage(notebookTextModel) {
        const metaData = notebookTextModel.metadata;
        let suggestedKernelLanguage = metaData.custom?.metadata?.language_info?.name;
        // TODO how do we suggest multi language notebooks?
        if (!suggestedKernelLanguage) {
            const cellLanguages = notebookTextModel.cells.map(cell => cell.language).filter(language => language !== 'markdown');
            // Check if cell languages is all the same
            if (cellLanguages.length > 1) {
                const firstLanguage = cellLanguages[0];
                if (cellLanguages.every(language => language === firstLanguage)) {
                    suggestedKernelLanguage = firstLanguage;
                }
            }
        }
        return suggestedKernelLanguage;
    }
    /**
     * Given a language and notebook view type suggest a kernel for installation
     * @param language The language to find a suggested kernel extension for
     * @returns A recommednation object for the recommended extension, else undefined
     */
    getSuggestedKernelFromLanguage(viewType, language) {
        const recommendation = KERNEL_RECOMMENDATIONS.get(viewType)?.get(language);
        return recommendation;
    }
}
let KernelPickerFlatStrategy = class KernelPickerFlatStrategy extends KernelPickerStrategyBase {
    constructor(_notebookKernelService, _editorService, _productService, _quickInputService, _labelService, _logService, _paneCompositePartService, _extensionWorkbenchService, _extensionService, _commandService) {
        super(_notebookKernelService, _editorService, _productService, _quickInputService, _labelService, _logService, _paneCompositePartService, _extensionWorkbenchService, _extensionService, _commandService);
    }
    _getKernelPickerQuickPickItems(notebookTextModel, matchResult, notebookKernelService, scopedContextKeyService) {
        const { selected, all, suggestions, hidden } = matchResult;
        const quickPickItems = [];
        if (all.length) {
            // Always display suggested kernels on the top.
            this._fillInSuggestions(quickPickItems, suggestions, selected);
            // Next display all of the kernels not marked as hidden grouped by categories or extensions.
            // If we don't have a kind, always display those at the bottom.
            const picks = all.filter(item => (!suggestions.includes(item) && !hidden.includes(item))).map(kernel => toQuickPick(kernel, selected));
            const kernelsPerCategory = groupBy(picks, (a, b) => compareIgnoreCase(a.kernel.kind || 'z', b.kernel.kind || 'z'));
            kernelsPerCategory.forEach(items => {
                quickPickItems.push({
                    type: 'separator',
                    label: items[0].kernel.kind || localize('otherKernelKinds', "Other")
                });
                quickPickItems.push(...items);
            });
        }
        const sourceActions = notebookKernelService.getSourceActions(notebookTextModel, scopedContextKeyService);
        if (sourceActions.length) {
            quickPickItems.push({
                type: 'separator',
                // label: localize('sourceActions', "")
            });
            sourceActions.forEach(sourceAction => {
                const res = {
                    action: sourceAction,
                    picked: false,
                    label: sourceAction.action.label,
                };
                quickPickItems.push(res);
            });
        }
        return quickPickItems;
    }
    _fillInSuggestions(quickPickItems, suggestions, selected) {
        if (!suggestions.length) {
            return;
        }
        if (suggestions.length === 1 && suggestions[0].id === selected?.id) {
            quickPickItems.push({
                type: 'separator',
                label: localize('selectedKernels', "Selected")
            });
            // The title is already set to "Selected" so we don't need to set it again in description, thus passing in `undefined`.
            quickPickItems.push(toQuickPick(suggestions[0], undefined));
            return;
        }
        quickPickItems.push({
            type: 'separator',
            label: localize('suggestedKernels', "Suggested")
        });
        quickPickItems.push(...suggestions.map(kernel => toQuickPick(kernel, selected)));
    }
    static updateKernelStatusAction(notebook, action, notebookKernelService, scopedContextKeyService) {
        const detectionTasks = notebookKernelService.getKernelDetectionTasks(notebook);
        if (detectionTasks.length) {
            action.enabled = true;
            action.label = localize('kernels.detecting', "Detecting Kernels");
            action.class = ThemeIcon.asClassName(ThemeIcon.modify(executingStateIcon, 'spin'));
            return;
        }
        const runningActions = notebookKernelService.getRunningSourceActions(notebook);
        const updateActionFromSourceAction = (sourceAction, running) => {
            const sAction = sourceAction.action;
            action.class = running ? ThemeIcon.asClassName(ThemeIcon.modify(executingStateIcon, 'spin')) : ThemeIcon.asClassName(selectKernelIcon);
            action.label = sAction.label;
            action.enabled = true;
        };
        if (runningActions.length) {
            return updateActionFromSourceAction(runningActions[0] /** TODO handle multiple actions state */, true);
        }
        const info = notebookKernelService.getMatchingKernel(notebook);
        if (info.all.length === 0) {
            action.enabled = true;
            const sourceActions = notebookKernelService.getSourceActions(notebook, scopedContextKeyService);
            if (sourceActions.length === 1) {
                // exact one action
                updateActionFromSourceAction(sourceActions[0], false);
            }
            else if (sourceActions.filter(sourceAction => sourceAction.isPrimary).length === 1) {
                // exact one primary action
                updateActionFromSourceAction(sourceActions.filter(sourceAction => sourceAction.isPrimary)[0], false);
            }
            else {
                action.class = ThemeIcon.asClassName(selectKernelIcon);
                action.label = localize('select', "Select Kernel");
                action.tooltip = '';
            }
            return;
        }
        action.enabled = true;
        action.class = ThemeIcon.asClassName(selectKernelIcon);
        const selectedOrSuggested = info.selected
            ?? (info.suggestions.length === 1 ? info.suggestions[0] : undefined)
            ?? (info.all.length === 1 ? info.all[0] : undefined);
        if (selectedOrSuggested) {
            // selected or suggested kernel
            action.label = selectedOrSuggested.label;
            action.tooltip = selectedOrSuggested.description ?? selectedOrSuggested.detail ?? '';
            if (!info.selected) {
                // special UI for selected kernel?
            }
        }
        else {
            // many kernels or no kernels
            action.label = localize('select', "Select Kernel");
            action.tooltip = '';
        }
    }
};
KernelPickerFlatStrategy = __decorate([
    __param(0, INotebookKernelService),
    __param(1, IEditorService),
    __param(2, IProductService),
    __param(3, IQuickInputService),
    __param(4, ILabelService),
    __param(5, ILogService),
    __param(6, IPaneCompositePartService),
    __param(7, IExtensionsWorkbenchService),
    __param(8, IExtensionService),
    __param(9, ICommandService)
], KernelPickerFlatStrategy);
export { KernelPickerFlatStrategy };
let KernelPickerMRUStrategy = class KernelPickerMRUStrategy extends KernelPickerStrategyBase {
    constructor(_notebookKernelService, _editorService, _productService, _quickInputService, _labelService, _logService, _paneCompositePartService, _extensionWorkbenchService, _extensionService, _commandService) {
        super(_notebookKernelService, _editorService, _productService, _quickInputService, _labelService, _logService, _paneCompositePartService, _extensionWorkbenchService, _extensionService, _commandService);
    }
    _getKernelPickerQuickPickItems(notebookTextModel, matchResult, notebookKernelService, scopedContextKeyService) {
        const quickPickItems = [];
        let previousKind = '';
        if (matchResult.selected) {
            const kernelItem = toQuickPick(matchResult.selected, matchResult.selected);
            const kind = matchResult.selected.kind || '';
            if (kind) {
                previousKind = kind;
                quickPickItems.push({ type: 'separator', label: kind });
            }
            quickPickItems.push(kernelItem);
        }
        matchResult.suggestions.filter(kernel => kernel.id !== matchResult.selected?.id).map(kernel => toQuickPick(kernel, matchResult.selected))
            .forEach(kernel => {
            const kind = kernel.kernel.kind || '';
            if (kind && kind !== previousKind) {
                previousKind = kind;
                quickPickItems.push({ type: 'separator', label: kind });
            }
            quickPickItems.push(kernel);
        });
        quickPickItems.push({
            type: 'separator'
        });
        // select another kernel quick pick
        quickPickItems.push({
            id: 'selectAnother',
            label: localize('selectAnotherKernel.more', "Select Another Kernel..."),
        });
        return quickPickItems;
    }
    async _handleQuickPick(notebook, pick, context) {
        if (pick.id === 'selectAnother') {
            return this.displaySelectAnotherQuickPick(notebook, context);
        }
        return super._handleQuickPick(notebook, pick, context);
    }
    async displaySelectAnotherQuickPick(notebook, context) {
        const disposables = new DisposableStore();
        return new Promise(resolve => {
            // select from kernel sources
            const quickPick = this._quickInputService.createQuickPick();
            quickPick.title = localize('selectAnotherKernel', "Select Another Kernel");
            quickPick.busy = true;
            quickPick.buttons = [this._quickInputService.backButton];
            quickPick.show();
            const quickPickItems = [];
            disposables.add(quickPick.onDidTriggerButton(button => {
                if (button === this._quickInputService.backButton) {
                    quickPick.hide();
                    resolve(this.showQuickPick(context));
                }
            }));
            disposables.add(quickPick.onDidAccept(async () => {
                quickPick.hide();
                quickPick.dispose();
                if (quickPick.selectedItems) {
                    if ('command' in quickPick.selectedItems[0]) {
                        const selectedKernelId = await this._executeCommand(notebook, quickPick.selectedItems[0].command);
                        if (selectedKernelId) {
                            const { all } = await this._notebookKernelService.getMatchingKernel(notebook);
                            const kernel = all.find(kernel => kernel.id === `ms-toolsai.jupyter/${selectedKernelId}`);
                            if (kernel) {
                                await this._notebookKernelService.selectKernelForNotebook(kernel, notebook);
                                resolve(true);
                            }
                            resolve(true);
                        }
                        else {
                            return resolve(this.displaySelectAnotherQuickPick(notebook));
                        }
                    }
                    else if ('kernel' in quickPick.selectedItems[0]) {
                        await this._notebookKernelService.selectKernelForNotebook(quickPick.selectedItems[0].kernel, notebook);
                        resolve(true);
                    }
                }
            }));
            this._notebookKernelService.getKernelSourceActions2(notebook).then(actions => {
                quickPick.busy = false;
                const matchResult = this._notebookKernelService.getMatchingKernel(notebook);
                const others = matchResult.all.filter(item => item.extension.value !== JUPYTER_EXTENSION_ID);
                quickPickItems.push(...others.map(kernel => ({
                    label: kernel.label,
                    detail: kernel.extension.value,
                    kernel
                })));
                const validActions = actions.filter(action => action.command);
                quickPickItems.push(...validActions.map(action => {
                    return {
                        id: typeof action.command === 'string' ? action.command : action.command.id,
                        label: action.label,
                        detail: action.detail,
                        description: action.description,
                        command: action.command
                    };
                }));
                quickPick.items = quickPickItems;
            });
        }).finally(() => {
            disposables.dispose();
        });
    }
    async _executeCommand(notebook, command) {
        const id = typeof command === 'string' ? command : command.id;
        const args = typeof command === 'string' ? [] : command.arguments ?? [];
        if (typeof command === 'string' || !command.arguments || !Array.isArray(command.arguments) || command.arguments.length === 0) {
            args.unshift({
                uri: notebook.uri,
                $mid: 13 /* MarshalledId.NotebookActionContext */
            });
        }
        if (typeof command === 'string') {
            return this._commandService.executeCommand(id);
        }
        else {
            return this._commandService.executeCommand(id, ...args);
        }
    }
    static updateKernelStatusAction(notebook, action, notebookKernelService) {
        const detectionTasks = notebookKernelService.getKernelDetectionTasks(notebook);
        if (detectionTasks.length) {
            action.enabled = true;
            action.label = localize('kernels.detecting', "Detecting Kernels");
            action.class = ThemeIcon.asClassName(ThemeIcon.modify(executingStateIcon, 'spin'));
            return;
        }
        const info = notebookKernelService.getMatchingKernel(notebook);
        if (info.selected) {
            action.label = info.selected.label;
            action.class = ThemeIcon.asClassName(selectKernelIcon);
            action.tooltip = info.selected.description ?? info.selected.detail ?? '';
        }
        else {
            action.label = localize('select', "Select Kernel");
            action.class = ThemeIcon.asClassName(selectKernelIcon);
            action.tooltip = '';
        }
    }
};
KernelPickerMRUStrategy = __decorate([
    __param(0, INotebookKernelService),
    __param(1, IEditorService),
    __param(2, IProductService),
    __param(3, IQuickInputService),
    __param(4, ILabelService),
    __param(5, ILogService),
    __param(6, IPaneCompositePartService),
    __param(7, IExtensionsWorkbenchService),
    __param(8, IExtensionService),
    __param(9, ICommandService)
], KernelPickerMRUStrategy);
export { KernelPickerMRUStrategy };

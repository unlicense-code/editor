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
import { IListService, WorkbenchList } from 'vs/platform/list/browser/listService';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { IThemeService, ThemeIcon } from 'vs/platform/theme/common/themeService';
import { ITerminalGroupService, ITerminalService } from 'vs/workbench/contrib/terminal/browser/terminal';
import { localize } from 'vs/nls';
import * as DOM from 'vs/base/browser/dom';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ActionBar } from 'vs/base/browser/ui/actionbar/actionbar';
import { MenuItemAction } from 'vs/platform/actions/common/actions';
import { MenuEntryActionViewItem } from 'vs/platform/actions/browser/menuEntryActionViewItem';
import { TerminalLocation } from 'vs/platform/terminal/common/terminal';
import { Codicon } from 'vs/base/common/codicons';
import { Action } from 'vs/base/common/actions';
import { MarkdownString } from 'vs/base/common/htmlContent';
import { TerminalDecorationsProvider } from 'vs/workbench/contrib/terminal/browser/terminalDecorationsProvider';
import { DEFAULT_LABELS_CONTAINER, ResourceLabels } from 'vs/workbench/browser/labels';
import { IDecorationsService } from 'vs/workbench/services/decorations/common/decorations';
import { IHoverService } from 'vs/workbench/services/hover/browser/hover';
import Severity from 'vs/base/common/severity';
import { Disposable, DisposableStore, dispose, toDisposable } from 'vs/base/common/lifecycle';
import { DataTransfers } from 'vs/base/browser/dnd';
import { disposableTimeout } from 'vs/base/common/async';
import { ElementsDragAndDropData, NativeDragAndDropData } from 'vs/base/browser/ui/list/listView';
import { URI } from 'vs/base/common/uri';
import { getColorClass, getIconId, getUriClasses } from 'vs/workbench/contrib/terminal/browser/terminalIcon';
import { IContextViewService } from 'vs/platform/contextview/browser/contextView';
import { InputBox } from 'vs/base/browser/ui/inputbox/inputBox';
import { once } from 'vs/base/common/functional';
import { attachInputBoxStyler } from 'vs/platform/theme/common/styler';
import { CodeDataTransfers, containsDragType } from 'vs/platform/dnd/browser/dnd';
import { terminalStrings } from 'vs/workbench/contrib/terminal/common/terminalStrings';
import { ILifecycleService } from 'vs/workbench/services/lifecycle/common/lifecycle';
import { TerminalContextKeys } from 'vs/workbench/contrib/terminal/common/terminalContextKey';
import { getTerminalResourcesFromDragEvent, parseTerminalUri } from 'vs/workbench/contrib/terminal/browser/terminalUri';
import { getShellIntegrationTooltip } from 'vs/workbench/contrib/terminal/browser/terminalTooltip';
const $ = DOM.$;
export var TerminalTabsListSizes;
(function (TerminalTabsListSizes) {
    TerminalTabsListSizes[TerminalTabsListSizes["TabHeight"] = 22] = "TabHeight";
    TerminalTabsListSizes[TerminalTabsListSizes["NarrowViewWidth"] = 46] = "NarrowViewWidth";
    TerminalTabsListSizes[TerminalTabsListSizes["WideViewMinimumWidth"] = 80] = "WideViewMinimumWidth";
    TerminalTabsListSizes[TerminalTabsListSizes["DefaultWidth"] = 120] = "DefaultWidth";
    TerminalTabsListSizes[TerminalTabsListSizes["MidpointViewWidth"] = 63] = "MidpointViewWidth";
    TerminalTabsListSizes[TerminalTabsListSizes["ActionbarMinimumWidth"] = 105] = "ActionbarMinimumWidth";
    TerminalTabsListSizes[TerminalTabsListSizes["MaximumWidth"] = 500] = "MaximumWidth";
})(TerminalTabsListSizes || (TerminalTabsListSizes = {}));
let TerminalTabList = class TerminalTabList extends WorkbenchList {
    _configurationService;
    _terminalService;
    _terminalGroupService;
    _themeService;
    _decorationsProvider;
    _terminalTabsSingleSelectedContextKey;
    _isSplitContextKey;
    constructor(container, contextKeyService, listService, themeService, _configurationService, _terminalService, _terminalGroupService, instantiationService, decorationsService, _themeService, lifecycleService) {
        super('TerminalTabsList', container, {
            getHeight: () => 22 /* TerminalTabsListSizes.TabHeight */,
            getTemplateId: () => 'terminal.tabs'
        }, [instantiationService.createInstance(TerminalTabsRenderer, container, instantiationService.createInstance(ResourceLabels, DEFAULT_LABELS_CONTAINER), () => this.getSelectedElements())], {
            horizontalScrolling: false,
            supportDynamicHeights: false,
            selectionNavigation: true,
            identityProvider: {
                getId: e => e?.instanceId
            },
            accessibilityProvider: instantiationService.createInstance(TerminalTabsAccessibilityProvider),
            smoothScrolling: _configurationService.getValue('workbench.list.smoothScrolling'),
            multipleSelectionSupport: true,
            additionalScrollHeight: 22 /* TerminalTabsListSizes.TabHeight */,
            dnd: instantiationService.createInstance(TerminalTabsDragAndDrop),
            openOnSingleClick: true
        }, contextKeyService, listService, themeService, _configurationService, instantiationService);
        this._configurationService = _configurationService;
        this._terminalService = _terminalService;
        this._terminalGroupService = _terminalGroupService;
        this._themeService = _themeService;
        const instanceDisposables = [
            this._terminalGroupService.onDidChangeInstances(() => this.refresh()),
            this._terminalGroupService.onDidChangeGroups(() => this.refresh()),
            this._terminalGroupService.onDidShow(() => this.refresh()),
            this._terminalGroupService.onDidChangeInstanceCapability(() => this.refresh()),
            this._terminalService.onDidChangeInstanceTitle(() => this.refresh()),
            this._terminalService.onDidChangeInstanceIcon(() => this.refresh()),
            this._terminalService.onDidChangeInstancePrimaryStatus(() => this.refresh()),
            this._terminalService.onDidChangeConnectionState(() => this.refresh()),
            this._themeService.onDidColorThemeChange(() => this.refresh()),
            this._terminalGroupService.onDidChangeActiveInstance(e => {
                if (e) {
                    const i = this._terminalGroupService.instances.indexOf(e);
                    this.setSelection([i]);
                    this.reveal(i);
                }
                this.refresh();
            })
        ];
        // Dispose of instance listeners on shutdown to avoid extra work and so tabs don't disappear
        // briefly
        lifecycleService.onWillShutdown(e => {
            dispose(instanceDisposables);
        });
        this.onMouseDblClick(async (e) => {
            const focus = this.getFocus();
            if (focus.length === 0) {
                const instance = await this._terminalService.createTerminal({ location: TerminalLocation.Panel });
                this._terminalGroupService.setActiveInstance(instance);
                await instance.focusWhenReady();
            }
            if (this._getFocusMode() === 'doubleClick' && this.getFocus().length === 1) {
                e.element?.focus(true);
            }
        });
        // on left click, if focus mode = single click, focus the element
        // unless multi-selection is in progress
        this.onMouseClick(async (e) => {
            if (e.browserEvent.altKey && e.element) {
                await this._terminalService.createTerminal({ location: { parentTerminal: e.element } });
            }
            else if (this._getFocusMode() === 'singleClick') {
                if (this.getSelection().length <= 1) {
                    e.element?.focus(true);
                }
            }
        });
        // on right click, set the focus to that element
        // unless multi-selection is in progress
        this.onContextMenu(e => {
            if (!e.element) {
                this.setSelection([]);
                return;
            }
            const selection = this.getSelectedElements();
            if (!selection || !selection.find(s => e.element === s)) {
                this.setFocus(e.index !== undefined ? [e.index] : []);
            }
        });
        this._terminalTabsSingleSelectedContextKey = TerminalContextKeys.tabsSingularSelection.bindTo(contextKeyService);
        this._isSplitContextKey = TerminalContextKeys.splitTerminal.bindTo(contextKeyService);
        this.onDidChangeSelection(e => this._updateContextKey());
        this.onDidChangeFocus(() => this._updateContextKey());
        this.onDidOpen(async (e) => {
            const instance = e.element;
            if (!instance) {
                return;
            }
            this._terminalGroupService.setActiveInstance(instance);
            if (!e.editorOptions.preserveFocus) {
                await instance.focusWhenReady();
            }
        });
        if (!this._decorationsProvider) {
            this._decorationsProvider = instantiationService.createInstance(TerminalDecorationsProvider);
            decorationsService.registerDecorationsProvider(this._decorationsProvider);
        }
        this.refresh();
    }
    _getFocusMode() {
        return this._configurationService.getValue("terminal.integrated.tabs.focusMode" /* TerminalSettingId.TabsFocusMode */);
    }
    refresh(cancelEditing = true) {
        if (cancelEditing && this._terminalService.isEditable(undefined)) {
            this.domFocus();
        }
        this.splice(0, this.length, this._terminalGroupService.instances.slice());
    }
    _updateContextKey() {
        this._terminalTabsSingleSelectedContextKey.set(this.getSelectedElements().length === 1);
        const instance = this.getFocusedElements();
        this._isSplitContextKey.set(instance.length > 0 && this._terminalGroupService.instanceIsSplit(instance[0]));
    }
};
TerminalTabList = __decorate([
    __param(1, IContextKeyService),
    __param(2, IListService),
    __param(3, IThemeService),
    __param(4, IConfigurationService),
    __param(5, ITerminalService),
    __param(6, ITerminalGroupService),
    __param(7, IInstantiationService),
    __param(8, IDecorationsService),
    __param(9, IThemeService),
    __param(10, ILifecycleService)
], TerminalTabList);
export { TerminalTabList };
let TerminalTabsRenderer = class TerminalTabsRenderer {
    _container;
    _labels;
    _getSelection;
    _instantiationService;
    _terminalService;
    _terminalGroupService;
    _hoverService;
    _configurationService;
    _keybindingService;
    _listService;
    _themeService;
    _contextViewService;
    templateId = 'terminal.tabs';
    constructor(_container, _labels, _getSelection, _instantiationService, _terminalService, _terminalGroupService, _hoverService, _configurationService, _keybindingService, _listService, _themeService, _contextViewService) {
        this._container = _container;
        this._labels = _labels;
        this._getSelection = _getSelection;
        this._instantiationService = _instantiationService;
        this._terminalService = _terminalService;
        this._terminalGroupService = _terminalGroupService;
        this._hoverService = _hoverService;
        this._configurationService = _configurationService;
        this._keybindingService = _keybindingService;
        this._listService = _listService;
        this._themeService = _themeService;
        this._contextViewService = _contextViewService;
    }
    renderTemplate(container) {
        const element = DOM.append(container, $('.terminal-tabs-entry'));
        const context = {};
        const label = this._labels.create(element, {
            supportHighlights: true,
            supportDescriptionHighlights: true,
            supportIcons: true,
            hoverDelegate: {
                delay: this._configurationService.getValue('workbench.hover.delay'),
                showHover: options => {
                    return this._hoverService.showHover({
                        ...options,
                        actions: context.hoverActions,
                        hideOnHover: true
                    });
                }
            }
        });
        const actionsContainer = DOM.append(label.element, $('.actions'));
        const actionBar = new ActionBar(actionsContainer, {
            actionViewItemProvider: action => action instanceof MenuItemAction
                ? this._instantiationService.createInstance(MenuEntryActionViewItem, action, undefined)
                : undefined
        });
        return {
            element,
            label,
            actionBar,
            context,
            elementDisposables: new DisposableStore(),
        };
    }
    shouldHideText() {
        return this._container ? this._container.clientWidth < 63 /* TerminalTabsListSizes.MidpointViewWidth */ : false;
    }
    shouldHideActionBar() {
        return this._container ? this._container.clientWidth <= 105 /* TerminalTabsListSizes.ActionbarMinimumWidth */ : false;
    }
    renderElement(instance, index, template) {
        const hasText = !this.shouldHideText();
        const group = this._terminalGroupService.getGroupForInstance(instance);
        if (!group) {
            throw new Error(`Could not find group for instance "${instance.instanceId}"`);
        }
        template.element.classList.toggle('has-text', hasText);
        template.element.classList.toggle('is-active', this._terminalGroupService.activeInstance === instance);
        let prefix = '';
        if (group.terminalInstances.length > 1) {
            const terminalIndex = group.terminalInstances.indexOf(instance);
            if (terminalIndex === 0) {
                prefix = `┌ `;
            }
            else if (terminalIndex === group.terminalInstances.length - 1) {
                prefix = `└ `;
            }
            else {
                prefix = `├ `;
            }
        }
        let statusString = '';
        const statuses = instance.statusList.statuses;
        template.context.hoverActions = [];
        for (const status of statuses) {
            statusString += `\n\n---\n\n${status.icon ? `$(${status.icon?.id}) ` : ''}${status.tooltip || status.id}`;
            if (status.hoverActions) {
                template.context.hoverActions.push(...status.hoverActions);
            }
        }
        const shellIntegrationString = getShellIntegrationTooltip(instance, true);
        const iconId = this._instantiationService.invokeFunction(getIconId, instance);
        const hasActionbar = !this.shouldHideActionBar();
        let label = '';
        if (!hasText) {
            const primaryStatus = instance.statusList.primary;
            // Don't show ignore severity
            if (primaryStatus && primaryStatus.severity > Severity.Ignore) {
                label = `${prefix}$(${primaryStatus.icon?.id || iconId})`;
            }
            else {
                label = `${prefix}$(${iconId})`;
            }
        }
        else {
            this.fillActionBar(instance, template);
            label = prefix;
            // Only add the title if the icon is set, this prevents the title jumping around for
            // example when launching with a ShellLaunchConfig.name and no icon
            if (instance.icon) {
                label += `$(${iconId}) ${instance.title}`;
            }
        }
        if (!hasActionbar) {
            template.actionBar.clear();
        }
        // Kill terminal on middle click
        template.elementDisposables.add(DOM.addDisposableListener(template.element, DOM.EventType.AUXCLICK, e => {
            e.stopImmediatePropagation();
            if (e.button === 1 /*middle*/) {
                this._terminalService.safeDisposeTerminal(instance);
            }
        }));
        const extraClasses = [];
        const colorClass = getColorClass(instance);
        if (colorClass) {
            extraClasses.push(colorClass);
        }
        const uriClasses = getUriClasses(instance, this._themeService.getColorTheme().type);
        if (uriClasses) {
            extraClasses.push(...uriClasses);
        }
        template.label.setResource({
            resource: instance.resource,
            name: label,
            description: hasText ? instance.description : undefined
        }, {
            fileDecorations: {
                colors: true,
                badges: hasText
            },
            title: {
                markdown: new MarkdownString(instance.title + shellIntegrationString + statusString, { supportThemeIcons: true }),
                markdownNotSupportedFallback: undefined
            },
            extraClasses
        });
        const editableData = this._terminalService.getEditableData(instance);
        template.label.element.classList.toggle('editable-tab', !!editableData);
        if (editableData) {
            template.elementDisposables.add(this._renderInputBox(template.label.element.querySelector('.monaco-icon-label-container'), instance, editableData));
            template.actionBar.clear();
        }
    }
    _renderInputBox(container, instance, editableData) {
        const value = instance.title || '';
        const inputBox = new InputBox(container, this._contextViewService, {
            validationOptions: {
                validation: (value) => {
                    const message = editableData.validationMessage(value);
                    if (!message || message.severity !== Severity.Error) {
                        return null;
                    }
                    return {
                        content: message.content,
                        formatContent: true,
                        type: 3 /* MessageType.ERROR */
                    };
                }
            },
            ariaLabel: localize('terminalInputAriaLabel', "Type terminal name. Press Enter to confirm or Escape to cancel.")
        });
        const styler = attachInputBoxStyler(inputBox, this._themeService);
        inputBox.element.style.height = '22px';
        inputBox.value = value;
        inputBox.focus();
        inputBox.select({ start: 0, end: value.length });
        const done = once((success, finishEditing) => {
            inputBox.element.style.display = 'none';
            const value = inputBox.value;
            dispose(toDispose);
            inputBox.element.remove();
            if (finishEditing) {
                editableData.onFinish(value, success);
            }
        });
        const showInputBoxNotification = () => {
            if (inputBox.isInputValid()) {
                const message = editableData.validationMessage(inputBox.value);
                if (message) {
                    inputBox.showMessage({
                        content: message.content,
                        formatContent: true,
                        type: message.severity === Severity.Info ? 1 /* MessageType.INFO */ : message.severity === Severity.Warning ? 2 /* MessageType.WARNING */ : 3 /* MessageType.ERROR */
                    });
                }
                else {
                    inputBox.hideMessage();
                }
            }
        };
        showInputBoxNotification();
        const toDispose = [
            inputBox,
            DOM.addStandardDisposableListener(inputBox.inputElement, DOM.EventType.KEY_DOWN, (e) => {
                e.stopPropagation();
                if (e.equals(3 /* KeyCode.Enter */)) {
                    done(inputBox.isInputValid(), true);
                }
                else if (e.equals(9 /* KeyCode.Escape */)) {
                    done(false, true);
                }
            }),
            DOM.addStandardDisposableListener(inputBox.inputElement, DOM.EventType.KEY_UP, (e) => {
                showInputBoxNotification();
            }),
            DOM.addDisposableListener(inputBox.inputElement, DOM.EventType.BLUR, () => {
                done(inputBox.isInputValid(), true);
            }),
            styler
        ];
        return toDisposable(() => {
            done(false, false);
        });
    }
    disposeElement(instance, index, templateData) {
        templateData.elementDisposables.clear();
        templateData.actionBar.clear();
    }
    disposeTemplate(templateData) {
        templateData.elementDisposables.dispose();
        templateData.label.dispose();
        templateData.actionBar.dispose();
    }
    fillActionBar(instance, template) {
        // If the instance is within the selection, split all selected
        const actions = [
            new Action("workbench.action.terminal.splitInstance" /* TerminalCommandId.SplitInstance */, terminalStrings.split.short, ThemeIcon.asClassName(Codicon.splitHorizontal), true, async () => {
                this._runForSelectionOrInstance(instance, async (e) => {
                    this._terminalService.createTerminal({ location: { parentTerminal: e } });
                });
            }),
            new Action("workbench.action.terminal.killInstance" /* TerminalCommandId.KillInstance */, terminalStrings.kill.short, ThemeIcon.asClassName(Codicon.trashcan), true, async () => {
                this._runForSelectionOrInstance(instance, e => this._terminalService.safeDisposeTerminal(e));
            })
        ];
        // TODO: Cache these in a way that will use the correct instance
        template.actionBar.clear();
        for (const action of actions) {
            template.actionBar.push(action, { icon: true, label: false, keybinding: this._keybindingService.lookupKeybinding(action.id)?.getLabel() });
        }
    }
    _runForSelectionOrInstance(instance, callback) {
        const selection = this._getSelection();
        if (selection.includes(instance)) {
            for (const s of selection) {
                if (s) {
                    callback(s);
                }
            }
        }
        else {
            callback(instance);
        }
        this._terminalGroupService.focusTabs();
        this._listService.lastFocusedList?.focusNext();
    }
};
TerminalTabsRenderer = __decorate([
    __param(3, IInstantiationService),
    __param(4, ITerminalService),
    __param(5, ITerminalGroupService),
    __param(6, IHoverService),
    __param(7, IConfigurationService),
    __param(8, IKeybindingService),
    __param(9, IListService),
    __param(10, IThemeService),
    __param(11, IContextViewService)
], TerminalTabsRenderer);
let TerminalTabsAccessibilityProvider = class TerminalTabsAccessibilityProvider {
    _terminalGroupService;
    constructor(_terminalGroupService) {
        this._terminalGroupService = _terminalGroupService;
    }
    getWidgetAriaLabel() {
        return localize('terminal.tabs', "Terminal tabs");
    }
    getAriaLabel(instance) {
        let ariaLabel = '';
        const tab = this._terminalGroupService.getGroupForInstance(instance);
        if (tab && tab.terminalInstances?.length > 1) {
            const terminalIndex = tab.terminalInstances.indexOf(instance);
            ariaLabel = localize({
                key: 'splitTerminalAriaLabel',
                comment: [
                    `The terminal's ID`,
                    `The terminal's title`,
                    `The terminal's split number`,
                    `The terminal group's total split number`
                ]
            }, "Terminal {0} {1}, split {2} of {3}", instance.instanceId, instance.title, terminalIndex + 1, tab.terminalInstances.length);
        }
        else {
            ariaLabel = localize({
                key: 'terminalAriaLabel',
                comment: [
                    `The terminal's ID`,
                    `The terminal's title`
                ]
            }, "Terminal {0} {1}", instance.instanceId, instance.title);
        }
        return ariaLabel;
    }
};
TerminalTabsAccessibilityProvider = __decorate([
    __param(0, ITerminalGroupService)
], TerminalTabsAccessibilityProvider);
let TerminalTabsDragAndDrop = class TerminalTabsDragAndDrop {
    _terminalService;
    _terminalGroupService;
    _autoFocusInstance;
    _autoFocusDisposable = Disposable.None;
    _primaryBackend;
    constructor(_terminalService, _terminalGroupService) {
        this._terminalService = _terminalService;
        this._terminalGroupService = _terminalGroupService;
        this._primaryBackend = this._terminalService.getPrimaryBackend();
    }
    getDragURI(instance) {
        return instance.resource.toString();
    }
    getDragLabel(elements, originalEvent) {
        return elements.length === 1 ? elements[0].title : undefined;
    }
    onDragLeave() {
        this._autoFocusInstance = undefined;
        this._autoFocusDisposable.dispose();
        this._autoFocusDisposable = Disposable.None;
    }
    onDragStart(data, originalEvent) {
        if (!originalEvent.dataTransfer) {
            return;
        }
        const dndData = data.getData();
        if (!Array.isArray(dndData)) {
            return;
        }
        // Attach terminals type to event
        const terminals = dndData.filter(e => 'instanceId' in e);
        if (terminals.length > 0) {
            originalEvent.dataTransfer.setData("Terminals" /* TerminalDataTransfers.Terminals */, JSON.stringify(terminals.map(e => e.resource.toString())));
        }
    }
    onDragOver(data, targetInstance, targetIndex, originalEvent) {
        if (data instanceof NativeDragAndDropData) {
            if (!containsDragType(originalEvent, DataTransfers.FILES, DataTransfers.RESOURCES, "Terminals" /* TerminalDataTransfers.Terminals */, CodeDataTransfers.FILES)) {
                return false;
            }
        }
        const didChangeAutoFocusInstance = this._autoFocusInstance !== targetInstance;
        if (didChangeAutoFocusInstance) {
            this._autoFocusDisposable.dispose();
            this._autoFocusInstance = targetInstance;
        }
        if (!targetInstance && !containsDragType(originalEvent, "Terminals" /* TerminalDataTransfers.Terminals */)) {
            return data instanceof ElementsDragAndDropData;
        }
        if (didChangeAutoFocusInstance && targetInstance) {
            this._autoFocusDisposable = disposableTimeout(() => {
                this._terminalService.setActiveInstance(targetInstance);
                this._autoFocusInstance = undefined;
            }, 500);
        }
        return {
            feedback: targetIndex ? [targetIndex] : undefined,
            accept: true,
            effect: 1 /* ListDragOverEffect.Move */
        };
    }
    async drop(data, targetInstance, targetIndex, originalEvent) {
        this._autoFocusDisposable.dispose();
        this._autoFocusInstance = undefined;
        let sourceInstances;
        const promises = [];
        const resources = getTerminalResourcesFromDragEvent(originalEvent);
        if (resources) {
            for (const uri of resources) {
                const instance = this._terminalService.getInstanceFromResource(uri);
                if (instance) {
                    sourceInstances = [instance];
                    this._terminalService.moveToTerminalView(instance);
                }
                else if (this._primaryBackend) {
                    const terminalIdentifier = parseTerminalUri(uri);
                    if (terminalIdentifier.instanceId) {
                        promises.push(this._primaryBackend.requestDetachInstance(terminalIdentifier.workspaceId, terminalIdentifier.instanceId));
                    }
                }
            }
        }
        if (promises.length) {
            let processes = await Promise.all(promises);
            processes = processes.filter(p => p !== undefined);
            let lastInstance;
            for (const attachPersistentProcess of processes) {
                lastInstance = await this._terminalService.createTerminal({ config: { attachPersistentProcess } });
            }
            if (lastInstance) {
                this._terminalService.setActiveInstance(lastInstance);
            }
            return;
        }
        if (sourceInstances === undefined) {
            if (!(data instanceof ElementsDragAndDropData)) {
                this._handleExternalDrop(targetInstance, originalEvent);
                return;
            }
            const draggedElement = data.getData();
            if (!draggedElement || !Array.isArray(draggedElement)) {
                return;
            }
            sourceInstances = [];
            for (const e of draggedElement) {
                if ('instanceId' in e) {
                    sourceInstances.push(e);
                }
            }
        }
        if (!targetInstance) {
            this._terminalGroupService.moveGroupToEnd(sourceInstances[0]);
            this._terminalService.setActiveInstance(sourceInstances[0]);
            return;
        }
        let focused = false;
        for (const instance of sourceInstances) {
            this._terminalGroupService.moveGroup(instance, targetInstance);
            if (!focused) {
                this._terminalService.setActiveInstance(instance);
                focused = true;
            }
        }
    }
    async _handleExternalDrop(instance, e) {
        if (!instance || !e.dataTransfer) {
            return;
        }
        // Check if files were dragged from the tree explorer
        let path;
        const rawResources = e.dataTransfer.getData(DataTransfers.RESOURCES);
        if (rawResources) {
            path = URI.parse(JSON.parse(rawResources)[0]).fsPath;
        }
        const rawCodeFiles = e.dataTransfer.getData(CodeDataTransfers.FILES);
        if (!path && rawCodeFiles) {
            path = URI.file(JSON.parse(rawCodeFiles)[0]).fsPath;
        }
        if (!path && e.dataTransfer.files.length > 0 && e.dataTransfer.files[0].path /* Electron only */) {
            // Check if the file was dragged from the filesystem
            path = URI.file(e.dataTransfer.files[0].path).fsPath;
        }
        if (!path) {
            return;
        }
        this._terminalService.setActiveInstance(instance);
        instance.focus();
        await instance.sendPath(path, false);
    }
};
TerminalTabsDragAndDrop = __decorate([
    __param(0, ITerminalService),
    __param(1, ITerminalGroupService)
], TerminalTabsDragAndDrop);

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
import * as nls from 'vs/nls';
import * as dom from 'vs/base/browser/dom';
import { StandardKeyboardEvent } from 'vs/base/browser/keyboardEvent';
import { SelectBox } from 'vs/base/browser/ui/selectBox/selectBox';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { IDebugService } from 'vs/workbench/contrib/debug/common/debug';
import { IThemeService, ThemeIcon } from 'vs/platform/theme/common/themeService';
import { attachSelectBoxStyler, attachStylerCallback } from 'vs/platform/theme/common/styler';
import { selectBorder, selectBackground } from 'vs/platform/theme/common/colorRegistry';
import { IContextViewService } from 'vs/platform/contextview/browser/contextView';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { dispose } from 'vs/base/common/lifecycle';
import { ADD_CONFIGURATION_ID } from 'vs/workbench/contrib/debug/browser/debugCommands';
import { BaseActionViewItem, SelectActionViewItem } from 'vs/base/browser/ui/actionbar/actionViewItems';
import { debugStart } from 'vs/workbench/contrib/debug/browser/debugIcons';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
const $ = dom.$;
let StartDebugActionViewItem = class StartDebugActionViewItem extends BaseActionViewItem {
    context;
    debugService;
    themeService;
    configurationService;
    commandService;
    contextService;
    keybindingService;
    static SEPARATOR = '\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500';
    container;
    start;
    selectBox;
    debugOptions = [];
    toDispose;
    selected = 0;
    providers = [];
    constructor(context, action, debugService, themeService, configurationService, commandService, contextService, contextViewService, keybindingService) {
        super(context, action);
        this.context = context;
        this.debugService = debugService;
        this.themeService = themeService;
        this.configurationService = configurationService;
        this.commandService = commandService;
        this.contextService = contextService;
        this.keybindingService = keybindingService;
        this.toDispose = [];
        this.selectBox = new SelectBox([], -1, contextViewService, undefined, { ariaLabel: nls.localize('debugLaunchConfigurations', 'Debug Launch Configurations') });
        this.selectBox.setFocusable(false);
        this.toDispose.push(this.selectBox);
        this.toDispose.push(attachSelectBoxStyler(this.selectBox, themeService));
        this.registerListeners();
    }
    registerListeners() {
        this.toDispose.push(this.configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('launch')) {
                this.updateOptions();
            }
        }));
        this.toDispose.push(this.debugService.getConfigurationManager().onDidSelectConfiguration(() => {
            this.updateOptions();
        }));
    }
    render(container) {
        this.container = container;
        container.classList.add('start-debug-action-item');
        this.start = dom.append(container, $(ThemeIcon.asCSSSelector(debugStart)));
        const keybinding = this.keybindingService.lookupKeybinding(this.action.id)?.getLabel();
        const keybindingLabel = keybinding ? ` (${keybinding})` : '';
        this.start.title = this.action.label + keybindingLabel;
        this.start.setAttribute('role', 'button');
        this.toDispose.push(dom.addDisposableListener(this.start, dom.EventType.CLICK, () => {
            this.start.blur();
            if (this.debugService.state !== 1 /* State.Initializing */) {
                this.actionRunner.run(this.action, this.context);
            }
        }));
        this.toDispose.push(dom.addDisposableListener(this.start, dom.EventType.MOUSE_DOWN, (e) => {
            if (this.action.enabled && e.button === 0) {
                this.start.classList.add('active');
            }
        }));
        this.toDispose.push(dom.addDisposableListener(this.start, dom.EventType.MOUSE_UP, () => {
            this.start.classList.remove('active');
        }));
        this.toDispose.push(dom.addDisposableListener(this.start, dom.EventType.MOUSE_OUT, () => {
            this.start.classList.remove('active');
        }));
        this.toDispose.push(dom.addDisposableListener(this.start, dom.EventType.KEY_DOWN, (e) => {
            const event = new StandardKeyboardEvent(e);
            if (event.equals(17 /* KeyCode.RightArrow */)) {
                this.start.tabIndex = -1;
                this.selectBox.focus();
                event.stopPropagation();
            }
        }));
        this.toDispose.push(this.selectBox.onDidSelect(async (e) => {
            const target = this.debugOptions[e.index];
            const shouldBeSelected = target.handler ? await target.handler() : false;
            if (shouldBeSelected) {
                this.selected = e.index;
            }
            else {
                // Some select options should not remain selected https://github.com/microsoft/vscode/issues/31526
                this.selectBox.select(this.selected);
            }
        }));
        const selectBoxContainer = $('.configuration');
        this.selectBox.render(dom.append(container, selectBoxContainer));
        this.toDispose.push(dom.addDisposableListener(selectBoxContainer, dom.EventType.KEY_DOWN, (e) => {
            const event = new StandardKeyboardEvent(e);
            if (event.equals(15 /* KeyCode.LeftArrow */)) {
                this.selectBox.setFocusable(false);
                this.start.tabIndex = 0;
                this.start.focus();
                event.stopPropagation();
            }
        }));
        this.toDispose.push(attachStylerCallback(this.themeService, { selectBorder, selectBackground }, colors => {
            this.container.style.border = colors.selectBorder ? `1px solid ${colors.selectBorder}` : '';
            selectBoxContainer.style.borderLeft = colors.selectBorder ? `1px solid ${colors.selectBorder}` : '';
            const selectBackgroundColor = colors.selectBackground ? `${colors.selectBackground}` : '';
            this.container.style.backgroundColor = selectBackgroundColor;
        }));
        this.debugService.getConfigurationManager().getDynamicProviders().then(providers => {
            this.providers = providers;
            if (this.providers.length > 0) {
                this.updateOptions();
            }
        });
        this.updateOptions();
    }
    setActionContext(context) {
        this.context = context;
    }
    isEnabled() {
        return true;
    }
    focus(fromRight) {
        if (fromRight) {
            this.selectBox.focus();
        }
        else {
            this.start.tabIndex = 0;
            this.start.focus();
        }
    }
    blur() {
        this.start.tabIndex = -1;
        this.selectBox.blur();
        this.container.blur();
    }
    setFocusable(focusable) {
        if (focusable) {
            this.start.tabIndex = 0;
        }
        else {
            this.start.tabIndex = -1;
            this.selectBox.setFocusable(false);
        }
    }
    dispose() {
        this.toDispose = dispose(this.toDispose);
    }
    updateOptions() {
        this.selected = 0;
        this.debugOptions = [];
        const manager = this.debugService.getConfigurationManager();
        const inWorkspace = this.contextService.getWorkbenchState() === 3 /* WorkbenchState.WORKSPACE */;
        let lastGroup;
        const disabledIdxs = [];
        manager.getAllConfigurations().forEach(({ launch, name, presentation }) => {
            if (lastGroup !== presentation?.group) {
                lastGroup = presentation?.group;
                if (this.debugOptions.length) {
                    this.debugOptions.push({ label: StartDebugActionViewItem.SEPARATOR, handler: () => Promise.resolve(false) });
                    disabledIdxs.push(this.debugOptions.length - 1);
                }
            }
            if (name === manager.selectedConfiguration.name && launch === manager.selectedConfiguration.launch) {
                this.selected = this.debugOptions.length;
            }
            const label = inWorkspace ? `${name} (${launch.name})` : name;
            this.debugOptions.push({
                label, handler: async () => {
                    await manager.selectConfiguration(launch, name);
                    return true;
                }
            });
        });
        // Only take 3 elements from the recent dynamic configurations to not clutter the dropdown
        manager.getRecentDynamicConfigurations().slice(0, 3).forEach(({ name, type }) => {
            if (type === manager.selectedConfiguration.type && manager.selectedConfiguration.name === name) {
                this.selected = this.debugOptions.length;
            }
            this.debugOptions.push({
                label: name,
                handler: async () => {
                    await manager.selectConfiguration(undefined, name, undefined, { type });
                    return true;
                }
            });
        });
        if (this.debugOptions.length === 0) {
            this.debugOptions.push({ label: nls.localize('noConfigurations', "No Configurations"), handler: async () => false });
        }
        this.debugOptions.push({ label: StartDebugActionViewItem.SEPARATOR, handler: () => Promise.resolve(false) });
        disabledIdxs.push(this.debugOptions.length - 1);
        this.providers.forEach(p => {
            this.debugOptions.push({
                label: `${p.label}...`,
                handler: async () => {
                    const picked = await p.pick();
                    if (picked) {
                        await manager.selectConfiguration(picked.launch, picked.config.name, picked.config, { type: p.type });
                        return true;
                    }
                    return false;
                }
            });
        });
        manager.getLaunches().filter(l => !l.hidden).forEach(l => {
            const label = inWorkspace ? nls.localize("addConfigTo", "Add Config ({0})...", l.name) : nls.localize('addConfiguration', "Add Configuration...");
            this.debugOptions.push({
                label, handler: async () => {
                    await this.commandService.executeCommand(ADD_CONFIGURATION_ID, l.uri.toString());
                    return false;
                }
            });
        });
        this.selectBox.setOptions(this.debugOptions.map((data, index) => ({ text: data.label, isDisabled: disabledIdxs.indexOf(index) !== -1 })), this.selected);
    }
};
StartDebugActionViewItem = __decorate([
    __param(2, IDebugService),
    __param(3, IThemeService),
    __param(4, IConfigurationService),
    __param(5, ICommandService),
    __param(6, IWorkspaceContextService),
    __param(7, IContextViewService),
    __param(8, IKeybindingService)
], StartDebugActionViewItem);
export { StartDebugActionViewItem };
let FocusSessionActionViewItem = class FocusSessionActionViewItem extends SelectActionViewItem {
    debugService;
    configurationService;
    constructor(action, session, debugService, themeService, contextViewService, configurationService) {
        super(null, action, [], -1, contextViewService, { ariaLabel: nls.localize('debugSession', 'Debug Session') });
        this.debugService = debugService;
        this.configurationService = configurationService;
        this._register(attachSelectBoxStyler(this.selectBox, themeService));
        this._register(this.debugService.getViewModel().onDidFocusSession(() => {
            const session = this.getSelectedSession();
            if (session) {
                const index = this.getSessions().indexOf(session);
                this.select(index);
            }
        }));
        this._register(this.debugService.onDidNewSession(session => {
            const sessionListeners = [];
            sessionListeners.push(session.onDidChangeName(() => this.update()));
            sessionListeners.push(session.onDidEndAdapter(() => dispose(sessionListeners)));
            this.update();
        }));
        this.getSessions().forEach(session => {
            this._register(session.onDidChangeName(() => this.update()));
        });
        this._register(this.debugService.onDidEndSession(() => this.update()));
        const selectedSession = session ? this.mapFocusedSessionToSelected(session) : undefined;
        this.update(selectedSession);
    }
    getActionContext(_, index) {
        return this.getSessions()[index];
    }
    update(session) {
        if (!session) {
            session = this.getSelectedSession();
        }
        const sessions = this.getSessions();
        const names = sessions.map(s => {
            const label = s.getLabel();
            if (s.parentSession) {
                // Indent child sessions so they look like children
                return `\u00A0\u00A0${label}`;
            }
            return label;
        });
        this.setOptions(names.map(data => ({ text: data })), session ? sessions.indexOf(session) : undefined);
    }
    getSelectedSession() {
        const session = this.debugService.getViewModel().focusedSession;
        return session ? this.mapFocusedSessionToSelected(session) : undefined;
    }
    getSessions() {
        const showSubSessions = this.configurationService.getValue('debug').showSubSessionsInToolBar;
        const sessions = this.debugService.getModel().getSessions();
        return showSubSessions ? sessions : sessions.filter(s => !s.parentSession);
    }
    mapFocusedSessionToSelected(focusedSession) {
        const showSubSessions = this.configurationService.getValue('debug').showSubSessionsInToolBar;
        while (focusedSession.parentSession && !showSubSessions) {
            focusedSession = focusedSession.parentSession;
        }
        return focusedSession;
    }
};
FocusSessionActionViewItem = __decorate([
    __param(2, IDebugService),
    __param(3, IThemeService),
    __param(4, IContextViewService),
    __param(5, IConfigurationService)
], FocusSessionActionViewItem);
export { FocusSessionActionViewItem };

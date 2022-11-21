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
import 'vs/css!./media/welcomeOverlay';
import * as dom from 'vs/base/browser/dom';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { ShowAllCommandsAction } from 'vs/workbench/contrib/quickaccess/browser/commandsQuickAccess';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { ILayoutService } from 'vs/platform/layout/browser/layoutService';
import { localize } from 'vs/nls';
import { Categories } from 'vs/platform/action/common/actionCommonCategories';
import { Action2, registerAction2 } from 'vs/platform/actions/common/actions';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { Disposable } from 'vs/base/common/lifecycle';
import { RawContextKey, IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { registerThemingParticipant } from 'vs/platform/theme/common/themeService';
import { textPreformatForeground, foreground } from 'vs/platform/theme/common/colorRegistry';
import { Color } from 'vs/base/common/color';
import { Codicon } from 'vs/base/common/codicons';
const $ = dom.$;
const keys = [
    {
        id: 'explorer',
        arrow: '\u2190',
        label: localize('welcomeOverlay.explorer', "File explorer"),
        command: 'workbench.view.explorer'
    },
    {
        id: 'search',
        arrow: '\u2190',
        label: localize('welcomeOverlay.search', "Search across files"),
        command: 'workbench.view.search'
    },
    {
        id: 'git',
        arrow: '\u2190',
        label: localize('welcomeOverlay.git', "Source code management"),
        command: 'workbench.view.scm'
    },
    {
        id: 'debug',
        arrow: '\u2190',
        label: localize('welcomeOverlay.debug', "Launch and debug"),
        command: 'workbench.view.debug'
    },
    {
        id: 'extensions',
        arrow: '\u2190',
        label: localize('welcomeOverlay.extensions', "Manage extensions"),
        command: 'workbench.view.extensions'
    },
    // {
    // 	id: 'watermark',
    // 	arrow: '&larrpl;',
    // 	label: localize('welcomeOverlay.watermark', "Command Hints"),
    // 	withEditor: false
    // },
    {
        id: 'problems',
        arrow: '\u2939',
        label: localize('welcomeOverlay.problems', "View errors and warnings"),
        command: 'workbench.actions.view.problems'
    },
    {
        id: 'terminal',
        label: localize('welcomeOverlay.terminal', "Toggle integrated terminal"),
        command: 'workbench.action.terminal.toggleTerminal'
    },
    // {
    // 	id: 'openfile',
    // 	arrow: '&cudarrl;',
    // 	label: localize('welcomeOverlay.openfile', "File Properties"),
    // 	arrowLast: true,
    // 	withEditor: true
    // },
    {
        id: 'commandPalette',
        arrow: '\u2196',
        label: localize('welcomeOverlay.commandPalette', "Find and run all commands"),
        command: ShowAllCommandsAction.ID
    },
    {
        id: 'notifications',
        arrow: '\u2935',
        arrowLast: true,
        label: localize('welcomeOverlay.notifications', "Show notifications"),
        command: 'notifications.showList'
    }
];
const OVERLAY_VISIBLE = new RawContextKey('interfaceOverviewVisible', false);
let welcomeOverlay;
export class WelcomeOverlayAction extends Action2 {
    static ID = 'workbench.action.showInterfaceOverview';
    static LABEL = { value: localize('welcomeOverlay', "User Interface Overview"), original: 'User Interface Overview' };
    constructor() {
        super({
            id: WelcomeOverlayAction.ID,
            title: WelcomeOverlayAction.LABEL,
            category: Categories.Help,
            f1: true
        });
    }
    run(accessor) {
        const instantiationService = accessor.get(IInstantiationService);
        if (!welcomeOverlay) {
            welcomeOverlay = instantiationService.createInstance(WelcomeOverlay);
        }
        welcomeOverlay.show();
        return Promise.resolve();
    }
}
export class HideWelcomeOverlayAction extends Action2 {
    static ID = 'workbench.action.hideInterfaceOverview';
    static LABEL = { value: localize('hideWelcomeOverlay', "Hide Interface Overview"), original: 'Hide Interface Overview' };
    constructor() {
        super({
            id: HideWelcomeOverlayAction.ID,
            title: HideWelcomeOverlayAction.LABEL,
            category: Categories.Help,
            f1: true,
            keybinding: {
                primary: 9 /* KeyCode.Escape */,
                when: OVERLAY_VISIBLE,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */
            },
            precondition: OVERLAY_VISIBLE
        });
    }
    run() {
        welcomeOverlay?.hide();
        return Promise.resolve();
    }
}
let WelcomeOverlay = class WelcomeOverlay extends Disposable {
    layoutService;
    editorService;
    commandService;
    _contextKeyService;
    keybindingService;
    _overlayVisible;
    _overlay;
    constructor(layoutService, editorService, commandService, _contextKeyService, keybindingService) {
        super();
        this.layoutService = layoutService;
        this.editorService = editorService;
        this.commandService = commandService;
        this._contextKeyService = _contextKeyService;
        this.keybindingService = keybindingService;
        this._overlayVisible = OVERLAY_VISIBLE.bindTo(this._contextKeyService);
        this.create();
    }
    create() {
        const offset = this.layoutService.offset.top;
        this._overlay = dom.append(this.layoutService.container, $('.welcomeOverlay'));
        this._overlay.style.top = `${offset}px`;
        this._overlay.style.height = `calc(100% - ${offset}px)`;
        this._overlay.style.display = 'none';
        this._overlay.tabIndex = -1;
        this._register(dom.addStandardDisposableListener(this._overlay, 'click', () => this.hide()));
        this.commandService.onWillExecuteCommand(() => this.hide());
        dom.append(this._overlay, $('.commandPalettePlaceholder'));
        const editorOpen = !!this.editorService.visibleEditors.length;
        keys.filter(key => !('withEditor' in key) || key.withEditor === editorOpen)
            .forEach(({ id, arrow, label, command, arrowLast }) => {
            const div = dom.append(this._overlay, $(`.key.${id}`));
            if (arrow && !arrowLast) {
                dom.append(div, $('span.arrow', undefined, arrow));
            }
            dom.append(div, $('span.label')).textContent = label;
            if (command) {
                const shortcut = this.keybindingService.lookupKeybinding(command);
                if (shortcut) {
                    dom.append(div, $('span.shortcut')).textContent = shortcut.getLabel();
                }
            }
            if (arrow && arrowLast) {
                dom.append(div, $('span.arrow', undefined, arrow));
            }
        });
    }
    show() {
        if (this._overlay.style.display !== 'block') {
            this._overlay.style.display = 'block';
            const workbench = document.querySelector('.monaco-workbench');
            workbench.classList.add('blur-background');
            this._overlayVisible.set(true);
            this.updateProblemsKey();
            this.updateActivityBarKeys();
            this._overlay.focus();
        }
    }
    updateProblemsKey() {
        const problems = document.querySelector(`footer[id="workbench.parts.statusbar"] .statusbar-item.left ${Codicon.warning.cssSelector}`);
        const key = this._overlay.querySelector('.key.problems');
        if (problems instanceof HTMLElement) {
            const target = problems.getBoundingClientRect();
            const bounds = this._overlay.getBoundingClientRect();
            const bottom = bounds.bottom - target.top + 3;
            const left = (target.left + target.right) / 2 - bounds.left;
            key.style.bottom = bottom + 'px';
            key.style.left = left + 'px';
        }
        else {
            key.style.bottom = '';
            key.style.left = '';
        }
    }
    updateActivityBarKeys() {
        const ids = ['explorer', 'search', 'git', 'debug', 'extensions'];
        const activityBar = document.querySelector('.activitybar .composite-bar');
        if (activityBar instanceof HTMLElement) {
            const target = activityBar.getBoundingClientRect();
            const bounds = this._overlay.getBoundingClientRect();
            for (let i = 0; i < ids.length; i++) {
                const key = this._overlay.querySelector(`.key.${ids[i]}`);
                const top = target.top - bounds.top + 50 * i + 13;
                key.style.top = top + 'px';
            }
        }
        else {
            for (let i = 0; i < ids.length; i++) {
                const key = this._overlay.querySelector(`.key.${ids[i]}`);
                key.style.top = '';
            }
        }
    }
    hide() {
        if (this._overlay.style.display !== 'none') {
            this._overlay.style.display = 'none';
            const workbench = document.querySelector('.monaco-workbench');
            workbench.classList.remove('blur-background');
            this._overlayVisible.reset();
        }
    }
};
WelcomeOverlay = __decorate([
    __param(0, ILayoutService),
    __param(1, IEditorService),
    __param(2, ICommandService),
    __param(3, IContextKeyService),
    __param(4, IKeybindingService)
], WelcomeOverlay);
registerAction2(WelcomeOverlayAction);
registerAction2(HideWelcomeOverlayAction);
// theming
registerThemingParticipant((theme, collector) => {
    const key = theme.getColor(foreground);
    if (key) {
        collector.addRule(`.monaco-workbench > .welcomeOverlay > .key { color: ${key}; }`);
    }
    const backgroundColor = Color.fromHex(theme.type === 'light' ? '#FFFFFF85' : '#00000085');
    if (backgroundColor) {
        collector.addRule(`.monaco-workbench > .welcomeOverlay { background: ${backgroundColor}; }`);
    }
    const shortcut = theme.getColor(textPreformatForeground);
    if (shortcut) {
        collector.addRule(`.monaco-workbench > .welcomeOverlay > .key > .shortcut { color: ${shortcut}; }`);
    }
});

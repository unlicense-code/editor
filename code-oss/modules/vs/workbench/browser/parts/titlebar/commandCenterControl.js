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
import { reset } from 'vs/base/browser/dom';
import { BaseActionViewItem } from 'vs/base/browser/ui/actionbar/actionViewItems';
import { setupCustomHover } from 'vs/base/browser/ui/iconLabel/iconLabelHover';
import { renderIcon } from 'vs/base/browser/ui/iconLabel/iconLabels';
import { Codicon } from 'vs/base/common/codicons';
import { Color } from 'vs/base/common/color';
import { Emitter } from 'vs/base/common/event';
import { DisposableStore } from 'vs/base/common/lifecycle';
import { localize } from 'vs/nls';
import { createActionViewItem } from 'vs/platform/actions/browser/menuEntryActionViewItem';
import { MenuWorkbenchToolBar } from 'vs/platform/actions/browser/toolbar';
import { MenuId, MenuItemAction } from 'vs/platform/actions/common/actions';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { IQuickInputService } from 'vs/platform/quickinput/common/quickInput';
import * as colors from 'vs/platform/theme/common/colorRegistry';
import { MENUBAR_SELECTION_BACKGROUND, MENUBAR_SELECTION_FOREGROUND, TITLE_BAR_ACTIVE_FOREGROUND, TITLE_BAR_INACTIVE_FOREGROUND } from 'vs/workbench/common/theme';
let CommandCenterControl = class CommandCenterControl {
    _disposables = new DisposableStore();
    _onDidChangeVisibility = new Emitter();
    onDidChangeVisibility = this._onDidChangeVisibility.event;
    element = document.createElement('div');
    constructor(windowTitle, hoverDelegate, instantiationService, quickInputService, keybindingService) {
        this.element.classList.add('command-center');
        const titleToolbar = instantiationService.createInstance(MenuWorkbenchToolBar, this.element, MenuId.CommandCenter, {
            contextMenu: MenuId.TitleBarContext,
            hiddenItemStrategy: 0 /* HiddenItemStrategy.Ignore */,
            toolbarOptions: {
                primaryGroup: () => true,
            },
            telemetrySource: 'commandCenter',
            actionViewItemProvider: (action) => {
                if (action instanceof MenuItemAction && action.id === 'workbench.action.quickOpenWithModes') {
                    class CommandCenterViewItem extends BaseActionViewItem {
                        constructor(action, options) {
                            super(undefined, action, options);
                        }
                        render(container) {
                            super.render(container);
                            container.classList.add('command-center');
                            // icon (search)
                            const searchIcon = renderIcon(Codicon.search);
                            searchIcon.classList.add('search-icon');
                            // label: just workspace name and optional decorations
                            const label = this._getLabel();
                            const labelElement = document.createElement('span');
                            labelElement.classList.add('search-label');
                            labelElement.innerText = label;
                            reset(container, searchIcon, labelElement);
                            const hover = this._store.add(setupCustomHover(hoverDelegate, container, this.getTooltip()));
                            // update label & tooltip when window title changes
                            this._store.add(windowTitle.onDidChange(() => {
                                hover.update(this.getTooltip());
                                labelElement.innerText = this._getLabel();
                            }));
                        }
                        _getLabel() {
                            const { prefix, suffix } = windowTitle.getTitleDecorations();
                            let label = windowTitle.isCustomTitleFormat() ? windowTitle.getWindowTitle() : windowTitle.workspaceName;
                            if (!label) {
                                label = localize('label.dfl', "Search");
                            }
                            if (prefix) {
                                label = localize('label1', "{0} {1}", prefix, label);
                            }
                            if (suffix) {
                                label = localize('label2', "{0} {1}", label, suffix);
                            }
                            return label;
                        }
                        getTooltip() {
                            // tooltip: full windowTitle
                            const kb = keybindingService.lookupKeybinding(action.id)?.getLabel();
                            const title = kb
                                ? localize('title', "Search {0} ({1}) \u2014 {2}", windowTitle.workspaceName, kb, windowTitle.value)
                                : localize('title2', "Search {0} \u2014 {1}", windowTitle.workspaceName, windowTitle.value);
                            return title;
                        }
                    }
                    return instantiationService.createInstance(CommandCenterViewItem, action, {});
                }
                else {
                    return createActionViewItem(instantiationService, action, { hoverDelegate });
                }
            }
        });
        this._disposables.add(quickInputService.onShow(this._setVisibility.bind(this, false)));
        this._disposables.add(quickInputService.onHide(this._setVisibility.bind(this, true)));
        this._disposables.add(titleToolbar);
    }
    _setVisibility(show) {
        this.element.classList.toggle('hide', !show);
        this._onDidChangeVisibility.fire();
    }
    dispose() {
        this._disposables.dispose();
    }
};
CommandCenterControl = __decorate([
    __param(2, IInstantiationService),
    __param(3, IQuickInputService),
    __param(4, IKeybindingService)
], CommandCenterControl);
export { CommandCenterControl };
// --- theme colors
// foreground (inactive and active)
colors.registerColor('commandCenter.foreground', { dark: TITLE_BAR_ACTIVE_FOREGROUND, hcDark: TITLE_BAR_ACTIVE_FOREGROUND, light: TITLE_BAR_ACTIVE_FOREGROUND, hcLight: TITLE_BAR_ACTIVE_FOREGROUND }, localize('commandCenter-foreground', "Foreground color of the command center"), false);
colors.registerColor('commandCenter.activeForeground', { dark: MENUBAR_SELECTION_FOREGROUND, hcDark: MENUBAR_SELECTION_FOREGROUND, light: MENUBAR_SELECTION_FOREGROUND, hcLight: MENUBAR_SELECTION_FOREGROUND }, localize('commandCenter-activeForeground', "Active foreground color of the command center"), false);
colors.registerColor('commandCenter.inactiveForeground', { dark: TITLE_BAR_INACTIVE_FOREGROUND, hcDark: TITLE_BAR_INACTIVE_FOREGROUND, light: TITLE_BAR_INACTIVE_FOREGROUND, hcLight: TITLE_BAR_INACTIVE_FOREGROUND }, localize('commandCenter-inactiveForeground', "Foreground color of the command center when the window is inactive"), false);
// background (inactive and active)
colors.registerColor('commandCenter.background', {
    dark: Color.white.transparent(0.05), hcDark: null, light: Color.black.transparent(0.05), hcLight: null
}, localize('commandCenter-background', "Background color of the command center"), false);
colors.registerColor('commandCenter.activeBackground', { dark: Color.white.transparent(0.08), hcDark: MENUBAR_SELECTION_BACKGROUND, light: Color.black.transparent(0.08), hcLight: MENUBAR_SELECTION_BACKGROUND }, localize('commandCenter-activeBackground', "Active background color of the command center"), false);
// border: active and inactive. defaults to active background
colors.registerColor('commandCenter.border', { dark: colors.transparent(TITLE_BAR_ACTIVE_FOREGROUND, .20), hcDark: colors.transparent(TITLE_BAR_ACTIVE_FOREGROUND, .60), light: colors.transparent(TITLE_BAR_ACTIVE_FOREGROUND, .20), hcLight: colors.transparent(TITLE_BAR_ACTIVE_FOREGROUND, .60) }, localize('commandCenter-border', "Border color of the command center"), false);
colors.registerColor('commandCenter.activeBorder', { dark: colors.transparent(TITLE_BAR_ACTIVE_FOREGROUND, .30), hcDark: TITLE_BAR_ACTIVE_FOREGROUND, light: colors.transparent(TITLE_BAR_ACTIVE_FOREGROUND, .30), hcLight: TITLE_BAR_ACTIVE_FOREGROUND }, localize('commandCenter-activeBorder', "Active border color of the command center"), false);
// border: defaults to active background
colors.registerColor('commandCenter.inactiveBorder', { dark: colors.transparent(TITLE_BAR_INACTIVE_FOREGROUND, .25), hcDark: colors.transparent(TITLE_BAR_INACTIVE_FOREGROUND, .25), light: colors.transparent(TITLE_BAR_INACTIVE_FOREGROUND, .25), hcLight: colors.transparent(TITLE_BAR_INACTIVE_FOREGROUND, .25) }, localize('commandCenter-inactiveBorder', "Border color of the command center when the window is inactive"), false);

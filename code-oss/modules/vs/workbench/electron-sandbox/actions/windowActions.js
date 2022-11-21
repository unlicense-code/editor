/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import 'vs/css!./media/actions';
import { URI } from 'vs/base/common/uri';
import { localize } from 'vs/nls';
import { applyZoom } from 'vs/platform/window/electron-sandbox/window';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { getZoomLevel } from 'vs/base/browser/browser';
import { FileKind } from 'vs/platform/files/common/files';
import { IModelService } from 'vs/editor/common/services/model';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { IQuickInputService } from 'vs/platform/quickinput/common/quickInput';
import { getIconClasses } from 'vs/editor/common/services/getIconClasses';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { INativeHostService } from 'vs/platform/native/electron-sandbox/native';
import { Codicon } from 'vs/base/common/codicons';
import { isSingleFolderWorkspaceIdentifier, isWorkspaceIdentifier } from 'vs/platform/workspace/common/workspace';
import { Action2, MenuId } from 'vs/platform/actions/common/actions';
import { Categories } from 'vs/platform/action/common/actionCommonCategories';
export class CloseWindowAction extends Action2 {
    static ID = 'workbench.action.closeWindow';
    constructor() {
        super({
            id: CloseWindowAction.ID,
            title: {
                value: localize('closeWindow', "Close Window"),
                mnemonicTitle: localize({ key: 'miCloseWindow', comment: ['&& denotes a mnemonic'] }, "Clos&&e Window"),
                original: 'Close Window'
            },
            f1: true,
            keybinding: {
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 53 /* KeyCode.KeyW */ },
                linux: { primary: 512 /* KeyMod.Alt */ | 62 /* KeyCode.F4 */, secondary: [2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 53 /* KeyCode.KeyW */] },
                win: { primary: 512 /* KeyMod.Alt */ | 62 /* KeyCode.F4 */, secondary: [2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 53 /* KeyCode.KeyW */] }
            },
            menu: {
                id: MenuId.MenubarFileMenu,
                group: '6_close',
                order: 4
            }
        });
    }
    async run(accessor) {
        const nativeHostService = accessor.get(INativeHostService);
        return nativeHostService.closeWindow();
    }
}
class BaseZoomAction extends Action2 {
    static SETTING_KEY = 'window.zoomLevel';
    static MAX_ZOOM_LEVEL = 8;
    static MIN_ZOOM_LEVEL = -8;
    constructor(desc) {
        super(desc);
    }
    async setConfiguredZoomLevel(accessor, level) {
        const configurationService = accessor.get(IConfigurationService);
        level = Math.round(level); // when reaching smallest zoom, prevent fractional zoom levels
        if (level > BaseZoomAction.MAX_ZOOM_LEVEL || level < BaseZoomAction.MIN_ZOOM_LEVEL) {
            return; // https://github.com/microsoft/vscode/issues/48357
        }
        await configurationService.updateValue(BaseZoomAction.SETTING_KEY, level);
        applyZoom(level);
    }
}
export class ZoomInAction extends BaseZoomAction {
    constructor() {
        super({
            id: 'workbench.action.zoomIn',
            title: {
                value: localize('zoomIn', "Zoom In"),
                mnemonicTitle: localize({ key: 'miZoomIn', comment: ['&& denotes a mnemonic'] }, "&&Zoom In"),
                original: 'Zoom In'
            },
            category: Categories.View,
            f1: true,
            keybinding: {
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                primary: 2048 /* KeyMod.CtrlCmd */ | 81 /* KeyCode.Equal */,
                secondary: [2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 81 /* KeyCode.Equal */, 2048 /* KeyMod.CtrlCmd */ | 104 /* KeyCode.NumpadAdd */]
            },
            menu: {
                id: MenuId.MenubarAppearanceMenu,
                group: '5_zoom',
                order: 1
            }
        });
    }
    run(accessor) {
        return super.setConfiguredZoomLevel(accessor, getZoomLevel() + 1);
    }
}
export class ZoomOutAction extends BaseZoomAction {
    constructor() {
        super({
            id: 'workbench.action.zoomOut',
            title: {
                value: localize('zoomOut', "Zoom Out"),
                mnemonicTitle: localize({ key: 'miZoomOut', comment: ['&& denotes a mnemonic'] }, "&&Zoom Out"),
                original: 'Zoom Out'
            },
            category: Categories.View,
            f1: true,
            keybinding: {
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                primary: 2048 /* KeyMod.CtrlCmd */ | 83 /* KeyCode.Minus */,
                secondary: [2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 83 /* KeyCode.Minus */, 2048 /* KeyMod.CtrlCmd */ | 106 /* KeyCode.NumpadSubtract */],
                linux: {
                    primary: 2048 /* KeyMod.CtrlCmd */ | 83 /* KeyCode.Minus */,
                    secondary: [2048 /* KeyMod.CtrlCmd */ | 106 /* KeyCode.NumpadSubtract */]
                }
            },
            menu: {
                id: MenuId.MenubarAppearanceMenu,
                group: '5_zoom',
                order: 2
            }
        });
    }
    run(accessor) {
        return super.setConfiguredZoomLevel(accessor, getZoomLevel() - 1);
    }
}
export class ZoomResetAction extends BaseZoomAction {
    constructor() {
        super({
            id: 'workbench.action.zoomReset',
            title: {
                value: localize('zoomReset', "Reset Zoom"),
                mnemonicTitle: localize({ key: 'miZoomReset', comment: ['&& denotes a mnemonic'] }, "&&Reset Zoom"),
                original: 'Reset Zoom'
            },
            category: Categories.View,
            f1: true,
            keybinding: {
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                primary: 2048 /* KeyMod.CtrlCmd */ | 93 /* KeyCode.Numpad0 */
            },
            menu: {
                id: MenuId.MenubarAppearanceMenu,
                group: '5_zoom',
                order: 3
            }
        });
    }
    run(accessor) {
        return super.setConfiguredZoomLevel(accessor, 0);
    }
}
class BaseSwitchWindow extends Action2 {
    closeWindowAction = {
        iconClass: Codicon.removeClose.classNames,
        tooltip: localize('close', "Close Window")
    };
    closeDirtyWindowAction = {
        iconClass: 'dirty-window ' + Codicon.closeDirty,
        tooltip: localize('close', "Close Window"),
        alwaysVisible: true
    };
    constructor(desc) {
        super(desc);
    }
    async run(accessor) {
        const quickInputService = accessor.get(IQuickInputService);
        const keybindingService = accessor.get(IKeybindingService);
        const modelService = accessor.get(IModelService);
        const languageService = accessor.get(ILanguageService);
        const nativeHostService = accessor.get(INativeHostService);
        const currentWindowId = nativeHostService.windowId;
        const windows = await nativeHostService.getWindows();
        const placeHolder = localize('switchWindowPlaceHolder', "Select a window to switch to");
        const picks = windows.map(window => {
            const resource = window.filename ? URI.file(window.filename) : isSingleFolderWorkspaceIdentifier(window.workspace) ? window.workspace.uri : isWorkspaceIdentifier(window.workspace) ? window.workspace.configPath : undefined;
            const fileKind = window.filename ? FileKind.FILE : isSingleFolderWorkspaceIdentifier(window.workspace) ? FileKind.FOLDER : isWorkspaceIdentifier(window.workspace) ? FileKind.ROOT_FOLDER : FileKind.FILE;
            return {
                payload: window.id,
                label: window.title,
                ariaLabel: window.dirty ? localize('windowDirtyAriaLabel', "{0}, window with unsaved changes", window.title) : window.title,
                iconClasses: getIconClasses(modelService, languageService, resource, fileKind),
                description: (currentWindowId === window.id) ? localize('current', "Current Window") : undefined,
                buttons: currentWindowId !== window.id ? window.dirty ? [this.closeDirtyWindowAction] : [this.closeWindowAction] : undefined
            };
        });
        const autoFocusIndex = (picks.indexOf(picks.filter(pick => pick.payload === currentWindowId)[0]) + 1) % picks.length;
        const pick = await quickInputService.pick(picks, {
            contextKey: 'inWindowsPicker',
            activeItem: picks[autoFocusIndex],
            placeHolder,
            quickNavigate: this.isQuickNavigate() ? { keybindings: keybindingService.lookupKeybindings(this.desc.id) } : undefined,
            hideInput: this.isQuickNavigate(),
            onDidTriggerItemButton: async (context) => {
                await nativeHostService.closeWindowById(context.item.payload);
                context.removeItem();
            }
        });
        if (pick) {
            nativeHostService.focusWindow({ windowId: pick.payload });
        }
    }
}
export class SwitchWindowAction extends BaseSwitchWindow {
    constructor() {
        super({
            id: 'workbench.action.switchWindow',
            title: { value: localize('switchWindow', "Switch Window..."), original: 'Switch Window...' },
            f1: true,
            keybinding: {
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                primary: 0,
                mac: { primary: 256 /* KeyMod.WinCtrl */ | 53 /* KeyCode.KeyW */ }
            }
        });
    }
    isQuickNavigate() {
        return false;
    }
}
export class QuickSwitchWindowAction extends BaseSwitchWindow {
    constructor() {
        super({
            id: 'workbench.action.quickSwitchWindow',
            title: { value: localize('quickSwitchWindow', "Quick Switch Window..."), original: 'Quick Switch Window...' },
            f1: false // hide quick pickers from command palette to not confuse with the other entry that shows a input field
        });
    }
    isQuickNavigate() {
        return true;
    }
}
export const NewWindowTabHandler = function (accessor) {
    return accessor.get(INativeHostService).newWindowTab();
};
export const ShowPreviousWindowTabHandler = function (accessor) {
    return accessor.get(INativeHostService).showPreviousWindowTab();
};
export const ShowNextWindowTabHandler = function (accessor) {
    return accessor.get(INativeHostService).showNextWindowTab();
};
export const MoveWindowTabToNewWindowHandler = function (accessor) {
    return accessor.get(INativeHostService).moveWindowTabToNewWindow();
};
export const MergeWindowTabsHandlerHandler = function (accessor) {
    return accessor.get(INativeHostService).mergeAllWindowTabs();
};
export const ToggleWindowTabsBarHandler = function (accessor) {
    return accessor.get(INativeHostService).toggleWindowTabsBar();
};

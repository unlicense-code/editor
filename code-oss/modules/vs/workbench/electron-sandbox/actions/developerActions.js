/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { localize } from 'vs/nls';
import { INativeHostService } from 'vs/platform/native/electron-sandbox/native';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { Action2, MenuId } from 'vs/platform/actions/common/actions';
import { Categories } from 'vs/platform/action/common/actionCommonCategories';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { IsDevelopmentContext } from 'vs/platform/contextkey/common/contextkeys';
export class ToggleDevToolsAction extends Action2 {
    constructor() {
        super({
            id: 'workbench.action.toggleDevTools',
            title: { value: localize('toggleDevTools', "Toggle Developer Tools"), original: 'Toggle Developer Tools' },
            category: Categories.Developer,
            f1: true,
            keybinding: {
                weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 50,
                when: IsDevelopmentContext,
                primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 39 /* KeyCode.KeyI */,
                mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 39 /* KeyCode.KeyI */ }
            },
            menu: {
                id: MenuId.MenubarHelpMenu,
                group: '5_tools',
                order: 1
            }
        });
    }
    async run(accessor) {
        const nativeHostService = accessor.get(INativeHostService);
        return nativeHostService.toggleDevTools();
    }
}
export class ConfigureRuntimeArgumentsAction extends Action2 {
    constructor() {
        super({
            id: 'workbench.action.configureRuntimeArguments',
            title: { value: localize('configureRuntimeArguments', "Configure Runtime Arguments"), original: 'Configure Runtime Arguments' },
            category: Categories.Preferences,
            f1: true
        });
    }
    async run(accessor) {
        const editorService = accessor.get(IEditorService);
        const environmentService = accessor.get(IWorkbenchEnvironmentService);
        await editorService.openEditor({
            resource: environmentService.argvResource,
            options: { pinned: true }
        });
    }
}
export class ToggleSharedProcessAction extends Action2 {
    constructor() {
        super({
            id: 'workbench.action.toggleSharedProcess',
            title: { value: localize('toggleSharedProcess', "Toggle Shared Process"), original: 'Toggle Shared Process' },
            category: Categories.Developer,
            f1: true
        });
    }
    async run(accessor) {
        return accessor.get(INativeHostService).toggleSharedProcessWindow();
    }
}
export class ReloadWindowWithExtensionsDisabledAction extends Action2 {
    constructor() {
        super({
            id: 'workbench.action.reloadWindowWithExtensionsDisabled',
            title: { value: localize('reloadWindowWithExtensionsDisabled', "Reload With Extensions Disabled"), original: 'Reload With Extensions Disabled' },
            category: Categories.Developer,
            f1: true
        });
    }
    async run(accessor) {
        return accessor.get(INativeHostService).reload({ disableExtensions: true });
    }
}

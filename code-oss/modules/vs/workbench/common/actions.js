/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Registry } from 'vs/platform/registry/common/platform';
import { KeybindingsRegistry } from 'vs/platform/keybinding/common/keybindingsRegistry';
import { CommandsRegistry } from 'vs/platform/commands/common/commands';
import { MenuRegistry, MenuId } from 'vs/platform/actions/common/actions';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { DisposableStore } from 'vs/base/common/lifecycle';
import { ILifecycleService } from 'vs/workbench/services/lifecycle/common/lifecycle';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { ContextKeyExpr } from 'vs/platform/contextkey/common/contextkey';
export const Extensions = {
    WorkbenchActions: 'workbench.contributions.actions'
};
Registry.add(Extensions.WorkbenchActions, new class {
    registerWorkbenchAction(descriptor, alias, category, when) {
        return this.registerWorkbenchCommandFromAction(descriptor, alias, category, when);
    }
    registerWorkbenchCommandFromAction(descriptor, alias, category, when) {
        const registrations = new DisposableStore();
        // command
        registrations.add(CommandsRegistry.registerCommand(descriptor.id, this.createCommandHandler(descriptor)));
        // keybinding
        const weight = (typeof descriptor.keybindingWeight === 'undefined' ? 200 /* KeybindingWeight.WorkbenchContrib */ : descriptor.keybindingWeight);
        const keybindings = descriptor.keybindings;
        registrations.add(KeybindingsRegistry.registerKeybindingRule({
            id: descriptor.id,
            weight: weight,
            when: descriptor.keybindingContext && when
                ? ContextKeyExpr.and(descriptor.keybindingContext, when)
                : descriptor.keybindingContext || when || null,
            primary: keybindings ? keybindings.primary : 0,
            secondary: keybindings?.secondary,
            win: keybindings?.win,
            mac: keybindings?.mac,
            linux: keybindings?.linux
        }));
        // menu item
        // TODO@Rob slightly weird if-check required because of
        // https://github.com/microsoft/vscode/blob/main/src/vs/workbench/contrib/search/electron-browser/search.contribution.ts#L266
        if (descriptor.label) {
            const idx = alias.indexOf(': ');
            let categoryOriginal = '';
            if (idx > 0) {
                categoryOriginal = alias.substr(0, idx);
                alias = alias.substr(idx + 2);
            }
            const command = {
                id: descriptor.id,
                title: { value: descriptor.label, original: alias },
                category: category ? { value: category, original: categoryOriginal } : undefined
            };
            registrations.add(MenuRegistry.addCommand(command));
            registrations.add(MenuRegistry.appendMenuItem(MenuId.CommandPalette, { command, when }));
        }
        return registrations;
    }
    createCommandHandler(descriptor) {
        return async (accessor, args) => {
            const notificationService = accessor.get(INotificationService);
            const instantiationService = accessor.get(IInstantiationService);
            const lifecycleService = accessor.get(ILifecycleService);
            try {
                await this.triggerAndDisposeAction(instantiationService, lifecycleService, descriptor, args);
            }
            catch (error) {
                notificationService.error(error);
            }
        };
    }
    async triggerAndDisposeAction(instantiationService, lifecycleService, descriptor, args) {
        // run action when workbench is created
        await lifecycleService.when(2 /* LifecyclePhase.Ready */);
        const actionInstance = instantiationService.createInstance(descriptor.syncDescriptor);
        actionInstance.label = descriptor.label || actionInstance.label;
        // don't run the action when not enabled
        if (!actionInstance.enabled) {
            actionInstance.dispose();
            return;
        }
        // otherwise run and dispose
        try {
            const from = args?.from || 'keybinding';
            await actionInstance.run(undefined, { from });
        }
        finally {
            actionInstance.dispose();
        }
    }
});

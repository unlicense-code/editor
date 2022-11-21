/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { URI } from 'vs/base/common/uri';
import { localize } from 'vs/nls';
import { MenuId, MenuRegistry, Action2, registerAction2 } from 'vs/platform/actions/common/actions';
import { CommandsRegistry } from 'vs/platform/commands/common/commands';
import { IQuickInputService } from 'vs/platform/quickinput/common/quickInput';
import { Registry } from 'vs/platform/registry/common/platform';
import { IURLService } from 'vs/platform/url/common/url';
import { Extensions as WorkbenchExtensions } from 'vs/workbench/common/contributions';
import { ExternalUriResolverContribution } from 'vs/workbench/contrib/url/browser/externalUriResolver';
import { manageTrustedDomainSettingsCommand } from 'vs/workbench/contrib/url/browser/trustedDomains';
import { TrustedDomainsFileSystemProvider } from 'vs/workbench/contrib/url/browser/trustedDomainsFileSystemProvider';
import { OpenerValidatorContributions } from 'vs/workbench/contrib/url/browser/trustedDomainsValidator';
import { Categories } from 'vs/platform/action/common/actionCommonCategories';
import { Extensions as ConfigurationExtensions } from 'vs/platform/configuration/common/configurationRegistry';
import { workbenchConfigurationNodeBase } from 'vs/workbench/common/configuration';
class OpenUrlAction extends Action2 {
    constructor() {
        super({
            id: 'workbench.action.url.openUrl',
            title: { value: localize('openUrl', "Open URL"), original: 'Open URL' },
            category: Categories.Developer,
            f1: true
        });
    }
    async run(accessor) {
        const quickInputService = accessor.get(IQuickInputService);
        const urlService = accessor.get(IURLService);
        return quickInputService.input({ prompt: localize('urlToOpen', "URL to open") }).then(input => {
            if (input) {
                const uri = URI.parse(input);
                urlService.open(uri, { originalUrl: input });
            }
        });
    }
}
registerAction2(OpenUrlAction);
/**
 * Trusted Domains Contribution
 */
CommandsRegistry.registerCommand(manageTrustedDomainSettingsCommand);
MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
    command: {
        id: manageTrustedDomainSettingsCommand.id,
        title: {
            value: manageTrustedDomainSettingsCommand.description.description,
            original: 'Manage Trusted Domains'
        }
    }
});
Registry.as(WorkbenchExtensions.Workbench).registerWorkbenchContribution(OpenerValidatorContributions, 3 /* LifecyclePhase.Restored */);
Registry.as(WorkbenchExtensions.Workbench).registerWorkbenchContribution(TrustedDomainsFileSystemProvider, 2 /* LifecyclePhase.Ready */);
Registry.as(WorkbenchExtensions.Workbench).registerWorkbenchContribution(ExternalUriResolverContribution, 2 /* LifecyclePhase.Ready */);
const configurationRegistry = Registry.as(ConfigurationExtensions.Configuration);
configurationRegistry.registerConfiguration({
    ...workbenchConfigurationNodeBase,
    properties: {
        'workbench.trustedDomains.promptInTrustedWorkspace': {
            scope: 1 /* ConfigurationScope.APPLICATION */,
            type: 'boolean',
            default: false,
            description: localize('workbench.trustedDomains.promptInTrustedWorkspace', "When enabled, trusted domain prompts will appear when opening links in trusted workspaces.")
        }
    }
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { localize } from 'vs/nls';
export function getShellIntegrationTooltip(instance, markdown) {
    const shellIntegrationCapabilities = [];
    if (instance.capabilities.has(2 /* TerminalCapability.CommandDetection */)) {
        shellIntegrationCapabilities.push(2 /* TerminalCapability.CommandDetection */);
    }
    if (instance.capabilities.has(0 /* TerminalCapability.CwdDetection */)) {
        shellIntegrationCapabilities.push(0 /* TerminalCapability.CwdDetection */);
    }
    let shellIntegrationString = '';
    if (shellIntegrationCapabilities.length > 0) {
        shellIntegrationString += `${markdown ? '\n\n---\n\n' : '\n\n'} ${localize('shellIntegration.enabled', "Shell integration activated")}`;
    }
    else {
        if (instance.shellLaunchConfig.ignoreShellIntegration) {
            shellIntegrationString += `${markdown ? '\n\n---\n\n' : '\n\n'} ${localize('launchFailed.exitCodeOnlyShellIntegration', "The terminal process failed to launch. Disabling shell integration with terminal.integrated.shellIntegration.enabled might help.")}`;
        }
        else {
            if (instance.usedShellIntegrationInjection) {
                shellIntegrationString += `${markdown ? '\n\n---\n\n' : '\n\n'} ${localize('shellIntegration.activationFailed', "Shell integration failed to activate")}`;
            }
        }
    }
    return shellIntegrationString;
}

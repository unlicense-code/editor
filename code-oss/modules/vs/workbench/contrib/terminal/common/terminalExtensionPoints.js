/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as extensionsRegistry from 'vs/workbench/services/extensions/common/extensionsRegistry';
import { terminalContributionsDescriptor } from 'vs/workbench/contrib/terminal/common/terminal';
import { flatten } from 'vs/base/common/arrays';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { URI } from 'vs/base/common/uri';
import { isProposedApiEnabled } from 'vs/workbench/services/extensions/common/extensions';
// terminal extension point
export const terminalsExtPoint = extensionsRegistry.ExtensionsRegistry.registerExtensionPoint(terminalContributionsDescriptor);
export const ITerminalContributionService = createDecorator('terminalContributionsService');
export class TerminalContributionService {
    _terminalProfiles = [];
    get terminalProfiles() { return this._terminalProfiles; }
    _quickFixes = [];
    get quickFixes() { return this._quickFixes; }
    constructor() {
        terminalsExtPoint.setHandler(contributions => {
            this._terminalProfiles = flatten(contributions.map(c => {
                return c.value?.profiles?.filter(p => hasValidTerminalIcon(p)).map(e => {
                    return { ...e, extensionIdentifier: c.description.identifier.value };
                }) || [];
            }));
            this._quickFixes = flatten(contributions.filter(c => isProposedApiEnabled(c.description, 'contribTerminalQuickFixes')).map(c => c.value.quickFixes ? c.value.quickFixes.map(fix => { return { ...fix, extensionIdentifier: c.description.identifier.value }; }) : []));
        });
    }
}
function hasValidTerminalIcon(profile) {
    return !profile.icon ||
        (typeof profile.icon === 'string' ||
            URI.isUri(profile.icon) ||
            ('light' in profile.icon && 'dark' in profile.icon &&
                URI.isUri(profile.icon.light) && URI.isUri(profile.icon.dark)));
}

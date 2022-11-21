/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { URI } from 'vs/base/common/uri';
import { localize } from 'vs/nls';
import { IProductService } from 'vs/platform/product/common/productService';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IAuthenticationService } from 'vs/workbench/services/authentication/common/authentication';
import { IFileService } from 'vs/platform/files/common/files';
import { ITextFileService } from 'vs/workbench/services/textfile/common/textfiles';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { IBrowserWorkbenchEnvironmentService } from 'vs/workbench/services/environment/browser/environmentService';
const TRUSTED_DOMAINS_URI = URI.parse('trustedDomains:/Trusted Domains');
export const TRUSTED_DOMAINS_STORAGE_KEY = 'http.linkProtectionTrustedDomains';
export const TRUSTED_DOMAINS_CONTENT_STORAGE_KEY = 'http.linkProtectionTrustedDomainsContent';
export const manageTrustedDomainSettingsCommand = {
    id: 'workbench.action.manageTrustedDomain',
    description: {
        description: localize('trustedDomain.manageTrustedDomain', 'Manage Trusted Domains'),
        args: []
    },
    handler: async (accessor) => {
        const editorService = accessor.get(IEditorService);
        editorService.openEditor({ resource: TRUSTED_DOMAINS_URI, languageId: 'jsonc', options: { pinned: true } });
        return;
    }
};
export async function configureOpenerTrustedDomainsHandler(trustedDomains, domainToConfigure, resource, quickInputService, storageService, editorService, telemetryService) {
    const parsedDomainToConfigure = URI.parse(domainToConfigure);
    const toplevelDomainSegements = parsedDomainToConfigure.authority.split('.');
    const domainEnd = toplevelDomainSegements.slice(toplevelDomainSegements.length - 2).join('.');
    const topLevelDomain = '*.' + domainEnd;
    const options = [];
    options.push({
        type: 'item',
        label: localize('trustedDomain.trustDomain', 'Trust {0}', domainToConfigure),
        id: 'trust',
        toTrust: domainToConfigure,
        picked: true
    });
    const isIP = toplevelDomainSegements.length === 4 &&
        toplevelDomainSegements.every(segment => Number.isInteger(+segment) || Number.isInteger(+segment.split(':')[0]));
    if (isIP) {
        if (parsedDomainToConfigure.authority.includes(':')) {
            const base = parsedDomainToConfigure.authority.split(':')[0];
            options.push({
                type: 'item',
                label: localize('trustedDomain.trustAllPorts', 'Trust {0} on all ports', base),
                toTrust: base + ':*',
                id: 'trust'
            });
        }
    }
    else {
        options.push({
            type: 'item',
            label: localize('trustedDomain.trustSubDomain', 'Trust {0} and all its subdomains', domainEnd),
            toTrust: topLevelDomain,
            id: 'trust'
        });
    }
    options.push({
        type: 'item',
        label: localize('trustedDomain.trustAllDomains', 'Trust all domains (disables link protection)'),
        toTrust: '*',
        id: 'trust'
    });
    options.push({
        type: 'item',
        label: localize('trustedDomain.manageTrustedDomains', 'Manage Trusted Domains'),
        id: 'manage'
    });
    const pickedResult = await quickInputService.pick(options, { activeItem: options[0] });
    if (pickedResult && pickedResult.id) {
        switch (pickedResult.id) {
            case 'manage':
                await editorService.openEditor({
                    resource: TRUSTED_DOMAINS_URI.with({ fragment: resource.toString() }),
                    languageId: 'jsonc',
                    options: { pinned: true }
                });
                return trustedDomains;
            case 'trust': {
                const itemToTrust = pickedResult.toTrust;
                if (trustedDomains.indexOf(itemToTrust) === -1) {
                    storageService.remove(TRUSTED_DOMAINS_CONTENT_STORAGE_KEY, -1 /* StorageScope.APPLICATION */);
                    storageService.store(TRUSTED_DOMAINS_STORAGE_KEY, JSON.stringify([...trustedDomains, itemToTrust]), -1 /* StorageScope.APPLICATION */, 0 /* StorageTarget.USER */);
                    return [...trustedDomains, itemToTrust];
                }
            }
        }
    }
    return [];
}
// Exported for testing.
export function extractGitHubRemotesFromGitConfig(gitConfig) {
    const domains = new Set();
    let match;
    const RemoteMatcher = /^\s*url\s*=\s*(?:git@|https:\/\/)github\.com(?::|\/)(\S*)\s*$/mg;
    while (match = RemoteMatcher.exec(gitConfig)) {
        const repo = match[1].replace(/\.git$/, '');
        if (repo) {
            domains.add(`https://github.com/${repo}/`);
        }
    }
    return [...domains];
}
async function getRemotes(fileService, textFileService, contextService) {
    const workspaceUris = contextService.getWorkspace().folders.map(folder => folder.uri);
    const domains = await Promise.race([
        new Promise(resolve => setTimeout(() => resolve([]), 2000)),
        Promise.all(workspaceUris.map(async (workspaceUri) => {
            try {
                const path = workspaceUri.path;
                const uri = workspaceUri.with({ path: `${path !== '/' ? path : ''}/.git/config` });
                const exists = await fileService.exists(uri);
                if (!exists) {
                    return [];
                }
                const gitConfig = (await (textFileService.read(uri, { acceptTextOnly: true }).catch(() => ({ value: '' })))).value;
                return extractGitHubRemotesFromGitConfig(gitConfig);
            }
            catch {
                return [];
            }
        }))
    ]);
    const set = domains.reduce((set, list) => list.reduce((set, item) => set.add(item), set), new Set());
    return [...set];
}
export async function readTrustedDomains(accessor) {
    const { defaultTrustedDomains, trustedDomains } = readStaticTrustedDomains(accessor);
    const [workspaceDomains, userDomains] = await Promise.all([readWorkspaceTrustedDomains(accessor), readAuthenticationTrustedDomains(accessor)]);
    return {
        workspaceDomains,
        userDomains,
        defaultTrustedDomains,
        trustedDomains,
    };
}
export async function readWorkspaceTrustedDomains(accessor) {
    const fileService = accessor.get(IFileService);
    const textFileService = accessor.get(ITextFileService);
    const workspaceContextService = accessor.get(IWorkspaceContextService);
    return getRemotes(fileService, textFileService, workspaceContextService);
}
export async function readAuthenticationTrustedDomains(accessor) {
    const authenticationService = accessor.get(IAuthenticationService);
    return authenticationService.isAuthenticationProviderRegistered('github') && ((await authenticationService.getSessions('github')) ?? []).length > 0
        ? [`https://github.com`]
        : [];
}
export function readStaticTrustedDomains(accessor) {
    const storageService = accessor.get(IStorageService);
    const productService = accessor.get(IProductService);
    const environmentService = accessor.get(IBrowserWorkbenchEnvironmentService);
    const defaultTrustedDomains = [
        ...productService.linkProtectionTrustedDomains ?? [],
        ...environmentService.options?.additionalTrustedDomains ?? []
    ];
    let trustedDomains = [];
    try {
        const trustedDomainsSrc = storageService.get(TRUSTED_DOMAINS_STORAGE_KEY, -1 /* StorageScope.APPLICATION */);
        if (trustedDomainsSrc) {
            trustedDomains = JSON.parse(trustedDomainsSrc);
        }
    }
    catch (err) { }
    return {
        defaultTrustedDomains,
        trustedDomains,
    };
}

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
import { flatten } from 'vs/base/common/arrays';
import { Emitter } from 'vs/base/common/event';
import { Disposable, dispose, MutableDisposable } from 'vs/base/common/lifecycle';
import { isFalsyOrWhitespace } from 'vs/base/common/strings';
import { isString } from 'vs/base/common/types';
import * as nls from 'vs/nls';
import { MenuId, MenuRegistry } from 'vs/platform/actions/common/actions';
import { CommandsRegistry } from 'vs/platform/commands/common/commands';
import { ContextKeyExpr } from 'vs/platform/contextkey/common/contextkey';
import { IDialogService } from 'vs/platform/dialogs/common/dialogs';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { Severity } from 'vs/platform/notification/common/notification';
import { IProductService } from 'vs/platform/product/common/productService';
import { IQuickInputService } from 'vs/platform/quickinput/common/quickInput';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IActivityService, NumberBadge } from 'vs/workbench/services/activity/common/activity';
import { IAuthenticationService } from 'vs/workbench/services/authentication/common/authentication';
import { IBrowserWorkbenchEnvironmentService } from 'vs/workbench/services/environment/browser/environmentService';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { ExtensionsRegistry } from 'vs/workbench/services/extensions/common/extensionsRegistry';
export function getAuthenticationProviderActivationEvent(id) { return `onAuthenticationRequest:${id}`; }
export function readAccountUsages(storageService, providerId, accountName) {
    const accountKey = `${providerId}-${accountName}-usages`;
    const storedUsages = storageService.get(accountKey, -1 /* StorageScope.APPLICATION */);
    let usages = [];
    if (storedUsages) {
        try {
            usages = JSON.parse(storedUsages);
        }
        catch (e) {
            // ignore
        }
    }
    return usages;
}
export function removeAccountUsage(storageService, providerId, accountName) {
    const accountKey = `${providerId}-${accountName}-usages`;
    storageService.remove(accountKey, -1 /* StorageScope.APPLICATION */);
}
export function addAccountUsage(storageService, providerId, accountName, extensionId, extensionName) {
    const accountKey = `${providerId}-${accountName}-usages`;
    const usages = readAccountUsages(storageService, providerId, accountName);
    const existingUsageIndex = usages.findIndex(usage => usage.extensionId === extensionId);
    if (existingUsageIndex > -1) {
        usages.splice(existingUsageIndex, 1, {
            extensionId,
            extensionName,
            lastUsed: Date.now()
        });
    }
    else {
        usages.push({
            extensionId,
            extensionName,
            lastUsed: Date.now()
        });
    }
    storageService.store(accountKey, JSON.stringify(usages), -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
}
export async function getCurrentAuthenticationSessionInfo(credentialsService, productService) {
    const authenticationSessionValue = await credentialsService.getPassword(`${productService.urlProtocol}.login`, 'account');
    if (authenticationSessionValue) {
        try {
            const authenticationSessionInfo = JSON.parse(authenticationSessionValue);
            if (authenticationSessionInfo
                && isString(authenticationSessionInfo.id)
                && isString(authenticationSessionInfo.accessToken)
                && isString(authenticationSessionInfo.providerId)) {
                return authenticationSessionInfo;
            }
        }
        catch (e) {
            // ignore as this is a best effort operation.
        }
    }
    return undefined;
}
export function readAllowedExtensions(storageService, providerId, accountName) {
    let trustedExtensions = [];
    try {
        const trustedExtensionSrc = storageService.get(`${providerId}-${accountName}`, -1 /* StorageScope.APPLICATION */);
        if (trustedExtensionSrc) {
            trustedExtensions = JSON.parse(trustedExtensionSrc);
        }
    }
    catch (err) { }
    return trustedExtensions;
}
// OAuth2 spec prohibits space in a scope, so use that to join them.
const SCOPESLIST_SEPARATOR = ' ';
CommandsRegistry.registerCommand('workbench.getCodeExchangeProxyEndpoints', function (accessor, _) {
    const environmentService = accessor.get(IBrowserWorkbenchEnvironmentService);
    return environmentService.options?.codeExchangeProxyEndpoints;
});
const authenticationDefinitionSchema = {
    type: 'object',
    additionalProperties: false,
    properties: {
        id: {
            type: 'string',
            description: nls.localize('authentication.id', 'The id of the authentication provider.')
        },
        label: {
            type: 'string',
            description: nls.localize('authentication.label', 'The human readable name of the authentication provider.'),
        }
    }
};
const authenticationExtPoint = ExtensionsRegistry.registerExtensionPoint({
    extensionPoint: 'authentication',
    jsonSchema: {
        description: nls.localize({ key: 'authenticationExtensionPoint', comment: [`'Contributes' means adds here`] }, 'Contributes authentication'),
        type: 'array',
        items: authenticationDefinitionSchema
    }
});
let placeholderMenuItem = MenuRegistry.appendMenuItem(MenuId.AccountsContext, {
    command: {
        id: 'noAuthenticationProviders',
        title: nls.localize('authentication.Placeholder', "No accounts requested yet..."),
        precondition: ContextKeyExpr.false()
    },
});
let AuthenticationService = class AuthenticationService extends Disposable {
    activityService;
    extensionService;
    storageService;
    dialogService;
    quickInputService;
    productService;
    _signInRequestItems = new Map();
    _sessionAccessRequestItems = new Map();
    _accountBadgeDisposable = this._register(new MutableDisposable());
    _authenticationProviders = new Map();
    /**
     * All providers that have been statically declared by extensions. These may not be registered.
     */
    declaredProviders = [];
    _onDidRegisterAuthenticationProvider = this._register(new Emitter());
    onDidRegisterAuthenticationProvider = this._onDidRegisterAuthenticationProvider.event;
    _onDidUnregisterAuthenticationProvider = this._register(new Emitter());
    onDidUnregisterAuthenticationProvider = this._onDidUnregisterAuthenticationProvider.event;
    _onDidChangeSessions = this._register(new Emitter());
    onDidChangeSessions = this._onDidChangeSessions.event;
    _onDidChangeDeclaredProviders = this._register(new Emitter());
    onDidChangeDeclaredProviders = this._onDidChangeDeclaredProviders.event;
    constructor(activityService, extensionService, storageService, dialogService, quickInputService, productService) {
        super();
        this.activityService = activityService;
        this.extensionService = extensionService;
        this.storageService = storageService;
        this.dialogService = dialogService;
        this.quickInputService = quickInputService;
        this.productService = productService;
        authenticationExtPoint.setHandler((extensions, { added, removed }) => {
            added.forEach(point => {
                for (const provider of point.value) {
                    if (isFalsyOrWhitespace(provider.id)) {
                        point.collector.error(nls.localize('authentication.missingId', 'An authentication contribution must specify an id.'));
                        continue;
                    }
                    if (isFalsyOrWhitespace(provider.label)) {
                        point.collector.error(nls.localize('authentication.missingLabel', 'An authentication contribution must specify a label.'));
                        continue;
                    }
                    if (!this.declaredProviders.some(p => p.id === provider.id)) {
                        this.declaredProviders.push(provider);
                    }
                    else {
                        point.collector.error(nls.localize('authentication.idConflict', "This authentication id '{0}' has already been registered", provider.id));
                    }
                }
            });
            const removedExtPoints = flatten(removed.map(r => r.value));
            removedExtPoints.forEach(point => {
                const index = this.declaredProviders.findIndex(provider => provider.id === point.id);
                if (index > -1) {
                    this.declaredProviders.splice(index, 1);
                }
            });
            this._onDidChangeDeclaredProviders.fire(this.declaredProviders);
        });
    }
    getProviderIds() {
        const providerIds = [];
        this._authenticationProviders.forEach(provider => {
            providerIds.push(provider.id);
        });
        return providerIds;
    }
    isAuthenticationProviderRegistered(id) {
        return this._authenticationProviders.has(id);
    }
    registerAuthenticationProvider(id, authenticationProvider) {
        this._authenticationProviders.set(id, authenticationProvider);
        this._onDidRegisterAuthenticationProvider.fire({ id, label: authenticationProvider.label });
        if (placeholderMenuItem) {
            placeholderMenuItem.dispose();
            placeholderMenuItem = undefined;
        }
    }
    unregisterAuthenticationProvider(id) {
        const provider = this._authenticationProviders.get(id);
        if (provider) {
            provider.dispose();
            this._authenticationProviders.delete(id);
            this._onDidUnregisterAuthenticationProvider.fire({ id, label: provider.label });
            const accessRequests = this._sessionAccessRequestItems.get(id) || {};
            Object.keys(accessRequests).forEach(extensionId => {
                this.removeAccessRequest(id, extensionId);
            });
        }
        if (!this._authenticationProviders.size) {
            placeholderMenuItem = MenuRegistry.appendMenuItem(MenuId.AccountsContext, {
                command: {
                    id: 'noAuthenticationProviders',
                    title: nls.localize('loading', "Loading..."),
                    precondition: ContextKeyExpr.false()
                },
            });
        }
    }
    async sessionsUpdate(id, event) {
        const provider = this._authenticationProviders.get(id);
        if (provider) {
            this._onDidChangeSessions.fire({ providerId: id, label: provider.label, event: event });
            if (event.added) {
                await this.updateNewSessionRequests(provider, event.added);
            }
            if (event.removed) {
                await this.updateAccessRequests(id, event.removed);
            }
            this.updateBadgeCount();
        }
    }
    async updateNewSessionRequests(provider, addedSessions) {
        const existingRequestsForProvider = this._signInRequestItems.get(provider.id);
        if (!existingRequestsForProvider) {
            return;
        }
        Object.keys(existingRequestsForProvider).forEach(requestedScopes => {
            if (addedSessions.some(session => session.scopes.slice().join(SCOPESLIST_SEPARATOR) === requestedScopes)) {
                const sessionRequest = existingRequestsForProvider[requestedScopes];
                sessionRequest?.disposables.forEach(item => item.dispose());
                delete existingRequestsForProvider[requestedScopes];
                if (Object.keys(existingRequestsForProvider).length === 0) {
                    this._signInRequestItems.delete(provider.id);
                }
                else {
                    this._signInRequestItems.set(provider.id, existingRequestsForProvider);
                }
            }
        });
    }
    async updateAccessRequests(providerId, removedSessions) {
        const providerRequests = this._sessionAccessRequestItems.get(providerId);
        if (providerRequests) {
            Object.keys(providerRequests).forEach(extensionId => {
                removedSessions.forEach(removed => {
                    const indexOfSession = providerRequests[extensionId].possibleSessions.findIndex(session => session.id === removed.id);
                    if (indexOfSession) {
                        providerRequests[extensionId].possibleSessions.splice(indexOfSession, 1);
                    }
                });
                if (!providerRequests[extensionId].possibleSessions.length) {
                    this.removeAccessRequest(providerId, extensionId);
                }
            });
        }
    }
    updateBadgeCount() {
        this._accountBadgeDisposable.clear();
        let numberOfRequests = 0;
        this._signInRequestItems.forEach(providerRequests => {
            Object.keys(providerRequests).forEach(request => {
                numberOfRequests += providerRequests[request].requestingExtensionIds.length;
            });
        });
        this._sessionAccessRequestItems.forEach(accessRequest => {
            numberOfRequests += Object.keys(accessRequest).length;
        });
        if (numberOfRequests > 0) {
            const badge = new NumberBadge(numberOfRequests, () => nls.localize('sign in', "Sign in requested"));
            this._accountBadgeDisposable.value = this.activityService.showAccountsActivity({ badge });
        }
    }
    removeAccessRequest(providerId, extensionId) {
        const providerRequests = this._sessionAccessRequestItems.get(providerId) || {};
        if (providerRequests[extensionId]) {
            dispose(providerRequests[extensionId].disposables);
            delete providerRequests[extensionId];
            this.updateBadgeCount();
        }
    }
    /**
     * Check extension access to an account
     * @param providerId The id of the authentication provider
     * @param accountName The account name that access is checked for
     * @param extensionId The id of the extension requesting access
     * @returns Returns true or false if the user has opted to permanently grant or disallow access, and undefined
     * if they haven't made a choice yet
     */
    isAccessAllowed(providerId, accountName, extensionId) {
        const allowList = readAllowedExtensions(this.storageService, providerId, accountName);
        const extensionData = allowList.find(extension => extension.id === extensionId);
        if (extensionData) {
            // This property didn't exist on this data previously, inclusion in the list at all indicates allowance
            return extensionData.allowed !== undefined
                ? extensionData.allowed
                : true;
        }
        if (this.productService.trustedExtensionAuthAccess?.includes(extensionId)) {
            return true;
        }
        return undefined;
    }
    updateAllowedExtension(providerId, accountName, extensionId, extensionName, isAllowed) {
        const allowList = readAllowedExtensions(this.storageService, providerId, accountName);
        const index = allowList.findIndex(extension => extension.id === extensionId);
        if (index === -1) {
            allowList.push({ id: extensionId, name: extensionName, allowed: isAllowed });
        }
        else {
            allowList[index].allowed = isAllowed;
        }
        this.storageService.store(`${providerId}-${accountName}`, JSON.stringify(allowList), -1 /* StorageScope.APPLICATION */, 0 /* StorageTarget.USER */);
    }
    //#region Session Preference
    updateSessionPreference(providerId, extensionId, session) {
        // The 3 parts of this key are important:
        // * Extension id: The extension that has a preference
        // * Provider id: The provider that the preference is for
        // * The scopes: The subset of sessions that the preference applies to
        this.storageService.store(`${extensionId}-${providerId}-${session.scopes.join(' ')}`, session.id, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
    }
    getSessionPreference(providerId, extensionId, scopes) {
        return this.storageService.get(`${extensionId}-${providerId}-${scopes.join(' ')}`, -1 /* StorageScope.APPLICATION */, undefined);
    }
    removeSessionPreference(providerId, extensionId, scopes) {
        this.storageService.remove(`${extensionId}-${providerId}-${scopes.join(' ')}`, -1 /* StorageScope.APPLICATION */);
    }
    //#endregion
    async showGetSessionPrompt(providerId, accountName, extensionId, extensionName) {
        const providerName = this.getLabel(providerId);
        const { choice } = await this.dialogService.show(Severity.Info, nls.localize('confirmAuthenticationAccess', "The extension '{0}' wants to access the {1} account '{2}'.", extensionName, providerName, accountName), [nls.localize('allow', "Allow"), nls.localize('deny', "Deny"), nls.localize('cancel', "Cancel")], {
            cancelId: 2
        });
        const cancelled = choice === 2;
        const allowed = choice === 0;
        if (!cancelled) {
            this.updateAllowedExtension(providerId, accountName, extensionId, extensionName, allowed);
            this.removeAccessRequest(providerId, extensionId);
        }
        return allowed;
    }
    async selectSession(providerId, extensionId, extensionName, scopes, availableSessions) {
        return new Promise((resolve, reject) => {
            // This function should be used only when there are sessions to disambiguate.
            if (!availableSessions.length) {
                reject('No available sessions');
            }
            const quickPick = this.quickInputService.createQuickPick();
            quickPick.ignoreFocusOut = true;
            const items = availableSessions.map(session => {
                return {
                    label: session.account.label,
                    session: session
                };
            });
            items.push({
                label: nls.localize('useOtherAccount', "Sign in to another account")
            });
            const providerName = this.getLabel(providerId);
            quickPick.items = items;
            quickPick.title = nls.localize({
                key: 'selectAccount',
                comment: ['The placeholder {0} is the name of an extension. {1} is the name of the type of account, such as Microsoft or GitHub.']
            }, "The extension '{0}' wants to access a {1} account", extensionName, providerName);
            quickPick.placeholder = nls.localize('getSessionPlateholder', "Select an account for '{0}' to use or Esc to cancel", extensionName);
            quickPick.onDidAccept(async (_) => {
                const session = quickPick.selectedItems[0].session ?? await this.createSession(providerId, scopes);
                const accountName = session.account.label;
                this.updateAllowedExtension(providerId, accountName, extensionId, extensionName, true);
                this.updateSessionPreference(providerId, extensionId, session);
                this.removeAccessRequest(providerId, extensionId);
                quickPick.dispose();
                resolve(session);
            });
            quickPick.onDidHide(_ => {
                if (!quickPick.selectedItems[0]) {
                    reject('User did not consent to account access');
                }
                quickPick.dispose();
            });
            quickPick.show();
        });
    }
    async completeSessionAccessRequest(providerId, extensionId, extensionName, scopes) {
        const providerRequests = this._sessionAccessRequestItems.get(providerId) || {};
        const existingRequest = providerRequests[extensionId];
        if (!existingRequest) {
            return;
        }
        const possibleSessions = existingRequest.possibleSessions;
        const supportsMultipleAccounts = this.supportsMultipleAccounts(providerId);
        let session;
        if (supportsMultipleAccounts) {
            try {
                session = await this.selectSession(providerId, extensionId, extensionName, scopes, possibleSessions);
            }
            catch (_) {
                // ignore cancel
            }
        }
        else {
            const approved = await this.showGetSessionPrompt(providerId, possibleSessions[0].account.label, extensionId, extensionName);
            if (approved) {
                session = possibleSessions[0];
            }
        }
        if (session) {
            addAccountUsage(this.storageService, providerId, session.account.label, extensionId, extensionName);
            const providerName = this.getLabel(providerId);
            this._onDidChangeSessions.fire({ providerId, label: providerName, event: { added: [], removed: [], changed: [session] } });
        }
    }
    requestSessionAccess(providerId, extensionId, extensionName, scopes, possibleSessions) {
        const providerRequests = this._sessionAccessRequestItems.get(providerId) || {};
        const hasExistingRequest = providerRequests[extensionId];
        if (hasExistingRequest) {
            return;
        }
        const menuItem = MenuRegistry.appendMenuItem(MenuId.AccountsContext, {
            group: '3_accessRequests',
            command: {
                id: `${providerId}${extensionId}Access`,
                title: nls.localize({
                    key: 'accessRequest',
                    comment: [`The placeholder {0} will be replaced with an authentication provider''s label. {1} will be replaced with an extension name. (1) is to indicate that this menu item contributes to a badge count`]
                }, "Grant access to {0} for {1}... (1)", this.getLabel(providerId), extensionName)
            }
        });
        const accessCommand = CommandsRegistry.registerCommand({
            id: `${providerId}${extensionId}Access`,
            handler: async (accessor) => {
                const authenticationService = accessor.get(IAuthenticationService);
                authenticationService.completeSessionAccessRequest(providerId, extensionId, extensionName, scopes);
            }
        });
        providerRequests[extensionId] = { possibleSessions, disposables: [menuItem, accessCommand] };
        this._sessionAccessRequestItems.set(providerId, providerRequests);
        this.updateBadgeCount();
    }
    async requestNewSession(providerId, scopes, extensionId, extensionName) {
        let provider = this._authenticationProviders.get(providerId);
        if (!provider) {
            // Activate has already been called for the authentication provider, but it cannot block on registering itself
            // since this is sync and returns a disposable. So, wait for registration event to fire that indicates the
            // provider is now in the map.
            await new Promise((resolve, _) => {
                const dispose = this.onDidRegisterAuthenticationProvider(e => {
                    if (e.id === providerId) {
                        provider = this._authenticationProviders.get(providerId);
                        dispose.dispose();
                        resolve();
                    }
                });
            });
        }
        if (!provider) {
            return;
        }
        const providerRequests = this._signInRequestItems.get(providerId);
        const scopesList = scopes.join(SCOPESLIST_SEPARATOR);
        const extensionHasExistingRequest = providerRequests
            && providerRequests[scopesList]
            && providerRequests[scopesList].requestingExtensionIds.includes(extensionId);
        if (extensionHasExistingRequest) {
            return;
        }
        // Construct a commandId that won't clash with others generated here, nor likely with an extension's command
        const commandId = `${providerId}:${extensionId}:signIn${Object.keys(providerRequests || []).length}`;
        const menuItem = MenuRegistry.appendMenuItem(MenuId.AccountsContext, {
            group: '2_signInRequests',
            command: {
                id: commandId,
                title: nls.localize({
                    key: 'signInRequest',
                    comment: [`The placeholder {0} will be replaced with an authentication provider's label. {1} will be replaced with an extension name. (1) is to indicate that this menu item contributes to a badge count.`]
                }, "Sign in with {0} to use {1} (1)", provider.label, extensionName)
            }
        });
        const signInCommand = CommandsRegistry.registerCommand({
            id: commandId,
            handler: async (accessor) => {
                const authenticationService = accessor.get(IAuthenticationService);
                const session = await authenticationService.createSession(providerId, scopes);
                this.updateAllowedExtension(providerId, session.account.label, extensionId, extensionName, true);
                this.updateSessionPreference(providerId, extensionId, session);
            }
        });
        if (providerRequests) {
            const existingRequest = providerRequests[scopesList] || { disposables: [], requestingExtensionIds: [] };
            providerRequests[scopesList] = {
                disposables: [...existingRequest.disposables, menuItem, signInCommand],
                requestingExtensionIds: [...existingRequest.requestingExtensionIds, extensionId]
            };
            this._signInRequestItems.set(providerId, providerRequests);
        }
        else {
            this._signInRequestItems.set(providerId, {
                [scopesList]: {
                    disposables: [menuItem, signInCommand],
                    requestingExtensionIds: [extensionId]
                }
            });
        }
        this.updateBadgeCount();
    }
    getLabel(id) {
        const authProvider = this._authenticationProviders.get(id);
        if (authProvider) {
            return authProvider.label;
        }
        else {
            throw new Error(`No authentication provider '${id}' is currently registered.`);
        }
    }
    supportsMultipleAccounts(id) {
        const authProvider = this._authenticationProviders.get(id);
        if (authProvider) {
            return authProvider.supportsMultipleAccounts;
        }
        else {
            throw new Error(`No authentication provider '${id}' is currently registered.`);
        }
    }
    async tryActivateProvider(providerId, activateImmediate) {
        await this.extensionService.activateByEvent(getAuthenticationProviderActivationEvent(providerId), activateImmediate ? 1 /* ActivationKind.Immediate */ : 0 /* ActivationKind.Normal */);
        let provider = this._authenticationProviders.get(providerId);
        if (provider) {
            return provider;
        }
        // When activate has completed, the extension has made the call to `registerAuthenticationProvider`.
        // However, activate cannot block on this, so the renderer may not have gotten the event yet.
        const didRegister = new Promise((resolve, _) => {
            this.onDidRegisterAuthenticationProvider(e => {
                if (e.id === providerId) {
                    provider = this._authenticationProviders.get(providerId);
                    if (provider) {
                        resolve(provider);
                    }
                    else {
                        throw new Error(`No authentication provider '${providerId}' is currently registered.`);
                    }
                }
            });
        });
        const didTimeout = new Promise((_, reject) => {
            setTimeout(() => {
                reject('Timed out waiting for authentication provider to register');
            }, 5000);
        });
        return Promise.race([didRegister, didTimeout]);
    }
    async getSessions(id, scopes, activateImmediate = false) {
        const authProvider = this._authenticationProviders.get(id) || await this.tryActivateProvider(id, activateImmediate);
        if (authProvider) {
            return await authProvider.getSessions(scopes);
        }
        else {
            throw new Error(`No authentication provider '${id}' is currently registered.`);
        }
    }
    async createSession(id, scopes, activateImmediate = false) {
        const authProvider = this._authenticationProviders.get(id) || await this.tryActivateProvider(id, activateImmediate);
        if (authProvider) {
            return await authProvider.createSession(scopes);
        }
        else {
            throw new Error(`No authentication provider '${id}' is currently registered.`);
        }
    }
    async removeSession(id, sessionId) {
        const authProvider = this._authenticationProviders.get(id);
        if (authProvider) {
            return authProvider.removeSession(sessionId);
        }
        else {
            throw new Error(`No authentication provider '${id}' is currently registered.`);
        }
    }
    async manageTrustedExtensionsForAccount(id, accountName) {
        const authProvider = this._authenticationProviders.get(id);
        if (authProvider) {
            return authProvider.manageTrustedExtensions(accountName);
        }
        else {
            throw new Error(`No authentication provider '${id}' is currently registered.`);
        }
    }
    async removeAccountSessions(id, accountName, sessions) {
        const authProvider = this._authenticationProviders.get(id);
        if (authProvider) {
            return authProvider.removeAccountSessions(accountName, sessions);
        }
        else {
            throw new Error(`No authentication provider '${id}' is currently registered.`);
        }
    }
};
AuthenticationService = __decorate([
    __param(0, IActivityService),
    __param(1, IExtensionService),
    __param(2, IStorageService),
    __param(3, IDialogService),
    __param(4, IQuickInputService),
    __param(5, IProductService)
], AuthenticationService);
export { AuthenticationService };
registerSingleton(IAuthenticationService, AuthenticationService, 1 /* InstantiationType.Delayed */);

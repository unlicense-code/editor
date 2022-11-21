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
import { Disposable } from 'vs/base/common/lifecycle';
import * as nls from 'vs/nls';
import { extHostNamedCustomer } from 'vs/workbench/services/extensions/common/extHostCustomers';
import { readAllowedExtensions, getAuthenticationProviderActivationEvent, addAccountUsage, readAccountUsages, removeAccountUsage } from 'vs/workbench/services/authentication/browser/authenticationService';
import { IAuthenticationService } from 'vs/workbench/services/authentication/common/authentication';
import { ExtHostContext, MainContext } from '../common/extHost.protocol';
import { IDialogService } from 'vs/platform/dialogs/common/dialogs';
import { IStorageService } from 'vs/platform/storage/common/storage';
import Severity from 'vs/base/common/severity';
import { IQuickInputService } from 'vs/platform/quickinput/common/quickInput';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { fromNow } from 'vs/base/common/date';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
export class MainThreadAuthenticationProvider extends Disposable {
    _proxy;
    id;
    label;
    supportsMultipleAccounts;
    notificationService;
    storageService;
    quickInputService;
    dialogService;
    constructor(_proxy, id, label, supportsMultipleAccounts, notificationService, storageService, quickInputService, dialogService) {
        super();
        this._proxy = _proxy;
        this.id = id;
        this.label = label;
        this.supportsMultipleAccounts = supportsMultipleAccounts;
        this.notificationService = notificationService;
        this.storageService = storageService;
        this.quickInputService = quickInputService;
        this.dialogService = dialogService;
    }
    manageTrustedExtensions(accountName) {
        const allowedExtensions = readAllowedExtensions(this.storageService, this.id, accountName);
        if (!allowedExtensions.length) {
            this.dialogService.show(Severity.Info, nls.localize('noTrustedExtensions', "This account has not been used by any extensions."));
            return;
        }
        const quickPick = this.quickInputService.createQuickPick();
        quickPick.canSelectMany = true;
        quickPick.customButton = true;
        quickPick.customLabel = nls.localize('manageTrustedExtensions.cancel', 'Cancel');
        const usages = readAccountUsages(this.storageService, this.id, accountName);
        const items = allowedExtensions.map(extension => {
            const usage = usages.find(usage => extension.id === usage.extensionId);
            return {
                label: extension.name,
                description: usage
                    ? nls.localize({ key: 'accountLastUsedDate', comment: ['The placeholder {0} is a string with time information, such as "3 days ago"'] }, "Last used this account {0}", fromNow(usage.lastUsed, true))
                    : nls.localize('notUsed', "Has not used this account"),
                extension
            };
        });
        quickPick.items = items;
        quickPick.selectedItems = items.filter(item => item.extension.allowed === undefined || item.extension.allowed);
        quickPick.title = nls.localize('manageTrustedExtensions', "Manage Trusted Extensions");
        quickPick.placeholder = nls.localize('manageExtensions', "Choose which extensions can access this account");
        quickPick.onDidAccept(() => {
            const updatedAllowedList = quickPick.items
                .map(i => i.extension);
            this.storageService.store(`${this.id}-${accountName}`, JSON.stringify(updatedAllowedList), -1 /* StorageScope.APPLICATION */, 0 /* StorageTarget.USER */);
            quickPick.dispose();
        });
        quickPick.onDidChangeSelection((changed) => {
            quickPick.items.forEach(item => {
                if (item.extension) {
                    item.extension.allowed = false;
                }
            });
            changed.forEach((item) => item.extension.allowed = true);
        });
        quickPick.onDidHide(() => {
            quickPick.dispose();
        });
        quickPick.onDidCustom(() => {
            quickPick.hide();
        });
        quickPick.show();
    }
    async removeAccountSessions(accountName, sessions) {
        const accountUsages = readAccountUsages(this.storageService, this.id, accountName);
        const result = await this.dialogService.show(Severity.Info, accountUsages.length
            ? nls.localize('signOutMessage', "The account '{0}' has been used by: \n\n{1}\n\n Sign out from these extensions?", accountName, accountUsages.map(usage => usage.extensionName).join('\n'))
            : nls.localize('signOutMessageSimple', "Sign out of '{0}'?", accountName), [
            nls.localize('signOut', "Sign Out"),
            nls.localize('cancel', "Cancel")
        ], {
            cancelId: 1
        });
        if (result.choice === 0) {
            const removeSessionPromises = sessions.map(session => this.removeSession(session.id));
            await Promise.all(removeSessionPromises);
            removeAccountUsage(this.storageService, this.id, accountName);
            this.storageService.remove(`${this.id}-${accountName}`, -1 /* StorageScope.APPLICATION */);
        }
    }
    async getSessions(scopes) {
        return this._proxy.$getSessions(this.id, scopes);
    }
    createSession(scopes) {
        return this._proxy.$createSession(this.id, scopes);
    }
    async removeSession(sessionId) {
        await this._proxy.$removeSession(this.id, sessionId);
        this.notificationService.info(nls.localize('signedOut', "Successfully signed out."));
    }
}
let MainThreadAuthentication = class MainThreadAuthentication extends Disposable {
    authenticationService;
    dialogService;
    storageService;
    notificationService;
    quickInputService;
    extensionService;
    telemetryService;
    _proxy;
    constructor(extHostContext, authenticationService, dialogService, storageService, notificationService, quickInputService, extensionService, telemetryService) {
        super();
        this.authenticationService = authenticationService;
        this.dialogService = dialogService;
        this.storageService = storageService;
        this.notificationService = notificationService;
        this.quickInputService = quickInputService;
        this.extensionService = extensionService;
        this.telemetryService = telemetryService;
        this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostAuthentication);
        this._register(this.authenticationService.onDidChangeSessions(e => {
            this._proxy.$onDidChangeAuthenticationSessions(e.providerId, e.label);
        }));
        this._proxy.$setProviders(this.authenticationService.declaredProviders);
        this._register(this.authenticationService.onDidChangeDeclaredProviders(e => {
            this._proxy.$setProviders(e);
        }));
    }
    async $registerAuthenticationProvider(id, label, supportsMultipleAccounts) {
        const provider = new MainThreadAuthenticationProvider(this._proxy, id, label, supportsMultipleAccounts, this.notificationService, this.storageService, this.quickInputService, this.dialogService);
        this.authenticationService.registerAuthenticationProvider(id, provider);
    }
    $unregisterAuthenticationProvider(id) {
        this.authenticationService.unregisterAuthenticationProvider(id);
    }
    $ensureProvider(id) {
        return this.extensionService.activateByEvent(getAuthenticationProviderActivationEvent(id), 1 /* ActivationKind.Immediate */);
    }
    $sendDidChangeSessions(id, event) {
        this.authenticationService.sessionsUpdate(id, event);
    }
    $removeSession(providerId, sessionId) {
        return this.authenticationService.removeSession(providerId, sessionId);
    }
    async loginPrompt(providerName, extensionName, recreatingSession, detail) {
        const message = recreatingSession
            ? nls.localize('confirmRelogin', "The extension '{0}' wants you to sign in again using {1}.", extensionName, providerName)
            : nls.localize('confirmLogin', "The extension '{0}' wants to sign in using {1}.", extensionName, providerName);
        const { choice } = await this.dialogService.show(Severity.Info, message, [nls.localize('allow', "Allow"), nls.localize('cancel', "Cancel")], {
            cancelId: 1,
            detail
        });
        return choice === 0;
    }
    async doGetSession(providerId, scopes, extensionId, extensionName, options) {
        const sessions = await this.authenticationService.getSessions(providerId, scopes, true);
        const supportsMultipleAccounts = this.authenticationService.supportsMultipleAccounts(providerId);
        // Error cases
        if (options.forceNewSession && options.createIfNone) {
            throw new Error('Invalid combination of options. Please remove one of the following: forceNewSession, createIfNone');
        }
        if (options.forceNewSession && options.silent) {
            throw new Error('Invalid combination of options. Please remove one of the following: forceNewSession, silent');
        }
        if (options.createIfNone && options.silent) {
            throw new Error('Invalid combination of options. Please remove one of the following: createIfNone, silent');
        }
        // Check if the sessions we have are valid
        if (!options.forceNewSession && sessions.length) {
            if (supportsMultipleAccounts) {
                if (options.clearSessionPreference) {
                    // Clearing the session preference is usually paired with createIfNone, so just remove the preference and
                    // defer to the rest of the logic in this function to choose the session.
                    this.authenticationService.removeSessionPreference(providerId, extensionId, scopes);
                }
                else {
                    // If we have an existing session preference, use that. If not, we'll return any valid session at the end of this function.
                    const existingSessionPreference = this.authenticationService.getSessionPreference(providerId, extensionId, scopes);
                    if (existingSessionPreference) {
                        const matchingSession = sessions.find(session => session.id === existingSessionPreference);
                        if (matchingSession && this.authenticationService.isAccessAllowed(providerId, matchingSession.account.label, extensionId)) {
                            return matchingSession;
                        }
                    }
                }
            }
            else if (this.authenticationService.isAccessAllowed(providerId, sessions[0].account.label, extensionId)) {
                return sessions[0];
            }
        }
        // We may need to prompt because we don't have a valid session
        // modal flows
        if (options.createIfNone || options.forceNewSession) {
            const providerName = this.authenticationService.getLabel(providerId);
            const detail = (typeof options.forceNewSession === 'object') ? options.forceNewSession.detail : undefined;
            // We only want to show the "recreating session" prompt if we are using forceNewSession & there are sessions
            // that we will be "forcing through".
            const recreatingSession = !!(options.forceNewSession && sessions.length);
            const isAllowed = await this.loginPrompt(providerName, extensionName, recreatingSession, detail);
            if (!isAllowed) {
                throw new Error('User did not consent to login.');
            }
            const session = sessions?.length && !options.forceNewSession && supportsMultipleAccounts
                ? await this.authenticationService.selectSession(providerId, extensionId, extensionName, scopes, sessions)
                : await this.authenticationService.createSession(providerId, scopes, true);
            this.authenticationService.updateAllowedExtension(providerId, session.account.label, extensionId, extensionName, true);
            this.authenticationService.updateSessionPreference(providerId, extensionId, session);
            return session;
        }
        // For the silent flows, if we have a session, even though it may not be the user's preference, we'll return it anyway because it might be for a specific
        // set of scopes.
        const validSession = sessions.find(session => this.authenticationService.isAccessAllowed(providerId, session.account.label, extensionId));
        if (validSession) {
            // Migration. If we have a valid session, but no preference, we'll set the preference to the valid session.
            // TODO: Remove this after in a few releases.
            if (!this.authenticationService.getSessionPreference(providerId, extensionId, scopes)) {
                if (this.storageService.get(`${extensionName}-${providerId}`, -1 /* StorageScope.APPLICATION */)) {
                    this.storageService.remove(`${extensionName}-${providerId}`, -1 /* StorageScope.APPLICATION */);
                }
                this.authenticationService.updateAllowedExtension(providerId, validSession.account.label, extensionId, extensionName, true);
                this.authenticationService.updateSessionPreference(providerId, extensionId, validSession);
            }
            return validSession;
        }
        // passive flows (silent or default)
        if (!options.silent) {
            // If there is a potential session, but the extension doesn't have access to it, use the "grant access" flow,
            // otherwise request a new one.
            sessions.length
                ? this.authenticationService.requestSessionAccess(providerId, extensionId, extensionName, scopes, sessions)
                : await this.authenticationService.requestNewSession(providerId, scopes, extensionId, extensionName);
        }
        return undefined;
    }
    async $getSession(providerId, scopes, extensionId, extensionName, options) {
        const session = await this.doGetSession(providerId, scopes, extensionId, extensionName, options);
        if (session) {
            this.telemetryService.publicLog2('authentication.providerUsage', { providerId, extensionId });
            addAccountUsage(this.storageService, providerId, session.account.label, extensionId, extensionName);
        }
        return session;
    }
};
MainThreadAuthentication = __decorate([
    extHostNamedCustomer(MainContext.MainThreadAuthentication),
    __param(1, IAuthenticationService),
    __param(2, IDialogService),
    __param(3, IStorageService),
    __param(4, INotificationService),
    __param(5, IQuickInputService),
    __param(6, IExtensionService),
    __param(7, ITelemetryService)
], MainThreadAuthentication);
export { MainThreadAuthentication };

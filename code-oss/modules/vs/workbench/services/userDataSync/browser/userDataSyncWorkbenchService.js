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
import { IUserDataSyncService, isAuthenticationProvider, IUserDataAutoSyncService, IUserDataSyncStoreManagementService, IUserDataSyncEnablementService, USER_DATA_SYNC_SCHEME, } from 'vs/platform/userDataSync/common/userDataSync';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { IUserDataSyncWorkbenchService, CONTEXT_SYNC_ENABLEMENT, CONTEXT_SYNC_STATE, CONTEXT_ACCOUNT_STATE, SHOW_SYNC_LOG_COMMAND_ID, CONTEXT_ENABLE_ACTIVITY_VIEWS, SYNC_VIEW_CONTAINER_ID, SYNC_TITLE, SYNC_CONFLICTS_VIEW_ID, CONTEXT_ENABLE_SYNC_CONFLICTS_VIEW, CONTEXT_HAS_CONFLICTS } from 'vs/workbench/services/userDataSync/common/userDataSync';
import { Disposable, DisposableStore } from 'vs/base/common/lifecycle';
import { Emitter, Event } from 'vs/base/common/event';
import { flatten } from 'vs/base/common/arrays';
import { getCurrentAuthenticationSessionInfo } from 'vs/workbench/services/authentication/browser/authenticationService';
import { IAuthenticationService } from 'vs/workbench/services/authentication/common/authentication';
import { IUserDataSyncAccountService } from 'vs/platform/userDataSync/common/userDataSyncAccount';
import { IQuickInputService } from 'vs/platform/quickinput/common/quickInput';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { ILogService } from 'vs/platform/log/common/log';
import { IProductService } from 'vs/platform/product/common/productService';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { localize } from 'vs/nls';
import { INotificationService, Severity } from 'vs/platform/notification/common/notification';
import { IDialogService } from 'vs/platform/dialogs/common/dialogs';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { Action } from 'vs/base/common/actions';
import { IProgressService } from 'vs/platform/progress/common/progress';
import { URI } from 'vs/base/common/uri';
import { IViewsService, IViewDescriptorService } from 'vs/workbench/common/views';
import { ILifecycleService } from 'vs/workbench/services/lifecycle/common/lifecycle';
import { isWeb } from 'vs/base/common/platform';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { UserDataSyncStoreClient } from 'vs/platform/userDataSync/common/userDataSyncStoreService';
import { UserDataSyncStoreTypeSynchronizer } from 'vs/platform/userDataSync/common/globalStateSync';
import { ICredentialsService } from 'vs/platform/credentials/common/credentials';
import { CancellationError } from 'vs/base/common/errors';
import { raceCancellationError } from 'vs/base/common/async';
import { CancellationTokenSource } from 'vs/base/common/cancellation';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
import { isDiffEditorInput } from 'vs/workbench/common/editor';
class UserDataSyncAccount {
    authenticationProviderId;
    session;
    constructor(authenticationProviderId, session) {
        this.authenticationProviderId = authenticationProviderId;
        this.session = session;
    }
    get sessionId() { return this.session.id; }
    get accountName() { return this.session.account.label; }
    get accountId() { return this.session.account.id; }
    get token() { return this.session.idToken || this.session.accessToken; }
}
export function isMergeEditorInput(editor) {
    const candidate = editor;
    return URI.isUri(candidate?.base) && URI.isUri(candidate?.input1?.uri) && URI.isUri(candidate?.input2?.uri) && URI.isUri(candidate?.result);
}
let UserDataSyncWorkbenchService = class UserDataSyncWorkbenchService extends Disposable {
    userDataSyncService;
    uriIdentityService;
    authenticationService;
    userDataSyncAccountService;
    quickInputService;
    storageService;
    userDataSyncEnablementService;
    userDataAutoSyncService;
    telemetryService;
    logService;
    productService;
    extensionService;
    environmentService;
    credentialsService;
    notificationService;
    progressService;
    dialogService;
    viewsService;
    viewDescriptorService;
    userDataSyncStoreManagementService;
    lifecycleService;
    instantiationService;
    editorService;
    _serviceBrand;
    static DONOT_USE_WORKBENCH_SESSION_STORAGE_KEY = 'userDataSyncAccount.donotUseWorkbenchSession';
    static CACHED_SESSION_STORAGE_KEY = 'userDataSyncAccountPreference';
    get enabled() { return !!this.userDataSyncStoreManagementService.userDataSyncStore; }
    _authenticationProviders = [];
    get authenticationProviders() { return this._authenticationProviders; }
    _accountStatus = "uninitialized" /* AccountStatus.Uninitialized */;
    get accountStatus() { return this._accountStatus; }
    _onDidChangeAccountStatus = this._register(new Emitter());
    onDidChangeAccountStatus = this._onDidChangeAccountStatus.event;
    _all = new Map();
    get all() { return flatten([...this._all.values()]); }
    get current() { return this.all.filter(account => this.isCurrentAccount(account))[0]; }
    syncEnablementContext;
    syncStatusContext;
    accountStatusContext;
    enableConflictsViewContext;
    hasConflicts;
    activityViewsEnablementContext;
    turnOnSyncCancellationToken = undefined;
    constructor(userDataSyncService, uriIdentityService, authenticationService, userDataSyncAccountService, quickInputService, storageService, userDataSyncEnablementService, userDataAutoSyncService, telemetryService, logService, productService, extensionService, environmentService, credentialsService, notificationService, progressService, dialogService, contextKeyService, viewsService, viewDescriptorService, userDataSyncStoreManagementService, lifecycleService, instantiationService, editorService) {
        super();
        this.userDataSyncService = userDataSyncService;
        this.uriIdentityService = uriIdentityService;
        this.authenticationService = authenticationService;
        this.userDataSyncAccountService = userDataSyncAccountService;
        this.quickInputService = quickInputService;
        this.storageService = storageService;
        this.userDataSyncEnablementService = userDataSyncEnablementService;
        this.userDataAutoSyncService = userDataAutoSyncService;
        this.telemetryService = telemetryService;
        this.logService = logService;
        this.productService = productService;
        this.extensionService = extensionService;
        this.environmentService = environmentService;
        this.credentialsService = credentialsService;
        this.notificationService = notificationService;
        this.progressService = progressService;
        this.dialogService = dialogService;
        this.viewsService = viewsService;
        this.viewDescriptorService = viewDescriptorService;
        this.userDataSyncStoreManagementService = userDataSyncStoreManagementService;
        this.lifecycleService = lifecycleService;
        this.instantiationService = instantiationService;
        this.editorService = editorService;
        this.syncEnablementContext = CONTEXT_SYNC_ENABLEMENT.bindTo(contextKeyService);
        this.syncStatusContext = CONTEXT_SYNC_STATE.bindTo(contextKeyService);
        this.accountStatusContext = CONTEXT_ACCOUNT_STATE.bindTo(contextKeyService);
        this.activityViewsEnablementContext = CONTEXT_ENABLE_ACTIVITY_VIEWS.bindTo(contextKeyService);
        this.hasConflicts = CONTEXT_HAS_CONFLICTS.bindTo(contextKeyService);
        this.enableConflictsViewContext = CONTEXT_ENABLE_SYNC_CONFLICTS_VIEW.bindTo(contextKeyService);
        if (this.userDataSyncStoreManagementService.userDataSyncStore) {
            this.syncStatusContext.set(this.userDataSyncService.status);
            this._register(userDataSyncService.onDidChangeStatus(status => this.syncStatusContext.set(status)));
            this.syncEnablementContext.set(userDataSyncEnablementService.isEnabled());
            this._register(userDataSyncEnablementService.onDidChangeEnablement(enabled => this.syncEnablementContext.set(enabled)));
            this.waitAndInitialize();
        }
    }
    updateAuthenticationProviders() {
        this._authenticationProviders = (this.userDataSyncStoreManagementService.userDataSyncStore?.authenticationProviders || []).filter(({ id }) => this.authenticationService.declaredProviders.some(provider => provider.id === id));
    }
    isSupportedAuthenticationProviderId(authenticationProviderId) {
        return this.authenticationProviders.some(({ id }) => id === authenticationProviderId);
    }
    async waitAndInitialize() {
        /* wait */
        await this.extensionService.whenInstalledExtensionsRegistered();
        /* initialize */
        try {
            this.logService.trace('Settings Sync: Initializing accounts');
            await this.initialize();
        }
        catch (error) {
            // Do not log if the current window is running extension tests
            if (!this.environmentService.extensionTestsLocationURI) {
                this.logService.error(error);
            }
        }
        if (this.accountStatus === "uninitialized" /* AccountStatus.Uninitialized */) {
            // Do not log if the current window is running extension tests
            if (!this.environmentService.extensionTestsLocationURI) {
                this.logService.warn('Settings Sync: Accounts are not initialized');
            }
        }
        else {
            this.logService.trace('Settings Sync: Accounts are initialized');
        }
    }
    async initialize() {
        const authenticationSession = await getCurrentAuthenticationSessionInfo(this.credentialsService, this.productService);
        if (this.currentSessionId === undefined && this.useWorkbenchSessionId && (authenticationSession?.id)) {
            this.currentSessionId = authenticationSession?.id;
            this.useWorkbenchSessionId = false;
        }
        await this.update();
        this._register(this.authenticationService.onDidChangeDeclaredProviders(() => this.updateAuthenticationProviders()));
        this._register(Event.any(Event.filter(Event.any(this.authenticationService.onDidRegisterAuthenticationProvider, this.authenticationService.onDidUnregisterAuthenticationProvider), info => this.isSupportedAuthenticationProviderId(info.id)), Event.filter(this.userDataSyncAccountService.onTokenFailed, isSuccessive => !isSuccessive))(() => this.update()));
        this._register(Event.filter(this.authenticationService.onDidChangeSessions, e => this.isSupportedAuthenticationProviderId(e.providerId))(({ event }) => this.onDidChangeSessions(event)));
        this._register(this.storageService.onDidChangeValue(e => this.onDidChangeStorage(e)));
        this._register(Event.filter(this.userDataSyncAccountService.onTokenFailed, isSuccessive => isSuccessive)(() => this.onDidSuccessiveAuthFailures()));
        this.hasConflicts.set(this.userDataSyncService.conflicts.length > 0);
        this._register(this.userDataSyncService.onDidChangeConflicts(conflicts => {
            this.hasConflicts.set(conflicts.length > 0);
            if (!conflicts.length) {
                this.enableConflictsViewContext.reset();
            }
            // Close merge editors with no conflicts
            this.editorService.editors.filter(input => {
                const remoteResource = isDiffEditorInput(input) ? input.original.resource : isMergeEditorInput(input) ? input.input1.uri : undefined;
                if (remoteResource?.scheme !== USER_DATA_SYNC_SCHEME) {
                    return false;
                }
                return !this.userDataSyncService.conflicts.some(({ conflicts }) => conflicts.some(({ previewResource }) => this.uriIdentityService.extUri.isEqual(previewResource, input.resource)));
            }).forEach(input => input.dispose());
        }));
    }
    async update() {
        this.updateAuthenticationProviders();
        const allAccounts = new Map();
        for (const { id, scopes } of this.authenticationProviders) {
            this.logService.trace('Settings Sync: Getting accounts for', id);
            const accounts = await this.getAccounts(id, scopes);
            allAccounts.set(id, accounts);
            this.logService.trace('Settings Sync: Updated accounts for', id);
        }
        this._all = allAccounts;
        const current = this.current;
        await this.updateToken(current);
        this.updateAccountStatus(current ? "available" /* AccountStatus.Available */ : "unavailable" /* AccountStatus.Unavailable */);
    }
    async getAccounts(authenticationProviderId, scopes) {
        const accounts = new Map();
        let currentAccount = null;
        const sessions = await this.authenticationService.getSessions(authenticationProviderId, scopes) || [];
        for (const session of sessions) {
            const account = new UserDataSyncAccount(authenticationProviderId, session);
            accounts.set(account.accountId, account);
            if (this.isCurrentAccount(account)) {
                currentAccount = account;
            }
        }
        if (currentAccount) {
            // Always use current account if available
            accounts.set(currentAccount.accountId, currentAccount);
        }
        return [...accounts.values()];
    }
    async updateToken(current) {
        let value = undefined;
        if (current) {
            try {
                this.logService.trace('Settings Sync: Updating the token for the account', current.accountName);
                const token = current.token;
                this.logService.trace('Settings Sync: Token updated for the account', current.accountName);
                value = { token, authenticationProviderId: current.authenticationProviderId };
            }
            catch (e) {
                this.logService.error(e);
            }
        }
        await this.userDataSyncAccountService.updateAccount(value);
    }
    updateAccountStatus(accountStatus) {
        if (this._accountStatus !== accountStatus) {
            const previous = this._accountStatus;
            this.logService.trace(`Settings Sync: Account status changed from ${previous} to ${accountStatus}`);
            this._accountStatus = accountStatus;
            this.accountStatusContext.set(accountStatus);
            this._onDidChangeAccountStatus.fire(accountStatus);
        }
    }
    async turnOn() {
        if (!this.authenticationProviders.length) {
            throw new Error(localize('no authentication providers', "Settings sync cannot be turned on because there are no authentication providers available."));
        }
        if (this.userDataSyncEnablementService.isEnabled()) {
            return;
        }
        if (this.userDataSyncService.status !== "idle" /* SyncStatus.Idle */) {
            throw new Error('Cannot turn on sync while syncing');
        }
        const picked = await this.pick();
        if (!picked) {
            throw new CancellationError();
        }
        // User did not pick an account or login failed
        if (this.accountStatus !== "available" /* AccountStatus.Available */) {
            throw new Error(localize('no account', "No account available"));
        }
        await this.turnOnUsingCurrentAccount();
    }
    async turnOnUsingCurrentAccount() {
        if (this.userDataSyncEnablementService.isEnabled()) {
            return;
        }
        if (this.userDataSyncService.status !== "idle" /* SyncStatus.Idle */) {
            throw new Error('Cannot turn on sync while syncing');
        }
        if (this.accountStatus !== "available" /* AccountStatus.Available */) {
            throw new Error(localize('no account', "No account available"));
        }
        const turnOnSyncCancellationToken = this.turnOnSyncCancellationToken = new CancellationTokenSource();
        const disposable = isWeb ? Disposable.None : this.lifecycleService.onBeforeShutdown(e => e.veto((async () => {
            const result = await this.dialogService.confirm({
                type: 'warning',
                message: localize('sync in progress', "Settings Sync is being turned on. Would you like to cancel it?"),
                title: localize('settings sync', "Settings Sync"),
                primaryButton: localize({ key: 'yes', comment: ['&& denotes a mnemonic'] }, "&&Yes"),
                secondaryButton: localize({ key: 'no', comment: ['&& denotes a mnemonic'] }, "&&No"),
            });
            if (result.confirmed) {
                turnOnSyncCancellationToken.cancel();
            }
            return !result.confirmed;
        })(), 'veto.settingsSync'));
        try {
            await this.doTurnOnSync(turnOnSyncCancellationToken.token);
        }
        finally {
            disposable.dispose();
            this.turnOnSyncCancellationToken = undefined;
        }
        await this.userDataAutoSyncService.turnOn();
        if (this.userDataSyncStoreManagementService.userDataSyncStore?.canSwitch) {
            await this.synchroniseUserDataSyncStoreType();
        }
        this.notificationService.info(localize('sync turned on', "{0} is turned on", SYNC_TITLE));
    }
    async turnoff(everywhere) {
        if (this.userDataSyncEnablementService.isEnabled()) {
            return this.userDataAutoSyncService.turnOff(everywhere);
        }
        if (this.turnOnSyncCancellationToken) {
            return this.turnOnSyncCancellationToken.cancel();
        }
    }
    async synchroniseUserDataSyncStoreType() {
        if (!this.userDataSyncAccountService.account) {
            throw new Error('Cannot update because you are signed out from settings sync. Please sign in and try again.');
        }
        if (!isWeb || !this.userDataSyncStoreManagementService.userDataSyncStore) {
            // Not supported
            return;
        }
        const userDataSyncStoreUrl = this.userDataSyncStoreManagementService.userDataSyncStore.type === 'insiders' ? this.userDataSyncStoreManagementService.userDataSyncStore.stableUrl : this.userDataSyncStoreManagementService.userDataSyncStore.insidersUrl;
        const userDataSyncStoreClient = this.instantiationService.createInstance(UserDataSyncStoreClient, userDataSyncStoreUrl);
        userDataSyncStoreClient.setAuthToken(this.userDataSyncAccountService.account.token, this.userDataSyncAccountService.account.authenticationProviderId);
        await this.instantiationService.createInstance(UserDataSyncStoreTypeSynchronizer, userDataSyncStoreClient).sync(this.userDataSyncStoreManagementService.userDataSyncStore.type);
    }
    syncNow() {
        return this.userDataAutoSyncService.triggerSync(['Sync Now'], false, true);
    }
    async doTurnOnSync(token) {
        const disposables = new DisposableStore();
        const manualSyncTask = await this.userDataSyncService.createManualSyncTask();
        try {
            await this.progressService.withProgress({
                location: 10 /* ProgressLocation.Window */,
                title: SYNC_TITLE,
                command: SHOW_SYNC_LOG_COMMAND_ID,
                delay: 500,
            }, async (progress) => {
                progress.report({ message: localize('turning on', "Turning on...") });
                disposables.add(this.userDataSyncService.onDidChangeStatus(status => {
                    if (status === "hasConflicts" /* SyncStatus.HasConflicts */) {
                        progress.report({ message: localize('resolving conflicts', "Resolving conflicts...") });
                    }
                    else {
                        progress.report({ message: localize('syncing...', "Turning on...") });
                    }
                }));
                await manualSyncTask.merge();
                if (this.userDataSyncService.status === "hasConflicts" /* SyncStatus.HasConflicts */) {
                    await this.handleConflictsWhileTurningOn(token);
                }
                await manualSyncTask.apply();
            });
        }
        catch (error) {
            await manualSyncTask.stop();
            throw error;
        }
        finally {
            disposables.dispose();
        }
    }
    async handleConflictsWhileTurningOn(token) {
        const result = await this.dialogService.show(Severity.Warning, localize('conflicts detected', "Conflicts Detected"), [
            localize('show conflicts', "Show Conflicts"),
            localize('replace local', "Replace Local"),
            localize('replace remote', "Replace Remote"),
            localize('cancel', "Cancel"),
        ], {
            detail: localize('resolve', "Please resolve conflicts to turn on..."),
            cancelId: 3
        });
        if (result.choice === 0) {
            const waitUntilConflictsAreResolvedPromise = raceCancellationError(Event.toPromise(Event.filter(this.userDataSyncService.onDidChangeConflicts, conficts => conficts.length === 0)), token);
            await this.showConflicts(this.userDataSyncService.conflicts[0]?.conflicts[0]);
            await waitUntilConflictsAreResolvedPromise;
        }
        else if (result.choice === 1 || result.choice === 2) {
            for (const conflict of this.userDataSyncService.conflicts) {
                for (const preview of conflict.conflicts) {
                    await this.accept({ syncResource: conflict.syncResource, profile: conflict.profile }, result.choice === 1 ? preview.remoteResource : preview.localResource, undefined, { force: true });
                }
            }
        }
        else {
            throw new CancellationError();
        }
    }
    async accept(resource, conflictResource, content, apply) {
        return this.userDataSyncService.accept(resource, conflictResource, content, apply);
    }
    async showConflicts(conflictToOpen) {
        if (!this.userDataSyncService.conflicts.length) {
            return;
        }
        this.enableConflictsViewContext.set(true);
        const view = await this.viewsService.openView(SYNC_CONFLICTS_VIEW_ID);
        if (view && conflictToOpen) {
            await view.open(conflictToOpen);
        }
    }
    async resetSyncedData() {
        const result = await this.dialogService.confirm({
            message: localize('reset', "This will clear your data in the cloud and stop sync on all your devices."),
            title: localize('reset title', "Clear"),
            type: 'info',
            primaryButton: localize({ key: 'resetButton', comment: ['&& denotes a mnemonic'] }, "&&Reset"),
        });
        if (result.confirmed) {
            await this.userDataSyncService.resetRemote();
        }
    }
    async showSyncActivity() {
        this.activityViewsEnablementContext.set(true);
        await this.waitForActiveSyncViews();
        await this.viewsService.openViewContainer(SYNC_VIEW_CONTAINER_ID);
    }
    async waitForActiveSyncViews() {
        const viewContainer = this.viewDescriptorService.getViewContainerById(SYNC_VIEW_CONTAINER_ID);
        if (viewContainer) {
            const model = this.viewDescriptorService.getViewContainerModel(viewContainer);
            if (!model.activeViewDescriptors.length) {
                await Event.toPromise(Event.filter(model.onDidChangeActiveViewDescriptors, e => model.activeViewDescriptors.length > 0));
            }
        }
    }
    isCurrentAccount(account) {
        return account.sessionId === this.currentSessionId;
    }
    async signIn() {
        await this.pick();
    }
    async pick() {
        const result = await this.doPick();
        if (!result) {
            return false;
        }
        let sessionId, accountName, accountId, authenticationProviderId;
        if (isAuthenticationProvider(result)) {
            const session = await this.authenticationService.createSession(result.id, result.scopes);
            sessionId = session.id;
            accountName = session.account.label;
            accountId = session.account.id;
            authenticationProviderId = result.id;
        }
        else {
            sessionId = result.sessionId;
            accountName = result.accountName;
            accountId = result.accountId;
            authenticationProviderId = result.authenticationProviderId;
        }
        await this.switch(sessionId, accountName, accountId, authenticationProviderId);
        return true;
    }
    async doPick() {
        if (this.authenticationProviders.length === 0) {
            return undefined;
        }
        await this.update();
        // Single auth provider and no accounts available
        if (this.authenticationProviders.length === 1 && !this.all.length) {
            return this.authenticationProviders[0];
        }
        return new Promise(c => {
            let result;
            const disposables = new DisposableStore();
            const quickPick = this.quickInputService.createQuickPick();
            disposables.add(quickPick);
            quickPick.title = SYNC_TITLE;
            quickPick.ok = false;
            quickPick.placeholder = localize('choose account placeholder', "Select an account to sign in");
            quickPick.ignoreFocusOut = true;
            quickPick.items = this.createQuickpickItems();
            disposables.add(quickPick.onDidAccept(() => {
                result = quickPick.selectedItems[0]?.account ? quickPick.selectedItems[0]?.account : quickPick.selectedItems[0]?.authenticationProvider;
                quickPick.hide();
            }));
            disposables.add(quickPick.onDidHide(() => {
                disposables.dispose();
                c(result);
            }));
            quickPick.show();
        });
    }
    createQuickpickItems() {
        const quickPickItems = [];
        // Signed in Accounts
        if (this.all.length) {
            const authenticationProviders = [...this.authenticationProviders].sort(({ id }) => id === this.current?.authenticationProviderId ? -1 : 1);
            quickPickItems.push({ type: 'separator', label: localize('signed in', "Signed in") });
            for (const authenticationProvider of authenticationProviders) {
                const accounts = (this._all.get(authenticationProvider.id) || []).sort(({ sessionId }) => sessionId === this.current?.sessionId ? -1 : 1);
                const providerName = this.authenticationService.getLabel(authenticationProvider.id);
                for (const account of accounts) {
                    quickPickItems.push({
                        label: `${account.accountName} (${providerName})`,
                        description: account.sessionId === this.current?.sessionId ? localize('last used', "Last Used with Sync") : undefined,
                        account,
                        authenticationProvider,
                    });
                }
            }
            quickPickItems.push({ type: 'separator', label: localize('others', "Others") });
        }
        // Account proviers
        for (const authenticationProvider of this.authenticationProviders) {
            const signedInForProvider = this.all.some(account => account.authenticationProviderId === authenticationProvider.id);
            if (!signedInForProvider || this.authenticationService.supportsMultipleAccounts(authenticationProvider.id)) {
                const providerName = this.authenticationService.getLabel(authenticationProvider.id);
                quickPickItems.push({ label: localize('sign in using account', "Sign in with {0}", providerName), authenticationProvider });
            }
        }
        return quickPickItems;
    }
    async switch(sessionId, accountName, accountId, authenticationProviderId) {
        const currentAccount = this.current;
        if (this.userDataSyncEnablementService.isEnabled() && (currentAccount && currentAccount.accountName !== accountName)) {
            // accounts are switched while sync is enabled.
        }
        this.currentSessionId = sessionId;
        await this.update();
    }
    async onDidSuccessiveAuthFailures() {
        this.telemetryService.publicLog2('sync/successiveAuthFailures');
        this.currentSessionId = undefined;
        await this.update();
        if (this.userDataSyncEnablementService.isEnabled()) {
            this.notificationService.notify({
                severity: Severity.Error,
                message: localize('successive auth failures', "Settings sync is suspended because of successive authorization failures. Please sign in again to continue synchronizing"),
                actions: {
                    primary: [new Action('sign in', localize('sign in', "Sign in"), undefined, true, () => this.signIn())]
                }
            });
        }
    }
    onDidChangeSessions(e) {
        if (this.currentSessionId && e.removed.find(session => session.id === this.currentSessionId)) {
            this.currentSessionId = undefined;
        }
        this.update();
    }
    onDidChangeStorage(e) {
        if (e.key === UserDataSyncWorkbenchService.CACHED_SESSION_STORAGE_KEY && e.scope === -1 /* StorageScope.APPLICATION */
            && this.currentSessionId !== this.getStoredCachedSessionId() /* This checks if current window changed the value or not */) {
            this._cachedCurrentSessionId = null;
            this.update();
        }
    }
    _cachedCurrentSessionId = null;
    get currentSessionId() {
        if (this._cachedCurrentSessionId === null) {
            this._cachedCurrentSessionId = this.getStoredCachedSessionId();
        }
        return this._cachedCurrentSessionId;
    }
    set currentSessionId(cachedSessionId) {
        if (this._cachedCurrentSessionId !== cachedSessionId) {
            this._cachedCurrentSessionId = cachedSessionId;
            if (cachedSessionId === undefined) {
                this.logService.info('Settings Sync: Reset current session');
                this.storageService.remove(UserDataSyncWorkbenchService.CACHED_SESSION_STORAGE_KEY, -1 /* StorageScope.APPLICATION */);
            }
            else {
                this.logService.info('Settings Sync: Updated current session', cachedSessionId);
                this.storageService.store(UserDataSyncWorkbenchService.CACHED_SESSION_STORAGE_KEY, cachedSessionId, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
            }
        }
    }
    getStoredCachedSessionId() {
        return this.storageService.get(UserDataSyncWorkbenchService.CACHED_SESSION_STORAGE_KEY, -1 /* StorageScope.APPLICATION */);
    }
    get useWorkbenchSessionId() {
        return !this.storageService.getBoolean(UserDataSyncWorkbenchService.DONOT_USE_WORKBENCH_SESSION_STORAGE_KEY, -1 /* StorageScope.APPLICATION */, false);
    }
    set useWorkbenchSessionId(useWorkbenchSession) {
        this.storageService.store(UserDataSyncWorkbenchService.DONOT_USE_WORKBENCH_SESSION_STORAGE_KEY, !useWorkbenchSession, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
    }
};
UserDataSyncWorkbenchService = __decorate([
    __param(0, IUserDataSyncService),
    __param(1, IUriIdentityService),
    __param(2, IAuthenticationService),
    __param(3, IUserDataSyncAccountService),
    __param(4, IQuickInputService),
    __param(5, IStorageService),
    __param(6, IUserDataSyncEnablementService),
    __param(7, IUserDataAutoSyncService),
    __param(8, ITelemetryService),
    __param(9, ILogService),
    __param(10, IProductService),
    __param(11, IExtensionService),
    __param(12, IWorkbenchEnvironmentService),
    __param(13, ICredentialsService),
    __param(14, INotificationService),
    __param(15, IProgressService),
    __param(16, IDialogService),
    __param(17, IContextKeyService),
    __param(18, IViewsService),
    __param(19, IViewDescriptorService),
    __param(20, IUserDataSyncStoreManagementService),
    __param(21, ILifecycleService),
    __param(22, IInstantiationService),
    __param(23, IEditorService)
], UserDataSyncWorkbenchService);
export { UserDataSyncWorkbenchService };
registerSingleton(IUserDataSyncWorkbenchService, UserDataSyncWorkbenchService, 0 /* InstantiationType.Eager */);

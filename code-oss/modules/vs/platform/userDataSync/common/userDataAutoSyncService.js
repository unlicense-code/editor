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
import { createCancelablePromise, disposableTimeout, ThrottledDelayer, timeout } from 'vs/base/common/async';
import { toLocalISOString } from 'vs/base/common/date';
import { toErrorMessage } from 'vs/base/common/errorMessage';
import { isCancellationError } from 'vs/base/common/errors';
import { Emitter, Event } from 'vs/base/common/event';
import { Disposable, MutableDisposable, toDisposable } from 'vs/base/common/lifecycle';
import { isWeb } from 'vs/base/common/platform';
import { isEqual } from 'vs/base/common/resources';
import { URI } from 'vs/base/common/uri';
import { localize } from 'vs/nls';
import { IProductService } from 'vs/platform/product/common/productService';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IUserDataSyncLogService, IUserDataSyncEnablementService, IUserDataSyncService, IUserDataSyncStoreManagementService, IUserDataSyncStoreService, UserDataAutoSyncError, UserDataSyncError } from 'vs/platform/userDataSync/common/userDataSync';
import { IUserDataSyncAccountService } from 'vs/platform/userDataSync/common/userDataSyncAccount';
import { IUserDataSyncMachinesService } from 'vs/platform/userDataSync/common/userDataSyncMachines';
const disableMachineEventuallyKey = 'sync.disableMachineEventually';
const sessionIdKey = 'sync.sessionId';
const storeUrlKey = 'sync.storeUrl';
const productQualityKey = 'sync.productQuality';
let UserDataAutoSyncService = class UserDataAutoSyncService extends Disposable {
    userDataSyncStoreManagementService;
    userDataSyncStoreService;
    userDataSyncEnablementService;
    userDataSyncService;
    logService;
    userDataSyncAccountService;
    telemetryService;
    userDataSyncMachinesService;
    storageService;
    _serviceBrand;
    autoSync = this._register(new MutableDisposable());
    successiveFailures = 0;
    lastSyncTriggerTime = undefined;
    syncTriggerDelayer;
    suspendUntilRestart = false;
    _onError = this._register(new Emitter());
    onError = this._onError.event;
    lastSyncUrl;
    get syncUrl() {
        const value = this.storageService.get(storeUrlKey, -1 /* StorageScope.APPLICATION */);
        return value ? URI.parse(value) : undefined;
    }
    set syncUrl(syncUrl) {
        if (syncUrl) {
            this.storageService.store(storeUrlKey, syncUrl.toString(), -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
        }
        else {
            this.storageService.remove(storeUrlKey, -1 /* StorageScope.APPLICATION */);
        }
    }
    previousProductQuality;
    get productQuality() {
        return this.storageService.get(productQualityKey, -1 /* StorageScope.APPLICATION */);
    }
    set productQuality(productQuality) {
        if (productQuality) {
            this.storageService.store(productQualityKey, productQuality, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
        }
        else {
            this.storageService.remove(productQualityKey, -1 /* StorageScope.APPLICATION */);
        }
    }
    constructor(productService, userDataSyncStoreManagementService, userDataSyncStoreService, userDataSyncEnablementService, userDataSyncService, logService, userDataSyncAccountService, telemetryService, userDataSyncMachinesService, storageService) {
        super();
        this.userDataSyncStoreManagementService = userDataSyncStoreManagementService;
        this.userDataSyncStoreService = userDataSyncStoreService;
        this.userDataSyncEnablementService = userDataSyncEnablementService;
        this.userDataSyncService = userDataSyncService;
        this.logService = logService;
        this.userDataSyncAccountService = userDataSyncAccountService;
        this.telemetryService = telemetryService;
        this.userDataSyncMachinesService = userDataSyncMachinesService;
        this.storageService = storageService;
        this.syncTriggerDelayer = this._register(new ThrottledDelayer(this.getSyncTriggerDelayTime()));
        this.lastSyncUrl = this.syncUrl;
        this.syncUrl = userDataSyncStoreManagementService.userDataSyncStore?.url;
        this.previousProductQuality = this.productQuality;
        this.productQuality = productService.quality;
        if (this.syncUrl) {
            this.logService.info('Using settings sync service', this.syncUrl.toString());
            this._register(userDataSyncStoreManagementService.onDidChangeUserDataSyncStore(() => {
                if (!isEqual(this.syncUrl, userDataSyncStoreManagementService.userDataSyncStore?.url)) {
                    this.lastSyncUrl = this.syncUrl;
                    this.syncUrl = userDataSyncStoreManagementService.userDataSyncStore?.url;
                    if (this.syncUrl) {
                        this.logService.info('Using settings sync service', this.syncUrl.toString());
                    }
                }
            }));
            if (this.userDataSyncEnablementService.isEnabled()) {
                this.logService.info('Auto Sync is enabled.');
            }
            else {
                this.logService.info('Auto Sync is disabled.');
            }
            this.updateAutoSync();
            if (this.hasToDisableMachineEventually()) {
                this.disableMachineEventually();
            }
            this._register(userDataSyncAccountService.onDidChangeAccount(() => this.updateAutoSync()));
            this._register(userDataSyncStoreService.onDidChangeDonotMakeRequestsUntil(() => this.updateAutoSync()));
            this._register(userDataSyncService.onDidChangeLocal(source => this.triggerSync([source], false, false)));
            this._register(Event.filter(this.userDataSyncEnablementService.onDidChangeResourceEnablement, ([, enabled]) => enabled)(() => this.triggerSync(['resourceEnablement'], false, false)));
            this._register(this.userDataSyncStoreManagementService.onDidChangeUserDataSyncStore(() => this.triggerSync(['userDataSyncStoreChanged'], false, false)));
        }
    }
    updateAutoSync() {
        const { enabled, message } = this.isAutoSyncEnabled();
        if (enabled) {
            if (this.autoSync.value === undefined) {
                this.autoSync.value = new AutoSync(this.lastSyncUrl, 1000 * 60 * 5 /* 5 miutes */, this.userDataSyncStoreManagementService, this.userDataSyncStoreService, this.userDataSyncService, this.userDataSyncMachinesService, this.logService, this.storageService);
                this.autoSync.value.register(this.autoSync.value.onDidStartSync(() => this.lastSyncTriggerTime = new Date().getTime()));
                this.autoSync.value.register(this.autoSync.value.onDidFinishSync(e => this.onDidFinishSync(e)));
                if (this.startAutoSync()) {
                    this.autoSync.value.start();
                }
            }
        }
        else {
            this.syncTriggerDelayer.cancel();
            if (this.autoSync.value !== undefined) {
                if (message) {
                    this.logService.info(message);
                }
                this.autoSync.clear();
            }
            /* log message when auto sync is not disabled by user */
            else if (message && this.userDataSyncEnablementService.isEnabled()) {
                this.logService.info(message);
            }
        }
    }
    // For tests purpose only
    startAutoSync() { return true; }
    isAutoSyncEnabled() {
        if (!this.userDataSyncEnablementService.isEnabled()) {
            return { enabled: false, message: 'Auto Sync: Disabled.' };
        }
        if (!this.userDataSyncAccountService.account) {
            return { enabled: false, message: 'Auto Sync: Suspended until auth token is available.' };
        }
        if (this.userDataSyncStoreService.donotMakeRequestsUntil) {
            return { enabled: false, message: `Auto Sync: Suspended until ${toLocalISOString(this.userDataSyncStoreService.donotMakeRequestsUntil)} because server is not accepting requests until then.` };
        }
        if (this.suspendUntilRestart) {
            return { enabled: false, message: 'Auto Sync: Suspended until restart.' };
        }
        return { enabled: true };
    }
    async turnOn() {
        this.stopDisableMachineEventually();
        this.lastSyncUrl = this.syncUrl;
        this.updateEnablement(true);
    }
    async turnOff(everywhere, softTurnOffOnError, donotRemoveMachine) {
        try {
            // Remove machine
            if (this.userDataSyncAccountService.account && !donotRemoveMachine) {
                await this.userDataSyncMachinesService.removeCurrentMachine();
            }
            // Disable Auto Sync
            this.updateEnablement(false);
            // Reset Session
            this.storageService.remove(sessionIdKey, -1 /* StorageScope.APPLICATION */);
            // Reset
            if (everywhere) {
                this.telemetryService.publicLog2('sync/turnOffEveryWhere');
                await this.userDataSyncService.reset();
            }
            else {
                await this.userDataSyncService.resetLocal();
            }
        }
        catch (error) {
            this.logService.error(error);
            if (softTurnOffOnError) {
                this.updateEnablement(false);
            }
            else {
                throw error;
            }
        }
    }
    updateEnablement(enabled) {
        if (this.userDataSyncEnablementService.isEnabled() !== enabled) {
            this.userDataSyncEnablementService.setEnablement(enabled);
            this.updateAutoSync();
        }
    }
    hasProductQualityChanged() {
        return !!this.previousProductQuality && !!this.productQuality && this.previousProductQuality !== this.productQuality;
    }
    async onDidFinishSync(error) {
        if (!error) {
            // Sync finished without errors
            this.successiveFailures = 0;
            return;
        }
        // Error while syncing
        const userDataSyncError = UserDataSyncError.toUserDataSyncError(error);
        // Log to telemetry
        if (userDataSyncError instanceof UserDataAutoSyncError) {
            this.telemetryService.publicLog2(`autosync/error`, { code: userDataSyncError.code, service: this.userDataSyncStoreManagementService.userDataSyncStore.url.toString() });
        }
        // Session got expired
        if (userDataSyncError.code === "SessionExpired" /* UserDataSyncErrorCode.SessionExpired */) {
            await this.turnOff(false, true /* force soft turnoff on error */);
            this.logService.info('Auto Sync: Turned off sync because current session is expired');
        }
        // Turned off from another device
        else if (userDataSyncError.code === "TurnedOff" /* UserDataSyncErrorCode.TurnedOff */) {
            await this.turnOff(false, true /* force soft turnoff on error */);
            this.logService.info('Auto Sync: Turned off sync because sync is turned off in the cloud');
        }
        // Exceeded Rate Limit on Client
        else if (userDataSyncError.code === "LocalTooManyRequests" /* UserDataSyncErrorCode.LocalTooManyRequests */) {
            this.suspendUntilRestart = true;
            this.logService.info('Auto Sync: Suspended sync because of making too many requests to server');
            this.updateAutoSync();
        }
        // Exceeded Rate Limit on Server
        else if (userDataSyncError.code === "RemoteTooManyRequests" /* UserDataSyncErrorCode.TooManyRequests */) {
            await this.turnOff(false, true /* force soft turnoff on error */, true /* do not disable machine because disabling a machine makes request to server and can fail with TooManyRequests */);
            this.disableMachineEventually();
            this.logService.info('Auto Sync: Turned off sync because of making too many requests to server');
        }
        // Upgrade Required or Gone
        else if (userDataSyncError.code === "UpgradeRequired" /* UserDataSyncErrorCode.UpgradeRequired */ || userDataSyncError.code === "Gone" /* UserDataSyncErrorCode.Gone */) {
            await this.turnOff(false, true /* force soft turnoff on error */, true /* do not disable machine because disabling a machine makes request to server and can fail with upgrade required or gone */);
            this.disableMachineEventually();
            this.logService.info('Auto Sync: Turned off sync because current client is not compatible with server. Requires client upgrade.');
        }
        // Incompatible Local Content
        else if (userDataSyncError.code === "IncompatibleLocalContent" /* UserDataSyncErrorCode.IncompatibleLocalContent */) {
            await this.turnOff(false, true /* force soft turnoff on error */);
            this.logService.info(`Auto Sync: Turned off sync because server has ${userDataSyncError.resource} content with newer version than of client. Requires client upgrade.`);
        }
        // Incompatible Remote Content
        else if (userDataSyncError.code === "IncompatibleRemoteContent" /* UserDataSyncErrorCode.IncompatibleRemoteContent */) {
            await this.turnOff(false, true /* force soft turnoff on error */);
            this.logService.info(`Auto Sync: Turned off sync because server has ${userDataSyncError.resource} content with older version than of client. Requires server reset.`);
        }
        // Service changed
        else if (userDataSyncError.code === "ServiceChanged" /* UserDataSyncErrorCode.ServiceChanged */ || userDataSyncError.code === "DefaultServiceChanged" /* UserDataSyncErrorCode.DefaultServiceChanged */) {
            // Check if default settings sync service has changed in web without changing the product quality
            // Then turn off settings sync and ask user to turn on again
            if (isWeb && userDataSyncError.code === "DefaultServiceChanged" /* UserDataSyncErrorCode.DefaultServiceChanged */ && !this.hasProductQualityChanged()) {
                await this.turnOff(false, true /* force soft turnoff on error */);
                this.logService.info('Auto Sync: Turned off sync because default sync service is changed.');
            }
            // Service has changed by the user. So turn off and turn on sync.
            // Show a prompt to the user about service change.
            else {
                await this.turnOff(false, true /* force soft turnoff on error */, true /* do not disable machine */);
                await this.turnOn();
                this.logService.info('Auto Sync: Sync Service changed. Turned off auto sync, reset local state and turned on auto sync.');
            }
        }
        else {
            this.logService.error(userDataSyncError);
            this.successiveFailures++;
        }
        this._onError.fire(userDataSyncError);
    }
    async disableMachineEventually() {
        this.storageService.store(disableMachineEventuallyKey, true, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
        await timeout(1000 * 60 * 10);
        // Return if got stopped meanwhile.
        if (!this.hasToDisableMachineEventually()) {
            return;
        }
        this.stopDisableMachineEventually();
        // disable only if sync is disabled
        if (!this.userDataSyncEnablementService.isEnabled() && this.userDataSyncAccountService.account) {
            await this.userDataSyncMachinesService.removeCurrentMachine();
        }
    }
    hasToDisableMachineEventually() {
        return this.storageService.getBoolean(disableMachineEventuallyKey, -1 /* StorageScope.APPLICATION */, false);
    }
    stopDisableMachineEventually() {
        this.storageService.remove(disableMachineEventuallyKey, -1 /* StorageScope.APPLICATION */);
    }
    sources = [];
    async triggerSync(sources, skipIfSyncedRecently, disableCache) {
        if (this.autoSync.value === undefined) {
            return this.syncTriggerDelayer.cancel();
        }
        if (skipIfSyncedRecently && this.lastSyncTriggerTime
            && Math.round((new Date().getTime() - this.lastSyncTriggerTime) / 1000) < 10) {
            this.logService.debug('Auto Sync: Skipped. Limited to once per 10 seconds.');
            return;
        }
        this.sources.push(...sources);
        return this.syncTriggerDelayer.trigger(async () => {
            this.logService.trace('activity sources', ...this.sources);
            this.telemetryService.publicLog2('sync/triggered', { sources: this.sources });
            this.sources = [];
            if (this.autoSync.value) {
                await this.autoSync.value.sync('Activity', disableCache);
            }
        }, this.successiveFailures
            ? this.getSyncTriggerDelayTime() * 1 * Math.min(Math.pow(2, this.successiveFailures), 60) /* Delay exponentially until max 1 minute */
            : this.getSyncTriggerDelayTime());
    }
    getSyncTriggerDelayTime() {
        return 2000; /* Debounce for 2 seconds if there are no failures */
    }
};
UserDataAutoSyncService = __decorate([
    __param(0, IProductService),
    __param(1, IUserDataSyncStoreManagementService),
    __param(2, IUserDataSyncStoreService),
    __param(3, IUserDataSyncEnablementService),
    __param(4, IUserDataSyncService),
    __param(5, IUserDataSyncLogService),
    __param(6, IUserDataSyncAccountService),
    __param(7, ITelemetryService),
    __param(8, IUserDataSyncMachinesService),
    __param(9, IStorageService)
], UserDataAutoSyncService);
export { UserDataAutoSyncService };
class AutoSync extends Disposable {
    lastSyncUrl;
    interval;
    userDataSyncStoreManagementService;
    userDataSyncStoreService;
    userDataSyncService;
    userDataSyncMachinesService;
    logService;
    storageService;
    static INTERVAL_SYNCING = 'Interval';
    intervalHandler = this._register(new MutableDisposable());
    _onDidStartSync = this._register(new Emitter());
    onDidStartSync = this._onDidStartSync.event;
    _onDidFinishSync = this._register(new Emitter());
    onDidFinishSync = this._onDidFinishSync.event;
    manifest = null;
    syncTask;
    syncPromise;
    constructor(lastSyncUrl, interval /* in milliseconds */, userDataSyncStoreManagementService, userDataSyncStoreService, userDataSyncService, userDataSyncMachinesService, logService, storageService) {
        super();
        this.lastSyncUrl = lastSyncUrl;
        this.interval = interval;
        this.userDataSyncStoreManagementService = userDataSyncStoreManagementService;
        this.userDataSyncStoreService = userDataSyncStoreService;
        this.userDataSyncService = userDataSyncService;
        this.userDataSyncMachinesService = userDataSyncMachinesService;
        this.logService = logService;
        this.storageService = storageService;
    }
    start() {
        this._register(this.onDidFinishSync(() => this.waitUntilNextIntervalAndSync()));
        this._register(toDisposable(() => {
            if (this.syncPromise) {
                this.syncPromise.cancel();
                this.logService.info('Auto sync: Cancelled sync that is in progress');
                this.syncPromise = undefined;
            }
            this.syncTask?.stop();
            this.logService.info('Auto Sync: Stopped');
        }));
        this.sync(AutoSync.INTERVAL_SYNCING, false);
    }
    waitUntilNextIntervalAndSync() {
        this.intervalHandler.value = disposableTimeout(() => this.sync(AutoSync.INTERVAL_SYNCING, false), this.interval);
    }
    sync(reason, disableCache) {
        const syncPromise = createCancelablePromise(async (token) => {
            if (this.syncPromise) {
                try {
                    // Wait until existing sync is finished
                    this.logService.debug('Auto Sync: Waiting until sync is finished.');
                    await this.syncPromise;
                }
                catch (error) {
                    if (isCancellationError(error)) {
                        // Cancelled => Disposed. Donot continue sync.
                        return;
                    }
                }
            }
            return this.doSync(reason, disableCache, token);
        });
        this.syncPromise = syncPromise;
        this.syncPromise.finally(() => this.syncPromise = undefined);
        return this.syncPromise;
    }
    hasSyncServiceChanged() {
        return this.lastSyncUrl !== undefined && !isEqual(this.lastSyncUrl, this.userDataSyncStoreManagementService.userDataSyncStore?.url);
    }
    async hasDefaultServiceChanged() {
        const previous = await this.userDataSyncStoreManagementService.getPreviousUserDataSyncStore();
        const current = this.userDataSyncStoreManagementService.userDataSyncStore;
        // check if defaults changed
        return !!current && !!previous &&
            (!isEqual(current.defaultUrl, previous.defaultUrl) ||
                !isEqual(current.insidersUrl, previous.insidersUrl) ||
                !isEqual(current.stableUrl, previous.stableUrl));
    }
    async doSync(reason, disableCache, token) {
        this.logService.info(`Auto Sync: Triggered by ${reason}`);
        this._onDidStartSync.fire();
        let error;
        try {
            this.syncTask = await this.userDataSyncService.createSyncTask(this.manifest, disableCache);
            if (token.isCancellationRequested) {
                return;
            }
            this.manifest = this.syncTask.manifest;
            // Server has no data but this machine was synced before
            if (this.manifest === null && await this.userDataSyncService.hasPreviouslySynced()) {
                if (this.hasSyncServiceChanged()) {
                    if (await this.hasDefaultServiceChanged()) {
                        throw new UserDataAutoSyncError(localize('default service changed', "Cannot sync because default service has changed"), "DefaultServiceChanged" /* UserDataSyncErrorCode.DefaultServiceChanged */);
                    }
                    else {
                        throw new UserDataAutoSyncError(localize('service changed', "Cannot sync because sync service has changed"), "ServiceChanged" /* UserDataSyncErrorCode.ServiceChanged */);
                    }
                }
                else {
                    // Sync was turned off in the cloud
                    throw new UserDataAutoSyncError(localize('turned off', "Cannot sync because syncing is turned off in the cloud"), "TurnedOff" /* UserDataSyncErrorCode.TurnedOff */);
                }
            }
            const sessionId = this.storageService.get(sessionIdKey, -1 /* StorageScope.APPLICATION */);
            // Server session is different from client session
            if (sessionId && this.manifest && sessionId !== this.manifest.session) {
                if (this.hasSyncServiceChanged()) {
                    if (await this.hasDefaultServiceChanged()) {
                        throw new UserDataAutoSyncError(localize('default service changed', "Cannot sync because default service has changed"), "DefaultServiceChanged" /* UserDataSyncErrorCode.DefaultServiceChanged */);
                    }
                    else {
                        throw new UserDataAutoSyncError(localize('service changed', "Cannot sync because sync service has changed"), "ServiceChanged" /* UserDataSyncErrorCode.ServiceChanged */);
                    }
                }
                else {
                    throw new UserDataAutoSyncError(localize('session expired', "Cannot sync because current session is expired"), "SessionExpired" /* UserDataSyncErrorCode.SessionExpired */);
                }
            }
            const machines = await this.userDataSyncMachinesService.getMachines(this.manifest || undefined);
            // Return if cancellation is requested
            if (token.isCancellationRequested) {
                return;
            }
            const currentMachine = machines.find(machine => machine.isCurrent);
            // Check if sync was turned off from other machine
            if (currentMachine?.disabled) {
                // Throw TurnedOff error
                throw new UserDataAutoSyncError(localize('turned off machine', "Cannot sync because syncing is turned off on this machine from another machine."), "TurnedOff" /* UserDataSyncErrorCode.TurnedOff */);
            }
            await this.syncTask.run();
            // After syncing, get the manifest if it was not available before
            if (this.manifest === null) {
                try {
                    this.manifest = await this.userDataSyncStoreService.manifest(null);
                }
                catch (error) {
                    throw new UserDataAutoSyncError(toErrorMessage(error), error instanceof UserDataSyncError ? error.code : "Unknown" /* UserDataSyncErrorCode.Unknown */);
                }
            }
            // Update local session id
            if (this.manifest && this.manifest.session !== sessionId) {
                this.storageService.store(sessionIdKey, this.manifest.session, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
            }
            // Return if cancellation is requested
            if (token.isCancellationRequested) {
                return;
            }
            // Add current machine
            if (!currentMachine) {
                await this.userDataSyncMachinesService.addCurrentMachine(this.manifest || undefined);
            }
        }
        catch (e) {
            this.logService.error(e);
            error = e;
        }
        this._onDidFinishSync.fire(error);
    }
    register(t) {
        return super._register(t);
    }
}

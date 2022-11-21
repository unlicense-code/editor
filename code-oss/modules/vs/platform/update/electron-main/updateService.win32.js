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
import { spawn } from 'child_process';
import * as fs from 'fs';
import { tmpdir } from 'os';
import { timeout } from 'vs/base/common/async';
import { CancellationToken } from 'vs/base/common/cancellation';
import { memoize } from 'vs/base/common/decorators';
import * as path from 'vs/base/common/path';
import { URI } from 'vs/base/common/uri';
import { checksum } from 'vs/base/node/crypto';
import * as pfs from 'vs/base/node/pfs';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IEnvironmentMainService } from 'vs/platform/environment/electron-main/environmentMainService';
import { IFileService } from 'vs/platform/files/common/files';
import { ILifecycleMainService } from 'vs/platform/lifecycle/electron-main/lifecycleMainService';
import { ILogService } from 'vs/platform/log/common/log';
import { INativeHostMainService } from 'vs/platform/native/electron-main/nativeHostMainService';
import { IProductService } from 'vs/platform/product/common/productService';
import { asJson, IRequestService } from 'vs/platform/request/common/request';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { State } from 'vs/platform/update/common/update';
import { AbstractUpdateService, createUpdateURL } from 'vs/platform/update/electron-main/abstractUpdateService';
async function pollUntil(fn, millis = 1000) {
    while (!fn()) {
        await timeout(millis);
    }
}
let _updateType = undefined;
function getUpdateType() {
    if (typeof _updateType === 'undefined') {
        _updateType = fs.existsSync(path.join(path.dirname(process.execPath), 'unins000.exe'))
            ? 0 /* UpdateType.Setup */
            : 1 /* UpdateType.Archive */;
    }
    return _updateType;
}
let Win32UpdateService = class Win32UpdateService extends AbstractUpdateService {
    telemetryService;
    fileService;
    nativeHostMainService;
    availableUpdate;
    get cachePath() {
        const result = path.join(tmpdir(), `vscode-update-${this.productService.target}-${process.arch}`);
        return pfs.Promises.mkdir(result, { recursive: true }).then(() => result);
    }
    constructor(lifecycleMainService, configurationService, telemetryService, environmentMainService, requestService, logService, fileService, nativeHostMainService, productService) {
        super(lifecycleMainService, configurationService, environmentMainService, requestService, logService, productService);
        this.telemetryService = telemetryService;
        this.fileService = fileService;
        this.nativeHostMainService = nativeHostMainService;
    }
    async initialize() {
        if (this.productService.target === 'user' && await this.nativeHostMainService.isAdmin(undefined)) {
            this.logService.info('update#ctor - updates are disabled due to running as Admin in user setup');
            return;
        }
        super.initialize();
    }
    buildUpdateFeedUrl(quality) {
        let platform = 'win32';
        if (process.arch !== 'ia32') {
            platform += `-${process.arch}`;
        }
        if (getUpdateType() === 1 /* UpdateType.Archive */) {
            platform += '-archive';
        }
        else if (this.productService.target === 'user') {
            platform += '-user';
        }
        return createUpdateURL(platform, quality, this.productService);
    }
    doCheckForUpdates(context) {
        if (!this.url) {
            return;
        }
        this.setState(State.CheckingForUpdates(context));
        this.requestService.request({ url: this.url }, CancellationToken.None)
            .then(asJson)
            .then(update => {
            const updateType = getUpdateType();
            if (!update || !update.url || !update.version || !update.productVersion) {
                this.telemetryService.publicLog2('update:notAvailable', { explicit: !!context });
                this.setState(State.Idle(updateType));
                return Promise.resolve(null);
            }
            if (updateType === 1 /* UpdateType.Archive */) {
                this.setState(State.AvailableForDownload(update));
                return Promise.resolve(null);
            }
            this.setState(State.Downloading(update));
            return this.cleanup(update.version).then(() => {
                return this.getUpdatePackagePath(update.version).then(updatePackagePath => {
                    return pfs.Promises.exists(updatePackagePath).then(exists => {
                        if (exists) {
                            return Promise.resolve(updatePackagePath);
                        }
                        const url = update.url;
                        const hash = update.hash;
                        const downloadPath = `${updatePackagePath}.tmp`;
                        return this.requestService.request({ url }, CancellationToken.None)
                            .then(context => this.fileService.writeFile(URI.file(downloadPath), context.stream))
                            .then(hash ? () => checksum(downloadPath, update.hash) : () => undefined)
                            .then(() => pfs.Promises.rename(downloadPath, updatePackagePath))
                            .then(() => updatePackagePath);
                    });
                }).then(packagePath => {
                    const fastUpdatesEnabled = this.configurationService.getValue('update.enableWindowsBackgroundUpdates');
                    this.availableUpdate = { packagePath };
                    if (fastUpdatesEnabled && update.supportsFastUpdate) {
                        if (this.productService.target === 'user') {
                            this.doApplyUpdate();
                        }
                        else {
                            this.setState(State.Downloaded(update));
                        }
                    }
                    else {
                        this.setState(State.Ready(update));
                    }
                });
            });
        })
            .then(undefined, err => {
            this.logService.error(err);
            this.telemetryService.publicLog2('update:notAvailable', { explicit: !!context });
            // only show message when explicitly checking for updates
            const message = !!context ? (err.message || err) : undefined;
            this.setState(State.Idle(getUpdateType(), message));
        });
    }
    async doDownloadUpdate(state) {
        if (state.update.url) {
            this.nativeHostMainService.openExternal(undefined, state.update.url);
        }
        this.setState(State.Idle(getUpdateType()));
    }
    async getUpdatePackagePath(version) {
        const cachePath = await this.cachePath;
        return path.join(cachePath, `CodeSetup-${this.productService.quality}-${version}.exe`);
    }
    async cleanup(exceptVersion = null) {
        const filter = exceptVersion ? (one) => !(new RegExp(`${this.productService.quality}-${exceptVersion}\\.exe$`).test(one)) : () => true;
        const cachePath = await this.cachePath;
        const versions = await pfs.Promises.readdir(cachePath);
        const promises = versions.filter(filter).map(async (one) => {
            try {
                await pfs.Promises.unlink(path.join(cachePath, one));
            }
            catch (err) {
                // ignore
            }
        });
        await Promise.all(promises);
    }
    async doApplyUpdate() {
        if (this.state.type !== "downloaded" /* StateType.Downloaded */ && this.state.type !== "downloading" /* StateType.Downloading */) {
            return Promise.resolve(undefined);
        }
        if (!this.availableUpdate) {
            return Promise.resolve(undefined);
        }
        const update = this.state.update;
        this.setState(State.Updating(update));
        const cachePath = await this.cachePath;
        this.availableUpdate.updateFilePath = path.join(cachePath, `CodeSetup-${this.productService.quality}-${update.version}.flag`);
        await pfs.Promises.writeFile(this.availableUpdate.updateFilePath, 'flag');
        const child = spawn(this.availableUpdate.packagePath, ['/verysilent', `/update="${this.availableUpdate.updateFilePath}"`, '/nocloseapplications', '/mergetasks=runcode,!desktopicon,!quicklaunchicon'], {
            detached: true,
            stdio: ['ignore', 'ignore', 'ignore'],
            windowsVerbatimArguments: true
        });
        child.once('exit', () => {
            this.availableUpdate = undefined;
            this.setState(State.Idle(getUpdateType()));
        });
        const readyMutexName = `${this.productService.win32MutexName}-ready`;
        const mutex = await import('windows-mutex');
        // poll for mutex-ready
        pollUntil(() => mutex.isActive(readyMutexName))
            .then(() => this.setState(State.Ready(update)));
    }
    doQuitAndInstall() {
        if (this.state.type !== "ready" /* StateType.Ready */ || !this.availableUpdate) {
            return;
        }
        this.logService.trace('update#quitAndInstall(): running raw#quitAndInstall()');
        if (this.state.update.supportsFastUpdate && this.availableUpdate.updateFilePath) {
            fs.unlinkSync(this.availableUpdate.updateFilePath);
        }
        else {
            spawn(this.availableUpdate.packagePath, ['/silent', '/mergetasks=runcode,!desktopicon,!quicklaunchicon'], {
                detached: true,
                stdio: ['ignore', 'ignore', 'ignore']
            });
        }
    }
    getUpdateType() {
        return getUpdateType();
    }
    async _applySpecificUpdate(packagePath) {
        if (this.state.type !== "idle" /* StateType.Idle */) {
            return;
        }
        const fastUpdatesEnabled = this.configurationService.getValue('update.enableWindowsBackgroundUpdates');
        const update = { version: 'unknown', productVersion: 'unknown', supportsFastUpdate: !!fastUpdatesEnabled };
        this.setState(State.Downloading(update));
        this.availableUpdate = { packagePath };
        if (fastUpdatesEnabled) {
            if (this.productService.target === 'user') {
                this.doApplyUpdate();
            }
            else {
                this.setState(State.Downloaded(update));
            }
        }
        else {
            this.setState(State.Ready(update));
        }
    }
};
__decorate([
    memoize
], Win32UpdateService.prototype, "cachePath", null);
Win32UpdateService = __decorate([
    __param(0, ILifecycleMainService),
    __param(1, IConfigurationService),
    __param(2, ITelemetryService),
    __param(3, IEnvironmentMainService),
    __param(4, IRequestService),
    __param(5, ILogService),
    __param(6, IFileService),
    __param(7, INativeHostMainService),
    __param(8, IProductService)
], Win32UpdateService);
export { Win32UpdateService };

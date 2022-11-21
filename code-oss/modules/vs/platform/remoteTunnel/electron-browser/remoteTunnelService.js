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
import { CONFIGURATION_KEY_HOST_NAME, TunnelStates } from 'vs/platform/remoteTunnel/common/remoteTunnel';
import { Emitter } from 'vs/base/common/event';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { INativeEnvironmentService } from 'vs/platform/environment/common/environment';
import { Disposable } from 'vs/base/common/lifecycle';
import { ILoggerService } from 'vs/platform/log/common/log';
import { dirname, join } from 'vs/base/common/path';
import { spawn } from 'child_process';
import { IProductService } from 'vs/platform/product/common/productService';
import { isMacintosh, isWindows } from 'vs/base/common/platform';
import { createCancelablePromise, Delayer } from 'vs/base/common/async';
import { ISharedProcessLifecycleService } from 'vs/platform/lifecycle/electron-browser/sharedProcessLifecycleService';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { localize } from 'vs/nls';
import { hostname, homedir } from 'os';
/**
 * This service runs on the shared service. It is running the `code-tunnel` command
 * to make the current machine available for remote access.
 */
let RemoteTunnelService = class RemoteTunnelService extends Disposable {
    telemetryService;
    productService;
    environmentService;
    configurationService;
    _onDidTokenFailedEmitter = new Emitter();
    onDidTokenFailed = this._onDidTokenFailedEmitter.event;
    _onDidChangeTunnelStatusEmitter = new Emitter();
    onDidChangeTunnelStatus = this._onDidChangeTunnelStatusEmitter.event;
    _onDidChangeAccountEmitter = new Emitter();
    onDidChangeAccount = this._onDidChangeAccountEmitter.event;
    _logger;
    _account;
    _tunnelProcess;
    _tunnelStatus = TunnelStates.disconnected;
    _startTunnelProcessDelayer;
    _tunnelCommand;
    constructor(telemetryService, productService, environmentService, loggerService, sharedProcessLifecycleService, configurationService) {
        super();
        this.telemetryService = telemetryService;
        this.productService = productService;
        this.environmentService = environmentService;
        this.configurationService = configurationService;
        this._logger = this._register(loggerService.createLogger(environmentService.remoteTunnelLogResource, { name: 'remoteTunnel' }));
        this._startTunnelProcessDelayer = new Delayer(100);
        this._register(sharedProcessLifecycleService.onWillShutdown(e => {
            if (this._tunnelProcess) {
                this._tunnelProcess.cancel();
                this._tunnelProcess = undefined;
            }
            this.dispose();
        }));
        this._register(configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration(CONFIGURATION_KEY_HOST_NAME)) {
                this._startTunnelProcessDelayer.trigger(() => this.updateTunnelProcess());
            }
        }));
    }
    async getAccount() {
        return this._account;
    }
    async updateAccount(account) {
        if (account && this._account ? account.token !== this._account.token || account.authenticationProviderId !== this._account.authenticationProviderId : account !== this._account) {
            this._account = account;
            this._onDidChangeAccountEmitter.fire(account);
            this._logger.info(`Account updated: ${account ? account.authenticationProviderId : 'undefined'}`);
            this.telemetryService.publicLog2('remoteTunnel.enablement', { enabled: !!account });
            try {
                await this._startTunnelProcessDelayer.trigger(() => this.updateTunnelProcess());
            }
            catch (e) {
                this._logger.error(e);
            }
        }
    }
    getTunnelCommandLocation() {
        if (!this._tunnelCommand) {
            let binParentLocation;
            if (isMacintosh) {
                // appRoot = /Applications/Visual Studio Code - Insiders.app/Contents/Resources/app
                // bin = /Applications/Visual Studio Code - Insiders.app/Contents/Resources/app/bin
                binParentLocation = this.environmentService.appRoot;
            }
            else {
                // appRoot = C:\Users\<name>\AppData\Local\Programs\Microsoft VS Code Insiders\resources\app
                // bin = C:\Users\<name>\AppData\Local\Programs\Microsoft VS Code Insiders\bin
                // appRoot = /usr/share/code-insiders/resources/app
                // bin = /usr/share/code-insiders/bin
                binParentLocation = dirname(dirname(this.environmentService.appRoot));
            }
            this._tunnelCommand = join(binParentLocation, 'bin', `${this.productService.tunnelApplicationName}${isWindows ? '.exe' : ''}`);
        }
        return this._tunnelCommand;
    }
    async updateTunnelProcess() {
        if (this._tunnelProcess) {
            this._tunnelProcess.cancel();
            this._tunnelProcess = undefined;
        }
        if (!this._account) {
            this.setTunnelStatus(TunnelStates.disconnected);
            return;
        }
        const { token, authenticationProviderId } = this._account;
        this.setTunnelStatus(TunnelStates.connecting(localize('remoteTunnelService.authorizing', 'Authorizing')));
        const onOutput = (a, isErr) => {
            a = a.replaceAll(token, '*'.repeat(4));
            if (isErr) {
                this._logger.error(a);
            }
            else {
                this._logger.info(a);
            }
        };
        const loginProcess = this.runCodeTunneCommand('login', ['user', 'login', '--provider', authenticationProviderId, '--access-token', token], onOutput);
        this._tunnelProcess = loginProcess;
        try {
            await loginProcess;
            if (this._tunnelProcess !== loginProcess) {
                return;
            }
        }
        catch (e) {
            this._logger.error(e);
            this._tunnelProcess = undefined;
            this._onDidTokenFailedEmitter.fire(true);
            this.setTunnelStatus(TunnelStates.disconnected);
            return;
        }
        const args = ['--parent-process-id', String(process.pid), '--accept-server-license-terms'];
        const hostName = this.getHostName();
        if (hostName) {
            args.push('--name', hostName);
        }
        else {
            args.push('--random-name');
        }
        const serveCommand = this.runCodeTunneCommand('tunnel', args, (message, isErr) => {
            if (isErr) {
                this._logger.error(message);
            }
            else {
                this._logger.info(message);
            }
            const m = message.match(/^\s*Open this link in your browser (https:\/\/([^\/\s]+)\/([^\/\s]+)\/([^\/\s]+))/);
            if (m) {
                const info = { link: m[1], domain: m[2], extensionId: 'ms-vscode.remote-server', hostName: m[4] };
                this.setTunnelStatus(TunnelStates.connected(info));
            }
            else if (message.match(/error refreshing token/)) {
                serveCommand.cancel();
                this._onDidTokenFailedEmitter.fire(true);
                this.setTunnelStatus(TunnelStates.disconnected);
            }
        });
        this._tunnelProcess = serveCommand;
        serveCommand.finally(() => {
            if (serveCommand === this._tunnelProcess) {
                // process exited unexpectedly
                this._logger.info(`tunnel process terminated`);
                this._tunnelProcess = undefined;
                this._account = undefined;
                this.setTunnelStatus(TunnelStates.disconnected);
            }
        });
    }
    async getTunnelStatus() {
        return this._tunnelStatus;
    }
    setTunnelStatus(tunnelStatus) {
        if (tunnelStatus !== this._tunnelStatus) {
            this._tunnelStatus = tunnelStatus;
            this._onDidChangeTunnelStatusEmitter.fire(tunnelStatus);
        }
    }
    runCodeTunneCommand(logLabel, commandArgs, onOutput = () => { }) {
        return createCancelablePromise(token => {
            return new Promise((resolve, reject) => {
                if (token.isCancellationRequested) {
                    resolve();
                }
                let tunnelProcess;
                token.onCancellationRequested(() => {
                    if (tunnelProcess) {
                        this._logger.info(`${logLabel} terminating (${tunnelProcess.pid})`);
                        tunnelProcess.kill();
                    }
                });
                if (process.env['VSCODE_DEV']) {
                    onOutput('Compiling tunnel CLI from sources and run', false);
                    onOutput(`${logLabel} Spawning: cargo run -- tunnel ${commandArgs.join(' ')}`, false);
                    tunnelProcess = spawn('cargo', ['run', '--', 'tunnel', ...commandArgs], { cwd: join(this.environmentService.appRoot, 'cli') });
                }
                else {
                    onOutput('Running tunnel CLI', false);
                    const tunnelCommand = this.getTunnelCommandLocation();
                    onOutput(`${logLabel} Spawning: ${tunnelCommand} tunnel ${commandArgs.join(' ')}`, false);
                    tunnelProcess = spawn(tunnelCommand, ['tunnel', ...commandArgs], { cwd: homedir() });
                }
                tunnelProcess.stdout.on('data', data => {
                    if (tunnelProcess) {
                        const message = data.toString();
                        onOutput(message, false);
                    }
                });
                tunnelProcess.stderr.on('data', data => {
                    if (tunnelProcess) {
                        const message = data.toString();
                        onOutput(message, true);
                    }
                });
                tunnelProcess.on('exit', e => {
                    if (tunnelProcess) {
                        onOutput(`${logLabel} exit (${tunnelProcess.pid}):  + ${e}`, false);
                        tunnelProcess = undefined;
                        if (e === 0) {
                            resolve();
                        }
                        else {
                            reject();
                        }
                    }
                });
                tunnelProcess.on('error', e => {
                    if (tunnelProcess) {
                        onOutput(`${logLabel} error (${tunnelProcess.pid}):  + ${e}`, true);
                        tunnelProcess = undefined;
                        reject();
                    }
                });
            });
        });
    }
    getHostName() {
        const name = this.configurationService.getValue(CONFIGURATION_KEY_HOST_NAME);
        if (name && name.match(/^([\w-]+)$/) && name.length <= 20) {
            return name;
        }
        const hostName = hostname();
        if (hostName && hostName.match(/^([\w-]+)$/)) {
            return hostName.substring(0, 20);
        }
        return undefined;
    }
};
RemoteTunnelService = __decorate([
    __param(0, ITelemetryService),
    __param(1, IProductService),
    __param(2, INativeEnvironmentService),
    __param(3, ILoggerService),
    __param(4, ISharedProcessLifecycleService),
    __param(5, IConfigurationService)
], RemoteTunnelService);
export { RemoteTunnelService };

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
import { getDelayedChannel, IPCLogger } from 'vs/base/parts/ipc/common/ipc';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { connectRemoteAgentManagement } from 'vs/platform/remote/common/remoteAgentConnection';
import { IRemoteAuthorityResolverService } from 'vs/platform/remote/common/remoteAuthorityResolver';
import { RemoteExtensionEnvironmentChannelClient } from 'vs/workbench/services/remote/common/remoteAgentEnvironmentChannel';
import { Emitter } from 'vs/base/common/event';
import { ISignService } from 'vs/platform/sign/common/sign';
import { ILogService } from 'vs/platform/log/common/log';
import { IProductService } from 'vs/platform/product/common/productService';
import { ImplicitActivationEvents } from 'vs/platform/extensionManagement/common/implicitActivationEvents';
let AbstractRemoteAgentService = class AbstractRemoteAgentService extends Disposable {
    _environmentService;
    _remoteAuthorityResolverService;
    socketFactory;
    _connection;
    _environment;
    constructor(socketFactory, _environmentService, productService, _remoteAuthorityResolverService, signService, logService) {
        super();
        this._environmentService = _environmentService;
        this._remoteAuthorityResolverService = _remoteAuthorityResolverService;
        this.socketFactory = socketFactory;
        if (this._environmentService.remoteAuthority) {
            this._connection = this._register(new RemoteAgentConnection(this._environmentService.remoteAuthority, productService.commit, productService.quality, this.socketFactory, this._remoteAuthorityResolverService, signService, logService));
        }
        else {
            this._connection = null;
        }
        this._environment = null;
    }
    getConnection() {
        return this._connection;
    }
    getEnvironment() {
        return this.getRawEnvironment().then(undefined, () => null);
    }
    getRawEnvironment() {
        if (!this._environment) {
            this._environment = this._withChannel(async (channel, connection) => {
                const env = await RemoteExtensionEnvironmentChannelClient.getEnvironmentData(channel, connection.remoteAuthority);
                this._remoteAuthorityResolverService._setAuthorityConnectionToken(connection.remoteAuthority, env.connectionToken);
                return env;
            }, null);
        }
        return this._environment;
    }
    getExtensionHostExitInfo(reconnectionToken) {
        return this._withChannel((channel, connection) => RemoteExtensionEnvironmentChannelClient.getExtensionHostExitInfo(channel, connection.remoteAuthority, reconnectionToken), null);
    }
    whenExtensionsReady() {
        return this._withChannel(channel => RemoteExtensionEnvironmentChannelClient.whenExtensionsReady(channel), undefined);
    }
    scanExtensions(skipExtensions = []) {
        return this._withChannel(async (channel, connection) => {
            const scannedExtensions = await RemoteExtensionEnvironmentChannelClient.scanExtensions(channel, connection.remoteAuthority, this._environmentService.extensionDevelopmentLocationURI, skipExtensions);
            scannedExtensions.forEach((extension) => ImplicitActivationEvents.updateManifest(extension));
            return scannedExtensions;
        }, []).then(undefined, () => []);
    }
    scanSingleExtension(extensionLocation, isBuiltin) {
        return this._withChannel(async (channel, connection) => {
            const scannedExtension = await RemoteExtensionEnvironmentChannelClient.scanSingleExtension(channel, connection.remoteAuthority, isBuiltin, extensionLocation);
            if (scannedExtension !== null) {
                ImplicitActivationEvents.updateManifest(scannedExtension);
            }
            return scannedExtension;
        }, null).then(undefined, () => null);
    }
    getDiagnosticInfo(options) {
        return this._withChannel(channel => RemoteExtensionEnvironmentChannelClient.getDiagnosticInfo(channel, options), undefined);
    }
    updateTelemetryLevel(telemetryLevel) {
        return this._withTelemetryChannel(channel => RemoteExtensionEnvironmentChannelClient.updateTelemetryLevel(channel, telemetryLevel), undefined);
    }
    logTelemetry(eventName, data) {
        return this._withTelemetryChannel(channel => RemoteExtensionEnvironmentChannelClient.logTelemetry(channel, eventName, data), undefined);
    }
    flushTelemetry() {
        return this._withTelemetryChannel(channel => RemoteExtensionEnvironmentChannelClient.flushTelemetry(channel), undefined);
    }
    getRoundTripTime() {
        return this._withTelemetryChannel(async (channel) => {
            const start = Date.now();
            await RemoteExtensionEnvironmentChannelClient.ping(channel);
            return Date.now() - start;
        }, undefined);
    }
    _withChannel(callback, fallback) {
        const connection = this.getConnection();
        if (!connection) {
            return Promise.resolve(fallback);
        }
        return connection.withChannel('remoteextensionsenvironment', (channel) => callback(channel, connection));
    }
    _withTelemetryChannel(callback, fallback) {
        const connection = this.getConnection();
        if (!connection) {
            return Promise.resolve(fallback);
        }
        return connection.withChannel('telemetry', (channel) => callback(channel, connection));
    }
};
AbstractRemoteAgentService = __decorate([
    __param(1, IWorkbenchEnvironmentService),
    __param(2, IProductService),
    __param(3, IRemoteAuthorityResolverService),
    __param(4, ISignService),
    __param(5, ILogService)
], AbstractRemoteAgentService);
export { AbstractRemoteAgentService };
class RemoteAgentConnection extends Disposable {
    _commit;
    _quality;
    _socketFactory;
    _remoteAuthorityResolverService;
    _signService;
    _logService;
    _onReconnecting = this._register(new Emitter());
    onReconnecting = this._onReconnecting.event;
    _onDidStateChange = this._register(new Emitter());
    onDidStateChange = this._onDidStateChange.event;
    remoteAuthority;
    _connection;
    _initialConnectionMs;
    constructor(remoteAuthority, _commit, _quality, _socketFactory, _remoteAuthorityResolverService, _signService, _logService) {
        super();
        this._commit = _commit;
        this._quality = _quality;
        this._socketFactory = _socketFactory;
        this._remoteAuthorityResolverService = _remoteAuthorityResolverService;
        this._signService = _signService;
        this._logService = _logService;
        this.remoteAuthority = remoteAuthority;
        this._connection = null;
    }
    getChannel(channelName) {
        return getDelayedChannel(this._getOrCreateConnection().then(c => c.getChannel(channelName)));
    }
    withChannel(channelName, callback) {
        const channel = this.getChannel(channelName);
        const result = callback(channel);
        return result;
    }
    registerChannel(channelName, channel) {
        this._getOrCreateConnection().then(client => client.registerChannel(channelName, channel));
    }
    async getInitialConnectionTimeMs() {
        try {
            await this._getOrCreateConnection();
        }
        catch {
            // ignored -- time is measured even if connection fails
        }
        return this._initialConnectionMs;
    }
    _getOrCreateConnection() {
        if (!this._connection) {
            this._connection = this._createConnection();
        }
        return this._connection;
    }
    async _createConnection() {
        let firstCall = true;
        const options = {
            commit: this._commit,
            quality: this._quality,
            socketFactory: this._socketFactory,
            addressProvider: {
                getAddress: async () => {
                    if (firstCall) {
                        firstCall = false;
                    }
                    else {
                        this._onReconnecting.fire(undefined);
                    }
                    const { authority } = await this._remoteAuthorityResolverService.resolveAuthority(this.remoteAuthority);
                    return { host: authority.host, port: authority.port, connectionToken: authority.connectionToken };
                }
            },
            signService: this._signService,
            logService: this._logService,
            ipcLogger: false ? new IPCLogger(`Local \u2192 Remote`, `Remote \u2192 Local`) : null
        };
        let connection;
        const start = Date.now();
        try {
            connection = this._register(await connectRemoteAgentManagement(options, this.remoteAuthority, `renderer`));
        }
        finally {
            this._initialConnectionMs = Date.now() - start;
        }
        connection.protocol.onDidDispose(() => {
            connection.dispose();
        });
        this._register(connection.onDidStateChange(e => this._onDidStateChange.fire(e)));
        return connection.client;
    }
}

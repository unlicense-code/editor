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
import { Emitter } from 'vs/base/common/event';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { ILogService } from 'vs/platform/log/common/log';
export const ITunnelService = createDecorator('tunnelService');
export const ISharedTunnelsService = createDecorator('sharedTunnelsService');
export var TunnelProtocol;
(function (TunnelProtocol) {
    TunnelProtocol["Http"] = "http";
    TunnelProtocol["Https"] = "https";
})(TunnelProtocol || (TunnelProtocol = {}));
export var TunnelPrivacyId;
(function (TunnelPrivacyId) {
    TunnelPrivacyId["ConstantPrivate"] = "constantPrivate";
    TunnelPrivacyId["Private"] = "private";
    TunnelPrivacyId["Public"] = "public";
})(TunnelPrivacyId || (TunnelPrivacyId = {}));
export var ProvidedOnAutoForward;
(function (ProvidedOnAutoForward) {
    ProvidedOnAutoForward[ProvidedOnAutoForward["Notify"] = 1] = "Notify";
    ProvidedOnAutoForward[ProvidedOnAutoForward["OpenBrowser"] = 2] = "OpenBrowser";
    ProvidedOnAutoForward[ProvidedOnAutoForward["OpenPreview"] = 3] = "OpenPreview";
    ProvidedOnAutoForward[ProvidedOnAutoForward["Silent"] = 4] = "Silent";
    ProvidedOnAutoForward[ProvidedOnAutoForward["Ignore"] = 5] = "Ignore";
    ProvidedOnAutoForward[ProvidedOnAutoForward["OpenBrowserOnce"] = 6] = "OpenBrowserOnce";
})(ProvidedOnAutoForward || (ProvidedOnAutoForward = {}));
export function extractLocalHostUriMetaDataForPortMapping(uri) {
    if (uri.scheme !== 'http' && uri.scheme !== 'https') {
        return undefined;
    }
    const localhostMatch = /^(localhost|127\.0\.0\.1|0\.0\.0\.0):(\d+)$/.exec(uri.authority);
    if (!localhostMatch) {
        return undefined;
    }
    return {
        address: localhostMatch[1],
        port: +localhostMatch[2],
    };
}
export const LOCALHOST_ADDRESSES = ['localhost', '127.0.0.1', '0:0:0:0:0:0:0:1', '::1'];
export function isLocalhost(host) {
    return LOCALHOST_ADDRESSES.indexOf(host) >= 0;
}
export const ALL_INTERFACES_ADDRESSES = ['0.0.0.0', '0:0:0:0:0:0:0:0', '::'];
export function isAllInterfaces(host) {
    return ALL_INTERFACES_ADDRESSES.indexOf(host) >= 0;
}
export function isPortPrivileged(port, host, os, osRelease) {
    if (os === 1 /* OperatingSystem.Windows */) {
        return false;
    }
    if (os === 2 /* OperatingSystem.Macintosh */) {
        if (isAllInterfaces(host)) {
            const osVersion = (/(\d+)\.(\d+)\.(\d+)/g).exec(osRelease);
            if (osVersion?.length === 4) {
                const major = parseInt(osVersion[1]);
                if (major >= 18 /* since macOS Mojave, darwin version 18.0.0 */) {
                    return false;
                }
            }
        }
    }
    return port < 1024;
}
export class DisposableTunnel {
    remoteAddress;
    localAddress;
    _dispose;
    _onDispose = new Emitter();
    onDidDispose = this._onDispose.event;
    constructor(remoteAddress, localAddress, _dispose) {
        this.remoteAddress = remoteAddress;
        this.localAddress = localAddress;
        this._dispose = _dispose;
    }
    dispose() {
        this._onDispose.fire();
        return this._dispose();
    }
}
let AbstractTunnelService = class AbstractTunnelService {
    logService;
    configurationService;
    _onTunnelOpened = new Emitter();
    onTunnelOpened = this._onTunnelOpened.event;
    _onTunnelClosed = new Emitter();
    onTunnelClosed = this._onTunnelClosed.event;
    _onAddedTunnelProvider = new Emitter();
    onAddedTunnelProvider = this._onAddedTunnelProvider.event;
    _tunnels = new Map();
    _tunnelProvider;
    _canElevate = false;
    _privacyOptions = [];
    _factoryInProgress = new Set();
    constructor(logService, configurationService) {
        this.logService = logService;
        this.configurationService = configurationService;
    }
    get hasTunnelProvider() {
        return !!this._tunnelProvider;
    }
    get defaultTunnelHost() {
        const settingValue = this.configurationService.getValue('remote.localPortHost');
        return (!settingValue || settingValue === 'localhost') ? '127.0.0.1' : '0.0.0.0';
    }
    setTunnelProvider(provider) {
        this._tunnelProvider = provider;
        if (!provider) {
            // clear features
            this._canElevate = false;
            this._privacyOptions = [];
            this._onAddedTunnelProvider.fire();
            return {
                dispose: () => { }
            };
        }
        this._onAddedTunnelProvider.fire();
        return {
            dispose: () => {
                this._tunnelProvider = undefined;
                this._canElevate = false;
                this._privacyOptions = [];
            }
        };
    }
    setTunnelFeatures(features) {
        this._canElevate = features.elevation;
        this._privacyOptions = features.privacyOptions;
    }
    get canElevate() {
        return this._canElevate;
    }
    get canChangePrivacy() {
        return this._privacyOptions.length > 0;
    }
    get privacyOptions() {
        return this._privacyOptions;
    }
    get tunnels() {
        return this.getTunnels();
    }
    async getTunnels() {
        const tunnels = [];
        const tunnelArray = Array.from(this._tunnels.values());
        for (const portMap of tunnelArray) {
            const portArray = Array.from(portMap.values());
            for (const x of portArray) {
                const tunnelValue = await x.value;
                if (tunnelValue) {
                    tunnels.push(tunnelValue);
                }
            }
        }
        return tunnels;
    }
    async dispose() {
        for (const portMap of this._tunnels.values()) {
            for (const { value } of portMap.values()) {
                await value.then(tunnel => tunnel?.dispose());
            }
            portMap.clear();
        }
        this._tunnels.clear();
    }
    setEnvironmentTunnel(remoteHost, remotePort, localAddress, privacy, protocol) {
        this.addTunnelToMap(remoteHost, remotePort, Promise.resolve({
            tunnelRemoteHost: remoteHost,
            tunnelRemotePort: remotePort,
            localAddress,
            privacy,
            protocol,
            dispose: () => Promise.resolve()
        }));
    }
    async getExistingTunnel(remoteHost, remotePort) {
        if (isAllInterfaces(remoteHost) || isLocalhost(remoteHost)) {
            remoteHost = LOCALHOST_ADDRESSES[0];
        }
        const existing = this.getTunnelFromMap(remoteHost, remotePort);
        if (existing) {
            ++existing.refcount;
            return existing.value;
        }
        return undefined;
    }
    openTunnel(addressProvider, remoteHost, remotePort, localPort, elevateIfNeeded = false, privacy, protocol) {
        this.logService.trace(`ForwardedPorts: (TunnelService) openTunnel request for ${remoteHost}:${remotePort} on local port ${localPort}.`);
        if (!addressProvider) {
            return undefined;
        }
        if (!remoteHost) {
            remoteHost = 'localhost';
        }
        // Prevent tunnel factories from calling openTunnel from within the factory
        if (this._tunnelProvider && this._factoryInProgress.has(remotePort)) {
            this.logService.debug(`ForwardedPorts: (TunnelService) Another call to create a tunnel with the same address has occurred before the last one completed. This call will be ignored.`);
            return;
        }
        const resolvedTunnel = this.retainOrCreateTunnel(addressProvider, remoteHost, remotePort, localPort, elevateIfNeeded, privacy, protocol);
        if (!resolvedTunnel) {
            this.logService.trace(`ForwardedPorts: (TunnelService) Tunnel was not created.`);
            return resolvedTunnel;
        }
        return resolvedTunnel.then(tunnel => {
            if (!tunnel) {
                this.logService.trace('ForwardedPorts: (TunnelService) New tunnel is undefined.');
                this.removeEmptyTunnelFromMap(remoteHost, remotePort);
                return undefined;
            }
            this.logService.trace('ForwardedPorts: (TunnelService) New tunnel established.');
            const newTunnel = this.makeTunnel(tunnel);
            if (tunnel.tunnelRemoteHost !== remoteHost || tunnel.tunnelRemotePort !== remotePort) {
                this.logService.warn('ForwardedPorts: (TunnelService) Created tunnel does not match requirements of requested tunnel. Host or port mismatch.');
            }
            this._onTunnelOpened.fire(newTunnel);
            return newTunnel;
        });
    }
    makeTunnel(tunnel) {
        return {
            tunnelRemotePort: tunnel.tunnelRemotePort,
            tunnelRemoteHost: tunnel.tunnelRemoteHost,
            tunnelLocalPort: tunnel.tunnelLocalPort,
            localAddress: tunnel.localAddress,
            privacy: tunnel.privacy,
            protocol: tunnel.protocol,
            dispose: async () => {
                this.logService.trace(`ForwardedPorts: (TunnelService) dispose request for ${tunnel.tunnelRemoteHost}:${tunnel.tunnelRemotePort} `);
                const existingHost = this._tunnels.get(tunnel.tunnelRemoteHost);
                if (existingHost) {
                    const existing = existingHost.get(tunnel.tunnelRemotePort);
                    if (existing) {
                        existing.refcount--;
                        await this.tryDisposeTunnel(tunnel.tunnelRemoteHost, tunnel.tunnelRemotePort, existing);
                    }
                }
            }
        };
    }
    async tryDisposeTunnel(remoteHost, remotePort, tunnel) {
        if (tunnel.refcount <= 0) {
            this.logService.trace(`ForwardedPorts: (TunnelService) Tunnel is being disposed ${remoteHost}:${remotePort}.`);
            const disposePromise = tunnel.value.then(async (tunnel) => {
                if (tunnel) {
                    await tunnel.dispose(true);
                    this._onTunnelClosed.fire({ host: tunnel.tunnelRemoteHost, port: tunnel.tunnelRemotePort });
                }
            });
            if (this._tunnels.has(remoteHost)) {
                this._tunnels.get(remoteHost).delete(remotePort);
            }
            return disposePromise;
        }
    }
    async closeTunnel(remoteHost, remotePort) {
        this.logService.trace(`ForwardedPorts: (TunnelService) close request for ${remoteHost}:${remotePort} `);
        const portMap = this._tunnels.get(remoteHost);
        if (portMap && portMap.has(remotePort)) {
            const value = portMap.get(remotePort);
            value.refcount = 0;
            await this.tryDisposeTunnel(remoteHost, remotePort, value);
        }
    }
    addTunnelToMap(remoteHost, remotePort, tunnel) {
        if (!this._tunnels.has(remoteHost)) {
            this._tunnels.set(remoteHost, new Map());
        }
        this._tunnels.get(remoteHost).set(remotePort, { refcount: 1, value: tunnel });
    }
    async removeEmptyTunnelFromMap(remoteHost, remotePort) {
        const hostMap = this._tunnels.get(remoteHost);
        if (hostMap) {
            const tunnel = hostMap.get(remotePort);
            const tunnelResult = await tunnel;
            if (!tunnelResult) {
                hostMap.delete(remotePort);
            }
            if (hostMap.size === 0) {
                this._tunnels.delete(remoteHost);
            }
        }
    }
    getTunnelFromMap(remoteHost, remotePort) {
        const hosts = [remoteHost];
        // Order matters. We want the original host to be first.
        if (isLocalhost(remoteHost)) {
            hosts.push(...LOCALHOST_ADDRESSES);
            // For localhost, we add the all interfaces hosts because if the tunnel is already available at all interfaces,
            // then of course it is available at localhost.
            hosts.push(...ALL_INTERFACES_ADDRESSES);
        }
        else if (isAllInterfaces(remoteHost)) {
            hosts.push(...ALL_INTERFACES_ADDRESSES);
        }
        const existingPortMaps = hosts.map(host => this._tunnels.get(host));
        for (const map of existingPortMaps) {
            const existingTunnel = map?.get(remotePort);
            if (existingTunnel) {
                return existingTunnel;
            }
        }
        return undefined;
    }
    canTunnel(uri) {
        return !!extractLocalHostUriMetaDataForPortMapping(uri);
    }
    createWithProvider(tunnelProvider, remoteHost, remotePort, localPort, elevateIfNeeded, privacy, protocol) {
        this.logService.trace(`ForwardedPorts: (TunnelService) Creating tunnel with provider ${remoteHost}:${remotePort} on local port ${localPort}.`);
        const key = remotePort;
        this._factoryInProgress.add(key);
        const preferredLocalPort = localPort === undefined ? remotePort : localPort;
        const creationInfo = { elevationRequired: elevateIfNeeded ? this.isPortPrivileged(preferredLocalPort) : false };
        const tunnelOptions = { remoteAddress: { host: remoteHost, port: remotePort }, localAddressPort: localPort, privacy, public: privacy ? (privacy !== TunnelPrivacyId.Private) : undefined, protocol };
        const tunnel = tunnelProvider.forwardPort(tunnelOptions, creationInfo);
        if (tunnel) {
            this.addTunnelToMap(remoteHost, remotePort, tunnel);
            tunnel.finally(() => {
                this.logService.trace('ForwardedPorts: (TunnelService) Tunnel created by provider.');
                this._factoryInProgress.delete(key);
            });
        }
        else {
            this._factoryInProgress.delete(key);
        }
        return tunnel;
    }
};
AbstractTunnelService = __decorate([
    __param(0, ILogService),
    __param(1, IConfigurationService)
], AbstractTunnelService);
export { AbstractTunnelService };

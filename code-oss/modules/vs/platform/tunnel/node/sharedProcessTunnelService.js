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
import { ILogService } from 'vs/platform/log/common/log';
import { ISharedTunnelsService } from 'vs/platform/tunnel/common/tunnel';
import { Disposable } from 'vs/base/common/lifecycle';
import { canceled } from 'vs/base/common/errors';
import { DeferredPromise } from 'vs/base/common/async';
class TunnelData extends Disposable {
    _address;
    _addressPromise;
    constructor() {
        super();
        this._address = null;
        this._addressPromise = null;
    }
    async getAddress() {
        if (this._address) {
            // address is resolved
            return this._address;
        }
        if (!this._addressPromise) {
            this._addressPromise = new DeferredPromise();
        }
        return this._addressPromise.p;
    }
    setAddress(address) {
        this._address = address;
        if (this._addressPromise) {
            this._addressPromise.complete(address);
            this._addressPromise = null;
        }
    }
    setTunnel(tunnel) {
        this._register(tunnel);
    }
}
let SharedProcessTunnelService = class SharedProcessTunnelService extends Disposable {
    _tunnelService;
    _logService;
    _serviceBrand;
    static _lastId = 0;
    _tunnels = new Map();
    _disposedTunnels = new Set();
    constructor(_tunnelService, _logService) {
        super();
        this._tunnelService = _tunnelService;
        this._logService = _logService;
    }
    dispose() {
        super.dispose();
        this._tunnels.forEach((tunnel) => tunnel.dispose());
    }
    async createTunnel() {
        const id = String(++SharedProcessTunnelService._lastId);
        return { id };
    }
    async startTunnel(authority, id, tunnelRemoteHost, tunnelRemotePort, tunnelLocalPort, elevateIfNeeded) {
        const tunnelData = new TunnelData();
        const tunnel = await Promise.resolve(this._tunnelService.openTunnel(authority, tunnelData, tunnelRemoteHost, tunnelRemotePort, tunnelLocalPort, elevateIfNeeded));
        if (!tunnel) {
            this._logService.info(`[SharedProcessTunnelService] Could not create a tunnel to ${tunnelRemoteHost}:${tunnelRemotePort} (remote).`);
            tunnelData.dispose();
            throw new Error(`Could not create tunnel`);
        }
        if (this._disposedTunnels.has(id)) {
            // This tunnel was disposed in the meantime
            this._disposedTunnels.delete(id);
            tunnelData.dispose();
            await tunnel.dispose();
            throw canceled();
        }
        tunnelData.setTunnel(tunnel);
        this._tunnels.set(id, tunnelData);
        this._logService.info(`[SharedProcessTunnelService] Created tunnel ${id}: ${tunnel.localAddress} (local) to ${tunnelRemoteHost}:${tunnelRemotePort} (remote).`);
        const result = {
            tunnelLocalPort: tunnel.tunnelLocalPort,
            localAddress: tunnel.localAddress
        };
        return result;
    }
    async setAddress(id, address) {
        const tunnel = this._tunnels.get(id);
        if (!tunnel) {
            return;
        }
        tunnel.setAddress(address);
    }
    async destroyTunnel(id) {
        const tunnel = this._tunnels.get(id);
        if (tunnel) {
            this._logService.info(`[SharedProcessTunnelService] Disposing tunnel ${id}.`);
            this._tunnels.delete(id);
            await tunnel.dispose();
            return;
        }
        // Looks like this tunnel is still starting, mark the id as disposed
        this._disposedTunnels.add(id);
    }
};
SharedProcessTunnelService = __decorate([
    __param(0, ISharedTunnelsService),
    __param(1, ILogService)
], SharedProcessTunnelService);
export { SharedProcessTunnelService };

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
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { TunnelPrivacyId } from 'vs/platform/tunnel/common/tunnel';
import { Emitter } from 'vs/base/common/event';
import { IExtHostRpcService } from 'vs/workbench/api/common/extHostRpcService';
export var TunnelDtoConverter;
(function (TunnelDtoConverter) {
    function fromApiTunnel(tunnel) {
        return {
            remoteAddress: tunnel.remoteAddress,
            localAddress: tunnel.localAddress,
            public: !!tunnel.public,
            privacy: tunnel.privacy ?? (tunnel.public ? TunnelPrivacyId.Public : TunnelPrivacyId.Private),
            protocol: tunnel.protocol
        };
    }
    TunnelDtoConverter.fromApiTunnel = fromApiTunnel;
    function fromServiceTunnel(tunnel) {
        return {
            remoteAddress: {
                host: tunnel.tunnelRemoteHost,
                port: tunnel.tunnelRemotePort
            },
            localAddress: tunnel.localAddress,
            public: tunnel.privacy !== TunnelPrivacyId.ConstantPrivate && tunnel.privacy !== TunnelPrivacyId.ConstantPrivate,
            privacy: tunnel.privacy,
            protocol: tunnel.protocol
        };
    }
    TunnelDtoConverter.fromServiceTunnel = fromServiceTunnel;
})(TunnelDtoConverter || (TunnelDtoConverter = {}));
export const IExtHostTunnelService = createDecorator('IExtHostTunnelService');
let ExtHostTunnelService = class ExtHostTunnelService {
    onDidChangeTunnels = (new Emitter()).event;
    constructor(extHostRpc) {
    }
    async $applyCandidateFilter(candidates) {
        return candidates;
    }
    async openTunnel(extension, forward) {
        return undefined;
    }
    async getTunnels() {
        return [];
    }
    async setTunnelFactory(provider) {
        return { dispose: () => { } };
    }
    registerPortsAttributesProvider(portSelector, provider) {
        return { dispose: () => { } };
    }
    async $providePortAttributes(handles, ports, pid, commandline, cancellationToken) {
        return [];
    }
    async $forwardPort(tunnelOptions, tunnelCreationOptions) { return undefined; }
    async $closeTunnel(remote) { }
    async $onDidTunnelsChange() { }
    async $registerCandidateFinder() { }
};
ExtHostTunnelService = __decorate([
    __param(0, IExtHostRpcService)
], ExtHostTunnelService);
export { ExtHostTunnelService };

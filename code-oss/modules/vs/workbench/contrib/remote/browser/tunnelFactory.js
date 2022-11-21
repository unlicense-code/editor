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
import * as nls from 'vs/nls';
import { ITunnelService, TunnelProtocol, TunnelPrivacyId } from 'vs/platform/tunnel/common/tunnel';
import { Disposable } from 'vs/base/common/lifecycle';
import { IBrowserWorkbenchEnvironmentService } from 'vs/workbench/services/environment/browser/environmentService';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { URI } from 'vs/base/common/uri';
import { IRemoteExplorerService } from 'vs/workbench/services/remote/common/remoteExplorerService';
import { ILogService } from 'vs/platform/log/common/log';
let TunnelFactoryContribution = class TunnelFactoryContribution extends Disposable {
    openerService;
    constructor(tunnelService, environmentService, openerService, remoteExplorerService, logService) {
        super();
        this.openerService = openerService;
        const tunnelFactory = environmentService.options?.tunnelProvider?.tunnelFactory;
        if (tunnelFactory) {
            let privacyOptions = environmentService.options?.tunnelProvider?.features?.privacyOptions ?? [];
            if (environmentService.options?.tunnelProvider?.features?.public
                && (privacyOptions.length === 0)) {
                privacyOptions = [
                    {
                        id: 'private',
                        label: nls.localize('tunnelPrivacy.private', "Private"),
                        themeIcon: 'lock'
                    },
                    {
                        id: 'public',
                        label: nls.localize('tunnelPrivacy.public', "Public"),
                        themeIcon: 'eye'
                    }
                ];
            }
            this._register(tunnelService.setTunnelProvider({
                forwardPort: async (tunnelOptions, tunnelCreationOptions) => {
                    let tunnelPromise;
                    try {
                        tunnelPromise = tunnelFactory(tunnelOptions, tunnelCreationOptions);
                    }
                    catch (e) {
                        logService.trace('tunnelFactory: tunnel provider error');
                    }
                    if (!tunnelPromise) {
                        return undefined;
                    }
                    let tunnel;
                    try {
                        tunnel = await tunnelPromise;
                    }
                    catch (e) {
                        logService.trace('tunnelFactory: tunnel provider promise error');
                        return undefined;
                    }
                    const localAddress = tunnel.localAddress.startsWith('http') ? tunnel.localAddress : `http://${tunnel.localAddress}`;
                    const remoteTunnel = {
                        tunnelRemotePort: tunnel.remoteAddress.port,
                        tunnelRemoteHost: tunnel.remoteAddress.host,
                        // The tunnel factory may give us an inaccessible local address.
                        // To make sure this doesn't happen, resolve the uri immediately.
                        localAddress: await this.resolveExternalUri(localAddress),
                        privacy: tunnel.privacy ?? (tunnel.public ? TunnelPrivacyId.Public : TunnelPrivacyId.Private),
                        protocol: tunnel.protocol ?? TunnelProtocol.Http,
                        dispose: async () => { await tunnel.dispose(); }
                    };
                    return remoteTunnel;
                }
            }));
            const tunnelInformation = environmentService.options?.tunnelProvider?.features ?
                {
                    features: {
                        elevation: !!environmentService.options?.tunnelProvider?.features?.elevation,
                        public: !!environmentService.options?.tunnelProvider?.features?.public,
                        privacyOptions
                    }
                } : undefined;
            remoteExplorerService.setTunnelInformation(tunnelInformation);
        }
    }
    async resolveExternalUri(uri) {
        try {
            return (await this.openerService.resolveExternalUri(URI.parse(uri))).resolved.toString();
        }
        catch {
            return uri;
        }
    }
};
TunnelFactoryContribution = __decorate([
    __param(0, ITunnelService),
    __param(1, IBrowserWorkbenchEnvironmentService),
    __param(2, IOpenerService),
    __param(3, IRemoteExplorerService),
    __param(4, ILogService)
], TunnelFactoryContribution);
export { TunnelFactoryContribution };

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
import { MainContext, ExtHostContext, CandidatePortSource } from 'vs/workbench/api/common/extHost.protocol';
import { TunnelDtoConverter } from 'vs/workbench/api/common/extHostTunnelService';
import { extHostNamedCustomer } from 'vs/workbench/services/extensions/common/extHostCustomers';
import { IRemoteExplorerService, makeAddress, PORT_AUTO_FORWARD_SETTING, PORT_AUTO_SOURCE_SETTING, PORT_AUTO_SOURCE_SETTING_OUTPUT, PORT_AUTO_SOURCE_SETTING_PROCESS, TunnelSource } from 'vs/workbench/services/remote/common/remoteExplorerService';
import { ITunnelService, TunnelProtocol } from 'vs/platform/tunnel/common/tunnel';
import { Disposable } from 'vs/base/common/lifecycle';
import { INotificationService, Severity } from 'vs/platform/notification/common/notification';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { ILogService } from 'vs/platform/log/common/log';
import { IRemoteAgentService } from 'vs/workbench/services/remote/common/remoteAgentService';
import { Registry } from 'vs/platform/registry/common/platform';
import { Extensions as ConfigurationExtensions } from 'vs/platform/configuration/common/configurationRegistry';
let MainThreadTunnelService = class MainThreadTunnelService extends Disposable {
    remoteExplorerService;
    tunnelService;
    notificationService;
    configurationService;
    logService;
    remoteAgentService;
    _proxy;
    elevateionRetry = false;
    portsAttributesProviders = new Map();
    constructor(extHostContext, remoteExplorerService, tunnelService, notificationService, configurationService, logService, remoteAgentService) {
        super();
        this.remoteExplorerService = remoteExplorerService;
        this.tunnelService = tunnelService;
        this.notificationService = notificationService;
        this.configurationService = configurationService;
        this.logService = logService;
        this.remoteAgentService = remoteAgentService;
        this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostTunnelService);
        this._register(tunnelService.onTunnelOpened(() => this._proxy.$onDidTunnelsChange()));
        this._register(tunnelService.onTunnelClosed(() => this._proxy.$onDidTunnelsChange()));
    }
    processFindingEnabled() {
        return (!!this.configurationService.getValue(PORT_AUTO_FORWARD_SETTING) || this.tunnelService.hasTunnelProvider)
            && (this.configurationService.getValue(PORT_AUTO_SOURCE_SETTING) === PORT_AUTO_SOURCE_SETTING_PROCESS);
    }
    async $setRemoteTunnelService(processId) {
        this.remoteExplorerService.namedProcesses.set(processId, 'Code Extension Host');
        if (this.remoteExplorerService.portsFeaturesEnabled) {
            this._proxy.$registerCandidateFinder(this.processFindingEnabled());
        }
        else {
            this._register(this.remoteExplorerService.onEnabledPortsFeatures(() => this._proxy.$registerCandidateFinder(this.configurationService.getValue(PORT_AUTO_FORWARD_SETTING))));
        }
        this._register(this.configurationService.onDidChangeConfiguration(async (e) => {
            if (e.affectsConfiguration(PORT_AUTO_FORWARD_SETTING) || e.affectsConfiguration(PORT_AUTO_SOURCE_SETTING)) {
                return this._proxy.$registerCandidateFinder(this.processFindingEnabled());
            }
        }));
        this._register(this.tunnelService.onAddedTunnelProvider(() => {
            return this._proxy.$registerCandidateFinder(this.processFindingEnabled());
        }));
    }
    _alreadyRegistered = false;
    async $registerPortsAttributesProvider(selector, providerHandle) {
        this.portsAttributesProviders.set(providerHandle, selector);
        if (!this._alreadyRegistered) {
            this.remoteExplorerService.tunnelModel.addAttributesProvider(this);
            this._alreadyRegistered = true;
        }
    }
    async $unregisterPortsAttributesProvider(providerHandle) {
        this.portsAttributesProviders.delete(providerHandle);
    }
    async providePortAttributes(ports, pid, commandLine, token) {
        if (this.portsAttributesProviders.size === 0) {
            return [];
        }
        // Check all the selectors to make sure it's worth going to the extension host.
        const appropriateHandles = Array.from(this.portsAttributesProviders.entries()).filter(entry => {
            const selector = entry[1];
            const portRange = selector.portRange;
            const portInRange = portRange ? ports.some(port => portRange[0] <= port && port < portRange[1]) : true;
            const pidMatches = !selector.pid || (selector.pid === pid);
            const commandMatches = !selector.commandMatcher || (commandLine && (commandLine.match(selector.commandMatcher)));
            return portInRange && pidMatches && commandMatches;
        }).map(entry => entry[0]);
        if (appropriateHandles.length === 0) {
            return [];
        }
        return this._proxy.$providePortAttributes(appropriateHandles, ports, pid, commandLine, token);
    }
    async $openTunnel(tunnelOptions, source) {
        const tunnel = await this.remoteExplorerService.forward({
            remote: tunnelOptions.remoteAddress,
            local: tunnelOptions.localAddressPort,
            name: tunnelOptions.label,
            source: {
                source: TunnelSource.Extension,
                description: source
            },
            elevateIfNeeded: false
        });
        if (tunnel) {
            if (!this.elevateionRetry
                && (tunnelOptions.localAddressPort !== undefined)
                && (tunnel.tunnelLocalPort !== undefined)
                && this.tunnelService.isPortPrivileged(tunnelOptions.localAddressPort)
                && (tunnel.tunnelLocalPort !== tunnelOptions.localAddressPort)
                && this.tunnelService.canElevate) {
                this.elevationPrompt(tunnelOptions, tunnel, source);
            }
            return TunnelDtoConverter.fromServiceTunnel(tunnel);
        }
        return undefined;
    }
    async elevationPrompt(tunnelOptions, tunnel, source) {
        return this.notificationService.prompt(Severity.Info, nls.localize('remote.tunnel.openTunnel', "The extension {0} has forwarded port {1}. You'll need to run as superuser to use port {2} locally.", source, tunnelOptions.remoteAddress.port, tunnelOptions.localAddressPort), [{
                label: nls.localize('remote.tunnelsView.elevationButton', "Use Port {0} as Sudo...", tunnel.tunnelRemotePort),
                run: async () => {
                    this.elevateionRetry = true;
                    await this.remoteExplorerService.close({ host: tunnel.tunnelRemoteHost, port: tunnel.tunnelRemotePort });
                    await this.remoteExplorerService.forward({
                        remote: tunnelOptions.remoteAddress,
                        local: tunnelOptions.localAddressPort,
                        name: tunnelOptions.label,
                        source: {
                            source: TunnelSource.Extension,
                            description: source
                        },
                        elevateIfNeeded: true
                    });
                    this.elevateionRetry = false;
                }
            }]);
    }
    async $closeTunnel(remote) {
        return this.remoteExplorerService.close(remote);
    }
    async $getTunnels() {
        return (await this.tunnelService.tunnels).map(tunnel => {
            return {
                remoteAddress: { port: tunnel.tunnelRemotePort, host: tunnel.tunnelRemoteHost },
                localAddress: tunnel.localAddress,
                privacy: tunnel.privacy,
                protocol: tunnel.protocol
            };
        });
    }
    async $onFoundNewCandidates(candidates) {
        this.remoteExplorerService.onFoundNewCandidates(candidates);
    }
    async $setTunnelProvider(features) {
        const tunnelProvider = {
            forwardPort: (tunnelOptions, tunnelCreationOptions) => {
                const forward = this._proxy.$forwardPort(tunnelOptions, tunnelCreationOptions);
                return forward.then(tunnel => {
                    this.logService.trace(`ForwardedPorts: (MainThreadTunnelService) New tunnel established by tunnel provider: ${tunnel?.remoteAddress.host}:${tunnel?.remoteAddress.port}`);
                    if (!tunnel) {
                        return undefined;
                    }
                    return {
                        tunnelRemotePort: tunnel.remoteAddress.port,
                        tunnelRemoteHost: tunnel.remoteAddress.host,
                        localAddress: typeof tunnel.localAddress === 'string' ? tunnel.localAddress : makeAddress(tunnel.localAddress.host, tunnel.localAddress.port),
                        tunnelLocalPort: typeof tunnel.localAddress !== 'string' ? tunnel.localAddress.port : undefined,
                        public: tunnel.public,
                        privacy: tunnel.privacy,
                        protocol: tunnel.protocol ?? TunnelProtocol.Http,
                        dispose: async (silent) => {
                            this.logService.trace(`ForwardedPorts: (MainThreadTunnelService) Closing tunnel from tunnel provider: ${tunnel?.remoteAddress.host}:${tunnel?.remoteAddress.port}`);
                            return this._proxy.$closeTunnel({ host: tunnel.remoteAddress.host, port: tunnel.remoteAddress.port }, silent);
                        }
                    };
                });
            }
        };
        this.tunnelService.setTunnelProvider(tunnelProvider);
        if (features) {
            this.tunnelService.setTunnelFeatures(features);
        }
    }
    async $setCandidateFilter() {
        this.remoteExplorerService.setCandidateFilter((candidates) => {
            return this._proxy.$applyCandidateFilter(candidates);
        });
    }
    async $setCandidatePortSource(source) {
        // Must wait for the remote environment before trying to set settings there.
        this.remoteAgentService.getEnvironment().then(() => {
            switch (source) {
                case CandidatePortSource.None: {
                    Registry.as(ConfigurationExtensions.Configuration)
                        .registerDefaultConfigurations([{ overrides: { 'remote.autoForwardPorts': false } }]);
                    break;
                }
                case CandidatePortSource.Output: {
                    Registry.as(ConfigurationExtensions.Configuration)
                        .registerDefaultConfigurations([{ overrides: { 'remote.autoForwardPortsSource': PORT_AUTO_SOURCE_SETTING_OUTPUT } }]);
                    break;
                }
                default: // Do nothing, the defaults for these settings should be used.
            }
        }).catch(() => {
            // The remote failed to get setup. Errors from that area will already be surfaced to the user.
        });
    }
};
MainThreadTunnelService = __decorate([
    extHostNamedCustomer(MainContext.MainThreadTunnelService),
    __param(1, IRemoteExplorerService),
    __param(2, ITunnelService),
    __param(3, INotificationService),
    __param(4, IConfigurationService),
    __param(5, ILogService),
    __param(6, IRemoteAgentService)
], MainThreadTunnelService);
export { MainThreadTunnelService };

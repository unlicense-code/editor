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
import { VSBuffer } from 'vs/base/common/buffer';
import { Emitter } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { Schemas } from 'vs/base/common/network';
import * as platform from 'vs/base/common/platform';
import { joinPath } from 'vs/base/common/resources';
import { localize } from 'vs/nls';
import { IExtensionHostDebugService } from 'vs/platform/debug/common/extensionHostDebug';
import { ILabelService } from 'vs/platform/label/common/label';
import { ILogService } from 'vs/platform/log/common/log';
import { IProductService } from 'vs/platform/product/common/productService';
import { Registry } from 'vs/platform/registry/common/platform';
import { connectRemoteAgentExtensionHost } from 'vs/platform/remote/common/remoteAgentConnection';
import { IRemoteAuthorityResolverService } from 'vs/platform/remote/common/remoteAuthorityResolver';
import { ISignService } from 'vs/platform/sign/common/sign';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { parseExtensionDevOptions } from 'vs/workbench/services/extensions/common/extensionDevOptions';
import { createMessageOfType, isMessageOfType, UIKind } from 'vs/workbench/services/extensions/common/extensionHostProtocol';
import { ExtensionHostExtensions, ExtensionHostLogFileName, remoteExtHostLog } from 'vs/workbench/services/extensions/common/extensions';
import { Extensions } from 'vs/workbench/services/output/common/output';
let RemoteExtensionHost = class RemoteExtensionHost extends Disposable {
    runningLocation;
    _initDataProvider;
    _socketFactory;
    _contextService;
    _environmentService;
    _telemetryService;
    _logService;
    _labelService;
    remoteAuthorityResolverService;
    _extensionHostDebugService;
    _productService;
    _signService;
    remoteAuthority;
    lazyStart = false;
    extensions = new ExtensionHostExtensions();
    _onExit = this._register(new Emitter());
    onExit = this._onExit.event;
    _protocol;
    _hasLostConnection;
    _terminating;
    _isExtensionDevHost;
    constructor(runningLocation, _initDataProvider, _socketFactory, _contextService, _environmentService, _telemetryService, _logService, _labelService, remoteAuthorityResolverService, _extensionHostDebugService, _productService, _signService) {
        super();
        this.runningLocation = runningLocation;
        this._initDataProvider = _initDataProvider;
        this._socketFactory = _socketFactory;
        this._contextService = _contextService;
        this._environmentService = _environmentService;
        this._telemetryService = _telemetryService;
        this._logService = _logService;
        this._labelService = _labelService;
        this.remoteAuthorityResolverService = remoteAuthorityResolverService;
        this._extensionHostDebugService = _extensionHostDebugService;
        this._productService = _productService;
        this._signService = _signService;
        this.remoteAuthority = this._initDataProvider.remoteAuthority;
        this._protocol = null;
        this._hasLostConnection = false;
        this._terminating = false;
        const devOpts = parseExtensionDevOptions(this._environmentService);
        this._isExtensionDevHost = devOpts.isExtensionDevHost;
    }
    start() {
        const options = {
            commit: this._productService.commit,
            quality: this._productService.quality,
            socketFactory: this._socketFactory,
            addressProvider: {
                getAddress: async () => {
                    const { authority } = await this.remoteAuthorityResolverService.resolveAuthority(this._initDataProvider.remoteAuthority);
                    return { host: authority.host, port: authority.port, connectionToken: authority.connectionToken };
                }
            },
            signService: this._signService,
            logService: this._logService,
            ipcLogger: null
        };
        return this.remoteAuthorityResolverService.resolveAuthority(this._initDataProvider.remoteAuthority).then((resolverResult) => {
            const startParams = {
                language: platform.language,
                debugId: this._environmentService.debugExtensionHost.debugId,
                break: this._environmentService.debugExtensionHost.break,
                port: this._environmentService.debugExtensionHost.port,
                env: { ...this._environmentService.debugExtensionHost.env, ...resolverResult.options?.extensionHostEnv },
            };
            const extDevLocs = this._environmentService.extensionDevelopmentLocationURI;
            let debugOk = true;
            if (extDevLocs && extDevLocs.length > 0) {
                // TODO@AW: handles only first path in array
                if (extDevLocs[0].scheme === Schemas.file) {
                    debugOk = false;
                }
            }
            if (!debugOk) {
                startParams.break = false;
            }
            return connectRemoteAgentExtensionHost(options, startParams).then(result => {
                this._register(result);
                const { protocol, debugPort, reconnectionToken } = result;
                const isExtensionDevelopmentDebug = typeof debugPort === 'number';
                if (debugOk && this._environmentService.isExtensionDevelopment && this._environmentService.debugExtensionHost.debugId && debugPort) {
                    this._extensionHostDebugService.attachSession(this._environmentService.debugExtensionHost.debugId, debugPort, this._initDataProvider.remoteAuthority);
                }
                protocol.onDidDispose(() => {
                    this._onExtHostConnectionLost(reconnectionToken);
                });
                protocol.onSocketClose(() => {
                    if (this._isExtensionDevHost) {
                        this._onExtHostConnectionLost(reconnectionToken);
                    }
                });
                // 1) wait for the incoming `ready` event and send the initialization data.
                // 2) wait for the incoming `initialized` event.
                return new Promise((resolve, reject) => {
                    const handle = setTimeout(() => {
                        reject('The remote extenion host took longer than 60s to send its ready message.');
                    }, 60 * 1000);
                    let logFile;
                    const disposable = protocol.onMessage(msg => {
                        if (isMessageOfType(msg, 1 /* MessageType.Ready */)) {
                            // 1) Extension Host is ready to receive messages, initialize it
                            this._createExtHostInitData(isExtensionDevelopmentDebug).then(data => {
                                logFile = data.logFile;
                                protocol.send(VSBuffer.fromString(JSON.stringify(data)));
                            });
                            return;
                        }
                        if (isMessageOfType(msg, 0 /* MessageType.Initialized */)) {
                            // 2) Extension Host is initialized
                            clearTimeout(handle);
                            // stop listening for messages here
                            disposable.dispose();
                            // Register log channel for remote exthost log
                            Registry.as(Extensions.OutputChannels).registerChannel({ id: remoteExtHostLog, label: localize('remote extension host Log', "Remote Extension Host"), file: logFile, log: true });
                            // release this promise
                            this._protocol = protocol;
                            resolve(protocol);
                            return;
                        }
                        console.error(`received unexpected message during handshake phase from the extension host: `, msg);
                    });
                });
            });
        });
    }
    _onExtHostConnectionLost(reconnectionToken) {
        if (this._hasLostConnection) {
            // avoid re-entering this method
            return;
        }
        this._hasLostConnection = true;
        if (this._isExtensionDevHost && this._environmentService.debugExtensionHost.debugId) {
            this._extensionHostDebugService.close(this._environmentService.debugExtensionHost.debugId);
        }
        if (this._terminating) {
            // Expected termination path (we asked the process to terminate)
            return;
        }
        this._onExit.fire([0, reconnectionToken]);
    }
    async _createExtHostInitData(isExtensionDevelopmentDebug) {
        const [telemetryInfo, remoteInitData] = await Promise.all([this._telemetryService.getTelemetryInfo(), this._initDataProvider.getInitData()]);
        const workspace = this._contextService.getWorkspace();
        const deltaExtensions = this.extensions.set(remoteInitData.allExtensions, remoteInitData.myExtensions);
        return {
            commit: this._productService.commit,
            version: this._productService.version,
            parentPid: remoteInitData.pid,
            environment: {
                isExtensionDevelopmentDebug,
                appRoot: remoteInitData.appRoot,
                appName: this._productService.nameLong,
                appHost: this._productService.embedderIdentifier || 'desktop',
                appUriScheme: this._productService.urlProtocol,
                extensionTelemetryLogResource: this._environmentService.extHostTelemetryLogFile,
                appLanguage: platform.language,
                extensionDevelopmentLocationURI: this._environmentService.extensionDevelopmentLocationURI,
                extensionTestsLocationURI: this._environmentService.extensionTestsLocationURI,
                globalStorageHome: remoteInitData.globalStorageHome,
                workspaceStorageHome: remoteInitData.workspaceStorageHome,
                extensionLogLevel: this._environmentService.extensionLogLevel
            },
            workspace: this._contextService.getWorkbenchState() === 1 /* WorkbenchState.EMPTY */ ? null : {
                configuration: workspace.configuration,
                id: workspace.id,
                name: this._labelService.getWorkspaceLabel(workspace),
                transient: workspace.transient
            },
            remote: {
                isRemote: true,
                authority: this._initDataProvider.remoteAuthority,
                connectionData: remoteInitData.connectionData
            },
            consoleForward: {
                includeStack: false,
                logNative: Boolean(this._environmentService.debugExtensionHost.debugId)
            },
            allExtensions: deltaExtensions.toAdd,
            myExtensions: deltaExtensions.myToAdd,
            telemetryInfo,
            logLevel: this._logService.getLevel(),
            logsLocation: remoteInitData.extensionHostLogsPath,
            logFile: joinPath(remoteInitData.extensionHostLogsPath, `${ExtensionHostLogFileName}.log`),
            autoStart: true,
            uiKind: platform.isWeb ? UIKind.Web : UIKind.Desktop
        };
    }
    getInspectPort() {
        return undefined;
    }
    enableInspectPort() {
        return Promise.resolve(false);
    }
    dispose() {
        super.dispose();
        this._terminating = true;
        if (this._protocol) {
            // Send the extension host a request to terminate itself
            // (graceful termination)
            // setTimeout(() => {
            // console.log(`SENDING TERMINATE TO REMOTE EXT HOST!`);
            const socket = this._protocol.getSocket();
            this._protocol.send(createMessageOfType(2 /* MessageType.Terminate */));
            this._protocol.sendDisconnect();
            this._protocol.dispose();
            // this._protocol.drain();
            socket.end();
            this._protocol = null;
            // }, 1000);
        }
    }
};
RemoteExtensionHost = __decorate([
    __param(3, IWorkspaceContextService),
    __param(4, IWorkbenchEnvironmentService),
    __param(5, ITelemetryService),
    __param(6, ILogService),
    __param(7, ILabelService),
    __param(8, IRemoteAuthorityResolverService),
    __param(9, IExtensionHostDebugService),
    __param(10, IProductService),
    __param(11, ISignService)
], RemoteExtensionHost);
export { RemoteExtensionHost };

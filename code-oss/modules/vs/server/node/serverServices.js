/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { hostname, release } from 'os';
import { Emitter } from 'vs/base/common/event';
import { toDisposable } from 'vs/base/common/lifecycle';
import { Schemas } from 'vs/base/common/network';
import * as path from 'vs/base/common/path';
import { getMachineId } from 'vs/base/node/id';
import { Promises } from 'vs/base/node/pfs';
import { IPCServer, ProxyChannel, StaticRouter } from 'vs/base/parts/ipc/common/ipc';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { ConfigurationService } from 'vs/platform/configuration/common/configurationService';
import { ICredentialsMainService } from 'vs/platform/credentials/common/credentials';
import { CredentialsWebMainService } from 'vs/platform/credentials/node/credentialsMainService';
import { ExtensionHostDebugBroadcastChannel } from 'vs/platform/debug/common/extensionHostDebugIpc';
import { IDownloadService } from 'vs/platform/download/common/download';
import { DownloadServiceChannelClient } from 'vs/platform/download/common/downloadIpc';
import { IEncryptionMainService } from 'vs/platform/encryption/common/encryptionService';
import { EncryptionMainService } from 'vs/platform/encryption/node/encryptionMainService';
import { IEnvironmentService, INativeEnvironmentService } from 'vs/platform/environment/common/environment';
import { ExtensionGalleryServiceWithNoStorageService } from 'vs/platform/extensionManagement/common/extensionGalleryService';
import { IExtensionGalleryService } from 'vs/platform/extensionManagement/common/extensionManagement';
import { ExtensionSignatureVerificationService, IExtensionSignatureVerificationService } from 'vs/platform/extensionManagement/node/extensionSignatureVerificationService';
import { ExtensionManagementCLI } from 'vs/platform/extensionManagement/common/extensionManagementCLI';
import { ExtensionManagementChannel } from 'vs/platform/extensionManagement/common/extensionManagementIpc';
import { ExtensionManagementService, INativeServerExtensionManagementService } from 'vs/platform/extensionManagement/node/extensionManagementService';
import { IFileService } from 'vs/platform/files/common/files';
import { FileService } from 'vs/platform/files/common/fileService';
import { DiskFileSystemProvider } from 'vs/platform/files/node/diskFileSystemProvider';
import { SyncDescriptor } from 'vs/platform/instantiation/common/descriptors';
import { InstantiationService } from 'vs/platform/instantiation/common/instantiationService';
import { ServiceCollection } from 'vs/platform/instantiation/common/serviceCollection';
import { ILanguagePackService } from 'vs/platform/languagePacks/common/languagePacks';
import { NativeLanguagePackService } from 'vs/platform/languagePacks/node/languagePacks';
import { AbstractLogger, DEFAULT_LOG_LEVEL, getLogLevel, ILogService, LogLevel, MultiplexLogService } from 'vs/platform/log/common/log';
import { LogLevelChannel } from 'vs/platform/log/common/logIpc';
import product from 'vs/platform/product/common/product';
import { IProductService } from 'vs/platform/product/common/productService';
import { IRequestService } from 'vs/platform/request/common/request';
import { RequestChannel } from 'vs/platform/request/common/requestIpc';
import { RequestService } from 'vs/platform/request/node/requestService';
import { resolveCommonProperties } from 'vs/platform/telemetry/common/commonProperties';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { getPiiPathsFromEnvironment, isInternalTelemetry, NullAppender, supportsTelemetry } from 'vs/platform/telemetry/common/telemetryUtils';
import ErrorTelemetry from 'vs/platform/telemetry/node/errorTelemetry';
import { IPtyService } from 'vs/platform/terminal/common/terminal';
import { PtyHostService } from 'vs/platform/terminal/node/ptyHostService';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
import { UriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentityService';
import { RemoteAgentEnvironmentChannel } from 'vs/server/node/remoteAgentEnvironmentImpl';
import { RemoteAgentFileSystemProviderChannel } from 'vs/server/node/remoteFileSystemProviderServer';
import { ServerTelemetryChannel } from 'vs/platform/telemetry/common/remoteTelemetryChannel';
import { IServerTelemetryService, ServerNullTelemetryService, ServerTelemetryService } from 'vs/platform/telemetry/common/serverTelemetryService';
import { RemoteTerminalChannel } from 'vs/server/node/remoteTerminalChannel';
import { createURITransformer } from 'vs/workbench/api/node/uriTransformer';
import { ServerEnvironmentService } from 'vs/server/node/serverEnvironmentService';
import { REMOTE_TERMINAL_CHANNEL_NAME } from 'vs/workbench/contrib/terminal/common/remoteTerminalChannel';
import { RemoteExtensionLogFileName } from 'vs/workbench/services/remote/common/remoteAgentService';
import { REMOTE_FILE_SYSTEM_CHANNEL_NAME } from 'vs/workbench/services/remote/common/remoteFileSystemProviderClient';
import { ExtensionHostStatusService, IExtensionHostStatusService } from 'vs/server/node/extensionHostStatusService';
import { IExtensionsScannerService } from 'vs/platform/extensionManagement/common/extensionsScannerService';
import { ExtensionsScannerService } from 'vs/server/node/extensionsScannerService';
import { ExtensionsProfileScannerService, IExtensionsProfileScannerService } from 'vs/platform/extensionManagement/common/extensionsProfileScannerService';
import { IUserDataProfilesService, UserDataProfilesService } from 'vs/platform/userDataProfile/common/userDataProfile';
import { NullPolicyService } from 'vs/platform/policy/common/policy';
import { OneDataSystemAppender } from 'vs/platform/telemetry/node/1dsAppender';
import { LoggerService } from 'vs/platform/log/node/loggerService';
import { URI } from 'vs/base/common/uri';
import { BufferLogService } from 'vs/platform/log/common/bufferLog';
const eventPrefix = 'monacoworkbench';
export async function setupServerServices(connectionToken, args, REMOTE_DATA_FOLDER, disposables) {
    const services = new ServiceCollection();
    const socketServer = new SocketServer();
    const productService = { _serviceBrand: undefined, ...product };
    services.set(IProductService, productService);
    const environmentService = new ServerEnvironmentService(args, productService);
    services.set(IEnvironmentService, environmentService);
    services.set(INativeEnvironmentService, environmentService);
    const bufferLogService = new BufferLogService();
    const logService = new MultiplexLogService([new ServerLogService(getLogLevel(environmentService)), bufferLogService]);
    services.set(ILogService, logService);
    setTimeout(() => cleanupOlderLogs(environmentService.logsPath).then(null, err => logService.error(err)), 10000);
    const loggerService = new LoggerService(logService);
    bufferLogService.logger = loggerService.createLogger(URI.file(path.join(environmentService.logsPath, `${RemoteExtensionLogFileName}.log`)), { name: RemoteExtensionLogFileName });
    logService.trace(`Remote configuration data at ${REMOTE_DATA_FOLDER}`);
    logService.trace('process arguments:', environmentService.args);
    if (Array.isArray(productService.serverGreeting)) {
        logService.info(`\n\n${productService.serverGreeting.join('\n')}\n\n`);
    }
    // ExtensionHost Debug broadcast service
    socketServer.registerChannel(ExtensionHostDebugBroadcastChannel.ChannelName, new ExtensionHostDebugBroadcastChannel());
    // TODO: @Sandy @Joao need dynamic context based router
    const router = new StaticRouter(ctx => ctx.clientId === 'renderer');
    socketServer.registerChannel('logger', new LogLevelChannel(logService, loggerService));
    // Files
    const fileService = disposables.add(new FileService(logService));
    services.set(IFileService, fileService);
    fileService.registerProvider(Schemas.file, disposables.add(new DiskFileSystemProvider(logService)));
    // URI Identity
    const uriIdentityService = new UriIdentityService(fileService);
    services.set(IUriIdentityService, uriIdentityService);
    // User Data Profiles
    const userDataProfilesService = new UserDataProfilesService(environmentService, fileService, uriIdentityService, logService);
    services.set(IUserDataProfilesService, userDataProfilesService);
    // Configuration
    const configurationService = new ConfigurationService(environmentService.machineSettingsResource, fileService, new NullPolicyService(), logService);
    services.set(IConfigurationService, configurationService);
    await configurationService.initialize();
    const extensionHostStatusService = new ExtensionHostStatusService();
    services.set(IExtensionHostStatusService, extensionHostStatusService);
    // Request
    services.set(IRequestService, new SyncDescriptor(RequestService));
    let oneDsAppender = NullAppender;
    const machineId = await getMachineId();
    const isInternal = isInternalTelemetry(productService, configurationService);
    if (supportsTelemetry(productService, environmentService)) {
        if (productService.aiConfig && productService.aiConfig.ariaKey) {
            oneDsAppender = new OneDataSystemAppender(isInternal, eventPrefix, null, productService.aiConfig.ariaKey);
            disposables.add(toDisposable(() => oneDsAppender?.flush())); // Ensure the AI appender is disposed so that it flushes remaining data
        }
        const config = {
            appenders: [oneDsAppender],
            commonProperties: resolveCommonProperties(fileService, release(), hostname(), process.arch, productService.commit, productService.version + '-remote', machineId, isInternal, environmentService.installSourcePath, 'remoteAgent'),
            piiPaths: getPiiPathsFromEnvironment(environmentService)
        };
        const initialTelemetryLevelArg = environmentService.args['telemetry-level'];
        let injectedTelemetryLevel = 3 /* TelemetryLevel.USAGE */;
        // Convert the passed in CLI argument into a telemetry level for the telemetry service
        if (initialTelemetryLevelArg === 'all') {
            injectedTelemetryLevel = 3 /* TelemetryLevel.USAGE */;
        }
        else if (initialTelemetryLevelArg === 'error') {
            injectedTelemetryLevel = 2 /* TelemetryLevel.ERROR */;
        }
        else if (initialTelemetryLevelArg === 'crash') {
            injectedTelemetryLevel = 1 /* TelemetryLevel.CRASH */;
        }
        else if (initialTelemetryLevelArg !== undefined) {
            injectedTelemetryLevel = 0 /* TelemetryLevel.NONE */;
        }
        services.set(IServerTelemetryService, new SyncDescriptor(ServerTelemetryService, [config, injectedTelemetryLevel]));
    }
    else {
        services.set(IServerTelemetryService, ServerNullTelemetryService);
    }
    services.set(IExtensionGalleryService, new SyncDescriptor(ExtensionGalleryServiceWithNoStorageService));
    const downloadChannel = socketServer.getChannel('download', router);
    services.set(IDownloadService, new DownloadServiceChannelClient(downloadChannel, () => getUriTransformer('renderer') /* TODO: @Sandy @Joao need dynamic context based router */));
    services.set(IExtensionsProfileScannerService, new SyncDescriptor(ExtensionsProfileScannerService));
    services.set(IExtensionsScannerService, new SyncDescriptor(ExtensionsScannerService));
    services.set(IExtensionSignatureVerificationService, new SyncDescriptor(ExtensionSignatureVerificationService));
    services.set(INativeServerExtensionManagementService, new SyncDescriptor(ExtensionManagementService));
    const instantiationService = new InstantiationService(services);
    services.set(ILanguagePackService, instantiationService.createInstance(NativeLanguagePackService));
    const ptyService = instantiationService.createInstance(PtyHostService, {
        graceTime: 10800000 /* ProtocolConstants.ReconnectionGraceTime */,
        shortGraceTime: 300000 /* ProtocolConstants.ReconnectionShortGraceTime */,
        scrollback: configurationService.getValue("terminal.integrated.persistentSessionScrollback" /* TerminalSettingId.PersistentSessionScrollback */) ?? 100
    });
    services.set(IPtyService, ptyService);
    services.set(IEncryptionMainService, new SyncDescriptor(EncryptionMainService, [machineId]));
    services.set(ICredentialsMainService, new SyncDescriptor(CredentialsWebMainService));
    instantiationService.invokeFunction(accessor => {
        const extensionManagementService = accessor.get(INativeServerExtensionManagementService);
        const extensionsScannerService = accessor.get(IExtensionsScannerService);
        const remoteExtensionEnvironmentChannel = new RemoteAgentEnvironmentChannel(connectionToken, environmentService, userDataProfilesService, instantiationService.createInstance(ExtensionManagementCLI), logService, extensionHostStatusService, extensionsScannerService, extensionManagementService);
        socketServer.registerChannel('remoteextensionsenvironment', remoteExtensionEnvironmentChannel);
        const telemetryChannel = new ServerTelemetryChannel(accessor.get(IServerTelemetryService), oneDsAppender);
        socketServer.registerChannel('telemetry', telemetryChannel);
        socketServer.registerChannel(REMOTE_TERMINAL_CHANNEL_NAME, new RemoteTerminalChannel(environmentService, logService, ptyService, productService, extensionManagementService));
        const remoteFileSystemChannel = new RemoteAgentFileSystemProviderChannel(logService, environmentService);
        socketServer.registerChannel(REMOTE_FILE_SYSTEM_CHANNEL_NAME, remoteFileSystemChannel);
        socketServer.registerChannel('request', new RequestChannel(accessor.get(IRequestService)));
        const channel = new ExtensionManagementChannel(extensionManagementService, (ctx) => getUriTransformer(ctx.remoteAuthority));
        socketServer.registerChannel('extensions', channel);
        const encryptionChannel = ProxyChannel.fromService(accessor.get(IEncryptionMainService));
        socketServer.registerChannel('encryption', encryptionChannel);
        const credentialsChannel = ProxyChannel.fromService(accessor.get(ICredentialsMainService));
        socketServer.registerChannel('credentials', credentialsChannel);
        // clean up deprecated extensions
        extensionManagementService.removeUninstalledExtensions();
        disposables.add(new ErrorTelemetry(accessor.get(ITelemetryService)));
        return {
            telemetryService: accessor.get(ITelemetryService)
        };
    });
    return { socketServer, instantiationService };
}
const _uriTransformerCache = Object.create(null);
function getUriTransformer(remoteAuthority) {
    if (!_uriTransformerCache[remoteAuthority]) {
        _uriTransformerCache[remoteAuthority] = createURITransformer(remoteAuthority);
    }
    return _uriTransformerCache[remoteAuthority];
}
export class SocketServer extends IPCServer {
    _onDidConnectEmitter;
    constructor() {
        const emitter = new Emitter();
        super(emitter.event);
        this._onDidConnectEmitter = emitter;
    }
    acceptConnection(protocol, onDidClientDisconnect) {
        this._onDidConnectEmitter.fire({ protocol, onDidClientDisconnect });
    }
}
class ServerLogService extends AbstractLogger {
    _serviceBrand;
    useColors;
    constructor(logLevel = DEFAULT_LOG_LEVEL) {
        super();
        this.setLevel(logLevel);
        this.useColors = Boolean(process.stdout.isTTY);
    }
    trace(message, ...args) {
        if (this.getLevel() <= LogLevel.Trace) {
            if (this.useColors) {
                console.log(`\x1b[90m[${now()}]\x1b[0m`, message, ...args);
            }
            else {
                console.log(`[${now()}]`, message, ...args);
            }
        }
    }
    debug(message, ...args) {
        if (this.getLevel() <= LogLevel.Debug) {
            if (this.useColors) {
                console.log(`\x1b[90m[${now()}]\x1b[0m`, message, ...args);
            }
            else {
                console.log(`[${now()}]`, message, ...args);
            }
        }
    }
    info(message, ...args) {
        if (this.getLevel() <= LogLevel.Info) {
            if (this.useColors) {
                console.log(`\x1b[90m[${now()}]\x1b[0m`, message, ...args);
            }
            else {
                console.log(`[${now()}]`, message, ...args);
            }
        }
    }
    warn(message, ...args) {
        if (this.getLevel() <= LogLevel.Warning) {
            if (this.useColors) {
                console.warn(`\x1b[93m[${now()}]\x1b[0m`, message, ...args);
            }
            else {
                console.warn(`[${now()}]`, message, ...args);
            }
        }
    }
    error(message, ...args) {
        if (this.getLevel() <= LogLevel.Error) {
            if (this.useColors) {
                console.error(`\x1b[91m[${now()}]\x1b[0m`, message, ...args);
            }
            else {
                console.error(`[${now()}]`, message, ...args);
            }
        }
    }
    dispose() {
        // noop
    }
    flush() {
        // noop
    }
}
function now() {
    const date = new Date();
    return `${twodigits(date.getHours())}:${twodigits(date.getMinutes())}:${twodigits(date.getSeconds())}`;
}
function twodigits(n) {
    if (n < 10) {
        return `0${n}`;
    }
    return String(n);
}
/**
 * Cleans up older logs, while keeping the 10 most recent ones.
 */
async function cleanupOlderLogs(logsPath) {
    const currentLog = path.basename(logsPath);
    const logsRoot = path.dirname(logsPath);
    const children = await Promises.readdir(logsRoot);
    const allSessions = children.filter(name => /^\d{8}T\d{6}$/.test(name));
    const oldSessions = allSessions.sort().filter((d) => d !== currentLog);
    const toDelete = oldSessions.slice(0, Math.max(0, oldSessions.length - 9));
    await Promise.all(toDelete.map(name => Promises.rm(path.join(logsRoot, name))));
}

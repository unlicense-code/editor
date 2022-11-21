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
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { IWorkbenchExtensionEnablementService, IWebExtensionsScannerService, IWorkbenchExtensionManagementService } from 'vs/workbench/services/extensionManagement/common/extensionManagement';
import { IRemoteAgentService } from 'vs/workbench/services/remote/common/remoteAgentService';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IExtensionService, toExtensionDescription, extensionHostKindToString } from 'vs/workbench/services/extensions/common/extensions';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { IFileService } from 'vs/platform/files/common/files';
import { IProductService } from 'vs/platform/product/common/productService';
import { AbstractExtensionService, extensionRunningPreferenceToString } from 'vs/workbench/services/extensions/common/abstractExtensionService';
import { RemoteExtensionHost } from 'vs/workbench/services/extensions/common/remoteExtensionHost';
import { INotificationService, Severity } from 'vs/platform/notification/common/notification';
import { WebWorkerExtensionHost } from 'vs/workbench/services/extensions/browser/webWorkerExtensionHost';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { ExtensionIdentifier } from 'vs/platform/extensions/common/extensions';
import { FetchFileSystemProvider } from 'vs/workbench/services/extensions/browser/webWorkerFileSystemProvider';
import { Schemas } from 'vs/base/common/network';
import { DisposableStore } from 'vs/base/common/lifecycle';
import { IRemoteAuthorityResolverService } from 'vs/platform/remote/common/remoteAuthorityResolver';
import { ILifecycleService } from 'vs/workbench/services/lifecycle/common/lifecycle';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { IExtensionManifestPropertiesService } from 'vs/workbench/services/extensions/common/extensionManifestPropertiesService';
import { IUserDataInitializationService } from 'vs/workbench/services/userData/browser/userDataInit';
import { ILogService } from 'vs/platform/log/common/log';
import { IUserDataProfileService } from 'vs/workbench/services/userDataProfile/common/userDataProfile';
import { dedupExtensions } from 'vs/workbench/services/extensions/common/extensionsUtil';
let ExtensionService = class ExtensionService extends AbstractExtensionService {
    _webExtensionsScannerService;
    _remoteAuthorityResolverService;
    _userDataInitializationService;
    _disposables = new DisposableStore();
    _remoteInitData = null;
    constructor(instantiationService, notificationService, environmentService, telemetryService, extensionEnablementService, fileService, productService, extensionManagementService, contextService, configurationService, extensionManifestPropertiesService, _webExtensionsScannerService, logService, remoteAgentService, lifecycleService, _remoteAuthorityResolverService, _userDataInitializationService, userDataProfileService) {
        super(instantiationService, notificationService, environmentService, telemetryService, extensionEnablementService, fileService, productService, extensionManagementService, contextService, configurationService, extensionManifestPropertiesService, logService, remoteAgentService, lifecycleService, userDataProfileService);
        this._webExtensionsScannerService = _webExtensionsScannerService;
        this._remoteAuthorityResolverService = _remoteAuthorityResolverService;
        this._userDataInitializationService = _userDataInitializationService;
        // Initialize installed extensions first and do it only after workbench is ready
        lifecycleService.when(2 /* LifecyclePhase.Ready */).then(async () => {
            await this._userDataInitializationService.initializeInstalledExtensions(this._instantiationService);
            this._initialize();
        });
        this._initFetchFileSystem();
    }
    dispose() {
        this._disposables.dispose();
        super.dispose();
    }
    async _scanSingleExtension(extension) {
        if (extension.location.scheme === Schemas.vscodeRemote) {
            return this._remoteAgentService.scanSingleExtension(extension.location, extension.type === 0 /* ExtensionType.System */);
        }
        const scannedExtension = await this._webExtensionsScannerService.scanExistingExtension(extension.location, extension.type, this._userDataProfileService.currentProfile.extensionsResource);
        if (scannedExtension) {
            return toExtensionDescription(scannedExtension);
        }
        return null;
    }
    _initFetchFileSystem() {
        const provider = new FetchFileSystemProvider();
        this._disposables.add(this._fileService.registerProvider(Schemas.http, provider));
        this._disposables.add(this._fileService.registerProvider(Schemas.https, provider));
    }
    _createLocalExtensionHostDataProvider(desiredRunningLocation) {
        return {
            getInitData: async () => {
                const allExtensions = await this.getExtensions();
                const localWebWorkerExtensions = this._filterByRunningLocation(allExtensions, desiredRunningLocation);
                return {
                    autoStart: true,
                    allExtensions: allExtensions,
                    myExtensions: localWebWorkerExtensions.map(extension => extension.identifier)
                };
            }
        };
    }
    _createRemoteExtensionHostDataProvider(remoteAuthority) {
        return {
            remoteAuthority: remoteAuthority,
            getInitData: async () => {
                await this.whenInstalledExtensionsRegistered();
                return this._remoteInitData;
            }
        };
    }
    _pickExtensionHostKind(extensionId, extensionKinds, isInstalledLocally, isInstalledRemotely, preference) {
        const result = ExtensionService.pickRunningLocation(extensionKinds, isInstalledLocally, isInstalledRemotely, preference);
        this._logService.trace(`pickRunningLocation for ${extensionId.value}, extension kinds: [${extensionKinds.join(', ')}], isInstalledLocally: ${isInstalledLocally}, isInstalledRemotely: ${isInstalledRemotely}, preference: ${extensionRunningPreferenceToString(preference)} => ${extensionHostKindToString(result)}`);
        return result;
    }
    static pickRunningLocation(extensionKinds, isInstalledLocally, isInstalledRemotely, preference) {
        const result = [];
        let canRunRemotely = false;
        for (const extensionKind of extensionKinds) {
            if (extensionKind === 'ui' && isInstalledRemotely) {
                // ui extensions run remotely if possible (but only as a last resort)
                if (preference === 2 /* ExtensionRunningPreference.Remote */) {
                    return 3 /* ExtensionHostKind.Remote */;
                }
                else {
                    canRunRemotely = true;
                }
            }
            if (extensionKind === 'workspace' && isInstalledRemotely) {
                // workspace extensions run remotely if possible
                if (preference === 0 /* ExtensionRunningPreference.None */ || preference === 2 /* ExtensionRunningPreference.Remote */) {
                    return 3 /* ExtensionHostKind.Remote */;
                }
                else {
                    result.push(3 /* ExtensionHostKind.Remote */);
                }
            }
            if (extensionKind === 'web' && (isInstalledLocally || isInstalledRemotely)) {
                // web worker extensions run in the local web worker if possible
                if (preference === 0 /* ExtensionRunningPreference.None */ || preference === 1 /* ExtensionRunningPreference.Local */) {
                    return 2 /* ExtensionHostKind.LocalWebWorker */;
                }
                else {
                    result.push(2 /* ExtensionHostKind.LocalWebWorker */);
                }
            }
        }
        if (canRunRemotely) {
            result.push(3 /* ExtensionHostKind.Remote */);
        }
        return (result.length > 0 ? result[0] : null);
    }
    _createExtensionHost(runningLocation, _isInitialStart) {
        switch (runningLocation.kind) {
            case 1 /* ExtensionHostKind.LocalProcess */: {
                return null;
            }
            case 2 /* ExtensionHostKind.LocalWebWorker */: {
                return this._instantiationService.createInstance(WebWorkerExtensionHost, runningLocation, false, this._createLocalExtensionHostDataProvider(runningLocation));
            }
            case 3 /* ExtensionHostKind.Remote */: {
                const remoteAgentConnection = this._remoteAgentService.getConnection();
                if (remoteAgentConnection) {
                    return this._instantiationService.createInstance(RemoteExtensionHost, runningLocation, this._createRemoteExtensionHostDataProvider(remoteAgentConnection.remoteAuthority), this._remoteAgentService.socketFactory);
                }
                return null;
            }
        }
    }
    async _scanWebExtensions() {
        const system = [], user = [], development = [];
        try {
            await Promise.all([
                this._webExtensionsScannerService.scanSystemExtensions().then(extensions => system.push(...extensions.map(e => toExtensionDescription(e)))),
                this._webExtensionsScannerService.scanUserExtensions(this._userDataProfileService.currentProfile.extensionsResource, { skipInvalidExtensions: true }).then(extensions => user.push(...extensions.map(e => toExtensionDescription(e)))),
                this._webExtensionsScannerService.scanExtensionsUnderDevelopment().then(extensions => development.push(...extensions.map(e => toExtensionDescription(e, true))))
            ]);
        }
        catch (error) {
            this._logService.error(error);
        }
        return dedupExtensions(system, user, development, this._logService);
    }
    async _scanAndHandleExtensions() {
        // fetch the remote environment
        let [localExtensions, remoteEnv, remoteExtensions] = await Promise.all([
            this._scanWebExtensions(),
            this._remoteAgentService.getEnvironment(),
            this._remoteAgentService.scanExtensions()
        ]);
        localExtensions = this._checkEnabledAndProposedAPI(localExtensions, false);
        remoteExtensions = this._checkEnabledAndProposedAPI(remoteExtensions, false);
        const remoteAgentConnection = this._remoteAgentService.getConnection();
        // `determineRunningLocation` will look at the complete picture (e.g. an extension installed on both sides),
        // takes care of duplicates and picks a running location for each extension
        this._initializeRunningLocation(localExtensions, remoteExtensions);
        // Some remote extensions could run locally in the web worker, so store them
        const remoteExtensionsThatNeedToRunLocally = this._filterByExtensionHostKind(remoteExtensions, 2 /* ExtensionHostKind.LocalWebWorker */);
        localExtensions = this._filterByExtensionHostKind(localExtensions, 2 /* ExtensionHostKind.LocalWebWorker */);
        remoteExtensions = this._filterByExtensionHostKind(remoteExtensions, 3 /* ExtensionHostKind.Remote */);
        // Add locally the remote extensions that need to run locally in the web worker
        for (const ext of remoteExtensionsThatNeedToRunLocally) {
            if (!includes(localExtensions, ext.identifier)) {
                localExtensions.push(ext);
            }
        }
        const result = this._registry.deltaExtensions(remoteExtensions.concat(localExtensions), []);
        if (result.removedDueToLooping.length > 0) {
            this._notificationService.notify({
                severity: Severity.Error,
                message: nls.localize('looping', "The following extensions contain dependency loops and have been disabled: {0}", result.removedDueToLooping.map(e => `'${e.identifier.value}'`).join(', '))
            });
        }
        if (remoteEnv && remoteAgentConnection) {
            // save for remote extension's init data
            this._remoteInitData = {
                connectionData: this._remoteAuthorityResolverService.getConnectionData(remoteAgentConnection.remoteAuthority),
                pid: remoteEnv.pid,
                appRoot: remoteEnv.appRoot,
                extensionHostLogsPath: remoteEnv.extensionHostLogsPath,
                globalStorageHome: remoteEnv.globalStorageHome,
                workspaceStorageHome: remoteEnv.workspaceStorageHome,
                allExtensions: this._registry.getAllExtensionDescriptions(),
                myExtensions: remoteExtensions.map(extension => extension.identifier),
            };
        }
        this._doHandleExtensionPoints(this._registry.getAllExtensionDescriptions());
    }
    _onExtensionHostExit(code) {
        // Dispose everything associated with the extension host
        this.stopExtensionHosts();
        const automatedWindow = window;
        if (typeof automatedWindow.codeAutomationExit === 'function') {
            automatedWindow.codeAutomationExit(code);
        }
    }
};
ExtensionService = __decorate([
    __param(0, IInstantiationService),
    __param(1, INotificationService),
    __param(2, IWorkbenchEnvironmentService),
    __param(3, ITelemetryService),
    __param(4, IWorkbenchExtensionEnablementService),
    __param(5, IFileService),
    __param(6, IProductService),
    __param(7, IWorkbenchExtensionManagementService),
    __param(8, IWorkspaceContextService),
    __param(9, IConfigurationService),
    __param(10, IExtensionManifestPropertiesService),
    __param(11, IWebExtensionsScannerService),
    __param(12, ILogService),
    __param(13, IRemoteAgentService),
    __param(14, ILifecycleService),
    __param(15, IRemoteAuthorityResolverService),
    __param(16, IUserDataInitializationService),
    __param(17, IUserDataProfileService)
], ExtensionService);
export { ExtensionService };
function includes(extensions, identifier) {
    for (const extension of extensions) {
        if (ExtensionIdentifier.equals(extension.identifier, identifier)) {
            return true;
        }
    }
    return false;
}
registerSingleton(IExtensionService, ExtensionService, 0 /* InstantiationType.Eager */);

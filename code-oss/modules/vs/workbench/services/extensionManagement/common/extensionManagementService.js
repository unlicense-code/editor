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
import { Event, EventMultiplexer } from 'vs/base/common/event';
import { IExtensionGalleryService, ExtensionManagementError, ExtensionManagementErrorCode } from 'vs/platform/extensionManagement/common/extensionManagement';
import { IExtensionManagementServerService } from 'vs/workbench/services/extensionManagement/common/extensionManagement';
import { isLanguagePackExtension, getWorkspaceSupportTypeMessage } from 'vs/platform/extensions/common/extensions';
import { Disposable } from 'vs/base/common/lifecycle';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { CancellationToken } from 'vs/base/common/cancellation';
import { areSameExtensions, computeTargetPlatform } from 'vs/platform/extensionManagement/common/extensionManagementUtil';
import { localize } from 'vs/nls';
import { IProductService } from 'vs/platform/product/common/productService';
import { Schemas } from 'vs/base/common/network';
import { IDownloadService } from 'vs/platform/download/common/download';
import { flatten } from 'vs/base/common/arrays';
import { IDialogService } from 'vs/platform/dialogs/common/dialogs';
import Severity from 'vs/base/common/severity';
import { IUserDataSyncEnablementService } from 'vs/platform/userDataSync/common/userDataSync';
import { Promises } from 'vs/base/common/async';
import { IWorkspaceTrustRequestService } from 'vs/platform/workspace/common/workspaceTrust';
import { IExtensionManifestPropertiesService } from 'vs/workbench/services/extensions/common/extensionManifestPropertiesService';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { isUndefined } from 'vs/base/common/types';
import { IFileService } from 'vs/platform/files/common/files';
import { ILogService } from 'vs/platform/log/common/log';
import { CancellationError } from 'vs/base/common/errors';
let ExtensionManagementService = class ExtensionManagementService extends Disposable {
    extensionManagementServerService;
    extensionGalleryService;
    configurationService;
    productService;
    downloadService;
    userDataSyncEnablementService;
    dialogService;
    workspaceTrustRequestService;
    extensionManifestPropertiesService;
    fileService;
    logService;
    instantiationService;
    onInstallExtension;
    onDidInstallExtensions;
    onUninstallExtension;
    onDidUninstallExtension;
    onProfileAwareInstallExtension;
    onProfileAwareDidInstallExtensions;
    onProfileAwareUninstallExtension;
    onProfileAwareDidUninstallExtension;
    onDidChangeProfile;
    servers = [];
    constructor(extensionManagementServerService, extensionGalleryService, configurationService, productService, downloadService, userDataSyncEnablementService, dialogService, workspaceTrustRequestService, extensionManifestPropertiesService, fileService, logService, instantiationService) {
        super();
        this.extensionManagementServerService = extensionManagementServerService;
        this.extensionGalleryService = extensionGalleryService;
        this.configurationService = configurationService;
        this.productService = productService;
        this.downloadService = downloadService;
        this.userDataSyncEnablementService = userDataSyncEnablementService;
        this.dialogService = dialogService;
        this.workspaceTrustRequestService = workspaceTrustRequestService;
        this.extensionManifestPropertiesService = extensionManifestPropertiesService;
        this.fileService = fileService;
        this.logService = logService;
        this.instantiationService = instantiationService;
        if (this.extensionManagementServerService.localExtensionManagementServer) {
            this.servers.push(this.extensionManagementServerService.localExtensionManagementServer);
        }
        if (this.extensionManagementServerService.remoteExtensionManagementServer) {
            this.servers.push(this.extensionManagementServerService.remoteExtensionManagementServer);
        }
        if (this.extensionManagementServerService.webExtensionManagementServer) {
            this.servers.push(this.extensionManagementServerService.webExtensionManagementServer);
        }
        this.onInstallExtension = this._register(this.servers.reduce((emitter, server) => { emitter.add(Event.map(server.extensionManagementService.onInstallExtension, e => ({ ...e, server }))); return emitter; }, new EventMultiplexer())).event;
        this.onDidInstallExtensions = this._register(this.servers.reduce((emitter, server) => { emitter.add(server.extensionManagementService.onDidInstallExtensions); return emitter; }, new EventMultiplexer())).event;
        this.onUninstallExtension = this._register(this.servers.reduce((emitter, server) => { emitter.add(Event.map(server.extensionManagementService.onUninstallExtension, e => ({ ...e, server }))); return emitter; }, new EventMultiplexer())).event;
        this.onDidUninstallExtension = this._register(this.servers.reduce((emitter, server) => { emitter.add(Event.map(server.extensionManagementService.onDidUninstallExtension, e => ({ ...e, server }))); return emitter; }, new EventMultiplexer())).event;
        this.onProfileAwareInstallExtension = this._register(this.servers.reduce((emitter, server) => { emitter.add(Event.map(server.extensionManagementService.onProfileAwareInstallExtension, e => ({ ...e, server }))); return emitter; }, new EventMultiplexer())).event;
        this.onProfileAwareDidInstallExtensions = this._register(this.servers.reduce((emitter, server) => { emitter.add(server.extensionManagementService.onProfileAwareDidInstallExtensions); return emitter; }, new EventMultiplexer())).event;
        this.onProfileAwareUninstallExtension = this._register(this.servers.reduce((emitter, server) => { emitter.add(Event.map(server.extensionManagementService.onProfileAwareUninstallExtension, e => ({ ...e, server }))); return emitter; }, new EventMultiplexer())).event;
        this.onProfileAwareDidUninstallExtension = this._register(this.servers.reduce((emitter, server) => { emitter.add(Event.map(server.extensionManagementService.onProfileAwareDidUninstallExtension, e => ({ ...e, server }))); return emitter; }, new EventMultiplexer())).event;
        this.onDidChangeProfile = this._register(this.servers.reduce((emitter, server) => { emitter.add(Event.map(server.extensionManagementService.onDidChangeProfile, e => ({ ...e, server }))); return emitter; }, new EventMultiplexer())).event;
    }
    async getInstalled(type, profileLocation) {
        const result = await Promise.all(this.servers.map(({ extensionManagementService }) => extensionManagementService.getInstalled(type, profileLocation)));
        return flatten(result);
    }
    async uninstall(extension, options) {
        const server = this.getServer(extension);
        if (!server) {
            return Promise.reject(`Invalid location ${extension.location.toString()}`);
        }
        if (this.servers.length > 1) {
            if (isLanguagePackExtension(extension.manifest)) {
                return this.uninstallEverywhere(extension, options);
            }
            return this.uninstallInServer(extension, server, options);
        }
        return server.extensionManagementService.uninstall(extension, options);
    }
    async uninstallEverywhere(extension, options) {
        const server = this.getServer(extension);
        if (!server) {
            return Promise.reject(`Invalid location ${extension.location.toString()}`);
        }
        const promise = server.extensionManagementService.uninstall(extension, options);
        const otherServers = this.servers.filter(s => s !== server);
        if (otherServers.length) {
            for (const otherServer of otherServers) {
                const installed = await otherServer.extensionManagementService.getInstalled();
                extension = installed.filter(i => !i.isBuiltin && areSameExtensions(i.identifier, extension.identifier))[0];
                if (extension) {
                    await otherServer.extensionManagementService.uninstall(extension, options);
                }
            }
        }
        return promise;
    }
    async uninstallInServer(extension, server, options) {
        if (server === this.extensionManagementServerService.localExtensionManagementServer) {
            const installedExtensions = await this.extensionManagementServerService.remoteExtensionManagementServer.extensionManagementService.getInstalled(1 /* ExtensionType.User */);
            const dependentNonUIExtensions = installedExtensions.filter(i => !this.extensionManifestPropertiesService.prefersExecuteOnUI(i.manifest)
                && i.manifest.extensionDependencies && i.manifest.extensionDependencies.some(id => areSameExtensions({ id }, extension.identifier)));
            if (dependentNonUIExtensions.length) {
                return Promise.reject(new Error(this.getDependentsErrorMessage(extension, dependentNonUIExtensions)));
            }
        }
        return server.extensionManagementService.uninstall(extension, options);
    }
    getDependentsErrorMessage(extension, dependents) {
        if (dependents.length === 1) {
            return localize('singleDependentError', "Cannot uninstall extension '{0}'. Extension '{1}' depends on this.", extension.manifest.displayName || extension.manifest.name, dependents[0].manifest.displayName || dependents[0].manifest.name);
        }
        if (dependents.length === 2) {
            return localize('twoDependentsError', "Cannot uninstall extension '{0}'. Extensions '{1}' and '{2}' depend on this.", extension.manifest.displayName || extension.manifest.name, dependents[0].manifest.displayName || dependents[0].manifest.name, dependents[1].manifest.displayName || dependents[1].manifest.name);
        }
        return localize('multipleDependentsError', "Cannot uninstall extension '{0}'. Extensions '{1}', '{2}' and others depend on this.", extension.manifest.displayName || extension.manifest.name, dependents[0].manifest.displayName || dependents[0].manifest.name, dependents[1].manifest.displayName || dependents[1].manifest.name);
    }
    async reinstallFromGallery(extension) {
        const server = this.getServer(extension);
        if (server) {
            await this.checkForWorkspaceTrust(extension.manifest);
            return server.extensionManagementService.reinstallFromGallery(extension);
        }
        return Promise.reject(`Invalid location ${extension.location.toString()}`);
    }
    updateMetadata(extension, metadata) {
        const server = this.getServer(extension);
        if (server) {
            return server.extensionManagementService.updateMetadata(extension, metadata);
        }
        return Promise.reject(`Invalid location ${extension.location.toString()}`);
    }
    updateExtensionScope(extension, isMachineScoped) {
        const server = this.getServer(extension);
        if (server) {
            return server.extensionManagementService.updateExtensionScope(extension, isMachineScoped);
        }
        return Promise.reject(`Invalid location ${extension.location.toString()}`);
    }
    zip(extension) {
        const server = this.getServer(extension);
        if (server) {
            return server.extensionManagementService.zip(extension);
        }
        return Promise.reject(`Invalid location ${extension.location.toString()}`);
    }
    unzip(zipLocation) {
        return Promises.settled(this.servers
            // Filter out web server
            .filter(server => server !== this.extensionManagementServerService.webExtensionManagementServer)
            .map(({ extensionManagementService }) => extensionManagementService.unzip(zipLocation))).then(([extensionIdentifier]) => extensionIdentifier);
    }
    download(extension, operation) {
        if (this.extensionManagementServerService.localExtensionManagementServer) {
            return this.extensionManagementServerService.localExtensionManagementServer.extensionManagementService.download(extension, operation);
        }
        throw new Error('Cannot download extension');
    }
    async install(vsix, options) {
        const manifest = await this.getManifest(vsix);
        return this.installVSIX(vsix, manifest, options);
    }
    async installVSIX(vsix, manifest, options) {
        const serversToInstall = this.getServersToInstall(manifest);
        if (serversToInstall?.length) {
            await this.checkForWorkspaceTrust(manifest);
            const [local] = await Promises.settled(serversToInstall.map(server => this.installVSIXInServer(vsix, server, options)));
            return local;
        }
        return Promise.reject('No Servers to Install');
    }
    getServersToInstall(manifest) {
        if (this.extensionManagementServerService.localExtensionManagementServer && this.extensionManagementServerService.remoteExtensionManagementServer) {
            if (isLanguagePackExtension(manifest)) {
                // Install on both servers
                return [this.extensionManagementServerService.localExtensionManagementServer, this.extensionManagementServerService.remoteExtensionManagementServer];
            }
            if (this.extensionManifestPropertiesService.prefersExecuteOnUI(manifest)) {
                // Install only on local server
                return [this.extensionManagementServerService.localExtensionManagementServer];
            }
            // Install only on remote server
            return [this.extensionManagementServerService.remoteExtensionManagementServer];
        }
        if (this.extensionManagementServerService.localExtensionManagementServer) {
            return [this.extensionManagementServerService.localExtensionManagementServer];
        }
        if (this.extensionManagementServerService.remoteExtensionManagementServer) {
            return [this.extensionManagementServerService.remoteExtensionManagementServer];
        }
        return undefined;
    }
    async installWebExtension(location) {
        if (!this.extensionManagementServerService.webExtensionManagementServer) {
            throw new Error('Web extension management server is not found');
        }
        return this.extensionManagementServerService.webExtensionManagementServer.extensionManagementService.install(location);
    }
    installVSIXInServer(vsix, server, options) {
        return server.extensionManagementService.install(vsix, options);
    }
    getManifest(vsix) {
        if (vsix.scheme === Schemas.file && this.extensionManagementServerService.localExtensionManagementServer) {
            return this.extensionManagementServerService.localExtensionManagementServer.extensionManagementService.getManifest(vsix);
        }
        if (vsix.scheme === Schemas.file && this.extensionManagementServerService.remoteExtensionManagementServer) {
            return this.extensionManagementServerService.remoteExtensionManagementServer.extensionManagementService.getManifest(vsix);
        }
        if (vsix.scheme === Schemas.vscodeRemote && this.extensionManagementServerService.remoteExtensionManagementServer) {
            return this.extensionManagementServerService.remoteExtensionManagementServer.extensionManagementService.getManifest(vsix);
        }
        return Promise.reject('No Servers');
    }
    async canInstall(gallery) {
        if (this.extensionManagementServerService.localExtensionManagementServer
            && await this.extensionManagementServerService.localExtensionManagementServer.extensionManagementService.canInstall(gallery)) {
            return true;
        }
        const manifest = await this.extensionGalleryService.getManifest(gallery, CancellationToken.None);
        if (!manifest) {
            return false;
        }
        if (this.extensionManagementServerService.remoteExtensionManagementServer
            && await this.extensionManagementServerService.remoteExtensionManagementServer.extensionManagementService.canInstall(gallery)
            && this.extensionManifestPropertiesService.canExecuteOnWorkspace(manifest)) {
            return true;
        }
        if (this.extensionManagementServerService.webExtensionManagementServer
            && await this.extensionManagementServerService.webExtensionManagementServer.extensionManagementService.canInstall(gallery)
            && this.extensionManifestPropertiesService.canExecuteOnWeb(manifest)) {
            return true;
        }
        return false;
    }
    async updateFromGallery(gallery, extension, installOptions) {
        const server = this.getServer(extension);
        if (!server) {
            return Promise.reject(`Invalid location ${extension.location.toString()}`);
        }
        const servers = [];
        // Update Language pack on local and remote servers
        if (isLanguagePackExtension(extension.manifest)) {
            servers.push(...this.servers.filter(server => server !== this.extensionManagementServerService.webExtensionManagementServer));
        }
        else {
            servers.push(server);
        }
        return Promises.settled(servers.map(server => server.extensionManagementService.installFromGallery(gallery, installOptions))).then(([local]) => local);
    }
    async installExtensions(extensions, installOptions) {
        if (!installOptions) {
            const isMachineScoped = await this.hasToFlagExtensionsMachineScoped(extensions);
            installOptions = { isMachineScoped, isBuiltin: false };
        }
        return Promises.settled(extensions.map(extension => this.installFromGallery(extension, installOptions)));
    }
    async installFromGallery(gallery, installOptions) {
        const manifest = await this.extensionGalleryService.getManifest(gallery, CancellationToken.None);
        if (!manifest) {
            return Promise.reject(localize('Manifest is not found', "Installing Extension {0} failed: Manifest is not found.", gallery.displayName || gallery.name));
        }
        const servers = [];
        // Install Language pack on local and remote servers
        if (isLanguagePackExtension(manifest)) {
            servers.push(...this.servers.filter(server => server !== this.extensionManagementServerService.webExtensionManagementServer));
        }
        else {
            const server = this.getExtensionManagementServerToInstall(manifest);
            if (server) {
                servers.push(server);
            }
        }
        if (servers.length) {
            if (!installOptions || isUndefined(installOptions.isMachineScoped)) {
                const isMachineScoped = await this.hasToFlagExtensionsMachineScoped([gallery]);
                installOptions = { ...(installOptions || {}), isMachineScoped };
            }
            if (!installOptions.isMachineScoped && this.isExtensionsSyncEnabled()) {
                if (this.extensionManagementServerService.localExtensionManagementServer && !servers.includes(this.extensionManagementServerService.localExtensionManagementServer) && (await this.extensionManagementServerService.localExtensionManagementServer.extensionManagementService.canInstall(gallery))) {
                    servers.push(this.extensionManagementServerService.localExtensionManagementServer);
                }
            }
            await this.checkForWorkspaceTrust(manifest);
            if (!installOptions.donotIncludePackAndDependencies) {
                await this.checkInstallingExtensionOnWeb(gallery, manifest);
            }
            return Promises.settled(servers.map(server => server.extensionManagementService.installFromGallery(gallery, installOptions))).then(([local]) => local);
        }
        const error = new Error(localize('cannot be installed', "Cannot install the '{0}' extension because it is not available in this setup.", gallery.displayName || gallery.name));
        error.name = ExtensionManagementErrorCode.Unsupported;
        return Promise.reject(error);
    }
    getExtensionManagementServerToInstall(manifest) {
        // Only local server
        if (this.servers.length === 1 && this.extensionManagementServerService.localExtensionManagementServer) {
            return this.extensionManagementServerService.localExtensionManagementServer;
        }
        const extensionKind = this.extensionManifestPropertiesService.getExtensionKind(manifest);
        for (const kind of extensionKind) {
            if (kind === 'ui' && this.extensionManagementServerService.localExtensionManagementServer) {
                return this.extensionManagementServerService.localExtensionManagementServer;
            }
            if (kind === 'workspace' && this.extensionManagementServerService.remoteExtensionManagementServer) {
                return this.extensionManagementServerService.remoteExtensionManagementServer;
            }
            if (kind === 'web' && this.extensionManagementServerService.webExtensionManagementServer) {
                return this.extensionManagementServerService.webExtensionManagementServer;
            }
        }
        // Local server can accept any extension. So return local server if not compatible server found.
        return this.extensionManagementServerService.localExtensionManagementServer;
    }
    isExtensionsSyncEnabled() {
        return this.userDataSyncEnablementService.isEnabled() && this.userDataSyncEnablementService.isResourceEnabled("extensions" /* SyncResource.Extensions */);
    }
    async hasToFlagExtensionsMachineScoped(extensions) {
        if (this.isExtensionsSyncEnabled()) {
            const result = await this.dialogService.show(Severity.Info, extensions.length === 1 ? localize('install extension', "Install Extension") : localize('install extensions', "Install Extensions"), [
                localize('install', "Install"),
                localize('install and do no sync', "Install (Do not sync)"),
                localize('cancel', "Cancel"),
            ], {
                cancelId: 2,
                detail: extensions.length === 1
                    ? localize('install single extension', "Would you like to install and synchronize '{0}' extension across your devices?", extensions[0].displayName)
                    : localize('install multiple extensions', "Would you like to install and synchronize extensions across your devices?")
            });
            switch (result.choice) {
                case 0:
                    return false;
                case 1:
                    return true;
            }
            throw new CancellationError();
        }
        return false;
    }
    getExtensionsControlManifest() {
        if (this.extensionManagementServerService.localExtensionManagementServer) {
            return this.extensionManagementServerService.localExtensionManagementServer.extensionManagementService.getExtensionsControlManifest();
        }
        if (this.extensionManagementServerService.remoteExtensionManagementServer) {
            return this.extensionManagementServerService.remoteExtensionManagementServer.extensionManagementService.getExtensionsControlManifest();
        }
        if (this.extensionManagementServerService.webExtensionManagementServer) {
            return this.extensionManagementServerService.webExtensionManagementServer.extensionManagementService.getExtensionsControlManifest();
        }
        return Promise.resolve({ malicious: [], deprecated: {} });
    }
    getServer(extension) {
        return this.extensionManagementServerService.getExtensionManagementServer(extension);
    }
    async checkForWorkspaceTrust(manifest) {
        if (this.extensionManifestPropertiesService.getExtensionUntrustedWorkspaceSupportType(manifest) === false) {
            const trustState = await this.workspaceTrustRequestService.requestWorkspaceTrust({
                message: localize('extensionInstallWorkspaceTrustMessage', "Enabling this extension requires a trusted workspace."),
                buttons: [
                    { label: localize('extensionInstallWorkspaceTrustButton', "Trust Workspace & Install"), type: 'ContinueWithTrust' },
                    { label: localize('extensionInstallWorkspaceTrustContinueButton', "Install"), type: 'ContinueWithoutTrust' },
                    { label: localize('extensionInstallWorkspaceTrustManageButton', "Learn More"), type: 'Manage' }
                ]
            });
            if (trustState === undefined) {
                throw new CancellationError();
            }
        }
    }
    async checkInstallingExtensionOnWeb(extension, manifest) {
        if (this.servers.length !== 1 || this.servers[0] !== this.extensionManagementServerService.webExtensionManagementServer) {
            return;
        }
        const nonWebExtensions = [];
        if (manifest.extensionPack?.length) {
            const extensions = await this.extensionGalleryService.getExtensions(manifest.extensionPack.map(id => ({ id })), CancellationToken.None);
            for (const extension of extensions) {
                if (!(await this.servers[0].extensionManagementService.canInstall(extension))) {
                    nonWebExtensions.push(extension);
                }
            }
            if (nonWebExtensions.length && nonWebExtensions.length === extensions.length) {
                throw new ExtensionManagementError('Not supported in Web', ExtensionManagementErrorCode.Unsupported);
            }
        }
        const productName = localize('VS Code for Web', "{0} for the Web", this.productService.nameLong);
        const virtualWorkspaceSupport = this.extensionManifestPropertiesService.getExtensionVirtualWorkspaceSupportType(manifest);
        const virtualWorkspaceSupportReason = getWorkspaceSupportTypeMessage(manifest.capabilities?.virtualWorkspaces);
        const hasLimitedSupport = virtualWorkspaceSupport === 'limited' || !!virtualWorkspaceSupportReason;
        if (!nonWebExtensions.length && !hasLimitedSupport) {
            return;
        }
        const limitedSupportMessage = localize('limited support', "'{0}' has limited functionality in {1}.", extension.displayName || extension.identifier.id, productName);
        let message, buttons, detail;
        if (nonWebExtensions.length && hasLimitedSupport) {
            message = limitedSupportMessage;
            detail = `${virtualWorkspaceSupportReason ? `${virtualWorkspaceSupportReason}\n` : ''}${localize('non web extensions detail', "Contains extensions which are not supported.")}`;
            buttons = [localize('install anyways', "Install Anyway"), localize('showExtensions', "Show Extensions"), localize('cancel', "Cancel")];
        }
        else if (hasLimitedSupport) {
            message = limitedSupportMessage;
            detail = virtualWorkspaceSupportReason || undefined;
            buttons = [localize('install anyways', "Install Anyway"), localize('cancel', "Cancel")];
        }
        else {
            message = localize('non web extensions', "'{0}' contains extensions which are not supported in {1}.", extension.displayName || extension.identifier.id, productName);
            buttons = [localize('install anyways', "Install Anyway"), localize('showExtensions', "Show Extensions"), localize('cancel', "Cancel")];
        }
        const { choice } = await this.dialogService.show(Severity.Info, message, buttons, { cancelId: buttons.length - 1, detail });
        if (choice === 0) {
            return;
        }
        if (choice === buttons.length - 2) {
            // Unfortunately ICommandService cannot be used directly due to cyclic dependencies
            this.instantiationService.invokeFunction(accessor => accessor.get(ICommandService).executeCommand('extension.open', extension.identifier.id, 'extensionPack'));
        }
        throw new CancellationError();
    }
    _targetPlatformPromise;
    getTargetPlatform() {
        if (!this._targetPlatformPromise) {
            this._targetPlatformPromise = computeTargetPlatform(this.fileService, this.logService);
        }
        return this._targetPlatformPromise;
    }
    async getMetadata(extension) {
        const server = this.getServer(extension);
        if (!server) {
            return undefined;
        }
        return server.extensionManagementService.getMetadata(extension);
    }
    registerParticipant() { throw new Error('Not Supported'); }
};
ExtensionManagementService = __decorate([
    __param(0, IExtensionManagementServerService),
    __param(1, IExtensionGalleryService),
    __param(2, IConfigurationService),
    __param(3, IProductService),
    __param(4, IDownloadService),
    __param(5, IUserDataSyncEnablementService),
    __param(6, IDialogService),
    __param(7, IWorkspaceTrustRequestService),
    __param(8, IExtensionManifestPropertiesService),
    __param(9, IFileService),
    __param(10, ILogService),
    __param(11, IInstantiationService)
], ExtensionManagementService);
export { ExtensionManagementService };

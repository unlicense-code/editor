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
import { localize } from 'vs/nls';
import { Event, Emitter } from 'vs/base/common/event';
import { Disposable, toDisposable } from 'vs/base/common/lifecycle';
import { IExtensionManagementService, IGlobalExtensionEnablementService, ENABLED_EXTENSIONS_STORAGE_PATH, DISABLED_EXTENSIONS_STORAGE_PATH } from 'vs/platform/extensionManagement/common/extensionManagement';
import { IWorkbenchExtensionEnablementService, IExtensionManagementServerService, IWorkbenchExtensionManagementService } from 'vs/workbench/services/extensionManagement/common/extensionManagement';
import { areSameExtensions, BetterMergeId, getExtensionDependencies } from 'vs/platform/extensionManagement/common/extensionManagementUtil';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { isAuthenticationProviderExtension, isLanguagePackExtension, isResolverExtension } from 'vs/platform/extensions/common/extensions';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { StorageManager } from 'vs/platform/extensionManagement/common/extensionEnablementService';
import { webWorkerExtHostConfig } from 'vs/workbench/services/extensions/common/extensions';
import { IUserDataSyncAccountService } from 'vs/platform/userDataSync/common/userDataSyncAccount';
import { IUserDataSyncEnablementService } from 'vs/platform/userDataSync/common/userDataSync';
import { ILifecycleService } from 'vs/workbench/services/lifecycle/common/lifecycle';
import { INotificationService, Severity } from 'vs/platform/notification/common/notification';
import { IHostService } from 'vs/workbench/services/host/browser/host';
import { IExtensionBisectService } from 'vs/workbench/services/extensionManagement/browser/extensionBisect';
import { IWorkspaceTrustManagementService, IWorkspaceTrustRequestService } from 'vs/platform/workspace/common/workspaceTrust';
import { IExtensionManifestPropertiesService } from 'vs/workbench/services/extensions/common/extensionManifestPropertiesService';
import { isVirtualWorkspace } from 'vs/platform/workspace/common/virtualWorkspace';
import { ILogService } from 'vs/platform/log/common/log';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
const SOURCE = 'IWorkbenchExtensionEnablementService';
let ExtensionEnablementService = class ExtensionEnablementService extends Disposable {
    globalExtensionEnablementService;
    contextService;
    environmentService;
    configurationService;
    extensionManagementServerService;
    userDataSyncEnablementService;
    userDataSyncAccountService;
    lifecycleService;
    notificationService;
    hostService;
    extensionBisectService;
    workspaceTrustManagementService;
    workspaceTrustRequestService;
    extensionManifestPropertiesService;
    _onEnablementChanged = new Emitter();
    onEnablementChanged = this._onEnablementChanged.event;
    extensionsManager;
    storageManger;
    constructor(storageService, globalExtensionEnablementService, contextService, environmentService, extensionManagementService, configurationService, extensionManagementServerService, userDataSyncEnablementService, userDataSyncAccountService, lifecycleService, notificationService, hostService, extensionBisectService, workspaceTrustManagementService, workspaceTrustRequestService, extensionManifestPropertiesService, instantiationService) {
        super();
        this.globalExtensionEnablementService = globalExtensionEnablementService;
        this.contextService = contextService;
        this.environmentService = environmentService;
        this.configurationService = configurationService;
        this.extensionManagementServerService = extensionManagementServerService;
        this.userDataSyncEnablementService = userDataSyncEnablementService;
        this.userDataSyncAccountService = userDataSyncAccountService;
        this.lifecycleService = lifecycleService;
        this.notificationService = notificationService;
        this.hostService = hostService;
        this.extensionBisectService = extensionBisectService;
        this.workspaceTrustManagementService = workspaceTrustManagementService;
        this.workspaceTrustRequestService = workspaceTrustRequestService;
        this.extensionManifestPropertiesService = extensionManifestPropertiesService;
        this.storageManger = this._register(new StorageManager(storageService));
        const uninstallDisposable = this._register(Event.filter(extensionManagementService.onDidUninstallExtension, e => !e.error)(({ identifier }) => this._reset(identifier)));
        let isDisposed = false;
        this._register(toDisposable(() => isDisposed = true));
        this.extensionsManager = this._register(instantiationService.createInstance(ExtensionsManager));
        this.extensionsManager.whenInitialized().then(() => {
            if (!isDisposed) {
                this._register(this.extensionsManager.onDidChangeExtensions(({ added, removed }) => this._onDidChangeExtensions(added, removed)));
                uninstallDisposable.dispose();
            }
        });
        this._register(this.globalExtensionEnablementService.onDidChangeEnablement(({ extensions, source }) => this._onDidChangeGloballyDisabledExtensions(extensions, source)));
        // delay notification for extensions disabled until workbench restored
        if (this.allUserExtensionsDisabled) {
            this.lifecycleService.when(4 /* LifecyclePhase.Eventually */).then(() => {
                this.notificationService.prompt(Severity.Info, localize('extensionsDisabled', "All installed extensions are temporarily disabled."), [{
                        label: localize('Reload', "Reload and Enable Extensions"),
                        run: () => hostService.reload({ disableExtensions: false })
                    }]);
            });
        }
    }
    get hasWorkspace() {
        return this.contextService.getWorkbenchState() !== 1 /* WorkbenchState.EMPTY */;
    }
    get allUserExtensionsDisabled() {
        return this.environmentService.disableExtensions === true;
    }
    getEnablementState(extension) {
        return this._computeEnablementState(extension, this.extensionsManager.extensions, this.getWorkspaceType());
    }
    getEnablementStates(extensions, workspaceTypeOverrides = {}) {
        const extensionsEnablements = new Map();
        const workspaceType = { ...this.getWorkspaceType(), ...workspaceTypeOverrides };
        return extensions.map(extension => this._computeEnablementState(extension, extensions, workspaceType, extensionsEnablements));
    }
    getDependenciesEnablementStates(extension) {
        return getExtensionDependencies(this.extensionsManager.extensions, extension).map(e => [e, this.getEnablementState(e)]);
    }
    canChangeEnablement(extension) {
        try {
            this.throwErrorIfCannotChangeEnablement(extension);
            return true;
        }
        catch (error) {
            return false;
        }
    }
    canChangeWorkspaceEnablement(extension) {
        if (!this.canChangeEnablement(extension)) {
            return false;
        }
        try {
            this.throwErrorIfCannotChangeWorkspaceEnablement(extension);
            return true;
        }
        catch (error) {
            return false;
        }
    }
    throwErrorIfCannotChangeEnablement(extension, donotCheckDependencies) {
        if (isLanguagePackExtension(extension.manifest)) {
            throw new Error(localize('cannot disable language pack extension', "Cannot change enablement of {0} extension because it contributes language packs.", extension.manifest.displayName || extension.identifier.id));
        }
        if (this.userDataSyncEnablementService.isEnabled() && this.userDataSyncAccountService.account &&
            isAuthenticationProviderExtension(extension.manifest) && extension.manifest.contributes.authentication.some(a => a.id === this.userDataSyncAccountService.account.authenticationProviderId)) {
            throw new Error(localize('cannot disable auth extension', "Cannot change enablement {0} extension because Settings Sync depends on it.", extension.manifest.displayName || extension.identifier.id));
        }
        if (this._isEnabledInEnv(extension)) {
            throw new Error(localize('cannot change enablement environment', "Cannot change enablement of {0} extension because it is enabled in environment", extension.manifest.displayName || extension.identifier.id));
        }
        this.throwErrorIfEnablementStateCannotBeChanged(extension, this.getEnablementState(extension), donotCheckDependencies);
    }
    throwErrorIfEnablementStateCannotBeChanged(extension, enablementStateOfExtension, donotCheckDependencies) {
        switch (enablementStateOfExtension) {
            case 2 /* EnablementState.DisabledByEnvironment */:
                throw new Error(localize('cannot change disablement environment', "Cannot change enablement of {0} extension because it is disabled in environment", extension.manifest.displayName || extension.identifier.id));
            case 4 /* EnablementState.DisabledByVirtualWorkspace */:
                throw new Error(localize('cannot change enablement virtual workspace', "Cannot change enablement of {0} extension because it does not support virtual workspaces", extension.manifest.displayName || extension.identifier.id));
            case 1 /* EnablementState.DisabledByExtensionKind */:
                throw new Error(localize('cannot change enablement extension kind', "Cannot change enablement of {0} extension because of its extension kind", extension.manifest.displayName || extension.identifier.id));
            case 5 /* EnablementState.DisabledByExtensionDependency */:
                if (donotCheckDependencies) {
                    break;
                }
                // Can be changed only when all its dependencies enablements can be changed
                for (const dependency of getExtensionDependencies(this.extensionsManager.extensions, extension)) {
                    if (this.isEnabled(dependency)) {
                        continue;
                    }
                    try {
                        this.throwErrorIfCannotChangeEnablement(dependency, true);
                    }
                    catch (error) {
                        throw new Error(localize('cannot change enablement dependency', "Cannot enable '{0}' extension because it depends on '{1}' extension that cannot be enabled", extension.manifest.displayName || extension.identifier.id, dependency.manifest.displayName || dependency.identifier.id));
                    }
                }
        }
    }
    throwErrorIfCannotChangeWorkspaceEnablement(extension) {
        if (!this.hasWorkspace) {
            throw new Error(localize('noWorkspace', "No workspace."));
        }
        if (isAuthenticationProviderExtension(extension.manifest)) {
            throw new Error(localize('cannot disable auth extension in workspace', "Cannot change enablement of {0} extension in workspace because it contributes authentication providers", extension.manifest.displayName || extension.identifier.id));
        }
    }
    async setEnablement(extensions, newState) {
        await this.extensionsManager.whenInitialized();
        if (newState === 8 /* EnablementState.EnabledGlobally */ || newState === 9 /* EnablementState.EnabledWorkspace */) {
            extensions.push(...this.getExtensionsToEnableRecursively(extensions, this.extensionsManager.extensions, newState, { dependencies: true, pack: true }));
        }
        const workspace = newState === 7 /* EnablementState.DisabledWorkspace */ || newState === 9 /* EnablementState.EnabledWorkspace */;
        for (const extension of extensions) {
            if (workspace) {
                this.throwErrorIfCannotChangeWorkspaceEnablement(extension);
            }
            else {
                this.throwErrorIfCannotChangeEnablement(extension);
            }
        }
        const result = [];
        for (const extension of extensions) {
            const enablementState = this.getEnablementState(extension);
            if (enablementState === 0 /* EnablementState.DisabledByTrustRequirement */
                /* All its disabled dependencies are disabled by Trust Requirement */
                || (enablementState === 5 /* EnablementState.DisabledByExtensionDependency */ && this.getDependenciesEnablementStates(extension).every(([, e]) => this.isEnabledEnablementState(e) || e === 0 /* EnablementState.DisabledByTrustRequirement */))) {
                const trustState = await this.workspaceTrustRequestService.requestWorkspaceTrust();
                result.push(trustState ?? false);
            }
            else {
                result.push(await this._setUserEnablementState(extension, newState));
            }
        }
        const changedExtensions = extensions.filter((e, index) => result[index]);
        if (changedExtensions.length) {
            this._onEnablementChanged.fire(changedExtensions);
        }
        return result;
    }
    getExtensionsToEnableRecursively(extensions, allExtensions, enablementState, options, checked = []) {
        if (!options.dependencies && !options.pack) {
            return [];
        }
        const toCheck = extensions.filter(e => checked.indexOf(e) === -1);
        if (!toCheck.length) {
            return [];
        }
        for (const extension of toCheck) {
            checked.push(extension);
        }
        const extensionsToEnable = [];
        for (const extension of allExtensions) {
            // Extension is already checked
            if (checked.some(e => areSameExtensions(e.identifier, extension.identifier))) {
                continue;
            }
            const enablementStateOfExtension = this.getEnablementState(extension);
            // Extension is enabled
            if (this.isEnabledEnablementState(enablementStateOfExtension)) {
                continue;
            }
            // Skip if dependency extension is disabled by extension kind
            if (enablementStateOfExtension === 1 /* EnablementState.DisabledByExtensionKind */) {
                continue;
            }
            // Check if the extension is a dependency or in extension pack
            if (extensions.some(e => (options.dependencies && e.manifest.extensionDependencies?.some(id => areSameExtensions({ id }, extension.identifier)))
                || (options.pack && e.manifest.extensionPack?.some(id => areSameExtensions({ id }, extension.identifier))))) {
                const index = extensionsToEnable.findIndex(e => areSameExtensions(e.identifier, extension.identifier));
                // Extension is not aded to the disablement list so add it
                if (index === -1) {
                    extensionsToEnable.push(extension);
                }
                // Extension is there already in the disablement list.
                else {
                    try {
                        // Replace only if the enablement state can be changed
                        this.throwErrorIfEnablementStateCannotBeChanged(extension, enablementStateOfExtension, true);
                        extensionsToEnable.splice(index, 1, extension);
                    }
                    catch (error) { /*Do not add*/ }
                }
            }
        }
        if (extensionsToEnable.length) {
            extensionsToEnable.push(...this.getExtensionsToEnableRecursively(extensionsToEnable, allExtensions, enablementState, options, checked));
        }
        return extensionsToEnable;
    }
    _setUserEnablementState(extension, newState) {
        const currentState = this._getUserEnablementState(extension.identifier);
        if (currentState === newState) {
            return Promise.resolve(false);
        }
        switch (newState) {
            case 8 /* EnablementState.EnabledGlobally */:
                this._enableExtension(extension.identifier);
                break;
            case 6 /* EnablementState.DisabledGlobally */:
                this._disableExtension(extension.identifier);
                break;
            case 9 /* EnablementState.EnabledWorkspace */:
                this._enableExtensionInWorkspace(extension.identifier);
                break;
            case 7 /* EnablementState.DisabledWorkspace */:
                this._disableExtensionInWorkspace(extension.identifier);
                break;
        }
        return Promise.resolve(true);
    }
    isEnabled(extension) {
        const enablementState = this.getEnablementState(extension);
        return this.isEnabledEnablementState(enablementState);
    }
    isEnabledEnablementState(enablementState) {
        return enablementState === 3 /* EnablementState.EnabledByEnvironment */ || enablementState === 9 /* EnablementState.EnabledWorkspace */ || enablementState === 8 /* EnablementState.EnabledGlobally */;
    }
    isDisabledGlobally(extension) {
        return this._isDisabledGlobally(extension.identifier);
    }
    _computeEnablementState(extension, extensions, workspaceType, computedEnablementStates) {
        computedEnablementStates = computedEnablementStates ?? new Map();
        let enablementState = computedEnablementStates.get(extension);
        if (enablementState !== undefined) {
            return enablementState;
        }
        enablementState = this._getUserEnablementState(extension.identifier);
        if (this.extensionBisectService.isDisabledByBisect(extension)) {
            enablementState = 2 /* EnablementState.DisabledByEnvironment */;
        }
        else if (this._isDisabledInEnv(extension)) {
            enablementState = 2 /* EnablementState.DisabledByEnvironment */;
        }
        else if (this._isDisabledByVirtualWorkspace(extension, workspaceType)) {
            enablementState = 4 /* EnablementState.DisabledByVirtualWorkspace */;
        }
        else if (this.isEnabledEnablementState(enablementState) && this._isDisabledByWorkspaceTrust(extension, workspaceType)) {
            enablementState = 0 /* EnablementState.DisabledByTrustRequirement */;
        }
        else if (this._isDisabledByExtensionKind(extension)) {
            enablementState = 1 /* EnablementState.DisabledByExtensionKind */;
        }
        else if (this.isEnabledEnablementState(enablementState) && this._isDisabledByExtensionDependency(extension, extensions, workspaceType, computedEnablementStates)) {
            enablementState = 5 /* EnablementState.DisabledByExtensionDependency */;
        }
        else if (!this.isEnabledEnablementState(enablementState) && this._isEnabledInEnv(extension)) {
            enablementState = 3 /* EnablementState.EnabledByEnvironment */;
        }
        computedEnablementStates.set(extension, enablementState);
        return enablementState;
    }
    _isDisabledInEnv(extension) {
        if (this.allUserExtensionsDisabled) {
            return !extension.isBuiltin && !isResolverExtension(extension.manifest, this.environmentService.remoteAuthority);
        }
        const disabledExtensions = this.environmentService.disableExtensions;
        if (Array.isArray(disabledExtensions)) {
            return disabledExtensions.some(id => areSameExtensions({ id }, extension.identifier));
        }
        // Check if this is the better merge extension which was migrated to a built-in extension
        if (areSameExtensions({ id: BetterMergeId.value }, extension.identifier)) {
            return true;
        }
        return false;
    }
    _isEnabledInEnv(extension) {
        const enabledExtensions = this.environmentService.enableExtensions;
        if (Array.isArray(enabledExtensions)) {
            return enabledExtensions.some(id => areSameExtensions({ id }, extension.identifier));
        }
        return false;
    }
    _isDisabledByVirtualWorkspace(extension, workspaceType) {
        // Not a virtual workspace
        if (!workspaceType.virtual) {
            return false;
        }
        // Supports virtual workspace
        if (this.extensionManifestPropertiesService.getExtensionVirtualWorkspaceSupportType(extension.manifest) !== false) {
            return false;
        }
        // Web extension from web extension management server
        if (this.extensionManagementServerService.getExtensionManagementServer(extension) === this.extensionManagementServerService.webExtensionManagementServer && this.extensionManifestPropertiesService.canExecuteOnWeb(extension.manifest)) {
            return false;
        }
        return true;
    }
    _isDisabledByExtensionKind(extension) {
        if (this.extensionManagementServerService.remoteExtensionManagementServer || this.extensionManagementServerService.webExtensionManagementServer) {
            const installLocation = this.extensionManagementServerService.getExtensionInstallLocation(extension);
            for (const extensionKind of this.extensionManifestPropertiesService.getExtensionKind(extension.manifest)) {
                if (extensionKind === 'ui') {
                    if (installLocation === 1 /* ExtensionInstallLocation.Local */) {
                        return false;
                    }
                }
                if (extensionKind === 'workspace') {
                    if (installLocation === 2 /* ExtensionInstallLocation.Remote */) {
                        return false;
                    }
                }
                if (extensionKind === 'web') {
                    if (this.extensionManagementServerService.webExtensionManagementServer /* web */) {
                        if (installLocation === 3 /* ExtensionInstallLocation.Web */ || installLocation === 2 /* ExtensionInstallLocation.Remote */) {
                            return false;
                        }
                    }
                    else if (installLocation === 1 /* ExtensionInstallLocation.Local */) {
                        const enableLocalWebWorker = this.configurationService.getValue(webWorkerExtHostConfig);
                        if (enableLocalWebWorker === true || enableLocalWebWorker === 'auto') {
                            // Web extensions are enabled on all configurations
                            return false;
                        }
                    }
                }
            }
            return true;
        }
        return false;
    }
    _isDisabledByWorkspaceTrust(extension, workspaceType) {
        if (workspaceType.trusted) {
            return false;
        }
        return this.extensionManifestPropertiesService.getExtensionUntrustedWorkspaceSupportType(extension.manifest) === false;
    }
    _isDisabledByExtensionDependency(extension, extensions, workspaceType, computedEnablementStates) {
        // Find dependencies from the same server as of the extension
        const dependencyExtensions = extension.manifest.extensionDependencies
            ? extensions.filter(e => extension.manifest.extensionDependencies.some(id => areSameExtensions(e.identifier, { id }) && this.extensionManagementServerService.getExtensionManagementServer(e) === this.extensionManagementServerService.getExtensionManagementServer(extension)))
            : [];
        if (!dependencyExtensions.length) {
            return false;
        }
        const hasEnablementState = computedEnablementStates.has(extension);
        if (!hasEnablementState) {
            // Placeholder to handle cyclic deps
            computedEnablementStates.set(extension, 8 /* EnablementState.EnabledGlobally */);
        }
        try {
            for (const dependencyExtension of dependencyExtensions) {
                const enablementState = this._computeEnablementState(dependencyExtension, extensions, workspaceType, computedEnablementStates);
                if (!this.isEnabledEnablementState(enablementState) && enablementState !== 1 /* EnablementState.DisabledByExtensionKind */) {
                    return true;
                }
            }
        }
        finally {
            if (!hasEnablementState) {
                // remove the placeholder
                computedEnablementStates.delete(extension);
            }
        }
        return false;
    }
    _getUserEnablementState(identifier) {
        if (this.hasWorkspace) {
            if (this._getWorkspaceEnabledExtensions().filter(e => areSameExtensions(e, identifier))[0]) {
                return 9 /* EnablementState.EnabledWorkspace */;
            }
            if (this._getWorkspaceDisabledExtensions().filter(e => areSameExtensions(e, identifier))[0]) {
                return 7 /* EnablementState.DisabledWorkspace */;
            }
        }
        if (this._isDisabledGlobally(identifier)) {
            return 6 /* EnablementState.DisabledGlobally */;
        }
        return 8 /* EnablementState.EnabledGlobally */;
    }
    _isDisabledGlobally(identifier) {
        return this.globalExtensionEnablementService.getDisabledExtensions().some(e => areSameExtensions(e, identifier));
    }
    _enableExtension(identifier) {
        this._removeFromWorkspaceDisabledExtensions(identifier);
        this._removeFromWorkspaceEnabledExtensions(identifier);
        return this.globalExtensionEnablementService.enableExtension(identifier, SOURCE);
    }
    _disableExtension(identifier) {
        this._removeFromWorkspaceDisabledExtensions(identifier);
        this._removeFromWorkspaceEnabledExtensions(identifier);
        return this.globalExtensionEnablementService.disableExtension(identifier, SOURCE);
    }
    _enableExtensionInWorkspace(identifier) {
        this._removeFromWorkspaceDisabledExtensions(identifier);
        this._addToWorkspaceEnabledExtensions(identifier);
    }
    _disableExtensionInWorkspace(identifier) {
        this._addToWorkspaceDisabledExtensions(identifier);
        this._removeFromWorkspaceEnabledExtensions(identifier);
    }
    _addToWorkspaceDisabledExtensions(identifier) {
        if (!this.hasWorkspace) {
            return Promise.resolve(false);
        }
        const disabledExtensions = this._getWorkspaceDisabledExtensions();
        if (disabledExtensions.every(e => !areSameExtensions(e, identifier))) {
            disabledExtensions.push(identifier);
            this._setDisabledExtensions(disabledExtensions);
            return Promise.resolve(true);
        }
        return Promise.resolve(false);
    }
    async _removeFromWorkspaceDisabledExtensions(identifier) {
        if (!this.hasWorkspace) {
            return false;
        }
        const disabledExtensions = this._getWorkspaceDisabledExtensions();
        for (let index = 0; index < disabledExtensions.length; index++) {
            const disabledExtension = disabledExtensions[index];
            if (areSameExtensions(disabledExtension, identifier)) {
                disabledExtensions.splice(index, 1);
                this._setDisabledExtensions(disabledExtensions);
                return true;
            }
        }
        return false;
    }
    _addToWorkspaceEnabledExtensions(identifier) {
        if (!this.hasWorkspace) {
            return false;
        }
        const enabledExtensions = this._getWorkspaceEnabledExtensions();
        if (enabledExtensions.every(e => !areSameExtensions(e, identifier))) {
            enabledExtensions.push(identifier);
            this._setEnabledExtensions(enabledExtensions);
            return true;
        }
        return false;
    }
    _removeFromWorkspaceEnabledExtensions(identifier) {
        if (!this.hasWorkspace) {
            return false;
        }
        const enabledExtensions = this._getWorkspaceEnabledExtensions();
        for (let index = 0; index < enabledExtensions.length; index++) {
            const disabledExtension = enabledExtensions[index];
            if (areSameExtensions(disabledExtension, identifier)) {
                enabledExtensions.splice(index, 1);
                this._setEnabledExtensions(enabledExtensions);
                return true;
            }
        }
        return false;
    }
    _getWorkspaceEnabledExtensions() {
        return this._getExtensions(ENABLED_EXTENSIONS_STORAGE_PATH);
    }
    _setEnabledExtensions(enabledExtensions) {
        this._setExtensions(ENABLED_EXTENSIONS_STORAGE_PATH, enabledExtensions);
    }
    _getWorkspaceDisabledExtensions() {
        return this._getExtensions(DISABLED_EXTENSIONS_STORAGE_PATH);
    }
    _setDisabledExtensions(disabledExtensions) {
        this._setExtensions(DISABLED_EXTENSIONS_STORAGE_PATH, disabledExtensions);
    }
    _getExtensions(storageId) {
        if (!this.hasWorkspace) {
            return [];
        }
        return this.storageManger.get(storageId, 1 /* StorageScope.WORKSPACE */);
    }
    _setExtensions(storageId, extensions) {
        this.storageManger.set(storageId, extensions, 1 /* StorageScope.WORKSPACE */);
    }
    async _onDidChangeGloballyDisabledExtensions(extensionIdentifiers, source) {
        if (source !== SOURCE) {
            await this.extensionsManager.whenInitialized();
            const extensions = this.extensionsManager.extensions.filter(installedExtension => extensionIdentifiers.some(identifier => areSameExtensions(identifier, installedExtension.identifier)));
            this._onEnablementChanged.fire(extensions);
        }
    }
    _onDidChangeExtensions(added, removed) {
        const disabledExtensions = added.filter(e => !this.isEnabledEnablementState(this.getEnablementState(e)));
        if (disabledExtensions.length) {
            this._onEnablementChanged.fire(disabledExtensions);
        }
        removed.forEach(({ identifier }) => this._reset(identifier));
    }
    async updateExtensionsEnablementsWhenWorkspaceTrustChanges() {
        await this.extensionsManager.whenInitialized();
        const computeEnablementStates = (workspaceType) => {
            const extensionsEnablements = new Map();
            return this.extensionsManager.extensions.map(extension => [extension, this._computeEnablementState(extension, this.extensionsManager.extensions, workspaceType, extensionsEnablements)]);
        };
        const workspaceType = this.getWorkspaceType();
        const enablementStatesWithTrustedWorkspace = computeEnablementStates({ ...workspaceType, trusted: true });
        const enablementStatesWithUntrustedWorkspace = computeEnablementStates({ ...workspaceType, trusted: false });
        const enablementChangedExtensionsBecauseOfTrust = enablementStatesWithTrustedWorkspace.filter(([, enablementState], index) => enablementState !== enablementStatesWithUntrustedWorkspace[index][1]).map(([extension]) => extension);
        if (enablementChangedExtensionsBecauseOfTrust.length) {
            this._onEnablementChanged.fire(enablementChangedExtensionsBecauseOfTrust);
        }
    }
    getWorkspaceType() {
        return { trusted: this.workspaceTrustManagementService.isWorkspaceTrusted(), virtual: isVirtualWorkspace(this.contextService.getWorkspace()) };
    }
    _reset(extension) {
        this._removeFromWorkspaceDisabledExtensions(extension);
        this._removeFromWorkspaceEnabledExtensions(extension);
        this.globalExtensionEnablementService.enableExtension(extension);
    }
};
ExtensionEnablementService = __decorate([
    __param(0, IStorageService),
    __param(1, IGlobalExtensionEnablementService),
    __param(2, IWorkspaceContextService),
    __param(3, IWorkbenchEnvironmentService),
    __param(4, IExtensionManagementService),
    __param(5, IConfigurationService),
    __param(6, IExtensionManagementServerService),
    __param(7, IUserDataSyncEnablementService),
    __param(8, IUserDataSyncAccountService),
    __param(9, ILifecycleService),
    __param(10, INotificationService),
    __param(11, IHostService),
    __param(12, IExtensionBisectService),
    __param(13, IWorkspaceTrustManagementService),
    __param(14, IWorkspaceTrustRequestService),
    __param(15, IExtensionManifestPropertiesService),
    __param(16, IInstantiationService)
], ExtensionEnablementService);
export { ExtensionEnablementService };
let ExtensionsManager = class ExtensionsManager extends Disposable {
    extensionManagementService;
    extensionManagementServerService;
    logService;
    _extensions = [];
    get extensions() { return this._extensions; }
    _onDidChangeExtensions = this._register(new Emitter());
    onDidChangeExtensions = this._onDidChangeExtensions.event;
    initializePromise;
    disposed = false;
    constructor(extensionManagementService, extensionManagementServerService, logService) {
        super();
        this.extensionManagementService = extensionManagementService;
        this.extensionManagementServerService = extensionManagementServerService;
        this.logService = logService;
        this._register(toDisposable(() => this.disposed = true));
        this.initializePromise = this.initialize();
    }
    whenInitialized() {
        return this.initializePromise;
    }
    async initialize() {
        try {
            this._extensions = await this.extensionManagementService.getInstalled();
            if (this.disposed) {
                return;
            }
            this._onDidChangeExtensions.fire({ added: this.extensions, removed: [] });
        }
        catch (error) {
            this.logService.error(error);
        }
        this._register(this.extensionManagementService.onDidInstallExtensions(e => this.onDidInstallExtensions(e.reduce((result, { local, operation }) => { if (local && operation !== 4 /* InstallOperation.Migrate */) {
            result.push(local);
        } return result; }, []))));
        this._register(Event.filter(this.extensionManagementService.onDidUninstallExtension, (e => !e.error))(e => this.onDidUninstallExtensions([e.identifier], e.server)));
        this._register(this.extensionManagementService.onDidChangeProfile(({ added, removed, server }) => { this.onDidInstallExtensions(added); this.onDidUninstallExtensions(removed.map(({ identifier }) => identifier), server); }));
    }
    onDidInstallExtensions(extensions) {
        if (extensions.length) {
            this._extensions.push(...extensions);
            this._onDidChangeExtensions.fire({ added: extensions, removed: [] });
        }
    }
    onDidUninstallExtensions(identifiers, server) {
        const removed = [];
        for (const identifier of identifiers) {
            const index = this._extensions.findIndex(e => areSameExtensions(e.identifier, identifier) && this.extensionManagementServerService.getExtensionManagementServer(e) === server);
            if (index !== -1) {
                removed.push(...this._extensions.splice(index, 1));
            }
        }
        if (removed.length) {
            this._onDidChangeExtensions.fire({ added: [], removed });
        }
    }
};
ExtensionsManager = __decorate([
    __param(0, IWorkbenchExtensionManagementService),
    __param(1, IExtensionManagementServerService),
    __param(2, ILogService)
], ExtensionsManager);
registerSingleton(IWorkbenchExtensionEnablementService, ExtensionEnablementService, 1 /* InstantiationType.Delayed */);

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
import { URI } from 'vs/base/common/uri';
import { Emitter } from 'vs/base/common/event';
import { ResourceMap } from 'vs/base/common/map';
import { equals } from 'vs/base/common/objects';
import { Disposable, DisposableStore } from 'vs/base/common/lifecycle';
import { Queue, Barrier, runWhenIdle, Promises } from 'vs/base/common/async';
import { Extensions as JSONExtensions } from 'vs/platform/jsonschemas/common/jsonContributionRegistry';
import { IWorkspaceContextService, Workspace as BaseWorkspace, toWorkspaceFolder, isWorkspaceFolder, isSingleFolderWorkspaceIdentifier, isWorkspaceIdentifier } from 'vs/platform/workspace/common/workspace';
import { ConfigurationModel, ConfigurationChangeEvent, mergeChanges } from 'vs/platform/configuration/common/configurationModels';
import { isConfigurationOverrides, ConfigurationTargetToString, isConfigurationUpdateOverrides, IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { NullPolicyConfiguration, PolicyConfiguration } from 'vs/platform/configuration/common/configurations';
import { Configuration } from 'vs/workbench/services/configuration/common/configurationModels';
import { FOLDER_CONFIG_FOLDER_NAME, defaultSettingsSchemaId, userSettingsSchemaId, workspaceSettingsSchemaId, folderSettingsSchemaId, machineSettingsSchemaId, LOCAL_MACHINE_SCOPES, PROFILE_SCOPES, LOCAL_MACHINE_PROFILE_SCOPES, profileSettingsSchemaId } from 'vs/workbench/services/configuration/common/configuration';
import { Registry } from 'vs/platform/registry/common/platform';
import { Extensions, allSettings, windowSettings, resourceSettings, applicationSettings, machineSettings, machineOverridableSettings, keyFromOverrideIdentifiers, OVERRIDE_PROPERTY_PATTERN, resourceLanguageSettingsSchemaId, configurationDefaultsSchemaId } from 'vs/platform/configuration/common/configurationRegistry';
import { isStoredWorkspaceFolder, getStoredWorkspaceFolder, toWorkspaceFolders } from 'vs/platform/workspaces/common/workspaces';
import { ConfigurationEditing } from 'vs/workbench/services/configuration/common/configurationEditing';
import { WorkspaceConfiguration, FolderConfiguration, RemoteUserConfiguration, UserConfiguration, DefaultConfiguration } from 'vs/workbench/services/configuration/browser/configuration';
import { mark } from 'vs/base/common/performance';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { Extensions as WorkbenchExtensions } from 'vs/workbench/common/contributions';
import { toErrorMessage } from 'vs/base/common/errorMessage';
import { IWorkspaceTrustManagementService } from 'vs/platform/workspace/common/workspaceTrust';
import { delta, distinct } from 'vs/base/common/arrays';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { IWorkbenchAssignmentService } from 'vs/workbench/services/assignment/common/assignmentService';
import { isUndefined } from 'vs/base/common/types';
import { localize } from 'vs/nls';
import { NullPolicyService } from 'vs/platform/policy/common/policy';
import { updateIgnoredSettings } from 'vs/platform/userDataSync/common/settingsMerge';
import { VSBuffer } from 'vs/base/common/buffer';
import { IJSONEditingService } from 'vs/workbench/services/configuration/common/jsonEditing';
function getLocalUserConfigurationScopes(userDataProfile, hasRemote) {
    return userDataProfile.isDefault
        ? hasRemote ? LOCAL_MACHINE_SCOPES : undefined
        : hasRemote ? LOCAL_MACHINE_PROFILE_SCOPES : PROFILE_SCOPES;
}
class Workspace extends BaseWorkspace {
    initialized = false;
}
export class WorkspaceService extends Disposable {
    userDataProfileService;
    userDataProfilesService;
    fileService;
    remoteAgentService;
    uriIdentityService;
    logService;
    _serviceBrand;
    workspace;
    initRemoteUserConfigurationBarrier;
    completeWorkspaceBarrier;
    configurationCache;
    _configuration;
    initialized = false;
    defaultConfiguration;
    policyConfiguration;
    applicationConfiguration = null;
    applicationConfigurationDisposables;
    localUserConfiguration;
    remoteUserConfiguration = null;
    workspaceConfiguration;
    cachedFolderConfigs;
    workspaceEditingQueue;
    _onDidChangeConfiguration = this._register(new Emitter());
    onDidChangeConfiguration = this._onDidChangeConfiguration.event;
    _onWillChangeWorkspaceFolders = this._register(new Emitter());
    onWillChangeWorkspaceFolders = this._onWillChangeWorkspaceFolders.event;
    _onDidChangeWorkspaceFolders = this._register(new Emitter());
    onDidChangeWorkspaceFolders = this._onDidChangeWorkspaceFolders.event;
    _onDidChangeWorkspaceName = this._register(new Emitter());
    onDidChangeWorkspaceName = this._onDidChangeWorkspaceName.event;
    _onDidChangeWorkbenchState = this._register(new Emitter());
    onDidChangeWorkbenchState = this._onDidChangeWorkbenchState.event;
    isWorkspaceTrusted = true;
    _restrictedSettings = { default: [] };
    get restrictedSettings() { return this._restrictedSettings; }
    _onDidChangeRestrictedSettings = this._register(new Emitter());
    onDidChangeRestrictedSettings = this._onDidChangeRestrictedSettings.event;
    configurationRegistry;
    instantiationService;
    configurationEditing;
    constructor({ remoteAuthority, configurationCache }, environmentService, userDataProfileService, userDataProfilesService, fileService, remoteAgentService, uriIdentityService, logService, policyService) {
        super();
        this.userDataProfileService = userDataProfileService;
        this.userDataProfilesService = userDataProfilesService;
        this.fileService = fileService;
        this.remoteAgentService = remoteAgentService;
        this.uriIdentityService = uriIdentityService;
        this.logService = logService;
        this.configurationRegistry = Registry.as(Extensions.Configuration);
        this.initRemoteUserConfigurationBarrier = new Barrier();
        this.completeWorkspaceBarrier = new Barrier();
        this.defaultConfiguration = this._register(new DefaultConfiguration(configurationCache, environmentService));
        this.policyConfiguration = policyService instanceof NullPolicyService ? new NullPolicyConfiguration() : this._register(new PolicyConfiguration(this.defaultConfiguration, policyService, logService));
        this.configurationCache = configurationCache;
        this._configuration = new Configuration(this.defaultConfiguration.configurationModel, this.policyConfiguration.configurationModel, new ConfigurationModel(), new ConfigurationModel(), new ConfigurationModel(), new ConfigurationModel(), new ResourceMap(), new ConfigurationModel(), new ResourceMap(), this.workspace);
        this.applicationConfigurationDisposables = this._register(new DisposableStore());
        this.createApplicationConfiguration();
        this.localUserConfiguration = this._register(new UserConfiguration(userDataProfileService.currentProfile.settingsResource, userDataProfileService.currentProfile.tasksResource, getLocalUserConfigurationScopes(userDataProfileService.currentProfile, !!remoteAuthority), fileService, uriIdentityService, logService));
        this.cachedFolderConfigs = new ResourceMap();
        this._register(this.localUserConfiguration.onDidChangeConfiguration(userConfiguration => this.onLocalUserConfigurationChanged(userConfiguration)));
        if (remoteAuthority) {
            const remoteUserConfiguration = this.remoteUserConfiguration = this._register(new RemoteUserConfiguration(remoteAuthority, configurationCache, fileService, uriIdentityService, remoteAgentService));
            this._register(remoteUserConfiguration.onDidInitialize(remoteUserConfigurationModel => {
                this._register(remoteUserConfiguration.onDidChangeConfiguration(remoteUserConfigurationModel => this.onRemoteUserConfigurationChanged(remoteUserConfigurationModel)));
                this.onRemoteUserConfigurationChanged(remoteUserConfigurationModel);
                this.initRemoteUserConfigurationBarrier.open();
            }));
        }
        else {
            this.initRemoteUserConfigurationBarrier.open();
        }
        this.workspaceConfiguration = this._register(new WorkspaceConfiguration(configurationCache, fileService, uriIdentityService, logService));
        this._register(this.workspaceConfiguration.onDidUpdateConfiguration(fromCache => {
            this.onWorkspaceConfigurationChanged(fromCache).then(() => {
                this.workspace.initialized = this.workspaceConfiguration.initialized;
                this.checkAndMarkWorkspaceComplete(fromCache);
            });
        }));
        this._register(this.defaultConfiguration.onDidChangeConfiguration(({ properties, defaults }) => this.onDefaultConfigurationChanged(defaults, properties)));
        this._register(this.policyConfiguration.onDidChangeConfiguration(configurationModel => this.onPolicyConfigurationChanged(configurationModel)));
        this._register(userDataProfileService.onDidChangeCurrentProfile(e => this.onUserDataProfileChanged(e)));
        this.workspaceEditingQueue = new Queue();
    }
    createApplicationConfiguration() {
        this.applicationConfigurationDisposables.clear();
        if (this.userDataProfileService.currentProfile.isDefault) {
            this.applicationConfiguration = null;
        }
        else {
            this.applicationConfiguration = this.applicationConfigurationDisposables.add(this._register(new UserConfiguration(this.userDataProfilesService.defaultProfile.settingsResource, undefined, [1 /* ConfigurationScope.APPLICATION */], this.fileService, this.uriIdentityService, this.logService)));
            this.applicationConfigurationDisposables.add(this.applicationConfiguration.onDidChangeConfiguration(configurationModel => this.onApplicationConfigurationChanged(configurationModel)));
        }
    }
    // Workspace Context Service Impl
    async getCompleteWorkspace() {
        await this.completeWorkspaceBarrier.wait();
        return this.getWorkspace();
    }
    getWorkspace() {
        return this.workspace;
    }
    getWorkbenchState() {
        // Workspace has configuration file
        if (this.workspace.configuration) {
            return 3 /* WorkbenchState.WORKSPACE */;
        }
        // Folder has single root
        if (this.workspace.folders.length === 1) {
            return 2 /* WorkbenchState.FOLDER */;
        }
        // Empty
        return 1 /* WorkbenchState.EMPTY */;
    }
    getWorkspaceFolder(resource) {
        return this.workspace.getFolder(resource);
    }
    addFolders(foldersToAdd, index) {
        return this.updateFolders(foldersToAdd, [], index);
    }
    removeFolders(foldersToRemove) {
        return this.updateFolders([], foldersToRemove);
    }
    async updateFolders(foldersToAdd, foldersToRemove, index) {
        return this.workspaceEditingQueue.queue(() => this.doUpdateFolders(foldersToAdd, foldersToRemove, index));
    }
    isInsideWorkspace(resource) {
        return !!this.getWorkspaceFolder(resource);
    }
    isCurrentWorkspace(workspaceIdOrFolder) {
        switch (this.getWorkbenchState()) {
            case 2 /* WorkbenchState.FOLDER */: {
                let folderUri = undefined;
                if (URI.isUri(workspaceIdOrFolder)) {
                    folderUri = workspaceIdOrFolder;
                }
                else if (isSingleFolderWorkspaceIdentifier(workspaceIdOrFolder)) {
                    folderUri = workspaceIdOrFolder.uri;
                }
                return URI.isUri(folderUri) && this.uriIdentityService.extUri.isEqual(folderUri, this.workspace.folders[0].uri);
            }
            case 3 /* WorkbenchState.WORKSPACE */:
                return isWorkspaceIdentifier(workspaceIdOrFolder) && this.workspace.id === workspaceIdOrFolder.id;
        }
        return false;
    }
    async doUpdateFolders(foldersToAdd, foldersToRemove, index) {
        if (this.getWorkbenchState() !== 3 /* WorkbenchState.WORKSPACE */) {
            return Promise.resolve(undefined); // we need a workspace to begin with
        }
        if (foldersToAdd.length + foldersToRemove.length === 0) {
            return Promise.resolve(undefined); // nothing to do
        }
        let foldersHaveChanged = false;
        // Remove first (if any)
        let currentWorkspaceFolders = this.getWorkspace().folders;
        let newStoredFolders = currentWorkspaceFolders.map(f => f.raw).filter((folder, index) => {
            if (!isStoredWorkspaceFolder(folder)) {
                return true; // keep entries which are unrelated
            }
            return !this.contains(foldersToRemove, currentWorkspaceFolders[index].uri); // keep entries which are unrelated
        });
        foldersHaveChanged = currentWorkspaceFolders.length !== newStoredFolders.length;
        // Add afterwards (if any)
        if (foldersToAdd.length) {
            // Recompute current workspace folders if we have folders to add
            const workspaceConfigPath = this.getWorkspace().configuration;
            const workspaceConfigFolder = this.uriIdentityService.extUri.dirname(workspaceConfigPath);
            currentWorkspaceFolders = toWorkspaceFolders(newStoredFolders, workspaceConfigPath, this.uriIdentityService.extUri);
            const currentWorkspaceFolderUris = currentWorkspaceFolders.map(folder => folder.uri);
            const storedFoldersToAdd = [];
            for (const folderToAdd of foldersToAdd) {
                const folderURI = folderToAdd.uri;
                if (this.contains(currentWorkspaceFolderUris, folderURI)) {
                    continue; // already existing
                }
                try {
                    const result = await this.fileService.stat(folderURI);
                    if (!result.isDirectory) {
                        continue;
                    }
                }
                catch (e) { /* Ignore */ }
                storedFoldersToAdd.push(getStoredWorkspaceFolder(folderURI, false, folderToAdd.name, workspaceConfigFolder, this.uriIdentityService.extUri));
            }
            // Apply to array of newStoredFolders
            if (storedFoldersToAdd.length > 0) {
                foldersHaveChanged = true;
                if (typeof index === 'number' && index >= 0 && index < newStoredFolders.length) {
                    newStoredFolders = newStoredFolders.slice(0);
                    newStoredFolders.splice(index, 0, ...storedFoldersToAdd);
                }
                else {
                    newStoredFolders = [...newStoredFolders, ...storedFoldersToAdd];
                }
            }
        }
        // Set folders if we recorded a change
        if (foldersHaveChanged) {
            return this.setFolders(newStoredFolders);
        }
        return Promise.resolve(undefined);
    }
    async setFolders(folders) {
        if (!this.instantiationService) {
            throw new Error('Cannot update workspace folders because workspace service is not yet ready to accept writes.');
        }
        await this.instantiationService.invokeFunction(accessor => this.workspaceConfiguration.setFolders(folders, accessor.get(IJSONEditingService)));
        return this.onWorkspaceConfigurationChanged(false);
    }
    contains(resources, toCheck) {
        return resources.some(resource => this.uriIdentityService.extUri.isEqual(resource, toCheck));
    }
    // Workspace Configuration Service Impl
    getConfigurationData() {
        return this._configuration.toData();
    }
    getValue(arg1, arg2) {
        const section = typeof arg1 === 'string' ? arg1 : undefined;
        const overrides = isConfigurationOverrides(arg1) ? arg1 : isConfigurationOverrides(arg2) ? arg2 : undefined;
        return this._configuration.getValue(section, overrides);
    }
    async updateValue(key, value, arg3, arg4, donotNotifyError) {
        const overrides = isConfigurationUpdateOverrides(arg3) ? arg3
            : isConfigurationOverrides(arg3) ? { resource: arg3.resource, overrideIdentifiers: arg3.overrideIdentifier ? [arg3.overrideIdentifier] : undefined } : undefined;
        const target = overrides ? arg4 : arg3;
        const targets = target ? [target] : [];
        if (overrides?.overrideIdentifiers) {
            overrides.overrideIdentifiers = distinct(overrides.overrideIdentifiers);
            overrides.overrideIdentifiers = overrides.overrideIdentifiers.length ? overrides.overrideIdentifiers : undefined;
        }
        if (!targets.length) {
            if (overrides?.overrideIdentifiers && overrides.overrideIdentifiers.length > 1) {
                throw new Error('Configuration Target is required while updating the value for multiple override identifiers');
            }
            const inspect = this.inspect(key, { resource: overrides?.resource, overrideIdentifier: overrides?.overrideIdentifiers ? overrides.overrideIdentifiers[0] : undefined });
            targets.push(...this.deriveConfigurationTargets(key, value, inspect));
            // Remove the setting, if the value is same as default value and is updated only in user target
            if (equals(value, inspect.defaultValue) && targets.length === 1 && (targets[0] === 2 /* ConfigurationTarget.USER */ || targets[0] === 3 /* ConfigurationTarget.USER_LOCAL */)) {
                value = undefined;
            }
        }
        await Promises.settled(targets.map(target => this.writeConfigurationValue(key, value, target, overrides, donotNotifyError)));
    }
    async reloadConfiguration(target) {
        if (target === undefined) {
            this.reloadDefaultConfiguration();
            const application = await this.reloadApplicationConfiguration(true);
            const { local, remote } = await this.reloadUserConfiguration();
            await this.reloadWorkspaceConfiguration();
            await this.loadConfiguration(application, local, remote);
            return;
        }
        if (isWorkspaceFolder(target)) {
            await this.reloadWorkspaceFolderConfiguration(target);
            return;
        }
        switch (target) {
            case 7 /* ConfigurationTarget.DEFAULT */:
                this.reloadDefaultConfiguration();
                return;
            case 2 /* ConfigurationTarget.USER */: {
                const { local, remote } = await this.reloadUserConfiguration();
                await this.loadConfiguration(this._configuration.applicationConfiguration, local, remote);
                return;
            }
            case 3 /* ConfigurationTarget.USER_LOCAL */:
                await this.reloadLocalUserConfiguration();
                return;
            case 4 /* ConfigurationTarget.USER_REMOTE */:
                await this.reloadRemoteUserConfiguration();
                return;
            case 5 /* ConfigurationTarget.WORKSPACE */:
            case 6 /* ConfigurationTarget.WORKSPACE_FOLDER */:
                await this.reloadWorkspaceConfiguration();
                return;
        }
    }
    inspect(key, overrides) {
        return this._configuration.inspect(key, overrides);
    }
    keys() {
        return this._configuration.keys();
    }
    async whenRemoteConfigurationLoaded() {
        await this.initRemoteUserConfigurationBarrier.wait();
    }
    /**
     * At present, all workspaces (empty, single-folder, multi-root) in local and remote
     * can be initialized without requiring extension host except following case:
     *
     * A multi root workspace with .code-workspace file that has to be resolved by an extension.
     * Because of readonly `rootPath` property in extension API we have to resolve multi root workspace
     * before extension host starts so that `rootPath` can be set to first folder.
     *
     * This restriction is lifted partially for web in `MainThreadWorkspace`.
     * In web, we start extension host with empty `rootPath` in this case.
     *
     * Related root path issue discussion is being tracked here - https://github.com/microsoft/vscode/issues/69335
     */
    async initialize(arg) {
        mark('code/willInitWorkspaceService');
        const workspace = await this.createWorkspace(arg);
        await this.updateWorkspaceAndInitializeConfiguration(workspace);
        this.checkAndMarkWorkspaceComplete(false);
        mark('code/didInitWorkspaceService');
    }
    updateWorkspaceTrust(trusted) {
        if (this.isWorkspaceTrusted !== trusted) {
            this.isWorkspaceTrusted = trusted;
            const data = this._configuration.toData();
            const folderConfigurationModels = [];
            for (const folder of this.workspace.folders) {
                const folderConfiguration = this.cachedFolderConfigs.get(folder.uri);
                let configurationModel;
                if (folderConfiguration) {
                    configurationModel = folderConfiguration.updateWorkspaceTrust(this.isWorkspaceTrusted);
                    this._configuration.updateFolderConfiguration(folder.uri, configurationModel);
                }
                folderConfigurationModels.push(configurationModel);
            }
            if (this.getWorkbenchState() === 2 /* WorkbenchState.FOLDER */) {
                if (folderConfigurationModels[0]) {
                    this._configuration.updateWorkspaceConfiguration(folderConfigurationModels[0]);
                }
            }
            else {
                this._configuration.updateWorkspaceConfiguration(this.workspaceConfiguration.updateWorkspaceTrust(this.isWorkspaceTrusted));
            }
            this.updateRestrictedSettings();
            let keys = [];
            if (this.restrictedSettings.userLocal) {
                keys.push(...this.restrictedSettings.userLocal);
            }
            if (this.restrictedSettings.userRemote) {
                keys.push(...this.restrictedSettings.userRemote);
            }
            if (this.restrictedSettings.workspace) {
                keys.push(...this.restrictedSettings.workspace);
            }
            this.restrictedSettings.workspaceFolder?.forEach((value) => keys.push(...value));
            keys = distinct(keys);
            if (keys.length) {
                this.triggerConfigurationChange({ keys, overrides: [] }, { data, workspace: this.workspace }, 5 /* ConfigurationTarget.WORKSPACE */);
            }
        }
    }
    acquireInstantiationService(instantiationService) {
        this.instantiationService = instantiationService;
    }
    async createWorkspace(arg) {
        if (isWorkspaceIdentifier(arg)) {
            return this.createMultiFolderWorkspace(arg);
        }
        if (isSingleFolderWorkspaceIdentifier(arg)) {
            return this.createSingleFolderWorkspace(arg);
        }
        return this.createEmptyWorkspace(arg);
    }
    async createMultiFolderWorkspace(workspaceIdentifier) {
        await this.workspaceConfiguration.initialize({ id: workspaceIdentifier.id, configPath: workspaceIdentifier.configPath }, this.isWorkspaceTrusted);
        const workspaceConfigPath = workspaceIdentifier.configPath;
        const workspaceFolders = toWorkspaceFolders(this.workspaceConfiguration.getFolders(), workspaceConfigPath, this.uriIdentityService.extUri);
        const workspaceId = workspaceIdentifier.id;
        const workspace = new Workspace(workspaceId, workspaceFolders, this.workspaceConfiguration.isTransient(), workspaceConfigPath, uri => this.uriIdentityService.extUri.ignorePathCasing(uri));
        workspace.initialized = this.workspaceConfiguration.initialized;
        return workspace;
    }
    createSingleFolderWorkspace(singleFolderWorkspaceIdentifier) {
        const workspace = new Workspace(singleFolderWorkspaceIdentifier.id, [toWorkspaceFolder(singleFolderWorkspaceIdentifier.uri)], false, null, uri => this.uriIdentityService.extUri.ignorePathCasing(uri));
        workspace.initialized = true;
        return workspace;
    }
    createEmptyWorkspace(emptyWorkspaceIdentifier) {
        const workspace = new Workspace(emptyWorkspaceIdentifier.id, [], false, null, uri => this.uriIdentityService.extUri.ignorePathCasing(uri));
        workspace.initialized = true;
        return Promise.resolve(workspace);
    }
    checkAndMarkWorkspaceComplete(fromCache) {
        if (!this.completeWorkspaceBarrier.isOpen() && this.workspace.initialized) {
            this.completeWorkspaceBarrier.open();
            this.validateWorkspaceFoldersAndReload(fromCache);
        }
    }
    async updateWorkspaceAndInitializeConfiguration(workspace) {
        const hasWorkspaceBefore = !!this.workspace;
        let previousState;
        let previousWorkspacePath;
        let previousFolders = [];
        if (hasWorkspaceBefore) {
            previousState = this.getWorkbenchState();
            previousWorkspacePath = this.workspace.configuration ? this.workspace.configuration.fsPath : undefined;
            previousFolders = this.workspace.folders;
            this.workspace.update(workspace);
        }
        else {
            this.workspace = workspace;
        }
        await this.initializeConfiguration();
        // Trigger changes after configuration initialization so that configuration is up to date.
        if (hasWorkspaceBefore) {
            const newState = this.getWorkbenchState();
            if (previousState && newState !== previousState) {
                this._onDidChangeWorkbenchState.fire(newState);
            }
            const newWorkspacePath = this.workspace.configuration ? this.workspace.configuration.fsPath : undefined;
            if (previousWorkspacePath && newWorkspacePath !== previousWorkspacePath || newState !== previousState) {
                this._onDidChangeWorkspaceName.fire();
            }
            const folderChanges = this.compareFolders(previousFolders, this.workspace.folders);
            if (folderChanges && (folderChanges.added.length || folderChanges.removed.length || folderChanges.changed.length)) {
                await this.handleWillChangeWorkspaceFolders(folderChanges, false);
                this._onDidChangeWorkspaceFolders.fire(folderChanges);
            }
        }
        if (!this.localUserConfiguration.hasTasksLoaded) {
            // Reload local user configuration again to load user tasks
            this._register(runWhenIdle(() => this.reloadLocalUserConfiguration()));
        }
    }
    compareFolders(currentFolders, newFolders) {
        const result = { added: [], removed: [], changed: [] };
        result.added = newFolders.filter(newFolder => !currentFolders.some(currentFolder => newFolder.uri.toString() === currentFolder.uri.toString()));
        for (let currentIndex = 0; currentIndex < currentFolders.length; currentIndex++) {
            const currentFolder = currentFolders[currentIndex];
            let newIndex = 0;
            for (newIndex = 0; newIndex < newFolders.length && currentFolder.uri.toString() !== newFolders[newIndex].uri.toString(); newIndex++) { }
            if (newIndex < newFolders.length) {
                if (currentIndex !== newIndex || currentFolder.name !== newFolders[newIndex].name) {
                    result.changed.push(currentFolder);
                }
            }
            else {
                result.removed.push(currentFolder);
            }
        }
        return result;
    }
    async initializeConfiguration() {
        await this.defaultConfiguration.initialize();
        const [, application, user] = await Promise.all([
            this.policyConfiguration.initialize(),
            this.initializeApplicationConfiguration(),
            (async () => {
                mark('code/willInitUserConfiguration');
                const result = await this.initializeUserConfiguration();
                mark('code/didInitUserConfiguration');
                return result;
            })()
        ]);
        mark('code/willInitWorkspaceConfiguration');
        await this.loadConfiguration(application, user.local, user.remote);
        mark('code/didInitWorkspaceConfiguration');
    }
    async initializeApplicationConfiguration() {
        return this.applicationConfiguration ? this.applicationConfiguration.initialize() : Promise.resolve(new ConfigurationModel());
    }
    async initializeUserConfiguration() {
        const [local, remote] = await Promise.all([this.localUserConfiguration.initialize(), this.remoteUserConfiguration ? this.remoteUserConfiguration.initialize() : Promise.resolve(new ConfigurationModel())]);
        return { local, remote };
    }
    reloadDefaultConfiguration() {
        this.onDefaultConfigurationChanged(this.defaultConfiguration.reload());
    }
    async reloadApplicationConfiguration(donotTrigger) {
        if (!this.applicationConfiguration) {
            return new ConfigurationModel();
        }
        const model = await this.applicationConfiguration.reload();
        if (!donotTrigger) {
            this.onApplicationConfigurationChanged(model);
        }
        return model;
    }
    async reloadUserConfiguration() {
        const [local, remote] = await Promise.all([this.reloadLocalUserConfiguration(true), this.reloadRemoteUserConfiguration(true)]);
        return { local, remote };
    }
    async reloadLocalUserConfiguration(donotTrigger) {
        const model = await this.localUserConfiguration.reload();
        if (!donotTrigger) {
            this.onLocalUserConfigurationChanged(model);
        }
        return model;
    }
    async reloadRemoteUserConfiguration(donotTrigger) {
        if (this.remoteUserConfiguration) {
            const model = await this.remoteUserConfiguration.reload();
            if (!donotTrigger) {
                this.onRemoteUserConfigurationChanged(model);
            }
            return model;
        }
        return new ConfigurationModel();
    }
    async reloadWorkspaceConfiguration() {
        const workbenchState = this.getWorkbenchState();
        if (workbenchState === 2 /* WorkbenchState.FOLDER */) {
            return this.onWorkspaceFolderConfigurationChanged(this.workspace.folders[0]);
        }
        if (workbenchState === 3 /* WorkbenchState.WORKSPACE */) {
            return this.workspaceConfiguration.reload().then(() => this.onWorkspaceConfigurationChanged(false));
        }
    }
    reloadWorkspaceFolderConfiguration(folder) {
        return this.onWorkspaceFolderConfigurationChanged(folder);
    }
    async loadConfiguration(applicationConfigurationModel, userConfigurationModel, remoteUserConfigurationModel) {
        // reset caches
        this.cachedFolderConfigs = new ResourceMap();
        const folders = this.workspace.folders;
        const folderConfigurations = await this.loadFolderConfigurations(folders);
        const workspaceConfiguration = this.getWorkspaceConfigurationModel(folderConfigurations);
        const folderConfigurationModels = new ResourceMap();
        folderConfigurations.forEach((folderConfiguration, index) => folderConfigurationModels.set(folders[index].uri, folderConfiguration));
        const currentConfiguration = this._configuration;
        this._configuration = new Configuration(this.defaultConfiguration.configurationModel, this.policyConfiguration.configurationModel, applicationConfigurationModel, userConfigurationModel, remoteUserConfigurationModel, workspaceConfiguration, folderConfigurationModels, new ConfigurationModel(), new ResourceMap(), this.workspace);
        if (this.initialized) {
            const change = this._configuration.compare(currentConfiguration);
            this.triggerConfigurationChange(change, { data: currentConfiguration.toData(), workspace: this.workspace }, 5 /* ConfigurationTarget.WORKSPACE */);
        }
        else {
            this.initialized = true;
        }
        this.updateRestrictedSettings();
    }
    getWorkspaceConfigurationModel(folderConfigurations) {
        switch (this.getWorkbenchState()) {
            case 2 /* WorkbenchState.FOLDER */:
                return folderConfigurations[0];
            case 3 /* WorkbenchState.WORKSPACE */:
                return this.workspaceConfiguration.getConfiguration();
            default:
                return new ConfigurationModel();
        }
    }
    onUserDataProfileChanged(e) {
        e.join((async () => {
            if (e.preserveData) {
                await Promise.all([
                    this.copyProfileSettings(e.previous.settingsResource, e.profile.settingsResource),
                    this.copyProfileTasks(e.previous.tasksResource, e.profile.tasksResource)
                ]);
            }
            const promises = [];
            promises.push(this.localUserConfiguration.reset(e.profile.settingsResource, e.profile.tasksResource, getLocalUserConfigurationScopes(e.profile, !!this.remoteUserConfiguration)));
            if (e.previous.isDefault !== e.profile.isDefault) {
                this.createApplicationConfiguration();
                if (this.applicationConfiguration) {
                    promises.push(this.reloadApplicationConfiguration(true));
                }
            }
            const [localUser, application] = await Promise.all(promises);
            await this.loadConfiguration(application ?? this._configuration.applicationConfiguration, localUser, this._configuration.remoteUserConfiguration);
        })());
    }
    async copyProfileSettings(from, to) {
        let fromContent;
        try {
            fromContent = (await this.fileService.readFile(from)).value.toString();
        }
        catch (error) {
            if (error.fileOperationResult !== 1 /* FileOperationResult.FILE_NOT_FOUND */) {
                throw error;
            }
        }
        if (!fromContent) {
            return;
        }
        const allSettings = Registry.as(Extensions.Configuration).getConfigurationProperties();
        const applicationSettings = Object.keys(allSettings).filter(key => allSettings[key]?.scope === 1 /* ConfigurationScope.APPLICATION */);
        const toContent = updateIgnoredSettings(fromContent, '{}', applicationSettings, {});
        await this.fileService.writeFile(to, VSBuffer.fromString(toContent));
    }
    async copyProfileTasks(from, to) {
        if (await this.fileService.exists(from)) {
            await this.fileService.copy(from, to);
        }
    }
    onDefaultConfigurationChanged(configurationModel, properties) {
        if (this.workspace) {
            const previousData = this._configuration.toData();
            const change = this._configuration.compareAndUpdateDefaultConfiguration(configurationModel, properties);
            if (this.remoteUserConfiguration) {
                this._configuration.updateLocalUserConfiguration(this.localUserConfiguration.reparse());
                this._configuration.updateRemoteUserConfiguration(this.remoteUserConfiguration.reparse());
            }
            if (this.getWorkbenchState() === 2 /* WorkbenchState.FOLDER */) {
                const folderConfiguration = this.cachedFolderConfigs.get(this.workspace.folders[0].uri);
                if (folderConfiguration) {
                    this._configuration.updateWorkspaceConfiguration(folderConfiguration.reparse());
                    this._configuration.updateFolderConfiguration(this.workspace.folders[0].uri, folderConfiguration.reparse());
                }
            }
            else {
                this._configuration.updateWorkspaceConfiguration(this.workspaceConfiguration.reparseWorkspaceSettings());
                for (const folder of this.workspace.folders) {
                    const folderConfiguration = this.cachedFolderConfigs.get(folder.uri);
                    if (folderConfiguration) {
                        this._configuration.updateFolderConfiguration(folder.uri, folderConfiguration.reparse());
                    }
                }
            }
            this.triggerConfigurationChange(change, { data: previousData, workspace: this.workspace }, 7 /* ConfigurationTarget.DEFAULT */);
            this.updateRestrictedSettings();
        }
    }
    onPolicyConfigurationChanged(policyConfiguration) {
        const previous = { data: this._configuration.toData(), workspace: this.workspace };
        const change = this._configuration.compareAndUpdatePolicyConfiguration(policyConfiguration);
        this.triggerConfigurationChange(change, previous, 7 /* ConfigurationTarget.DEFAULT */);
    }
    onApplicationConfigurationChanged(applicationConfiguration) {
        const previous = { data: this._configuration.toData(), workspace: this.workspace };
        const change = this._configuration.compareAndUpdateApplicationConfiguration(applicationConfiguration);
        this.triggerConfigurationChange(change, previous, 2 /* ConfigurationTarget.USER */);
    }
    onLocalUserConfigurationChanged(userConfiguration) {
        const previous = { data: this._configuration.toData(), workspace: this.workspace };
        const change = this._configuration.compareAndUpdateLocalUserConfiguration(userConfiguration);
        this.triggerConfigurationChange(change, previous, 2 /* ConfigurationTarget.USER */);
    }
    onRemoteUserConfigurationChanged(userConfiguration) {
        const previous = { data: this._configuration.toData(), workspace: this.workspace };
        const change = this._configuration.compareAndUpdateRemoteUserConfiguration(userConfiguration);
        this.triggerConfigurationChange(change, previous, 2 /* ConfigurationTarget.USER */);
    }
    async onWorkspaceConfigurationChanged(fromCache) {
        if (this.workspace && this.workspace.configuration) {
            let newFolders = toWorkspaceFolders(this.workspaceConfiguration.getFolders(), this.workspace.configuration, this.uriIdentityService.extUri);
            // Validate only if workspace is initialized
            if (this.workspace.initialized) {
                const { added, removed, changed } = this.compareFolders(this.workspace.folders, newFolders);
                /* If changed validate new folders */
                if (added.length || removed.length || changed.length) {
                    newFolders = await this.toValidWorkspaceFolders(newFolders);
                }
                /* Otherwise use existing */
                else {
                    newFolders = this.workspace.folders;
                }
            }
            await this.updateWorkspaceConfiguration(newFolders, this.workspaceConfiguration.getConfiguration(), fromCache);
        }
    }
    updateRestrictedSettings() {
        const changed = [];
        const allProperties = this.configurationRegistry.getConfigurationProperties();
        const defaultRestrictedSettings = Object.keys(allProperties).filter(key => allProperties[key].restricted).sort((a, b) => a.localeCompare(b));
        const defaultDelta = delta(defaultRestrictedSettings, this._restrictedSettings.default, (a, b) => a.localeCompare(b));
        changed.push(...defaultDelta.added, ...defaultDelta.removed);
        const application = (this.applicationConfiguration?.getRestrictedSettings() || []).sort((a, b) => a.localeCompare(b));
        const applicationDelta = delta(application, this._restrictedSettings.application || [], (a, b) => a.localeCompare(b));
        changed.push(...applicationDelta.added, ...applicationDelta.removed);
        const userLocal = this.localUserConfiguration.getRestrictedSettings().sort((a, b) => a.localeCompare(b));
        const userLocalDelta = delta(userLocal, this._restrictedSettings.userLocal || [], (a, b) => a.localeCompare(b));
        changed.push(...userLocalDelta.added, ...userLocalDelta.removed);
        const userRemote = (this.remoteUserConfiguration?.getRestrictedSettings() || []).sort((a, b) => a.localeCompare(b));
        const userRemoteDelta = delta(userRemote, this._restrictedSettings.userRemote || [], (a, b) => a.localeCompare(b));
        changed.push(...userRemoteDelta.added, ...userRemoteDelta.removed);
        const workspaceFolderMap = new ResourceMap();
        for (const workspaceFolder of this.workspace.folders) {
            const cachedFolderConfig = this.cachedFolderConfigs.get(workspaceFolder.uri);
            const folderRestrictedSettings = (cachedFolderConfig?.getRestrictedSettings() || []).sort((a, b) => a.localeCompare(b));
            if (folderRestrictedSettings.length) {
                workspaceFolderMap.set(workspaceFolder.uri, folderRestrictedSettings);
            }
            const previous = this._restrictedSettings.workspaceFolder?.get(workspaceFolder.uri) || [];
            const workspaceFolderDelta = delta(folderRestrictedSettings, previous, (a, b) => a.localeCompare(b));
            changed.push(...workspaceFolderDelta.added, ...workspaceFolderDelta.removed);
        }
        const workspace = this.getWorkbenchState() === 3 /* WorkbenchState.WORKSPACE */ ? this.workspaceConfiguration.getRestrictedSettings().sort((a, b) => a.localeCompare(b))
            : this.workspace.folders[0] ? (workspaceFolderMap.get(this.workspace.folders[0].uri) || []) : [];
        const workspaceDelta = delta(workspace, this._restrictedSettings.workspace || [], (a, b) => a.localeCompare(b));
        changed.push(...workspaceDelta.added, ...workspaceDelta.removed);
        if (changed.length) {
            this._restrictedSettings = {
                default: defaultRestrictedSettings,
                application: application.length ? application : undefined,
                userLocal: userLocal.length ? userLocal : undefined,
                userRemote: userRemote.length ? userRemote : undefined,
                workspace: workspace.length ? workspace : undefined,
                workspaceFolder: workspaceFolderMap.size ? workspaceFolderMap : undefined,
            };
            this._onDidChangeRestrictedSettings.fire(this.restrictedSettings);
        }
    }
    async updateWorkspaceConfiguration(workspaceFolders, configuration, fromCache) {
        const previous = { data: this._configuration.toData(), workspace: this.workspace };
        const change = this._configuration.compareAndUpdateWorkspaceConfiguration(configuration);
        const changes = this.compareFolders(this.workspace.folders, workspaceFolders);
        if (changes.added.length || changes.removed.length || changes.changed.length) {
            this.workspace.folders = workspaceFolders;
            const change = await this.onFoldersChanged();
            await this.handleWillChangeWorkspaceFolders(changes, fromCache);
            this.triggerConfigurationChange(change, previous, 6 /* ConfigurationTarget.WORKSPACE_FOLDER */);
            this._onDidChangeWorkspaceFolders.fire(changes);
        }
        else {
            this.triggerConfigurationChange(change, previous, 5 /* ConfigurationTarget.WORKSPACE */);
        }
        this.updateRestrictedSettings();
    }
    async handleWillChangeWorkspaceFolders(changes, fromCache) {
        const joiners = [];
        this._onWillChangeWorkspaceFolders.fire({
            join(updateWorkspaceTrustStatePromise) {
                joiners.push(updateWorkspaceTrustStatePromise);
            },
            changes,
            fromCache
        });
        try {
            await Promises.settled(joiners);
        }
        catch (error) { /* Ignore */ }
    }
    async onWorkspaceFolderConfigurationChanged(folder) {
        const [folderConfiguration] = await this.loadFolderConfigurations([folder]);
        const previous = { data: this._configuration.toData(), workspace: this.workspace };
        const folderConfigurationChange = this._configuration.compareAndUpdateFolderConfiguration(folder.uri, folderConfiguration);
        if (this.getWorkbenchState() === 2 /* WorkbenchState.FOLDER */) {
            const workspaceConfigurationChange = this._configuration.compareAndUpdateWorkspaceConfiguration(folderConfiguration);
            this.triggerConfigurationChange(mergeChanges(folderConfigurationChange, workspaceConfigurationChange), previous, 5 /* ConfigurationTarget.WORKSPACE */);
        }
        else {
            this.triggerConfigurationChange(folderConfigurationChange, previous, 6 /* ConfigurationTarget.WORKSPACE_FOLDER */);
        }
        this.updateRestrictedSettings();
    }
    async onFoldersChanged() {
        const changes = [];
        // Remove the configurations of deleted folders
        for (const key of this.cachedFolderConfigs.keys()) {
            if (!this.workspace.folders.filter(folder => folder.uri.toString() === key.toString())[0]) {
                const folderConfiguration = this.cachedFolderConfigs.get(key);
                folderConfiguration.dispose();
                this.cachedFolderConfigs.delete(key);
                changes.push(this._configuration.compareAndDeleteFolderConfiguration(key));
            }
        }
        const toInitialize = this.workspace.folders.filter(folder => !this.cachedFolderConfigs.has(folder.uri));
        if (toInitialize.length) {
            const folderConfigurations = await this.loadFolderConfigurations(toInitialize);
            folderConfigurations.forEach((folderConfiguration, index) => {
                changes.push(this._configuration.compareAndUpdateFolderConfiguration(toInitialize[index].uri, folderConfiguration));
            });
        }
        return mergeChanges(...changes);
    }
    loadFolderConfigurations(folders) {
        return Promise.all([...folders.map(folder => {
                let folderConfiguration = this.cachedFolderConfigs.get(folder.uri);
                if (!folderConfiguration) {
                    folderConfiguration = new FolderConfiguration(!this.initialized, folder, FOLDER_CONFIG_FOLDER_NAME, this.getWorkbenchState(), this.isWorkspaceTrusted, this.fileService, this.uriIdentityService, this.logService, this.configurationCache);
                    this._register(folderConfiguration.onDidChange(() => this.onWorkspaceFolderConfigurationChanged(folder)));
                    this.cachedFolderConfigs.set(folder.uri, this._register(folderConfiguration));
                }
                return folderConfiguration.loadConfiguration();
            })]);
    }
    async validateWorkspaceFoldersAndReload(fromCache) {
        const validWorkspaceFolders = await this.toValidWorkspaceFolders(this.workspace.folders);
        const { removed } = this.compareFolders(this.workspace.folders, validWorkspaceFolders);
        if (removed.length) {
            await this.updateWorkspaceConfiguration(validWorkspaceFolders, this.workspaceConfiguration.getConfiguration(), fromCache);
        }
    }
    // Filter out workspace folders which are files (not directories)
    // Workspace folders those cannot be resolved are not filtered because they are handled by the Explorer.
    async toValidWorkspaceFolders(workspaceFolders) {
        const validWorkspaceFolders = [];
        for (const workspaceFolder of workspaceFolders) {
            try {
                const result = await this.fileService.stat(workspaceFolder.uri);
                if (!result.isDirectory) {
                    continue;
                }
            }
            catch (e) {
                this.logService.warn(`Ignoring the error while validating workspace folder ${workspaceFolder.uri.toString()} - ${toErrorMessage(e)}`);
            }
            validWorkspaceFolders.push(workspaceFolder);
        }
        return validWorkspaceFolders;
    }
    async writeConfigurationValue(key, value, target, overrides, donotNotifyError) {
        if (!this.instantiationService) {
            throw new Error('Cannot write configuration because the configuration service is not yet ready to accept writes.');
        }
        if (target === 7 /* ConfigurationTarget.DEFAULT */) {
            throw new Error('Invalid configuration target');
        }
        if (target === 8 /* ConfigurationTarget.MEMORY */) {
            const previous = { data: this._configuration.toData(), workspace: this.workspace };
            this._configuration.updateValue(key, value, overrides);
            this.triggerConfigurationChange({ keys: overrides?.overrideIdentifiers?.length ? [keyFromOverrideIdentifiers(overrides.overrideIdentifiers), key] : [key], overrides: overrides?.overrideIdentifiers?.length ? overrides.overrideIdentifiers.map(overrideIdentifier => ([overrideIdentifier, [key]])) : [] }, previous, target);
            return;
        }
        const editableConfigurationTarget = this.toEditableConfigurationTarget(target, key);
        if (!editableConfigurationTarget) {
            throw new Error('Invalid configuration target');
        }
        if (editableConfigurationTarget === 2 /* EditableConfigurationTarget.USER_REMOTE */ && !this.remoteUserConfiguration) {
            throw new Error('Invalid configuration target');
        }
        // Use same instance of ConfigurationEditing to make sure all writes go through the same queue
        this.configurationEditing = this.configurationEditing ?? this.instantiationService.createInstance(ConfigurationEditing, (await this.remoteAgentService.getEnvironment())?.settingsPath ?? null);
        await this.configurationEditing.writeConfiguration(editableConfigurationTarget, { key, value }, { scopes: overrides, donotNotifyError });
        switch (editableConfigurationTarget) {
            case 1 /* EditableConfigurationTarget.USER_LOCAL */:
                if (this.applicationConfiguration && this.configurationRegistry.getConfigurationProperties()[key].scope === 1 /* ConfigurationScope.APPLICATION */) {
                    await this.reloadApplicationConfiguration();
                }
                else {
                    await this.reloadLocalUserConfiguration();
                }
                return;
            case 2 /* EditableConfigurationTarget.USER_REMOTE */:
                return this.reloadRemoteUserConfiguration().then(() => undefined);
            case 3 /* EditableConfigurationTarget.WORKSPACE */:
                return this.reloadWorkspaceConfiguration();
            case 4 /* EditableConfigurationTarget.WORKSPACE_FOLDER */: {
                const workspaceFolder = overrides && overrides.resource ? this.workspace.getFolder(overrides.resource) : null;
                if (workspaceFolder) {
                    return this.reloadWorkspaceFolderConfiguration(workspaceFolder);
                }
            }
        }
    }
    deriveConfigurationTargets(key, value, inspect) {
        if (equals(value, inspect.value)) {
            return [];
        }
        const definedTargets = [];
        if (inspect.workspaceFolderValue !== undefined) {
            definedTargets.push(6 /* ConfigurationTarget.WORKSPACE_FOLDER */);
        }
        if (inspect.workspaceValue !== undefined) {
            definedTargets.push(5 /* ConfigurationTarget.WORKSPACE */);
        }
        if (inspect.userRemoteValue !== undefined) {
            definedTargets.push(4 /* ConfigurationTarget.USER_REMOTE */);
        }
        if (inspect.userLocalValue !== undefined) {
            definedTargets.push(3 /* ConfigurationTarget.USER_LOCAL */);
        }
        if (value === undefined) {
            // Remove the setting in all defined targets
            return definedTargets;
        }
        return [definedTargets[0] || 2 /* ConfigurationTarget.USER */];
    }
    triggerConfigurationChange(change, previous, target) {
        if (change.keys.length) {
            if (target !== 7 /* ConfigurationTarget.DEFAULT */) {
                this.logService.debug(`Configuration keys changed in ${ConfigurationTargetToString(target)} target`, ...change.keys);
            }
            const configurationChangeEvent = new ConfigurationChangeEvent(change, previous, this._configuration, this.workspace);
            configurationChangeEvent.source = target;
            configurationChangeEvent.sourceConfig = this.getTargetConfiguration(target);
            this._onDidChangeConfiguration.fire(configurationChangeEvent);
        }
    }
    getTargetConfiguration(target) {
        switch (target) {
            case 7 /* ConfigurationTarget.DEFAULT */:
                return this._configuration.defaults.contents;
            case 2 /* ConfigurationTarget.USER */:
                return this._configuration.userConfiguration.contents;
            case 5 /* ConfigurationTarget.WORKSPACE */:
                return this._configuration.workspaceConfiguration.contents;
        }
        return {};
    }
    toEditableConfigurationTarget(target, key) {
        if (target === 2 /* ConfigurationTarget.USER */) {
            if (this.remoteUserConfiguration) {
                const scope = this.configurationRegistry.getConfigurationProperties()[key]?.scope;
                if (scope === 2 /* ConfigurationScope.MACHINE */ || scope === 6 /* ConfigurationScope.MACHINE_OVERRIDABLE */) {
                    return 2 /* EditableConfigurationTarget.USER_REMOTE */;
                }
                if (this.inspect(key).userRemoteValue !== undefined) {
                    return 2 /* EditableConfigurationTarget.USER_REMOTE */;
                }
            }
            return 1 /* EditableConfigurationTarget.USER_LOCAL */;
        }
        if (target === 3 /* ConfigurationTarget.USER_LOCAL */) {
            return 1 /* EditableConfigurationTarget.USER_LOCAL */;
        }
        if (target === 4 /* ConfigurationTarget.USER_REMOTE */) {
            return 2 /* EditableConfigurationTarget.USER_REMOTE */;
        }
        if (target === 5 /* ConfigurationTarget.WORKSPACE */) {
            return 3 /* EditableConfigurationTarget.WORKSPACE */;
        }
        if (target === 6 /* ConfigurationTarget.WORKSPACE_FOLDER */) {
            return 4 /* EditableConfigurationTarget.WORKSPACE_FOLDER */;
        }
        return null;
    }
}
let RegisterConfigurationSchemasContribution = class RegisterConfigurationSchemasContribution extends Disposable {
    workspaceContextService;
    environmentService;
    workspaceTrustManagementService;
    constructor(workspaceContextService, environmentService, workspaceTrustManagementService) {
        super();
        this.workspaceContextService = workspaceContextService;
        this.environmentService = environmentService;
        this.workspaceTrustManagementService = workspaceTrustManagementService;
        this.registerConfigurationSchemas();
        const configurationRegistry = Registry.as(Extensions.Configuration);
        this._register(configurationRegistry.onDidUpdateConfiguration(e => this.registerConfigurationSchemas()));
        this._register(configurationRegistry.onDidSchemaChange(e => this.registerConfigurationSchemas()));
        this._register(workspaceTrustManagementService.onDidChangeTrust(() => this.registerConfigurationSchemas()));
    }
    registerConfigurationSchemas() {
        const jsonRegistry = Registry.as(JSONExtensions.JSONContribution);
        const allSettingsSchema = {
            properties: allSettings.properties,
            patternProperties: allSettings.patternProperties,
            additionalProperties: true,
            allowTrailingCommas: true,
            allowComments: true
        };
        const userSettingsSchema = this.environmentService.remoteAuthority ?
            {
                properties: Object.assign({}, applicationSettings.properties, windowSettings.properties, resourceSettings.properties),
                patternProperties: allSettings.patternProperties,
                additionalProperties: true,
                allowTrailingCommas: true,
                allowComments: true
            }
            : allSettingsSchema;
        const profileSettingsSchema = {
            properties: Object.assign({}, machineSettings.properties, machineOverridableSettings.properties, windowSettings.properties, resourceSettings.properties),
            patternProperties: allSettings.patternProperties,
            additionalProperties: true,
            allowTrailingCommas: true,
            allowComments: true
        };
        const machineSettingsSchema = {
            properties: Object.assign({}, machineSettings.properties, machineOverridableSettings.properties, windowSettings.properties, resourceSettings.properties),
            patternProperties: allSettings.patternProperties,
            additionalProperties: true,
            allowTrailingCommas: true,
            allowComments: true
        };
        const workspaceSettingsSchema = {
            properties: Object.assign({}, this.checkAndFilterPropertiesRequiringTrust(machineOverridableSettings.properties), this.checkAndFilterPropertiesRequiringTrust(windowSettings.properties), this.checkAndFilterPropertiesRequiringTrust(resourceSettings.properties)),
            patternProperties: allSettings.patternProperties,
            additionalProperties: true,
            allowTrailingCommas: true,
            allowComments: true
        };
        jsonRegistry.registerSchema(defaultSettingsSchemaId, {
            properties: Object.keys(allSettings.properties).reduce((result, key) => {
                result[key] = Object.assign({ deprecationMessage: undefined }, allSettings.properties[key]);
                return result;
            }, {}),
            patternProperties: Object.keys(allSettings.patternProperties).reduce((result, key) => {
                result[key] = Object.assign({ deprecationMessage: undefined }, allSettings.patternProperties[key]);
                return result;
            }, {}),
            additionalProperties: true,
            allowTrailingCommas: true,
            allowComments: true
        });
        jsonRegistry.registerSchema(userSettingsSchemaId, userSettingsSchema);
        jsonRegistry.registerSchema(profileSettingsSchemaId, profileSettingsSchema);
        jsonRegistry.registerSchema(machineSettingsSchemaId, machineSettingsSchema);
        if (3 /* WorkbenchState.WORKSPACE */ === this.workspaceContextService.getWorkbenchState()) {
            const folderSettingsSchema = {
                properties: Object.assign({}, this.checkAndFilterPropertiesRequiringTrust(machineOverridableSettings.properties), this.checkAndFilterPropertiesRequiringTrust(resourceSettings.properties)),
                patternProperties: allSettings.patternProperties,
                additionalProperties: true,
                allowTrailingCommas: true,
                allowComments: true
            };
            jsonRegistry.registerSchema(workspaceSettingsSchemaId, workspaceSettingsSchema);
            jsonRegistry.registerSchema(folderSettingsSchemaId, folderSettingsSchema);
        }
        else {
            jsonRegistry.registerSchema(workspaceSettingsSchemaId, workspaceSettingsSchema);
            jsonRegistry.registerSchema(folderSettingsSchemaId, workspaceSettingsSchema);
        }
        jsonRegistry.registerSchema(configurationDefaultsSchemaId, {
            type: 'object',
            description: localize('configurationDefaults.description', 'Contribute defaults for configurations'),
            properties: Object.assign({}, machineOverridableSettings.properties, windowSettings.properties, resourceSettings.properties),
            patternProperties: {
                [OVERRIDE_PROPERTY_PATTERN]: {
                    type: 'object',
                    default: {},
                    $ref: resourceLanguageSettingsSchemaId,
                }
            },
            additionalProperties: false
        });
    }
    checkAndFilterPropertiesRequiringTrust(properties) {
        if (this.workspaceTrustManagementService.isWorkspaceTrusted()) {
            return properties;
        }
        const result = {};
        Object.entries(properties).forEach(([key, value]) => {
            if (!value.restricted) {
                result[key] = value;
            }
        });
        return result;
    }
};
RegisterConfigurationSchemasContribution = __decorate([
    __param(0, IWorkspaceContextService),
    __param(1, IWorkbenchEnvironmentService),
    __param(2, IWorkspaceTrustManagementService)
], RegisterConfigurationSchemasContribution);
let ResetConfigurationDefaultsOverridesCache = class ResetConfigurationDefaultsOverridesCache extends Disposable {
    constructor(configurationService, extensionService) {
        super();
        extensionService.whenInstalledExtensionsRegistered().then(() => configurationService.reloadConfiguration(7 /* ConfigurationTarget.DEFAULT */));
    }
};
ResetConfigurationDefaultsOverridesCache = __decorate([
    __param(0, IConfigurationService),
    __param(1, IExtensionService)
], ResetConfigurationDefaultsOverridesCache);
let UpdateExperimentalSettingsDefaults = class UpdateExperimentalSettingsDefaults extends Disposable {
    workbenchAssignmentService;
    processedExperimentalSettings = new Set();
    configurationRegistry = Registry.as(Extensions.Configuration);
    constructor(workbenchAssignmentService) {
        super();
        this.workbenchAssignmentService = workbenchAssignmentService;
        this.processExperimentalSettings(Object.keys(this.configurationRegistry.getConfigurationProperties()));
        this._register(this.configurationRegistry.onDidUpdateConfiguration(({ properties }) => this.processExperimentalSettings(properties)));
    }
    async processExperimentalSettings(properties) {
        const overrides = {};
        const allProperties = this.configurationRegistry.getConfigurationProperties();
        for (const property of properties) {
            const schema = allProperties[property];
            if (!schema?.tags?.includes('experimental')) {
                continue;
            }
            if (this.processedExperimentalSettings.has(property)) {
                continue;
            }
            this.processedExperimentalSettings.add(property);
            try {
                const value = await this.workbenchAssignmentService.getTreatment(`config.${property}`);
                if (!isUndefined(value) && !equals(value, schema.default)) {
                    overrides[property] = value;
                }
            }
            catch (error) { /*ignore */ }
        }
        if (Object.keys(overrides).length) {
            this.configurationRegistry.registerDefaultConfigurations([{ overrides, source: localize('experimental', "Experiments") }]);
        }
    }
};
UpdateExperimentalSettingsDefaults = __decorate([
    __param(0, IWorkbenchAssignmentService)
], UpdateExperimentalSettingsDefaults);
const workbenchContributionsRegistry = Registry.as(WorkbenchExtensions.Workbench);
workbenchContributionsRegistry.registerWorkbenchContribution(RegisterConfigurationSchemasContribution, 3 /* LifecyclePhase.Restored */);
workbenchContributionsRegistry.registerWorkbenchContribution(ResetConfigurationDefaultsOverridesCache, 4 /* LifecyclePhase.Eventually */);
workbenchContributionsRegistry.registerWorkbenchContribution(UpdateExperimentalSettingsDefaults, 3 /* LifecyclePhase.Restored */);

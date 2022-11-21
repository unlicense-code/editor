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
import { Emitter } from 'vs/base/common/event';
import { isMacintosh, isWindows } from 'vs/base/common/platform';
import { withNullAsUndefined } from 'vs/base/common/types';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ILabelService } from 'vs/platform/label/common/label';
import { ILogService } from 'vs/platform/log/common/log';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { Registry } from 'vs/platform/registry/common/platform';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { ILocalPtyService } from 'vs/platform/terminal/electron-sandbox/terminal';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { ITerminalService } from 'vs/workbench/contrib/terminal/browser/terminal';
import { ITerminalProfileResolverService, TerminalExtensions, TERMINAL_CONFIG_SECTION } from 'vs/workbench/contrib/terminal/common/terminal';
import { LocalPty } from 'vs/workbench/contrib/terminal/electron-sandbox/localPty';
import { IConfigurationResolverService } from 'vs/workbench/services/configurationResolver/common/configurationResolver';
import { IShellEnvironmentService } from 'vs/workbench/services/environment/electron-sandbox/shellEnvironmentService';
import { IHistoryService } from 'vs/workbench/services/history/common/history';
import * as terminalEnvironment from 'vs/workbench/contrib/terminal/common/terminalEnvironment';
import { IProductService } from 'vs/platform/product/common/productService';
import { IEnvironmentVariableService } from 'vs/workbench/contrib/terminal/common/environmentVariable';
import { BaseTerminalBackend } from 'vs/workbench/contrib/terminal/browser/baseTerminalBackend';
let LocalTerminalBackendContribution = class LocalTerminalBackendContribution {
    constructor(instantiationService, terminalService) {
        const backend = instantiationService.createInstance(LocalTerminalBackend, undefined);
        Registry.as(TerminalExtensions.Backend).registerTerminalBackend(backend);
        terminalService.handleNewRegisteredBackend(backend);
    }
};
LocalTerminalBackendContribution = __decorate([
    __param(0, IInstantiationService),
    __param(1, ITerminalService)
], LocalTerminalBackendContribution);
export { LocalTerminalBackendContribution };
let LocalTerminalBackend = class LocalTerminalBackend extends BaseTerminalBackend {
    remoteAuthority;
    _instantiationService;
    _localPtyService;
    _labelService;
    _shellEnvironmentService;
    _storageService;
    _configurationResolverService;
    _configurationService;
    _productService;
    _historyService;
    _terminalProfileResolverService;
    _environmentVariableService;
    _ptys = new Map();
    _onDidRequestDetach = this._register(new Emitter());
    onDidRequestDetach = this._onDidRequestDetach.event;
    constructor(remoteAuthority, _instantiationService, workspaceContextService, logService, _localPtyService, _labelService, _shellEnvironmentService, _storageService, _configurationResolverService, configurationService, _configurationService, _productService, _historyService, _terminalProfileResolverService, _environmentVariableService, notificationService, historyService) {
        super(_localPtyService, logService, notificationService, historyService, _configurationResolverService, workspaceContextService);
        this.remoteAuthority = remoteAuthority;
        this._instantiationService = _instantiationService;
        this._localPtyService = _localPtyService;
        this._labelService = _labelService;
        this._shellEnvironmentService = _shellEnvironmentService;
        this._storageService = _storageService;
        this._configurationResolverService = _configurationResolverService;
        this._configurationService = _configurationService;
        this._productService = _productService;
        this._historyService = _historyService;
        this._terminalProfileResolverService = _terminalProfileResolverService;
        this._environmentVariableService = _environmentVariableService;
        // Attach process listeners
        this._localPtyService.onProcessData(e => this._ptys.get(e.id)?.handleData(e.event));
        this._localPtyService.onDidChangeProperty(e => this._ptys.get(e.id)?.handleDidChangeProperty(e.property));
        this._localPtyService.onProcessExit(e => {
            const pty = this._ptys.get(e.id);
            if (pty) {
                pty.handleExit(e.event);
                this._ptys.delete(e.id);
            }
        });
        this._localPtyService.onProcessReady(e => this._ptys.get(e.id)?.handleReady(e.event));
        this._localPtyService.onProcessReplay(e => this._ptys.get(e.id)?.handleReplay(e.event));
        this._localPtyService.onProcessOrphanQuestion(e => this._ptys.get(e.id)?.handleOrphanQuestion());
        this._localPtyService.onDidRequestDetach(e => this._onDidRequestDetach.fire(e));
        // Listen for config changes
        const initialConfig = configurationService.getValue(TERMINAL_CONFIG_SECTION);
        for (const match of Object.keys(initialConfig.autoReplies)) {
            // Ensure the reply is value
            const reply = initialConfig.autoReplies[match];
            if (reply) {
                this._localPtyService.installAutoReply(match, reply);
            }
        }
        // TODO: Could simplify update to a single call
        this._register(configurationService.onDidChangeConfiguration(async (e) => {
            if (e.affectsConfiguration("terminal.integrated.autoReplies" /* TerminalSettingId.AutoReplies */)) {
                this._localPtyService.uninstallAllAutoReplies();
                const config = configurationService.getValue(TERMINAL_CONFIG_SECTION);
                for (const match of Object.keys(config.autoReplies)) {
                    // Ensure the reply is value
                    const reply = config.autoReplies[match];
                    if (reply) {
                        await this._localPtyService.installAutoReply(match, reply);
                    }
                }
            }
        }));
    }
    async requestDetachInstance(workspaceId, instanceId) {
        return this._localPtyService.requestDetachInstance(workspaceId, instanceId);
    }
    async acceptDetachInstanceReply(requestId, persistentProcessId) {
        if (!persistentProcessId) {
            this._logService.warn('Cannot attach to feature terminals, custom pty terminals, or those without a persistentProcessId');
            return;
        }
        return this._localPtyService.acceptDetachInstanceReply(requestId, persistentProcessId);
    }
    async persistTerminalState() {
        const ids = Array.from(this._ptys.keys());
        const serialized = await this._localPtyService.serializeTerminalState(ids);
        this._storageService.store("terminal.integrated.bufferState" /* TerminalStorageKeys.TerminalBufferState */, serialized, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
    }
    async updateTitle(id, title, titleSource) {
        await this._localPtyService.updateTitle(id, title, titleSource);
    }
    async updateIcon(id, userInitiated, icon, color) {
        await this._localPtyService.updateIcon(id, userInitiated, icon, color);
    }
    updateProperty(id, property, value) {
        return this._localPtyService.updateProperty(id, property, value);
    }
    async createProcess(shellLaunchConfig, cwd, cols, rows, unicodeVersion, env, options, shouldPersist) {
        const executableEnv = await this._shellEnvironmentService.getShellEnv();
        const id = await this._localPtyService.createProcess(shellLaunchConfig, cwd, cols, rows, unicodeVersion, env, executableEnv, options, shouldPersist, this._getWorkspaceId(), this._getWorkspaceName());
        const pty = this._instantiationService.createInstance(LocalPty, id, shouldPersist);
        this._ptys.set(id, pty);
        return pty;
    }
    async attachToProcess(id) {
        try {
            await this._localPtyService.attachToProcess(id);
            const pty = this._instantiationService.createInstance(LocalPty, id, true);
            this._ptys.set(id, pty);
            return pty;
        }
        catch (e) {
            this._logService.warn(`Couldn't attach to process ${e.message}`);
        }
        return undefined;
    }
    async attachToRevivedProcess(id) {
        try {
            const newId = await this._localPtyService.getRevivedPtyNewId(id) ?? id;
            return await this.attachToProcess(newId);
        }
        catch (e) {
            this._logService.warn(`Couldn't attach to process ${e.message}`);
        }
        return undefined;
    }
    async listProcesses() {
        return this._localPtyService.listProcesses();
    }
    async reduceConnectionGraceTime() {
        this._localPtyService.reduceConnectionGraceTime();
    }
    async getDefaultSystemShell(osOverride) {
        return this._localPtyService.getDefaultSystemShell(osOverride);
    }
    async getProfiles(profiles, defaultProfile, includeDetectedProfiles) {
        return this._localPtyService.getProfiles?.(this._workspaceContextService.getWorkspace().id, profiles, defaultProfile, includeDetectedProfiles) || [];
    }
    async getEnvironment() {
        return this._localPtyService.getEnvironment();
    }
    async getShellEnvironment() {
        return this._shellEnvironmentService.getShellEnv();
    }
    async getWslPath(original) {
        return this._localPtyService.getWslPath(original);
    }
    async setTerminalLayoutInfo(layoutInfo) {
        const args = {
            workspaceId: this._getWorkspaceId(),
            tabs: layoutInfo ? layoutInfo.tabs : []
        };
        await this._localPtyService.setTerminalLayoutInfo(args);
        // Store in the storage service as well to be used when reviving processes as normally this
        // is stored in memory on the pty host
        this._storageService.store("terminal.integrated.layoutInfo" /* TerminalStorageKeys.TerminalLayoutInfo */, JSON.stringify(args), 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
    }
    async getTerminalLayoutInfo() {
        const layoutArgs = {
            workspaceId: this._getWorkspaceId()
        };
        // Revive processes if needed
        const serializedState = this._storageService.get("terminal.integrated.bufferState" /* TerminalStorageKeys.TerminalBufferState */, 1 /* StorageScope.WORKSPACE */);
        const parsed = this._deserializeTerminalState(serializedState);
        if (parsed) {
            try {
                // Create variable resolver
                const activeWorkspaceRootUri = this._historyService.getLastActiveWorkspaceRoot();
                const lastActiveWorkspace = activeWorkspaceRootUri ? withNullAsUndefined(this._workspaceContextService.getWorkspaceFolder(activeWorkspaceRootUri)) : undefined;
                const variableResolver = terminalEnvironment.createVariableResolver(lastActiveWorkspace, await this._terminalProfileResolverService.getEnvironment(this.remoteAuthority), this._configurationResolverService);
                // Re-resolve the environments and replace it on the state so local terminals use a fresh
                // environment
                for (const state of parsed) {
                    const freshEnv = await this._resolveEnvironmentForRevive(variableResolver, state.shellLaunchConfig);
                    state.processLaunchConfig.env = freshEnv;
                }
                await this._localPtyService.reviveTerminalProcesses(parsed, Intl.DateTimeFormat().resolvedOptions().locale);
                this._storageService.remove("terminal.integrated.bufferState" /* TerminalStorageKeys.TerminalBufferState */, 1 /* StorageScope.WORKSPACE */);
                // If reviving processes, send the terminal layout info back to the pty host as it
                // will not have been persisted on application exit
                const layoutInfo = this._storageService.get("terminal.integrated.layoutInfo" /* TerminalStorageKeys.TerminalLayoutInfo */, 1 /* StorageScope.WORKSPACE */);
                if (layoutInfo) {
                    await this._localPtyService.setTerminalLayoutInfo(JSON.parse(layoutInfo));
                    this._storageService.remove("terminal.integrated.layoutInfo" /* TerminalStorageKeys.TerminalLayoutInfo */, 1 /* StorageScope.WORKSPACE */);
                }
            }
            catch {
                // no-op
            }
        }
        return this._localPtyService.getTerminalLayoutInfo(layoutArgs);
    }
    async _resolveEnvironmentForRevive(variableResolver, shellLaunchConfig) {
        const platformKey = isWindows ? 'windows' : (isMacintosh ? 'osx' : 'linux');
        const envFromConfigValue = this._configurationService.getValue(`terminal.integrated.env.${platformKey}`);
        const baseEnv = await (shellLaunchConfig.useShellEnvironment ? this.getShellEnvironment() : this.getEnvironment());
        const env = await terminalEnvironment.createTerminalEnvironment(shellLaunchConfig, envFromConfigValue, variableResolver, this._productService.version, this._configurationService.getValue("terminal.integrated.detectLocale" /* TerminalSettingId.DetectLocale */), baseEnv);
        if (!shellLaunchConfig.strictEnv && !shellLaunchConfig.hideFromUser) {
            await this._environmentVariableService.mergedCollection.applyToProcessEnvironment(env, variableResolver);
        }
        return env;
    }
    _getWorkspaceId() {
        return this._workspaceContextService.getWorkspace().id;
    }
    _getWorkspaceName() {
        return this._labelService.getWorkspaceLabel(this._workspaceContextService.getWorkspace());
    }
};
LocalTerminalBackend = __decorate([
    __param(1, IInstantiationService),
    __param(2, IWorkspaceContextService),
    __param(3, ILogService),
    __param(4, ILocalPtyService),
    __param(5, ILabelService),
    __param(6, IShellEnvironmentService),
    __param(7, IStorageService),
    __param(8, IConfigurationResolverService),
    __param(9, IConfigurationService),
    __param(10, IConfigurationService),
    __param(11, IProductService),
    __param(12, IHistoryService),
    __param(13, ITerminalProfileResolverService),
    __param(14, IEnvironmentVariableService),
    __param(15, INotificationService),
    __param(16, IHistoryService)
], LocalTerminalBackend);

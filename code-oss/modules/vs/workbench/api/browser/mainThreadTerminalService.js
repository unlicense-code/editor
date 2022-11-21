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
import { DisposableStore, Disposable } from 'vs/base/common/lifecycle';
import { ExtHostContext, MainContext } from 'vs/workbench/api/common/extHost.protocol';
import { extHostNamedCustomer } from 'vs/workbench/services/extensions/common/extHostCustomers';
import { URI } from 'vs/base/common/uri';
import { StopWatch } from 'vs/base/common/stopwatch';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ILogService } from 'vs/platform/log/common/log';
import { TerminalExitReason, TerminalLocation } from 'vs/platform/terminal/common/terminal';
import { TerminalDataBufferer } from 'vs/platform/terminal/common/terminalDataBuffering';
import { ITerminalEditorService, ITerminalGroupService, ITerminalInstanceService, ITerminalService } from 'vs/workbench/contrib/terminal/browser/terminal';
import { TerminalProcessExtHostProxy } from 'vs/workbench/contrib/terminal/browser/terminalProcessExtHostProxy';
import { IEnvironmentVariableService } from 'vs/workbench/contrib/terminal/common/environmentVariable';
import { deserializeEnvironmentVariableCollection, serializeEnvironmentVariableCollection } from 'vs/workbench/contrib/terminal/common/environmentVariableShared';
import { ITerminalProfileResolverService, ITerminalProfileService } from 'vs/workbench/contrib/terminal/common/terminal';
import { IRemoteAgentService } from 'vs/workbench/services/remote/common/remoteAgentService';
import { withNullAsUndefined } from 'vs/base/common/types';
import { OS } from 'vs/base/common/platform';
import { Promises } from 'vs/base/common/async';
let MainThreadTerminalService = class MainThreadTerminalService {
    _extHostContext;
    _terminalService;
    terminalInstanceService;
    _instantiationService;
    _environmentVariableService;
    _logService;
    _terminalProfileResolverService;
    _terminalGroupService;
    _terminalEditorService;
    _terminalProfileService;
    _proxy;
    /**
     * Stores a map from a temporary terminal id (a UUID generated on the extension host side)
     * to a numeric terminal id (an id generated on the renderer side)
     * This comes in play only when dealing with terminals created on the extension host side
     */
    _extHostTerminals = new Map();
    _toDispose = new DisposableStore();
    _terminalProcessProxies = new Map();
    _profileProviders = new Map();
    _dataEventTracker;
    /**
     * A single shared terminal link provider for the exthost. When an ext registers a link
     * provider, this is registered with the terminal on the renderer side and all links are
     * provided through this, even from multiple ext link providers. Xterm should remove lower
     * priority intersecting links itself.
     */
    _linkProvider;
    _os = OS;
    constructor(_extHostContext, _terminalService, terminalInstanceService, _instantiationService, _environmentVariableService, _logService, _terminalProfileResolverService, remoteAgentService, _terminalGroupService, _terminalEditorService, _terminalProfileService) {
        this._extHostContext = _extHostContext;
        this._terminalService = _terminalService;
        this.terminalInstanceService = terminalInstanceService;
        this._instantiationService = _instantiationService;
        this._environmentVariableService = _environmentVariableService;
        this._logService = _logService;
        this._terminalProfileResolverService = _terminalProfileResolverService;
        this._terminalGroupService = _terminalGroupService;
        this._terminalEditorService = _terminalEditorService;
        this._terminalProfileService = _terminalProfileService;
        this._proxy = _extHostContext.getProxy(ExtHostContext.ExtHostTerminalService);
        // ITerminalService listeners
        this._toDispose.add(_terminalService.onDidCreateInstance((instance) => {
            this._onTerminalOpened(instance);
            this._onInstanceDimensionsChanged(instance);
        }));
        this._toDispose.add(_terminalService.onDidDisposeInstance(instance => this._onTerminalDisposed(instance)));
        this._toDispose.add(_terminalService.onDidReceiveProcessId(instance => this._onTerminalProcessIdReady(instance)));
        this._toDispose.add(_terminalService.onDidChangeInstanceDimensions(instance => this._onInstanceDimensionsChanged(instance)));
        this._toDispose.add(_terminalService.onDidMaximumDimensionsChange(instance => this._onInstanceMaximumDimensionsChanged(instance)));
        this._toDispose.add(_terminalService.onDidRequestStartExtensionTerminal(e => this._onRequestStartExtensionTerminal(e)));
        this._toDispose.add(_terminalService.onDidChangeActiveInstance(instance => this._onActiveTerminalChanged(instance ? instance.instanceId : null)));
        this._toDispose.add(_terminalService.onDidChangeInstanceTitle(instance => instance && this._onTitleChanged(instance.instanceId, instance.title)));
        this._toDispose.add(_terminalService.onDidInputInstanceData(instance => this._proxy.$acceptTerminalInteraction(instance.instanceId)));
        // Set initial ext host state
        this._terminalService.instances.forEach(t => {
            this._onTerminalOpened(t);
            t.processReady.then(() => this._onTerminalProcessIdReady(t));
        });
        const activeInstance = this._terminalService.activeInstance;
        if (activeInstance) {
            this._proxy.$acceptActiveTerminalChanged(activeInstance.instanceId);
        }
        if (this._environmentVariableService.collections.size > 0) {
            const collectionAsArray = [...this._environmentVariableService.collections.entries()];
            const serializedCollections = collectionAsArray.map(e => {
                return [e[0], serializeEnvironmentVariableCollection(e[1].map)];
            });
            this._proxy.$initEnvironmentVariableCollections(serializedCollections);
        }
        remoteAgentService.getEnvironment().then(async (env) => {
            this._os = env?.os || OS;
            this._updateDefaultProfile();
        });
        this._terminalProfileService.onDidChangeAvailableProfiles(() => this._updateDefaultProfile());
    }
    dispose() {
        this._toDispose.dispose();
        this._linkProvider?.dispose();
    }
    async _updateDefaultProfile() {
        const remoteAuthority = withNullAsUndefined(this._extHostContext.remoteAuthority);
        const defaultProfile = this._terminalProfileResolverService.getDefaultProfile({ remoteAuthority, os: this._os });
        const defaultAutomationProfile = this._terminalProfileResolverService.getDefaultProfile({ remoteAuthority, os: this._os, allowAutomationShell: true });
        this._proxy.$acceptDefaultProfile(...await Promise.all([defaultProfile, defaultAutomationProfile]));
    }
    async _getTerminalInstance(id) {
        if (typeof id === 'string') {
            return this._extHostTerminals.get(id);
        }
        return this._terminalService.getInstanceFromId(id);
    }
    async $createTerminal(extHostTerminalId, launchConfig) {
        const shellLaunchConfig = {
            name: launchConfig.name,
            executable: launchConfig.shellPath,
            args: launchConfig.shellArgs,
            cwd: typeof launchConfig.cwd === 'string' ? launchConfig.cwd : URI.revive(launchConfig.cwd),
            icon: launchConfig.icon,
            color: launchConfig.color,
            initialText: launchConfig.initialText,
            waitOnExit: launchConfig.waitOnExit,
            ignoreConfigurationCwd: true,
            env: launchConfig.env,
            strictEnv: launchConfig.strictEnv,
            hideFromUser: launchConfig.hideFromUser,
            customPtyImplementation: launchConfig.isExtensionCustomPtyTerminal
                ? (id, cols, rows) => new TerminalProcessExtHostProxy(id, cols, rows, this._terminalService)
                : undefined,
            extHostTerminalId,
            isFeatureTerminal: launchConfig.isFeatureTerminal,
            isExtensionOwnedTerminal: launchConfig.isExtensionOwnedTerminal,
            useShellEnvironment: launchConfig.useShellEnvironment,
            isTransient: launchConfig.isTransient
        };
        const terminal = Promises.withAsyncBody(async (r) => {
            const terminal = await this._terminalService.createTerminal({
                config: shellLaunchConfig,
                location: await this._deserializeParentTerminal(launchConfig.location)
            });
            r(terminal);
        });
        this._extHostTerminals.set(extHostTerminalId, terminal);
        const terminalInstance = await terminal;
        this._toDispose.add(terminalInstance.onDisposed(() => {
            this._extHostTerminals.delete(extHostTerminalId);
        }));
    }
    async _deserializeParentTerminal(location) {
        if (typeof location === 'object' && 'parentTerminal' in location) {
            const parentTerminal = await this._extHostTerminals.get(location.parentTerminal.toString());
            return parentTerminal ? { parentTerminal } : undefined;
        }
        return location;
    }
    async $show(id, preserveFocus) {
        const terminalInstance = await this._getTerminalInstance(id);
        if (terminalInstance) {
            this._terminalService.setActiveInstance(terminalInstance);
            if (terminalInstance.target === TerminalLocation.Editor) {
                await this._terminalEditorService.revealActiveEditor(preserveFocus);
            }
            else {
                await this._terminalGroupService.showPanel(!preserveFocus);
            }
        }
    }
    async $hide(id) {
        const instanceToHide = await this._getTerminalInstance(id);
        const activeInstance = this._terminalService.activeInstance;
        if (activeInstance && activeInstance.instanceId === instanceToHide?.instanceId && activeInstance.target !== TerminalLocation.Editor) {
            this._terminalGroupService.hidePanel();
        }
    }
    async $dispose(id) {
        (await this._getTerminalInstance(id))?.dispose(TerminalExitReason.Extension);
    }
    async $sendText(id, text, addNewLine) {
        const instance = await this._getTerminalInstance(id);
        await instance?.sendText(text, addNewLine);
    }
    $sendProcessExit(terminalId, exitCode) {
        this._terminalProcessProxies.get(terminalId)?.emitExit(exitCode);
    }
    $startSendingDataEvents() {
        if (!this._dataEventTracker) {
            this._dataEventTracker = this._instantiationService.createInstance(TerminalDataEventTracker, (id, data) => {
                this._onTerminalData(id, data);
            });
            // Send initial events if they exist
            this._terminalService.instances.forEach(t => {
                t.initialDataEvents?.forEach(d => this._onTerminalData(t.instanceId, d));
            });
        }
    }
    $stopSendingDataEvents() {
        this._dataEventTracker?.dispose();
        this._dataEventTracker = undefined;
    }
    $startLinkProvider() {
        this._linkProvider?.dispose();
        this._linkProvider = this._terminalService.registerLinkProvider(new ExtensionTerminalLinkProvider(this._proxy));
    }
    $stopLinkProvider() {
        this._linkProvider?.dispose();
        this._linkProvider = undefined;
    }
    $registerProcessSupport(isSupported) {
        this._terminalService.registerProcessSupport(isSupported);
    }
    $registerProfileProvider(id, extensionIdentifier) {
        // Proxy profile provider requests through the extension host
        this._profileProviders.set(id, this._terminalProfileService.registerTerminalProfileProvider(extensionIdentifier, id, {
            createContributedTerminalProfile: async (options) => {
                return this._proxy.$createContributedProfileTerminal(id, options);
            }
        }));
    }
    $unregisterProfileProvider(id) {
        this._profileProviders.get(id)?.dispose();
        this._profileProviders.delete(id);
    }
    _onActiveTerminalChanged(terminalId) {
        this._proxy.$acceptActiveTerminalChanged(terminalId);
    }
    _onTerminalData(terminalId, data) {
        this._proxy.$acceptTerminalProcessData(terminalId, data);
    }
    _onTitleChanged(terminalId, name) {
        this._proxy.$acceptTerminalTitleChange(terminalId, name);
    }
    _onTerminalDisposed(terminalInstance) {
        this._proxy.$acceptTerminalClosed(terminalInstance.instanceId, terminalInstance.exitCode, terminalInstance.exitReason ?? TerminalExitReason.Unknown);
    }
    _onTerminalOpened(terminalInstance) {
        const extHostTerminalId = terminalInstance.shellLaunchConfig.extHostTerminalId;
        const shellLaunchConfigDto = {
            name: terminalInstance.shellLaunchConfig.name,
            executable: terminalInstance.shellLaunchConfig.executable,
            args: terminalInstance.shellLaunchConfig.args,
            cwd: terminalInstance.shellLaunchConfig.cwd,
            env: terminalInstance.shellLaunchConfig.env,
            hideFromUser: terminalInstance.shellLaunchConfig.hideFromUser
        };
        this._proxy.$acceptTerminalOpened(terminalInstance.instanceId, extHostTerminalId, terminalInstance.title, shellLaunchConfigDto);
    }
    _onTerminalProcessIdReady(terminalInstance) {
        if (terminalInstance.processId === undefined) {
            return;
        }
        this._proxy.$acceptTerminalProcessId(terminalInstance.instanceId, terminalInstance.processId);
    }
    _onInstanceDimensionsChanged(instance) {
        this._proxy.$acceptTerminalDimensions(instance.instanceId, instance.cols, instance.rows);
    }
    _onInstanceMaximumDimensionsChanged(instance) {
        this._proxy.$acceptTerminalMaximumDimensions(instance.instanceId, instance.maxCols, instance.maxRows);
    }
    _onRequestStartExtensionTerminal(request) {
        const proxy = request.proxy;
        this._terminalProcessProxies.set(proxy.instanceId, proxy);
        // Note that onResize is not being listened to here as it needs to fire when max dimensions
        // change, excluding the dimension override
        const initialDimensions = request.cols && request.rows ? {
            columns: request.cols,
            rows: request.rows
        } : undefined;
        this._proxy.$startExtensionTerminal(proxy.instanceId, initialDimensions).then(request.callback);
        proxy.onInput(data => this._proxy.$acceptProcessInput(proxy.instanceId, data));
        proxy.onShutdown(immediate => this._proxy.$acceptProcessShutdown(proxy.instanceId, immediate));
        proxy.onRequestCwd(() => this._proxy.$acceptProcessRequestCwd(proxy.instanceId));
        proxy.onRequestInitialCwd(() => this._proxy.$acceptProcessRequestInitialCwd(proxy.instanceId));
        proxy.onRequestLatency(() => this._onRequestLatency(proxy.instanceId));
    }
    $sendProcessData(terminalId, data) {
        this._terminalProcessProxies.get(terminalId)?.emitData(data);
    }
    $sendProcessReady(terminalId, pid, cwd) {
        this._terminalProcessProxies.get(terminalId)?.emitReady(pid, cwd);
    }
    $sendProcessProperty(terminalId, property) {
        if (property.type === "title" /* ProcessPropertyType.Title */) {
            const instance = this._terminalService.getInstanceFromId(terminalId);
            instance?.rename(property.value);
        }
        this._terminalProcessProxies.get(terminalId)?.emitProcessProperty(property);
    }
    async _onRequestLatency(terminalId) {
        const COUNT = 2;
        let sum = 0;
        for (let i = 0; i < COUNT; i++) {
            const sw = StopWatch.create(true);
            await this._proxy.$acceptProcessRequestLatency(terminalId);
            sw.stop();
            sum += sw.elapsed();
        }
        this._getTerminalProcess(terminalId)?.emitLatency(sum / COUNT);
    }
    _getTerminalProcess(terminalId) {
        const terminal = this._terminalProcessProxies.get(terminalId);
        if (!terminal) {
            this._logService.error(`Unknown terminal: ${terminalId}`);
            return undefined;
        }
        return terminal;
    }
    $setEnvironmentVariableCollection(extensionIdentifier, persistent, collection) {
        if (collection) {
            const translatedCollection = {
                persistent,
                map: deserializeEnvironmentVariableCollection(collection)
            };
            this._environmentVariableService.set(extensionIdentifier, translatedCollection);
        }
        else {
            this._environmentVariableService.delete(extensionIdentifier);
        }
    }
};
MainThreadTerminalService = __decorate([
    extHostNamedCustomer(MainContext.MainThreadTerminalService),
    __param(1, ITerminalService),
    __param(2, ITerminalInstanceService),
    __param(3, IInstantiationService),
    __param(4, IEnvironmentVariableService),
    __param(5, ILogService),
    __param(6, ITerminalProfileResolverService),
    __param(7, IRemoteAgentService),
    __param(8, ITerminalGroupService),
    __param(9, ITerminalEditorService),
    __param(10, ITerminalProfileService)
], MainThreadTerminalService);
export { MainThreadTerminalService };
/**
 * Encapsulates temporary tracking of data events from terminal instances, once disposed all
 * listeners are removed.
 */
let TerminalDataEventTracker = class TerminalDataEventTracker extends Disposable {
    _callback;
    _terminalService;
    _bufferer;
    constructor(_callback, _terminalService) {
        super();
        this._callback = _callback;
        this._terminalService = _terminalService;
        this._register(this._bufferer = new TerminalDataBufferer(this._callback));
        this._terminalService.instances.forEach(instance => this._registerInstance(instance));
        this._register(this._terminalService.onDidCreateInstance(instance => this._registerInstance(instance)));
        this._register(this._terminalService.onDidDisposeInstance(instance => this._bufferer.stopBuffering(instance.instanceId)));
    }
    _registerInstance(instance) {
        // Buffer data events to reduce the amount of messages going to the extension host
        this._register(this._bufferer.startBuffering(instance.instanceId, instance.onData));
    }
};
TerminalDataEventTracker = __decorate([
    __param(1, ITerminalService)
], TerminalDataEventTracker);
class ExtensionTerminalLinkProvider {
    _proxy;
    constructor(_proxy) {
        this._proxy = _proxy;
    }
    async provideLinks(instance, line) {
        const proxy = this._proxy;
        const extHostLinks = await proxy.$provideLinks(instance.instanceId, line);
        return extHostLinks.map(dto => ({
            id: dto.id,
            startIndex: dto.startIndex,
            length: dto.length,
            label: dto.label,
            activate: () => proxy.$activateLink(instance.instanceId, dto.id)
        }));
    }
}

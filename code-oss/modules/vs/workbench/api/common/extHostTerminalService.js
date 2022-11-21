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
import { MainContext } from 'vs/workbench/api/common/extHost.protocol';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { URI } from 'vs/base/common/uri';
import { IExtHostRpcService } from 'vs/workbench/api/common/extHostRpcService';
import { DisposableStore, Disposable } from 'vs/base/common/lifecycle';
import { Disposable as VSCodeDisposable, EnvironmentVariableMutatorType } from './extHostTypes';
import { localize } from 'vs/nls';
import { NotSupportedError } from 'vs/base/common/errors';
import { serializeEnvironmentVariableCollection } from 'vs/workbench/contrib/terminal/common/environmentVariableShared';
import { CancellationTokenSource } from 'vs/base/common/cancellation';
import { generateUuid } from 'vs/base/common/uuid';
import { TerminalDataBufferer } from 'vs/platform/terminal/common/terminalDataBuffering';
import { ThemeColor } from 'vs/platform/theme/common/themeService';
import { withNullAsUndefined } from 'vs/base/common/types';
import { Promises } from 'vs/base/common/async';
import { ViewColumn } from 'vs/workbench/api/common/extHostTypeConverters';
export const IExtHostTerminalService = createDecorator('IExtHostTerminalService');
export class ExtHostTerminal {
    _proxy;
    _id;
    _creationOptions;
    _name;
    _disposed = false;
    _pidPromise;
    _cols;
    _pidPromiseComplete;
    _rows;
    _exitStatus;
    _state = { isInteractedWith: false };
    isOpen = false;
    value;
    constructor(_proxy, _id, _creationOptions, _name) {
        this._proxy = _proxy;
        this._id = _id;
        this._creationOptions = _creationOptions;
        this._name = _name;
        this._creationOptions = Object.freeze(this._creationOptions);
        this._pidPromise = new Promise(c => this._pidPromiseComplete = c);
        const that = this;
        this.value = {
            get name() {
                return that._name || '';
            },
            get processId() {
                return that._pidPromise;
            },
            get creationOptions() {
                return that._creationOptions;
            },
            get exitStatus() {
                return that._exitStatus;
            },
            get state() {
                return that._state;
            },
            sendText(text, addNewLine = true) {
                that._checkDisposed();
                that._proxy.$sendText(that._id, text, addNewLine);
            },
            show(preserveFocus) {
                that._checkDisposed();
                that._proxy.$show(that._id, preserveFocus);
            },
            hide() {
                that._checkDisposed();
                that._proxy.$hide(that._id);
            },
            dispose() {
                if (!that._disposed) {
                    that._disposed = true;
                    that._proxy.$dispose(that._id);
                }
            },
            get dimensions() {
                if (that._cols === undefined || that._rows === undefined) {
                    return undefined;
                }
                return {
                    columns: that._cols,
                    rows: that._rows
                };
            }
        };
    }
    async create(options, internalOptions) {
        if (typeof this._id !== 'string') {
            throw new Error('Terminal has already been created');
        }
        await this._proxy.$createTerminal(this._id, {
            name: options.name,
            shellPath: withNullAsUndefined(options.shellPath),
            shellArgs: withNullAsUndefined(options.shellArgs),
            cwd: withNullAsUndefined(options.cwd),
            env: withNullAsUndefined(options.env),
            icon: withNullAsUndefined(asTerminalIcon(options.iconPath)),
            color: ThemeColor.isThemeColor(options.color) ? options.color.id : undefined,
            initialText: withNullAsUndefined(options.message),
            strictEnv: withNullAsUndefined(options.strictEnv),
            hideFromUser: withNullAsUndefined(options.hideFromUser),
            isFeatureTerminal: withNullAsUndefined(internalOptions?.isFeatureTerminal),
            isExtensionOwnedTerminal: true,
            useShellEnvironment: withNullAsUndefined(internalOptions?.useShellEnvironment),
            location: internalOptions?.location || this._serializeParentTerminal(options.location, internalOptions?.resolvedExtHostIdentifier),
            isTransient: withNullAsUndefined(options.isTransient)
        });
    }
    async createExtensionTerminal(location, parentTerminal, iconPath, color) {
        if (typeof this._id !== 'string') {
            throw new Error('Terminal has already been created');
        }
        await this._proxy.$createTerminal(this._id, {
            name: this._name,
            isExtensionCustomPtyTerminal: true,
            icon: iconPath,
            color: ThemeColor.isThemeColor(color) ? color.id : undefined,
            location: this._serializeParentTerminal(location, parentTerminal),
            isTransient: true
        });
        // At this point, the id has been set via `$acceptTerminalOpened`
        if (typeof this._id === 'string') {
            throw new Error('Terminal creation failed');
        }
        return this._id;
    }
    _serializeParentTerminal(location, parentTerminal) {
        if (typeof location === 'object') {
            if ('parentTerminal' in location && location.parentTerminal && parentTerminal) {
                return { parentTerminal };
            }
            if ('viewColumn' in location) {
                return { viewColumn: ViewColumn.from(location.viewColumn), preserveFocus: location.preserveFocus };
            }
            return undefined;
        }
        return location;
    }
    _checkDisposed() {
        if (this._disposed) {
            throw new Error('Terminal has already been disposed');
        }
    }
    set name(name) {
        this._name = name;
    }
    setExitStatus(code, reason) {
        this._exitStatus = Object.freeze({ code, reason });
    }
    setDimensions(cols, rows) {
        if (cols === this._cols && rows === this._rows) {
            // Nothing changed
            return false;
        }
        if (cols === 0 || rows === 0) {
            return false;
        }
        this._cols = cols;
        this._rows = rows;
        return true;
    }
    setInteractedWith() {
        if (!this._state.isInteractedWith) {
            this._state = { isInteractedWith: true };
            return true;
        }
        return false;
    }
    _setProcessId(processId) {
        // The event may fire 2 times when the panel is restored
        if (this._pidPromiseComplete) {
            this._pidPromiseComplete(processId);
            this._pidPromiseComplete = undefined;
        }
        else {
            // Recreate the promise if this is the nth processId set (e.g. reused task terminals)
            this._pidPromise.then(pid => {
                if (pid !== processId) {
                    this._pidPromise = Promise.resolve(processId);
                }
            });
        }
    }
}
export class ExtHostPseudoterminal {
    _pty;
    id = 0;
    shouldPersist = false;
    _onProcessData = new Emitter();
    onProcessData = this._onProcessData.event;
    _onProcessReady = new Emitter();
    get onProcessReady() { return this._onProcessReady.event; }
    _onDidChangeProperty = new Emitter();
    onDidChangeProperty = this._onDidChangeProperty.event;
    _onProcessExit = new Emitter();
    onProcessExit = this._onProcessExit.event;
    constructor(_pty) {
        this._pty = _pty;
    }
    refreshProperty(property) {
        throw new Error(`refreshProperty is not suppported in extension owned terminals. property: ${property}`);
    }
    updateProperty(property, value) {
        throw new Error(`updateProperty is not suppported in extension owned terminals. property: ${property}, value: ${value}`);
    }
    async start() {
        return undefined;
    }
    shutdown() {
        this._pty.close();
    }
    input(data) {
        this._pty.handleInput?.(data);
    }
    resize(cols, rows) {
        this._pty.setDimensions?.({ columns: cols, rows });
    }
    async processBinary(data) {
        // No-op, processBinary is not supported in extension owned terminals.
    }
    acknowledgeDataEvent(charCount) {
        // No-op, flow control is not supported in extension owned terminals. If this is ever
        // implemented it will need new pause and resume VS Code APIs.
    }
    async setUnicodeVersion(version) {
        // No-op, xterm-headless isn't used for extension owned terminals.
    }
    getInitialCwd() {
        return Promise.resolve('');
    }
    getCwd() {
        return Promise.resolve('');
    }
    getLatency() {
        return Promise.resolve(0);
    }
    startSendingEvents(initialDimensions) {
        // Attach the listeners
        this._pty.onDidWrite(e => this._onProcessData.fire(e));
        this._pty.onDidClose?.((e = undefined) => {
            this._onProcessExit.fire(e === void 0 ? undefined : e);
        });
        this._pty.onDidOverrideDimensions?.(e => {
            if (e) {
                this._onDidChangeProperty.fire({ type: "overrideDimensions" /* ProcessPropertyType.OverrideDimensions */, value: { cols: e.columns, rows: e.rows } });
            }
        });
        this._pty.onDidChangeName?.(title => {
            this._onDidChangeProperty.fire({ type: "title" /* ProcessPropertyType.Title */, value: title });
        });
        this._pty.open(initialDimensions ? initialDimensions : undefined);
        if (initialDimensions) {
            this._pty.setDimensions?.(initialDimensions);
        }
        this._onProcessReady.fire({ pid: -1, cwd: '' });
    }
}
let nextLinkId = 1;
let BaseExtHostTerminalService = class BaseExtHostTerminalService extends Disposable {
    _serviceBrand;
    _proxy;
    _activeTerminal;
    _terminals = [];
    _terminalProcesses = new Map();
    _terminalProcessDisposables = {};
    _extensionTerminalAwaitingStart = {};
    _getTerminalPromises = {};
    _environmentVariableCollections = new Map();
    _defaultProfile;
    _defaultAutomationProfile;
    _bufferer;
    _linkProviders = new Set();
    _profileProviders = new Map();
    _terminalLinkCache = new Map();
    _terminalLinkCancellationSource = new Map();
    get activeTerminal() { return this._activeTerminal?.value; }
    get terminals() { return this._terminals.map(term => term.value); }
    _onDidCloseTerminal = new Emitter();
    onDidCloseTerminal = this._onDidCloseTerminal.event;
    _onDidOpenTerminal = new Emitter();
    onDidOpenTerminal = this._onDidOpenTerminal.event;
    _onDidChangeActiveTerminal = new Emitter();
    onDidChangeActiveTerminal = this._onDidChangeActiveTerminal.event;
    _onDidChangeTerminalDimensions = new Emitter();
    onDidChangeTerminalDimensions = this._onDidChangeTerminalDimensions.event;
    _onDidChangeTerminalState = new Emitter();
    onDidChangeTerminalState = this._onDidChangeTerminalState.event;
    _onDidWriteTerminalData;
    get onDidWriteTerminalData() { return this._onDidWriteTerminalData.event; }
    _onDidChangeShell = new Emitter();
    onDidChangeShell = this._onDidChangeShell.event;
    constructor(supportsProcesses, extHostRpc) {
        super();
        this._proxy = extHostRpc.getProxy(MainContext.MainThreadTerminalService);
        this._bufferer = new TerminalDataBufferer(this._proxy.$sendProcessData);
        this._onDidWriteTerminalData = new Emitter({
            onWillAddFirstListener: () => this._proxy.$startSendingDataEvents(),
            onDidRemoveLastListener: () => this._proxy.$stopSendingDataEvents()
        });
        this._proxy.$registerProcessSupport(supportsProcesses);
        this._register({
            dispose: () => {
                for (const [_, terminalProcess] of this._terminalProcesses) {
                    terminalProcess.shutdown(true);
                }
            }
        });
    }
    getDefaultShell(useAutomationShell) {
        const profile = useAutomationShell ? this._defaultAutomationProfile : this._defaultProfile;
        return profile?.path || '';
    }
    getDefaultShellArgs(useAutomationShell) {
        const profile = useAutomationShell ? this._defaultAutomationProfile : this._defaultProfile;
        return profile?.args || [];
    }
    createExtensionTerminal(options, internalOptions) {
        const terminal = new ExtHostTerminal(this._proxy, generateUuid(), options, options.name);
        const p = new ExtHostPseudoterminal(options.pty);
        terminal.createExtensionTerminal(options.location, this._serializeParentTerminal(options, internalOptions).resolvedExtHostIdentifier, asTerminalIcon(options.iconPath), asTerminalColor(options.color)).then(id => {
            const disposable = this._setupExtHostProcessListeners(id, p);
            this._terminalProcessDisposables[id] = disposable;
        });
        this._terminals.push(terminal);
        return terminal.value;
    }
    _serializeParentTerminal(options, internalOptions) {
        internalOptions = internalOptions ? internalOptions : {};
        if (options.location && typeof options.location === 'object' && 'parentTerminal' in options.location) {
            const parentTerminal = options.location.parentTerminal;
            if (parentTerminal) {
                const parentExtHostTerminal = this._terminals.find(t => t.value === parentTerminal);
                if (parentExtHostTerminal) {
                    internalOptions.resolvedExtHostIdentifier = parentExtHostTerminal._id;
                }
            }
        }
        else if (options.location && typeof options.location !== 'object') {
            internalOptions.location = options.location;
        }
        else if (internalOptions.location && typeof internalOptions.location === 'object' && 'splitActiveTerminal' in internalOptions.location) {
            internalOptions.location = { splitActiveTerminal: true };
        }
        return internalOptions;
    }
    attachPtyToTerminal(id, pty) {
        const terminal = this._getTerminalById(id);
        if (!terminal) {
            throw new Error(`Cannot resolve terminal with id ${id} for virtual process`);
        }
        const p = new ExtHostPseudoterminal(pty);
        const disposable = this._setupExtHostProcessListeners(id, p);
        this._terminalProcessDisposables[id] = disposable;
    }
    async $acceptActiveTerminalChanged(id) {
        const original = this._activeTerminal;
        if (id === null) {
            this._activeTerminal = undefined;
            if (original !== this._activeTerminal) {
                this._onDidChangeActiveTerminal.fire(this._activeTerminal);
            }
            return;
        }
        const terminal = this._getTerminalById(id);
        if (terminal) {
            this._activeTerminal = terminal;
            if (original !== this._activeTerminal) {
                this._onDidChangeActiveTerminal.fire(this._activeTerminal.value);
            }
        }
    }
    async $acceptTerminalProcessData(id, data) {
        const terminal = this._getTerminalById(id);
        if (terminal) {
            this._onDidWriteTerminalData.fire({ terminal: terminal.value, data });
        }
    }
    async $acceptTerminalDimensions(id, cols, rows) {
        const terminal = this._getTerminalById(id);
        if (terminal) {
            if (terminal.setDimensions(cols, rows)) {
                this._onDidChangeTerminalDimensions.fire({
                    terminal: terminal.value,
                    dimensions: terminal.value.dimensions
                });
            }
        }
    }
    async $acceptTerminalMaximumDimensions(id, cols, rows) {
        // Extension pty terminal only - when virtual process resize fires it means that the
        // terminal's maximum dimensions changed
        this._terminalProcesses.get(id)?.resize(cols, rows);
    }
    async $acceptTerminalTitleChange(id, name) {
        const terminal = this._getTerminalById(id);
        if (terminal) {
            terminal.name = name;
        }
    }
    async $acceptTerminalClosed(id, exitCode, exitReason) {
        const index = this._getTerminalObjectIndexById(this._terminals, id);
        if (index !== null) {
            const terminal = this._terminals.splice(index, 1)[0];
            terminal.setExitStatus(exitCode, exitReason);
            this._onDidCloseTerminal.fire(terminal.value);
        }
    }
    $acceptTerminalOpened(id, extHostTerminalId, name, shellLaunchConfigDto) {
        if (extHostTerminalId) {
            // Resolve with the renderer generated id
            const index = this._getTerminalObjectIndexById(this._terminals, extHostTerminalId);
            if (index !== null) {
                // The terminal has already been created (via createTerminal*), only fire the event
                this._terminals[index]._id = id;
                this._onDidOpenTerminal.fire(this.terminals[index]);
                this._terminals[index].isOpen = true;
                return;
            }
        }
        const creationOptions = {
            name: shellLaunchConfigDto.name,
            shellPath: shellLaunchConfigDto.executable,
            shellArgs: shellLaunchConfigDto.args,
            cwd: typeof shellLaunchConfigDto.cwd === 'string' ? shellLaunchConfigDto.cwd : URI.revive(shellLaunchConfigDto.cwd),
            env: shellLaunchConfigDto.env,
            hideFromUser: shellLaunchConfigDto.hideFromUser
        };
        const terminal = new ExtHostTerminal(this._proxy, id, creationOptions, name);
        this._terminals.push(terminal);
        this._onDidOpenTerminal.fire(terminal.value);
        terminal.isOpen = true;
    }
    async $acceptTerminalProcessId(id, processId) {
        const terminal = this._getTerminalById(id);
        terminal?._setProcessId(processId);
    }
    async $startExtensionTerminal(id, initialDimensions) {
        // Make sure the ExtHostTerminal exists so onDidOpenTerminal has fired before we call
        // Pseudoterminal.start
        const terminal = this._getTerminalById(id);
        if (!terminal) {
            return { message: localize('launchFail.idMissingOnExtHost', "Could not find the terminal with id {0} on the extension host", id) };
        }
        // Wait for onDidOpenTerminal to fire
        if (!terminal.isOpen) {
            await new Promise(r => {
                // Ensure open is called after onDidOpenTerminal
                const listener = this.onDidOpenTerminal(async (e) => {
                    if (e === terminal.value) {
                        listener.dispose();
                        r();
                    }
                });
            });
        }
        const terminalProcess = this._terminalProcesses.get(id);
        if (terminalProcess) {
            terminalProcess.startSendingEvents(initialDimensions);
        }
        else {
            // Defer startSendingEvents call to when _setupExtHostProcessListeners is called
            this._extensionTerminalAwaitingStart[id] = { initialDimensions };
        }
        return undefined;
    }
    _setupExtHostProcessListeners(id, p) {
        const disposables = new DisposableStore();
        disposables.add(p.onProcessReady(e => this._proxy.$sendProcessReady(id, e.pid, e.cwd)));
        disposables.add(p.onDidChangeProperty(property => this._proxy.$sendProcessProperty(id, property)));
        // Buffer data events to reduce the amount of messages going to the renderer
        this._bufferer.startBuffering(id, p.onProcessData);
        disposables.add(p.onProcessExit(exitCode => this._onProcessExit(id, exitCode)));
        this._terminalProcesses.set(id, p);
        const awaitingStart = this._extensionTerminalAwaitingStart[id];
        if (awaitingStart && p instanceof ExtHostPseudoterminal) {
            p.startSendingEvents(awaitingStart.initialDimensions);
            delete this._extensionTerminalAwaitingStart[id];
        }
        return disposables;
    }
    $acceptProcessAckDataEvent(id, charCount) {
        this._terminalProcesses.get(id)?.acknowledgeDataEvent(charCount);
    }
    $acceptProcessInput(id, data) {
        this._terminalProcesses.get(id)?.input(data);
    }
    $acceptTerminalInteraction(id) {
        const terminal = this._getTerminalById(id);
        if (terminal?.setInteractedWith()) {
            this._onDidChangeTerminalState.fire(terminal.value);
        }
    }
    $acceptProcessResize(id, cols, rows) {
        try {
            this._terminalProcesses.get(id)?.resize(cols, rows);
        }
        catch (error) {
            // We tried to write to a closed pipe / channel.
            if (error.code !== 'EPIPE' && error.code !== 'ERR_IPC_CHANNEL_CLOSED') {
                throw (error);
            }
        }
    }
    $acceptProcessShutdown(id, immediate) {
        this._terminalProcesses.get(id)?.shutdown(immediate);
    }
    $acceptProcessRequestInitialCwd(id) {
        this._terminalProcesses.get(id)?.getInitialCwd().then(initialCwd => this._proxy.$sendProcessProperty(id, { type: "initialCwd" /* ProcessPropertyType.InitialCwd */, value: initialCwd }));
    }
    $acceptProcessRequestCwd(id) {
        this._terminalProcesses.get(id)?.getCwd().then(cwd => this._proxy.$sendProcessProperty(id, { type: "cwd" /* ProcessPropertyType.Cwd */, value: cwd }));
    }
    $acceptProcessRequestLatency(id) {
        return Promise.resolve(id);
    }
    registerLinkProvider(provider) {
        this._linkProviders.add(provider);
        if (this._linkProviders.size === 1) {
            this._proxy.$startLinkProvider();
        }
        return new VSCodeDisposable(() => {
            this._linkProviders.delete(provider);
            if (this._linkProviders.size === 0) {
                this._proxy.$stopLinkProvider();
            }
        });
    }
    registerProfileProvider(extension, id, provider) {
        if (this._profileProviders.has(id)) {
            throw new Error(`Terminal profile provider "${id}" already registered`);
        }
        this._profileProviders.set(id, provider);
        this._proxy.$registerProfileProvider(id, extension.identifier.value);
        return new VSCodeDisposable(() => {
            this._profileProviders.delete(id);
            this._proxy.$unregisterProfileProvider(id);
        });
    }
    async $createContributedProfileTerminal(id, options) {
        const token = new CancellationTokenSource().token;
        let profile = await this._profileProviders.get(id)?.provideTerminalProfile(token);
        if (token.isCancellationRequested) {
            return;
        }
        if (profile && !('options' in profile)) {
            profile = { options: profile };
        }
        if (!profile || !('options' in profile)) {
            throw new Error(`No terminal profile options provided for id "${id}"`);
        }
        if ('pty' in profile.options) {
            this.createExtensionTerminal(profile.options, options);
            return;
        }
        this.createTerminalFromOptions(profile.options, options);
    }
    async $provideLinks(terminalId, line) {
        const terminal = this._getTerminalById(terminalId);
        if (!terminal) {
            return [];
        }
        // Discard any cached links the terminal has been holding, currently all links are released
        // when new links are provided.
        this._terminalLinkCache.delete(terminalId);
        const oldToken = this._terminalLinkCancellationSource.get(terminalId);
        oldToken?.dispose(true);
        const cancellationSource = new CancellationTokenSource();
        this._terminalLinkCancellationSource.set(terminalId, cancellationSource);
        const result = [];
        const context = { terminal: terminal.value, line };
        const promises = [];
        for (const provider of this._linkProviders) {
            promises.push(Promises.withAsyncBody(async (r) => {
                cancellationSource.token.onCancellationRequested(() => r({ provider, links: [] }));
                const links = (await provider.provideTerminalLinks(context, cancellationSource.token)) || [];
                if (!cancellationSource.token.isCancellationRequested) {
                    r({ provider, links });
                }
            }));
        }
        const provideResults = await Promise.all(promises);
        if (cancellationSource.token.isCancellationRequested) {
            return [];
        }
        const cacheLinkMap = new Map();
        for (const provideResult of provideResults) {
            if (provideResult && provideResult.links.length > 0) {
                result.push(...provideResult.links.map(providerLink => {
                    const link = {
                        id: nextLinkId++,
                        startIndex: providerLink.startIndex,
                        length: providerLink.length,
                        label: providerLink.tooltip
                    };
                    cacheLinkMap.set(link.id, {
                        provider: provideResult.provider,
                        link: providerLink
                    });
                    return link;
                }));
            }
        }
        this._terminalLinkCache.set(terminalId, cacheLinkMap);
        return result;
    }
    $activateLink(terminalId, linkId) {
        const cachedLink = this._terminalLinkCache.get(terminalId)?.get(linkId);
        if (!cachedLink) {
            return;
        }
        cachedLink.provider.handleTerminalLink(cachedLink.link);
    }
    _onProcessExit(id, exitCode) {
        this._bufferer.stopBuffering(id);
        // Remove process reference
        this._terminalProcesses.delete(id);
        delete this._extensionTerminalAwaitingStart[id];
        // Clean up process disposables
        const processDiposable = this._terminalProcessDisposables[id];
        if (processDiposable) {
            processDiposable.dispose();
            delete this._terminalProcessDisposables[id];
        }
        // Send exit event to main side
        this._proxy.$sendProcessExit(id, exitCode);
    }
    _getTerminalById(id) {
        return this._getTerminalObjectById(this._terminals, id);
    }
    _getTerminalObjectById(array, id) {
        const index = this._getTerminalObjectIndexById(array, id);
        return index !== null ? array[index] : null;
    }
    _getTerminalObjectIndexById(array, id) {
        let index = null;
        array.some((item, i) => {
            const thisId = item._id;
            if (thisId === id) {
                index = i;
                return true;
            }
            return false;
        });
        return index;
    }
    getEnvironmentVariableCollection(extension) {
        let collection = this._environmentVariableCollections.get(extension.identifier.value);
        if (!collection) {
            collection = new EnvironmentVariableCollection();
            this._setEnvironmentVariableCollection(extension.identifier.value, collection);
        }
        return collection;
    }
    _syncEnvironmentVariableCollection(extensionIdentifier, collection) {
        const serialized = serializeEnvironmentVariableCollection(collection.map);
        this._proxy.$setEnvironmentVariableCollection(extensionIdentifier, collection.persistent, serialized.length === 0 ? undefined : serialized);
    }
    $initEnvironmentVariableCollections(collections) {
        collections.forEach(entry => {
            const extensionIdentifier = entry[0];
            const collection = new EnvironmentVariableCollection(entry[1]);
            this._setEnvironmentVariableCollection(extensionIdentifier, collection);
        });
    }
    $acceptDefaultProfile(profile, automationProfile) {
        const oldProfile = this._defaultProfile;
        this._defaultProfile = profile;
        this._defaultAutomationProfile = automationProfile;
        if (oldProfile?.path !== profile.path) {
            this._onDidChangeShell.fire(profile.path);
        }
    }
    _setEnvironmentVariableCollection(extensionIdentifier, collection) {
        this._environmentVariableCollections.set(extensionIdentifier, collection);
        collection.onDidChangeCollection(() => {
            // When any collection value changes send this immediately, this is done to ensure
            // following calls to createTerminal will be created with the new environment. It will
            // result in more noise by sending multiple updates when called but collections are
            // expected to be small.
            this._syncEnvironmentVariableCollection(extensionIdentifier, collection);
        });
    }
};
BaseExtHostTerminalService = __decorate([
    __param(1, IExtHostRpcService)
], BaseExtHostTerminalService);
export { BaseExtHostTerminalService };
export class EnvironmentVariableCollection {
    map = new Map();
    _persistent = true;
    get persistent() { return this._persistent; }
    set persistent(value) {
        this._persistent = value;
        this._onDidChangeCollection.fire();
    }
    _onDidChangeCollection = new Emitter();
    get onDidChangeCollection() { return this._onDidChangeCollection && this._onDidChangeCollection.event; }
    constructor(serialized) {
        this.map = new Map(serialized);
    }
    get size() {
        return this.map.size;
    }
    replace(variable, value) {
        this._setIfDiffers(variable, { value, type: EnvironmentVariableMutatorType.Replace });
    }
    append(variable, value) {
        this._setIfDiffers(variable, { value, type: EnvironmentVariableMutatorType.Append });
    }
    prepend(variable, value) {
        this._setIfDiffers(variable, { value, type: EnvironmentVariableMutatorType.Prepend });
    }
    _setIfDiffers(variable, mutator) {
        const current = this.map.get(variable);
        if (!current || current.value !== mutator.value || current.type !== mutator.type) {
            this.map.set(variable, mutator);
            this._onDidChangeCollection.fire();
        }
    }
    get(variable) {
        return this.map.get(variable);
    }
    forEach(callback, thisArg) {
        this.map.forEach((value, key) => callback.call(thisArg, key, value, this));
    }
    [Symbol.iterator]() {
        return this.map.entries();
    }
    delete(variable) {
        this.map.delete(variable);
        this._onDidChangeCollection.fire();
    }
    clear() {
        this.map.clear();
        this._onDidChangeCollection.fire();
    }
}
let WorkerExtHostTerminalService = class WorkerExtHostTerminalService extends BaseExtHostTerminalService {
    constructor(extHostRpc) {
        super(false, extHostRpc);
    }
    createTerminal(name, shellPath, shellArgs) {
        throw new NotSupportedError();
    }
    createTerminalFromOptions(options, internalOptions) {
        throw new NotSupportedError();
    }
};
WorkerExtHostTerminalService = __decorate([
    __param(0, IExtHostRpcService)
], WorkerExtHostTerminalService);
export { WorkerExtHostTerminalService };
function asTerminalIcon(iconPath) {
    if (!iconPath || typeof iconPath === 'string') {
        return undefined;
    }
    if (!('id' in iconPath)) {
        return iconPath;
    }
    return {
        id: iconPath.id,
        color: iconPath.color
    };
}
function asTerminalColor(color) {
    return ThemeColor.isThemeColor(color) ? color : undefined;
}

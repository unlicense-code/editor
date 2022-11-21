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
import * as errors from 'vs/base/common/errors';
import { Emitter } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ExtHostCustomersRegistry } from 'vs/workbench/services/extensions/common/extHostCustomers';
import { RPCProtocol } from 'vs/workbench/services/extensions/common/rpcProtocol';
import { RemoteAuthorityResolverErrorCode } from 'vs/platform/remote/common/remoteAuthorityResolver';
import * as nls from 'vs/nls';
import { registerAction2, Action2 } from 'vs/platform/actions/common/actions';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { StopWatch } from 'vs/base/common/stopwatch';
import { VSBuffer } from 'vs/base/common/buffer';
import { extensionHostKindToString, ExtensionHostExtensions } from 'vs/workbench/services/extensions/common/extensions';
import { Categories } from 'vs/platform/action/common/actionCommonCategories';
import { Barrier } from 'vs/base/common/async';
import { ILogService } from 'vs/platform/log/common/log';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
// Enable to see detailed message communication between window and extension host
const LOG_EXTENSION_HOST_COMMUNICATION = false;
const LOG_USE_COLORS = true;
export function createExtensionHostManager(instantiationService, extensionHostId, extensionHost, isInitialStart, initialActivationEvents, internalExtensionService) {
    if (extensionHost.lazyStart && isInitialStart && initialActivationEvents.length === 0) {
        return instantiationService.createInstance(LazyStartExtensionHostManager, extensionHostId, extensionHost, internalExtensionService);
    }
    return instantiationService.createInstance(ExtensionHostManager, extensionHostId, extensionHost, initialActivationEvents, internalExtensionService);
}
let ExtensionHostManager = class ExtensionHostManager extends Disposable {
    extensionHostId;
    _internalExtensionService;
    _instantiationService;
    _environmentService;
    _telemetryService;
    _logService;
    onDidExit;
    _onDidChangeResponsiveState = this._register(new Emitter());
    onDidChangeResponsiveState = this._onDidChangeResponsiveState.event;
    /**
     * A map of already requested activation events to speed things up if the same activation event is triggered multiple times.
     */
    _cachedActivationEvents;
    _resolvedActivationEvents;
    _rpcProtocol;
    _customers;
    _extensionHost;
    _proxy;
    _hasStarted = false;
    get kind() {
        return this._extensionHost.runningLocation.kind;
    }
    constructor(extensionHostId, extensionHost, initialActivationEvents, _internalExtensionService, _instantiationService, _environmentService, _telemetryService, _logService) {
        super();
        this.extensionHostId = extensionHostId;
        this._internalExtensionService = _internalExtensionService;
        this._instantiationService = _instantiationService;
        this._environmentService = _environmentService;
        this._telemetryService = _telemetryService;
        this._logService = _logService;
        this._cachedActivationEvents = new Map();
        this._resolvedActivationEvents = new Set();
        this._rpcProtocol = null;
        this._customers = [];
        this._extensionHost = extensionHost;
        this.onDidExit = this._extensionHost.onExit;
        const startingTelemetryEvent = {
            time: Date.now(),
            action: 'starting',
            kind: extensionHostKindToString(this.kind)
        };
        this._telemetryService.publicLog2('extensionHostStartup', startingTelemetryEvent);
        this._proxy = this._extensionHost.start().then((protocol) => {
            this._hasStarted = true;
            // Track healthy extension host startup
            const successTelemetryEvent = {
                time: Date.now(),
                action: 'success',
                kind: extensionHostKindToString(this.kind)
            };
            this._telemetryService.publicLog2('extensionHostStartup', successTelemetryEvent);
            return this._createExtensionHostCustomers(protocol);
        }, (err) => {
            this._logService.error(`Error received from starting extension host (kind: ${extensionHostKindToString(this.kind)})`);
            this._logService.error(err);
            // Track errors during extension host startup
            const failureTelemetryEvent = {
                time: Date.now(),
                action: 'error',
                kind: extensionHostKindToString(this.kind)
            };
            if (err && err.name) {
                failureTelemetryEvent.errorName = err.name;
            }
            if (err && err.message) {
                failureTelemetryEvent.errorMessage = err.message;
            }
            if (err && err.stack) {
                failureTelemetryEvent.errorStack = err.stack;
            }
            this._telemetryService.publicLog2('extensionHostStartup', failureTelemetryEvent);
            return null;
        });
        this._proxy.then(() => {
            initialActivationEvents.forEach((activationEvent) => this.activateByEvent(activationEvent, 0 /* ActivationKind.Normal */));
            this._register(registerLatencyTestProvider({
                measure: () => this.measure()
            }));
        });
    }
    dispose() {
        if (this._extensionHost) {
            this._extensionHost.dispose();
        }
        if (this._rpcProtocol) {
            this._rpcProtocol.dispose();
        }
        for (let i = 0, len = this._customers.length; i < len; i++) {
            const customer = this._customers[i];
            try {
                customer.dispose();
            }
            catch (err) {
                errors.onUnexpectedError(err);
            }
        }
        this._proxy = null;
        super.dispose();
    }
    async measure() {
        const proxy = await this._proxy;
        if (!proxy) {
            return null;
        }
        const latency = await this._measureLatency(proxy);
        const down = await this._measureDown(proxy);
        const up = await this._measureUp(proxy);
        return {
            remoteAuthority: this._extensionHost.remoteAuthority,
            latency,
            down,
            up
        };
    }
    async ready() {
        await this._proxy;
    }
    async _measureLatency(proxy) {
        const COUNT = 10;
        let sum = 0;
        for (let i = 0; i < COUNT; i++) {
            const sw = StopWatch.create(true);
            await proxy.test_latency(i);
            sw.stop();
            sum += sw.elapsed();
        }
        return (sum / COUNT);
    }
    static _convert(byteCount, elapsedMillis) {
        return (byteCount * 1000 * 8) / elapsedMillis;
    }
    async _measureUp(proxy) {
        const SIZE = 10 * 1024 * 1024; // 10MB
        const buff = VSBuffer.alloc(SIZE);
        const value = Math.ceil(Math.random() * 256);
        for (let i = 0; i < buff.byteLength; i++) {
            buff.writeUInt8(i, value);
        }
        const sw = StopWatch.create(true);
        await proxy.test_up(buff);
        sw.stop();
        return ExtensionHostManager._convert(SIZE, sw.elapsed());
    }
    async _measureDown(proxy) {
        const SIZE = 10 * 1024 * 1024; // 10MB
        const sw = StopWatch.create(true);
        await proxy.test_down(SIZE);
        sw.stop();
        return ExtensionHostManager._convert(SIZE, sw.elapsed());
    }
    _createExtensionHostCustomers(protocol) {
        let logger = null;
        if (LOG_EXTENSION_HOST_COMMUNICATION || this._environmentService.logExtensionHostCommunication) {
            logger = new RPCLogger();
        }
        this._rpcProtocol = new RPCProtocol(protocol, logger);
        this._register(this._rpcProtocol.onDidChangeResponsiveState((responsiveState) => this._onDidChangeResponsiveState.fire(responsiveState)));
        let extensionHostProxy = null;
        let mainProxyIdentifiers = [];
        const extHostContext = {
            remoteAuthority: this._extensionHost.remoteAuthority,
            extensionHostKind: this.kind,
            getProxy: (identifier) => this._rpcProtocol.getProxy(identifier),
            set: (identifier, instance) => this._rpcProtocol.set(identifier, instance),
            dispose: () => this._rpcProtocol.dispose(),
            assertRegistered: (identifiers) => this._rpcProtocol.assertRegistered(identifiers),
            drain: () => this._rpcProtocol.drain(),
            //#region internal
            internalExtensionService: this._internalExtensionService,
            _setExtensionHostProxy: (value) => {
                extensionHostProxy = value;
            },
            _setAllMainProxyIdentifiers: (value) => {
                mainProxyIdentifiers = value;
            },
            //#endregion
        };
        // Named customers
        const namedCustomers = ExtHostCustomersRegistry.getNamedCustomers();
        for (let i = 0, len = namedCustomers.length; i < len; i++) {
            const [id, ctor] = namedCustomers[i];
            try {
                const instance = this._instantiationService.createInstance(ctor, extHostContext);
                this._customers.push(instance);
                this._rpcProtocol.set(id, instance);
            }
            catch (err) {
                this._logService.error(`Cannot instantiate named customer: '${id.sid}'`);
                this._logService.error(err);
                errors.onUnexpectedError(err);
            }
        }
        // Customers
        const customers = ExtHostCustomersRegistry.getCustomers();
        for (const ctor of customers) {
            try {
                const instance = this._instantiationService.createInstance(ctor, extHostContext);
                this._customers.push(instance);
            }
            catch (err) {
                this._logService.error(err);
                errors.onUnexpectedError(err);
            }
        }
        if (!extensionHostProxy) {
            throw new Error(`Missing IExtensionHostProxy!`);
        }
        // Check that no named customers are missing
        this._rpcProtocol.assertRegistered(mainProxyIdentifiers);
        return extensionHostProxy;
    }
    async activate(extension, reason) {
        const proxy = await this._proxy;
        if (!proxy) {
            return false;
        }
        return proxy.activate(extension, reason);
    }
    activateByEvent(activationEvent, activationKind) {
        if (activationKind === 1 /* ActivationKind.Immediate */ && !this._hasStarted) {
            return Promise.resolve();
        }
        if (!this._cachedActivationEvents.has(activationEvent)) {
            this._cachedActivationEvents.set(activationEvent, this._activateByEvent(activationEvent, activationKind));
        }
        return this._cachedActivationEvents.get(activationEvent);
    }
    activationEventIsDone(activationEvent) {
        return this._resolvedActivationEvents.has(activationEvent);
    }
    async _activateByEvent(activationEvent, activationKind) {
        if (!this._proxy) {
            return;
        }
        const proxy = await this._proxy;
        if (!proxy) {
            // this case is already covered above and logged.
            // i.e. the extension host could not be started
            return;
        }
        await proxy.activateByEvent(activationEvent, activationKind);
        this._resolvedActivationEvents.add(activationEvent);
    }
    async getInspectPort(tryEnableInspector) {
        if (this._extensionHost) {
            if (tryEnableInspector) {
                await this._extensionHost.enableInspectPort();
            }
            const port = this._extensionHost.getInspectPort();
            if (port) {
                return port;
            }
        }
        return 0;
    }
    async resolveAuthority(remoteAuthority, resolveAttempt) {
        const proxy = await this._proxy;
        if (!proxy) {
            return {
                type: 'error',
                error: {
                    message: `Cannot resolve authority`,
                    code: RemoteAuthorityResolverErrorCode.Unknown,
                    detail: undefined
                }
            };
        }
        try {
            return proxy.resolveAuthority(remoteAuthority, resolveAttempt);
        }
        catch (err) {
            return {
                type: 'error',
                error: {
                    message: err.message,
                    code: RemoteAuthorityResolverErrorCode.Unknown,
                    detail: err
                }
            };
        }
    }
    async getCanonicalURI(remoteAuthority, uri) {
        const proxy = await this._proxy;
        if (!proxy) {
            throw new Error(`Cannot resolve canonical URI`);
        }
        return proxy.getCanonicalURI(remoteAuthority, uri);
    }
    async start(allExtensions, myExtensions) {
        const proxy = await this._proxy;
        if (!proxy) {
            return;
        }
        const deltaExtensions = this._extensionHost.extensions.set(allExtensions, myExtensions);
        return proxy.startExtensionHost(deltaExtensions);
    }
    async extensionTestsExecute() {
        const proxy = await this._proxy;
        if (!proxy) {
            throw new Error('Could not obtain Extension Host Proxy');
        }
        return proxy.extensionTestsExecute();
    }
    representsRunningLocation(runningLocation) {
        return this._extensionHost.runningLocation.equals(runningLocation);
    }
    async deltaExtensions(extensionsDelta) {
        const proxy = await this._proxy;
        if (!proxy) {
            return;
        }
        this._extensionHost.extensions.delta(extensionsDelta);
        return proxy.deltaExtensions(extensionsDelta);
    }
    containsExtension(extensionId) {
        return this._extensionHost.extensions.containsExtension(extensionId);
    }
    async setRemoteEnvironment(env) {
        const proxy = await this._proxy;
        if (!proxy) {
            return;
        }
        return proxy.setRemoteEnvironment(env);
    }
};
ExtensionHostManager = __decorate([
    __param(4, IInstantiationService),
    __param(5, IWorkbenchEnvironmentService),
    __param(6, ITelemetryService),
    __param(7, ILogService)
], ExtensionHostManager);
/**
 * Waits until `start()` and only if it has extensions proceeds to really start.
 */
let LazyStartExtensionHostManager = class LazyStartExtensionHostManager extends Disposable {
    extensionHostId;
    _internalExtensionService;
    _instantiationService;
    _logService;
    onDidExit;
    _onDidChangeResponsiveState = this._register(new Emitter());
    onDidChangeResponsiveState = this._onDidChangeResponsiveState.event;
    _extensionHost;
    _startCalled;
    _actual;
    _lazyStartExtensions;
    get kind() {
        return this._extensionHost.runningLocation.kind;
    }
    constructor(extensionHostId, extensionHost, _internalExtensionService, _instantiationService, _logService) {
        super();
        this.extensionHostId = extensionHostId;
        this._internalExtensionService = _internalExtensionService;
        this._instantiationService = _instantiationService;
        this._logService = _logService;
        this._extensionHost = extensionHost;
        this.onDidExit = extensionHost.onExit;
        this._startCalled = new Barrier();
        this._actual = null;
        this._lazyStartExtensions = null;
    }
    _createActual(reason) {
        this._logService.info(`Creating lazy extension host: ${reason}`);
        this._actual = this._register(this._instantiationService.createInstance(ExtensionHostManager, this.extensionHostId, this._extensionHost, [], this._internalExtensionService));
        this._register(this._actual.onDidChangeResponsiveState((e) => this._onDidChangeResponsiveState.fire(e)));
        return this._actual;
    }
    async _getOrCreateActualAndStart(reason) {
        if (this._actual) {
            // already created/started
            return this._actual;
        }
        const actual = this._createActual(reason);
        await actual.start([], []);
        return actual;
    }
    async ready() {
        await this._startCalled.wait();
        if (this._actual) {
            await this._actual.ready();
        }
    }
    representsRunningLocation(runningLocation) {
        return this._extensionHost.runningLocation.equals(runningLocation);
    }
    async deltaExtensions(extensionsDelta) {
        await this._startCalled.wait();
        if (this._actual) {
            return this._actual.deltaExtensions(extensionsDelta);
        }
        this._lazyStartExtensions.delta(extensionsDelta);
        if (extensionsDelta.myToAdd.length > 0) {
            const actual = this._createActual(`contains ${extensionsDelta.myToAdd.length} new extension(s) (installed or enabled): ${extensionsDelta.myToAdd.map(extId => extId.value)}`);
            const { toAdd, myToAdd } = this._lazyStartExtensions.toDelta();
            actual.start(toAdd, myToAdd);
            return;
        }
    }
    containsExtension(extensionId) {
        return this._extensionHost.extensions.containsExtension(extensionId);
    }
    async activate(extension, reason) {
        await this._startCalled.wait();
        if (this._actual) {
            return this._actual.activate(extension, reason);
        }
        return false;
    }
    async activateByEvent(activationEvent, activationKind) {
        if (activationKind === 1 /* ActivationKind.Immediate */) {
            // this is an immediate request, so we cannot wait for start to be called
            if (this._actual) {
                return this._actual.activateByEvent(activationEvent, activationKind);
            }
            return;
        }
        await this._startCalled.wait();
        if (this._actual) {
            return this._actual.activateByEvent(activationEvent, activationKind);
        }
    }
    activationEventIsDone(activationEvent) {
        if (!this._startCalled.isOpen()) {
            return false;
        }
        if (this._actual) {
            return this._actual.activationEventIsDone(activationEvent);
        }
        return true;
    }
    async getInspectPort(tryEnableInspector) {
        await this._startCalled.wait();
        if (this._actual) {
            return this._actual.getInspectPort(tryEnableInspector);
        }
        return 0;
    }
    async resolveAuthority(remoteAuthority, resolveAttempt) {
        await this._startCalled.wait();
        if (this._actual) {
            return this._actual.resolveAuthority(remoteAuthority, resolveAttempt);
        }
        return {
            type: 'error',
            error: {
                message: `Cannot resolve authority`,
                code: RemoteAuthorityResolverErrorCode.Unknown,
                detail: undefined
            }
        };
    }
    async getCanonicalURI(remoteAuthority, uri) {
        await this._startCalled.wait();
        if (this._actual) {
            return this._actual.getCanonicalURI(remoteAuthority, uri);
        }
        throw new Error(`Cannot resolve canonical URI`);
    }
    async start(allExtensions, myExtensions) {
        if (myExtensions.length > 0) {
            // there are actual extensions, so let's launch the extension host
            const actual = this._createActual(`contains ${myExtensions.length} extension(s): ${myExtensions.map(extId => extId.value)}.`);
            const result = actual.start(allExtensions, myExtensions);
            this._startCalled.open();
            return result;
        }
        // there are no actual extensions running, store extensions in `this._lazyStartExtensions`
        this._lazyStartExtensions = new ExtensionHostExtensions();
        this._lazyStartExtensions.set(allExtensions, myExtensions);
        this._startCalled.open();
    }
    async extensionTestsExecute() {
        await this._startCalled.wait();
        const actual = await this._getOrCreateActualAndStart(`execute tests.`);
        return actual.extensionTestsExecute();
    }
    async setRemoteEnvironment(env) {
        await this._startCalled.wait();
        if (this._actual) {
            return this._actual.setRemoteEnvironment(env);
        }
    }
};
LazyStartExtensionHostManager = __decorate([
    __param(3, IInstantiationService),
    __param(4, ILogService)
], LazyStartExtensionHostManager);
const colorTables = [
    ['#2977B1', '#FC802D', '#34A13A', '#D3282F', '#9366BA'],
    ['#8B564C', '#E177C0', '#7F7F7F', '#BBBE3D', '#2EBECD']
];
function prettyWithoutArrays(data) {
    if (Array.isArray(data)) {
        return data;
    }
    if (data && typeof data === 'object' && typeof data.toString === 'function') {
        const result = data.toString();
        if (result !== '[object Object]') {
            return result;
        }
    }
    return data;
}
function pretty(data) {
    if (Array.isArray(data)) {
        return data.map(prettyWithoutArrays);
    }
    return prettyWithoutArrays(data);
}
class RPCLogger {
    _totalIncoming = 0;
    _totalOutgoing = 0;
    _log(direction, totalLength, msgLength, req, initiator, str, data) {
        data = pretty(data);
        const colorTable = colorTables[initiator];
        const color = LOG_USE_COLORS ? colorTable[req % colorTable.length] : '#000000';
        let args = [`%c[${direction}]%c[${String(totalLength).padStart(7)}]%c[len: ${String(msgLength).padStart(5)}]%c${String(req).padStart(5)} - ${str}`, 'color: darkgreen', 'color: grey', 'color: grey', `color: ${color}`];
        if (/\($/.test(str)) {
            args = args.concat(data);
            args.push(')');
        }
        else {
            args.push(data);
        }
        console.log.apply(console, args);
    }
    logIncoming(msgLength, req, initiator, str, data) {
        this._totalIncoming += msgLength;
        this._log('Ext \u2192 Win', this._totalIncoming, msgLength, req, initiator, str, data);
    }
    logOutgoing(msgLength, req, initiator, str, data) {
        this._totalOutgoing += msgLength;
        this._log('Win \u2192 Ext', this._totalOutgoing, msgLength, req, initiator, str, data);
    }
}
const providers = [];
function registerLatencyTestProvider(provider) {
    providers.push(provider);
    return {
        dispose: () => {
            for (let i = 0; i < providers.length; i++) {
                if (providers[i] === provider) {
                    providers.splice(i, 1);
                    return;
                }
            }
        }
    };
}
function getLatencyTestProviders() {
    return providers.slice(0);
}
registerAction2(class MeasureExtHostLatencyAction extends Action2 {
    constructor() {
        super({
            id: 'editor.action.measureExtHostLatency',
            title: {
                value: nls.localize('measureExtHostLatency', "Measure Extension Host Latency"),
                original: 'Measure Extension Host Latency'
            },
            category: Categories.Developer,
            f1: true
        });
    }
    async run(accessor) {
        const editorService = accessor.get(IEditorService);
        const measurements = await Promise.all(getLatencyTestProviders().map(provider => provider.measure()));
        editorService.openEditor({ resource: undefined, contents: measurements.map(MeasureExtHostLatencyAction._print).join('\n\n'), options: { pinned: true } });
    }
    static _print(m) {
        if (!m) {
            return '';
        }
        return `${m.remoteAuthority ? `Authority: ${m.remoteAuthority}\n` : ``}Roundtrip latency: ${m.latency.toFixed(3)}ms\nUp: ${MeasureExtHostLatencyAction._printSpeed(m.up)}\nDown: ${MeasureExtHostLatencyAction._printSpeed(m.down)}\n`;
    }
    static _printSpeed(n) {
        if (n <= 1024) {
            return `${n} bps`;
        }
        if (n < 1024 * 1024) {
            return `${(n / 1024).toFixed(1)} kbps`;
        }
        return `${(n / 1024 / 1024).toFixed(1)} Mbps`;
    }
});

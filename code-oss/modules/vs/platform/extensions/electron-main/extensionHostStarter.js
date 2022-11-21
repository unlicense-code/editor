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
import { canceled, transformErrorForSerialization } from 'vs/base/common/errors';
import { Disposable } from 'vs/base/common/lifecycle';
import { Emitter, Event } from 'vs/base/common/event';
import { ILogService } from 'vs/platform/log/common/log';
import { ILifecycleMainService } from 'vs/platform/lifecycle/electron-main/lifecycleMainService';
import { StopWatch } from 'vs/base/common/stopwatch';
import { fork } from 'child_process';
import { StringDecoder } from 'string_decoder';
import { Promises, timeout } from 'vs/base/common/async';
import { FileAccess } from 'vs/base/common/network';
import { mixin } from 'vs/base/common/objects';
import * as platform from 'vs/base/common/platform';
import { cwd } from 'vs/base/common/process';
import * as electron from 'electron';
import { IWindowsMainService } from 'vs/platform/windows/electron-main/windows';
const UtilityProcess = (electron.utilityProcess);
const canUseUtilityProcess = (typeof UtilityProcess !== 'undefined');
let ExtensionHostStarter = class ExtensionHostStarter {
    _logService;
    _windowsMainService;
    _serviceBrand;
    static _lastId = 0;
    _extHosts;
    _shutdown = false;
    constructor(_logService, lifecycleMainService, _windowsMainService) {
        this._logService = _logService;
        this._windowsMainService = _windowsMainService;
        this._extHosts = new Map();
        // On shutdown: gracefully await extension host shutdowns
        lifecycleMainService.onWillShutdown((e) => {
            this._shutdown = true;
            e.join(this._waitForAllExit(6000));
        });
    }
    dispose() {
        // Intentionally not killing the extension host processes
    }
    _getExtHost(id) {
        const extHostProcess = this._extHosts.get(id);
        if (!extHostProcess) {
            throw new Error(`Unknown extension host!`);
        }
        return extHostProcess;
    }
    onDynamicStdout(id) {
        return this._getExtHost(id).onStdout;
    }
    onDynamicStderr(id) {
        return this._getExtHost(id).onStderr;
    }
    onDynamicMessage(id) {
        return this._getExtHost(id).onMessage;
    }
    onDynamicError(id) {
        return this._getExtHost(id).onError;
    }
    onDynamicExit(id) {
        return this._getExtHost(id).onExit;
    }
    async canUseUtilityProcess() {
        return canUseUtilityProcess;
    }
    async createExtensionHost(useUtilityProcess) {
        if (this._shutdown) {
            throw canceled();
        }
        const id = String(++ExtensionHostStarter._lastId);
        let extHost;
        if (useUtilityProcess) {
            if (!canUseUtilityProcess) {
                throw new Error(`Cannot use UtilityProcess!`);
            }
            extHost = new UtilityExtensionHostProcess(id, this._logService, this._windowsMainService);
        }
        else {
            extHost = new ExtensionHostProcess(id, this._logService);
        }
        this._extHosts.set(id, extHost);
        extHost.onExit(({ pid, code, signal }) => {
            this._logService.info(`Extension host with pid ${pid} exited with code: ${code}, signal: ${signal}.`);
            setTimeout(() => {
                extHost.dispose();
                this._extHosts.delete(id);
            });
        });
        return { id };
    }
    async start(id, opts) {
        if (this._shutdown) {
            throw canceled();
        }
        return this._getExtHost(id).start(opts);
    }
    async enableInspectPort(id) {
        if (this._shutdown) {
            throw canceled();
        }
        const extHostProcess = this._extHosts.get(id);
        if (!extHostProcess) {
            return false;
        }
        return extHostProcess.enableInspectPort();
    }
    async kill(id) {
        if (this._shutdown) {
            throw canceled();
        }
        const extHostProcess = this._extHosts.get(id);
        if (!extHostProcess) {
            // already gone!
            return;
        }
        extHostProcess.kill();
    }
    async _killAllNow() {
        for (const [, extHost] of this._extHosts) {
            extHost.kill();
        }
    }
    async _waitForAllExit(maxWaitTimeMs) {
        const exitPromises = [];
        for (const [, extHost] of this._extHosts) {
            exitPromises.push(extHost.waitForExit(maxWaitTimeMs));
        }
        return Promises.settled(exitPromises).then(() => { });
    }
};
ExtensionHostStarter = __decorate([
    __param(0, ILogService),
    __param(1, ILifecycleMainService),
    __param(2, IWindowsMainService)
], ExtensionHostStarter);
export { ExtensionHostStarter };
let ExtensionHostProcess = class ExtensionHostProcess extends Disposable {
    id;
    _logService;
    _onStdout = this._register(new Emitter());
    onStdout = this._onStdout.event;
    _onStderr = this._register(new Emitter());
    onStderr = this._onStderr.event;
    _onMessage = this._register(new Emitter());
    onMessage = this._onMessage.event;
    _onError = this._register(new Emitter());
    onError = this._onError.event;
    _onExit = this._register(new Emitter());
    onExit = this._onExit.event;
    _process = null;
    _hasExited = false;
    constructor(id, _logService) {
        super();
        this.id = id;
        this._logService = _logService;
    }
    start(opts) {
        if (platform.isCI) {
            this._logService.info(`Calling fork to start extension host...`);
        }
        const sw = StopWatch.create(false);
        this._process = fork(FileAccess.asFileUri('bootstrap-fork').fsPath, ['--type=extensionHost', '--skipWorkspaceStorageLock'], mixin({ cwd: cwd() }, opts));
        const forkTime = sw.elapsed();
        const pid = this._process.pid;
        this._logService.info(`Starting extension host with pid ${pid} (fork() took ${forkTime} ms).`);
        const stdoutDecoder = new StringDecoder('utf-8');
        this._process.stdout?.on('data', (chunk) => {
            const strChunk = typeof chunk === 'string' ? chunk : stdoutDecoder.write(chunk);
            this._onStdout.fire(strChunk);
        });
        const stderrDecoder = new StringDecoder('utf-8');
        this._process.stderr?.on('data', (chunk) => {
            const strChunk = typeof chunk === 'string' ? chunk : stderrDecoder.write(chunk);
            this._onStderr.fire(strChunk);
        });
        this._process.on('message', msg => {
            this._onMessage.fire(msg);
        });
        this._process.on('error', (err) => {
            this._onError.fire({ error: transformErrorForSerialization(err) });
        });
        this._process.on('exit', (code, signal) => {
            this._hasExited = true;
            this._onExit.fire({ pid, code, signal });
        });
    }
    enableInspectPort() {
        if (!this._process) {
            return false;
        }
        this._logService.info(`Enabling inspect port on extension host with pid ${this._process.pid}.`);
        if (typeof process._debugProcess === 'function') {
            // use (undocumented) _debugProcess feature of node
            process._debugProcess(this._process.pid);
            return true;
        }
        else if (!platform.isWindows) {
            // use KILL USR1 on non-windows platforms (fallback)
            this._process.kill('SIGUSR1');
            return true;
        }
        else {
            // not supported...
            return false;
        }
    }
    kill() {
        if (!this._process) {
            return;
        }
        this._logService.info(`Killing extension host with pid ${this._process.pid}.`);
        this._process.kill();
    }
    async waitForExit(maxWaitTimeMs) {
        if (!this._process) {
            return;
        }
        const pid = this._process.pid;
        this._logService.info(`Waiting for extension host with pid ${pid} to exit.`);
        await Promise.race([Event.toPromise(this.onExit), timeout(maxWaitTimeMs)]);
        if (!this._hasExited) {
            // looks like we timed out
            this._logService.info(`Extension host with pid ${pid} did not exit within ${maxWaitTimeMs}ms.`);
            this._process.kill();
        }
    }
};
ExtensionHostProcess = __decorate([
    __param(1, ILogService)
], ExtensionHostProcess);
let UtilityExtensionHostProcess = class UtilityExtensionHostProcess extends Disposable {
    id;
    _logService;
    _windowsMainService;
    onError = Event.None;
    _onStdout = this._register(new Emitter());
    onStdout = this._onStdout.event;
    _onStderr = this._register(new Emitter());
    onStderr = this._onStderr.event;
    _onMessage = this._register(new Emitter());
    onMessage = this._onMessage.event;
    _onExit = this._register(new Emitter());
    onExit = this._onExit.event;
    _process = null;
    _hasExited = false;
    constructor(id, _logService, _windowsMainService) {
        super();
        this.id = id;
        this._logService = _logService;
        this._windowsMainService = _windowsMainService;
    }
    start(opts) {
        const codeWindow = this._windowsMainService.getWindowById(opts.responseWindowId);
        if (!codeWindow) {
            this._logService.info(`UtilityProcess<${this.id}>: Refusing to create new Extension Host UtilityProcess because requesting window cannot be found...`);
            return;
        }
        const responseWindow = codeWindow.win;
        if (!responseWindow || responseWindow.isDestroyed() || responseWindow.webContents.isDestroyed()) {
            this._logService.info(`UtilityProcess<${this.id}>: Refusing to create new Extension Host UtilityProcess because requesting window cannot be found...`);
            return;
        }
        const serviceName = `extensionHost${this.id}`;
        const modulePath = FileAccess.asFileUri('bootstrap-fork.js').fsPath;
        const args = ['--type=extensionHost', '--skipWorkspaceStorageLock'];
        const execArgv = opts.execArgv || [];
        const env = { ...opts.env };
        const allowLoadingUnsignedLibraries = true;
        const stdio = 'pipe';
        // Make sure all values are strings, otherwise the process will not start
        for (const key of Object.keys(env)) {
            env[key] = String(env[key]);
        }
        this._logService.info(`UtilityProcess<${this.id}>: Creating new...`);
        this._process = UtilityProcess.fork(modulePath, args, {
            serviceName,
            env,
            execArgv,
            allowLoadingUnsignedLibraries,
            stdio
        });
        const stdoutDecoder = new StringDecoder('utf-8');
        this._process.stdout?.on('data', (chunk) => {
            const strChunk = typeof chunk === 'string' ? chunk : stdoutDecoder.write(chunk);
            this._onStdout.fire(strChunk);
        });
        const stderrDecoder = new StringDecoder('utf-8');
        this._process.stderr?.on('data', (chunk) => {
            const strChunk = typeof chunk === 'string' ? chunk : stderrDecoder.write(chunk);
            this._onStderr.fire(strChunk);
        });
        this._process.on('message', msg => {
            this._onMessage.fire(msg);
        });
        this._register(Event.fromNodeEventEmitter(this._process, 'spawn')(() => {
            this._logService.info(`UtilityProcess<${this.id}>: received spawn event.`);
        }));
        const onExit = Event.fromNodeEventEmitter(this._process, 'exit', (code) => code);
        this._register(onExit((code) => {
            this._logService.info(`UtilityProcess<${this.id}>: received exit event with code ${code}.`);
            this._hasExited = true;
            this._onExit.fire({ pid: this._process.pid, code, signal: '' });
        }));
        const { port1, port2 } = new electron.MessageChannelMain();
        this._process.postMessage('null', [port2]);
        responseWindow.webContents.postMessage(opts.responseChannel, opts.responseNonce, [port1]);
    }
    enableInspectPort() {
        if (!this._process) {
            return false;
        }
        this._logService.info(`UtilityProcess<${this.id}>: Enabling inspect port on extension host with pid ${this._process.pid}.`);
        if (typeof process._debugProcess === 'function') {
            // use (undocumented) _debugProcess feature of node
            process._debugProcess(this._process.pid);
            return true;
        }
        else {
            // not supported...
            return false;
        }
    }
    kill() {
        if (!this._process) {
            return;
        }
        this._logService.info(`UtilityProcess<${this.id}>: Killing extension host with pid ${this._process.pid}.`);
        this._process.kill();
    }
    async waitForExit(maxWaitTimeMs) {
        if (!this._process) {
            return;
        }
        const pid = this._process.pid;
        this._logService.info(`UtilityProcess<${this.id}>: Waiting for extension host with pid ${pid} to exit.`);
        await Promise.race([Event.toPromise(this.onExit), timeout(maxWaitTimeMs)]);
        if (!this._hasExited) {
            // looks like we timed out
            this._logService.info(`UtilityProcess<${this.id}>: Extension host with pid ${pid} did not exit within ${maxWaitTimeMs}ms, will kill it now.`);
            this._process.kill();
        }
    }
};
UtilityExtensionHostProcess = __decorate([
    __param(1, ILogService),
    __param(2, IWindowsMainService)
], UtilityExtensionHostProcess);

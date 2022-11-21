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
import * as cp from 'child_process';
import * as net from 'net';
import { getNLSConfiguration } from 'vs/server/node/remoteLanguagePacks';
import { FileAccess } from 'vs/base/common/network';
import { join, delimiter } from 'vs/base/common/path';
import { VSBuffer } from 'vs/base/common/buffer';
import { Emitter, Event } from 'vs/base/common/event';
import { createRandomIPCHandle, NodeSocket } from 'vs/base/parts/ipc/node/ipc.net';
import { getResolvedShellEnv } from 'vs/platform/shell/node/shellEnv';
import { ILogService } from 'vs/platform/log/common/log';
import { IServerEnvironmentService } from 'vs/server/node/serverEnvironmentService';
import { isWindows } from 'vs/base/common/platform';
import { removeDangerousEnvVariables } from 'vs/base/common/processes';
import { IExtensionHostStatusService } from 'vs/server/node/extensionHostStatusService';
import { DisposableStore, toDisposable } from 'vs/base/common/lifecycle';
import { IPCExtHostConnection, writeExtHostConnection, SocketExtHostConnection } from 'vs/workbench/services/extensions/common/extensionHostEnv';
export async function buildUserEnvironment(startParamsEnv = {}, withUserShellEnvironment, language, environmentService, logService) {
    const nlsConfig = await getNLSConfiguration(language, environmentService.userDataPath);
    let userShellEnv = {};
    if (withUserShellEnvironment) {
        try {
            userShellEnv = await getResolvedShellEnv(logService, environmentService.args, process.env);
        }
        catch (error) {
            logService.error('ExtensionHostConnection#buildUserEnvironment resolving shell environment failed', error);
        }
    }
    const processEnv = process.env;
    const env = {
        ...processEnv,
        ...userShellEnv,
        ...{
            VSCODE_AMD_ENTRYPOINT: 'vs/workbench/api/node/extensionHostProcess',
            VSCODE_HANDLES_UNCAUGHT_ERRORS: 'true',
            VSCODE_NLS_CONFIG: JSON.stringify(nlsConfig, undefined, 0)
        },
        ...startParamsEnv
    };
    const binFolder = environmentService.isBuilt ? join(environmentService.appRoot, 'bin') : join(environmentService.appRoot, 'resources', 'server', 'bin-dev');
    const remoteCliBinFolder = join(binFolder, 'remote-cli'); // contains the `code` command that can talk to the remote server
    let PATH = readCaseInsensitive(env, 'PATH');
    if (PATH) {
        PATH = remoteCliBinFolder + delimiter + PATH;
    }
    else {
        PATH = remoteCliBinFolder;
    }
    setCaseInsensitive(env, 'PATH', PATH);
    if (!environmentService.args['without-browser-env-var']) {
        env.BROWSER = join(binFolder, 'helpers', isWindows ? 'browser.cmd' : 'browser.sh'); // a command that opens a browser on the local machine
    }
    removeNulls(env);
    return env;
}
class ConnectionData {
    socket;
    initialDataChunk;
    constructor(socket, initialDataChunk) {
        this.socket = socket;
        this.initialDataChunk = initialDataChunk;
    }
    socketDrain() {
        return this.socket.drain();
    }
    toIExtHostSocketMessage() {
        let skipWebSocketFrames;
        let permessageDeflate;
        let inflateBytes;
        if (this.socket instanceof NodeSocket) {
            skipWebSocketFrames = true;
            permessageDeflate = false;
            inflateBytes = VSBuffer.alloc(0);
        }
        else {
            skipWebSocketFrames = false;
            permessageDeflate = this.socket.permessageDeflate;
            inflateBytes = this.socket.recordedInflateBytes;
        }
        return {
            type: 'VSCODE_EXTHOST_IPC_SOCKET',
            initialDataChunk: this.initialDataChunk.buffer.toString('base64'),
            skipWebSocketFrames: skipWebSocketFrames,
            permessageDeflate: permessageDeflate,
            inflateBytes: inflateBytes.buffer.toString('base64'),
        };
    }
}
let ExtensionHostConnection = class ExtensionHostConnection {
    _reconnectionToken;
    _environmentService;
    _logService;
    _extensionHostStatusService;
    _onClose = new Emitter();
    onClose = this._onClose.event;
    _canSendSocket;
    _disposed;
    _remoteAddress;
    _extensionHostProcess;
    _connectionData;
    constructor(_reconnectionToken, remoteAddress, socket, initialDataChunk, _environmentService, _logService, _extensionHostStatusService) {
        this._reconnectionToken = _reconnectionToken;
        this._environmentService = _environmentService;
        this._logService = _logService;
        this._extensionHostStatusService = _extensionHostStatusService;
        this._canSendSocket = (!isWindows || !this._environmentService.args['socket-path']);
        this._disposed = false;
        this._remoteAddress = remoteAddress;
        this._extensionHostProcess = null;
        this._connectionData = new ConnectionData(socket, initialDataChunk);
        this._log(`New connection established.`);
    }
    get _logPrefix() {
        return `[${this._remoteAddress}][${this._reconnectionToken.substr(0, 8)}][ExtensionHostConnection] `;
    }
    _log(_str) {
        this._logService.info(`${this._logPrefix}${_str}`);
    }
    _logError(_str) {
        this._logService.error(`${this._logPrefix}${_str}`);
    }
    async _pipeSockets(extHostSocket, connectionData) {
        const disposables = new DisposableStore();
        disposables.add(connectionData.socket);
        disposables.add(toDisposable(() => {
            extHostSocket.destroy();
        }));
        const stopAndCleanup = () => {
            disposables.dispose();
        };
        disposables.add(connectionData.socket.onEnd(stopAndCleanup));
        disposables.add(connectionData.socket.onClose(stopAndCleanup));
        disposables.add(Event.fromNodeEventEmitter(extHostSocket, 'end')(stopAndCleanup));
        disposables.add(Event.fromNodeEventEmitter(extHostSocket, 'close')(stopAndCleanup));
        disposables.add(Event.fromNodeEventEmitter(extHostSocket, 'error')(stopAndCleanup));
        disposables.add(connectionData.socket.onData((e) => extHostSocket.write(e.buffer)));
        disposables.add(Event.fromNodeEventEmitter(extHostSocket, 'data')((e) => {
            connectionData.socket.write(VSBuffer.wrap(e));
        }));
        if (connectionData.initialDataChunk.byteLength > 0) {
            extHostSocket.write(connectionData.initialDataChunk.buffer);
        }
    }
    async _sendSocketToExtensionHost(extensionHostProcess, connectionData) {
        // Make sure all outstanding writes have been drained before sending the socket
        await connectionData.socketDrain();
        const msg = connectionData.toIExtHostSocketMessage();
        let socket;
        if (connectionData.socket instanceof NodeSocket) {
            socket = connectionData.socket.socket;
        }
        else {
            socket = connectionData.socket.socket.socket;
        }
        extensionHostProcess.send(msg, socket);
    }
    shortenReconnectionGraceTimeIfNecessary() {
        if (!this._extensionHostProcess) {
            return;
        }
        const msg = {
            type: 'VSCODE_EXTHOST_IPC_REDUCE_GRACE_TIME'
        };
        this._extensionHostProcess.send(msg);
    }
    acceptReconnection(remoteAddress, _socket, initialDataChunk) {
        this._remoteAddress = remoteAddress;
        this._log(`The client has reconnected.`);
        const connectionData = new ConnectionData(_socket, initialDataChunk);
        if (!this._extensionHostProcess) {
            // The extension host didn't even start up yet
            this._connectionData = connectionData;
            return;
        }
        this._sendSocketToExtensionHost(this._extensionHostProcess, connectionData);
    }
    _cleanResources() {
        if (this._disposed) {
            // already called
            return;
        }
        this._disposed = true;
        if (this._connectionData) {
            this._connectionData.socket.end();
            this._connectionData = null;
        }
        if (this._extensionHostProcess) {
            this._extensionHostProcess.kill();
            this._extensionHostProcess = null;
        }
        this._onClose.fire(undefined);
    }
    async start(startParams) {
        try {
            let execArgv = process.execArgv ? process.execArgv.filter(a => !/^--inspect(-brk)?=/.test(a)) : [];
            if (startParams.port && !process.pkg) {
                execArgv = [`--inspect${startParams.break ? '-brk' : ''}=${startParams.port}`];
            }
            const env = await buildUserEnvironment(startParams.env, true, startParams.language, this._environmentService, this._logService);
            removeDangerousEnvVariables(env);
            let extHostNamedPipeServer;
            if (this._canSendSocket) {
                writeExtHostConnection(new SocketExtHostConnection(), env);
                extHostNamedPipeServer = null;
            }
            else {
                const { namedPipeServer, pipeName } = await this._listenOnPipe();
                writeExtHostConnection(new IPCExtHostConnection(pipeName), env);
                extHostNamedPipeServer = namedPipeServer;
            }
            const opts = {
                env,
                execArgv,
                silent: true
            };
            // Run Extension Host as fork of current process
            const args = ['--type=extensionHost', `--transformURIs`];
            const useHostProxy = this._environmentService.args['use-host-proxy'];
            args.push(`--useHostProxy=${useHostProxy ? 'true' : 'false'}`);
            this._extensionHostProcess = cp.fork(FileAccess.asFileUri('bootstrap-fork').fsPath, args, opts);
            const pid = this._extensionHostProcess.pid;
            this._log(`<${pid}> Launched Extension Host Process.`);
            // Catch all output coming from the extension host process
            this._extensionHostProcess.stdout.setEncoding('utf8');
            this._extensionHostProcess.stderr.setEncoding('utf8');
            const onStdout = Event.fromNodeEventEmitter(this._extensionHostProcess.stdout, 'data');
            const onStderr = Event.fromNodeEventEmitter(this._extensionHostProcess.stderr, 'data');
            onStdout((e) => this._log(`<${pid}> ${e}`));
            onStderr((e) => this._log(`<${pid}><stderr> ${e}`));
            // Lifecycle
            this._extensionHostProcess.on('error', (err) => {
                this._logError(`<${pid}> Extension Host Process had an error`);
                this._logService.error(err);
                this._cleanResources();
            });
            this._extensionHostProcess.on('exit', (code, signal) => {
                this._extensionHostStatusService.setExitInfo(this._reconnectionToken, { code, signal });
                this._log(`<${pid}> Extension Host Process exited with code: ${code}, signal: ${signal}.`);
                this._cleanResources();
            });
            if (extHostNamedPipeServer) {
                extHostNamedPipeServer.on('connection', (socket) => {
                    extHostNamedPipeServer.close();
                    this._pipeSockets(socket, this._connectionData);
                });
            }
            else {
                const messageListener = (msg) => {
                    if (msg.type === 'VSCODE_EXTHOST_IPC_READY') {
                        this._extensionHostProcess.removeListener('message', messageListener);
                        this._sendSocketToExtensionHost(this._extensionHostProcess, this._connectionData);
                        this._connectionData = null;
                    }
                };
                this._extensionHostProcess.on('message', messageListener);
            }
        }
        catch (error) {
            console.error('ExtensionHostConnection errored');
            if (error) {
                console.error(error);
            }
        }
    }
    _listenOnPipe() {
        return new Promise((resolve, reject) => {
            const pipeName = createRandomIPCHandle();
            const namedPipeServer = net.createServer();
            namedPipeServer.on('error', reject);
            namedPipeServer.listen(pipeName, () => {
                namedPipeServer?.removeListener('error', reject);
                resolve({ pipeName, namedPipeServer });
            });
        });
    }
};
ExtensionHostConnection = __decorate([
    __param(4, IServerEnvironmentService),
    __param(5, ILogService),
    __param(6, IExtensionHostStatusService)
], ExtensionHostConnection);
export { ExtensionHostConnection };
function readCaseInsensitive(env, key) {
    const pathKeys = Object.keys(env).filter(k => k.toLowerCase() === key.toLowerCase());
    const pathKey = pathKeys.length > 0 ? pathKeys[0] : key;
    return env[pathKey];
}
function setCaseInsensitive(env, key, value) {
    const pathKeys = Object.keys(env).filter(k => k.toLowerCase() === key.toLowerCase());
    const pathKey = pathKeys.length > 0 ? pathKeys[0] : key;
    env[pathKey] = value;
}
function removeNulls(env) {
    // Don't delete while iterating the object itself
    for (const key of Object.keys(env)) {
        if (env[key] === null) {
            delete env[key];
        }
    }
}

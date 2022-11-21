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
/* eslint-disable local/code-import-patterns */
/* eslint-disable local/code-layering */
import { Disposable, toDisposable } from 'vs/base/common/lifecycle';
import * as platform from 'vs/base/common/platform';
import { StopWatch } from 'vs/base/common/stopwatch';
import { PersistentProtocol } from 'vs/base/parts/ipc/common/ipc.net';
import { createRandomIPCHandle, NodeSocket } from 'vs/base/parts/ipc/node/ipc.net';
import { ILogService } from 'vs/platform/log/common/log';
import { IPCExtHostConnection, writeExtHostConnection } from 'vs/workbench/services/extensions/common/extensionHostEnv';
import { createMessageOfType } from 'vs/workbench/services/extensions/common/extensionHostProtocol';
import { ExtHostMessagePortCommunication, SandboxLocalProcessExtensionHost } from 'vs/workbench/services/extensions/electron-sandbox/localProcessExtensionHost';
import { process } from 'vs/base/parts/sandbox/electron-sandbox/globals';
export class NativeLocalProcessExtensionHost extends SandboxLocalProcessExtensionHost {
    async _start() {
        const canUseUtilityProcess = await this._extensionHostStarter.canUseUtilityProcess();
        if (canUseUtilityProcess && (this._configurationService.getValue('extensions.experimental.useUtilityProcess') || process.sandboxed)) {
            const communication = this._toDispose.add(new ExtHostMessagePortCommunication(this._logService));
            return this._startWithCommunication(communication);
        }
        else {
            const communication = this._toDispose.add(new ExtHostNamedPipeCommunication(this._logService));
            return this._startWithCommunication(communication);
        }
    }
}
let ExtHostNamedPipeCommunication = class ExtHostNamedPipeCommunication extends Disposable {
    _logService;
    useUtilityProcess = false;
    constructor(_logService) {
        super();
        this._logService = _logService;
    }
    async prepare() {
        const { createServer } = await import('net');
        return new Promise((resolve, reject) => {
            const pipeName = createRandomIPCHandle();
            const namedPipeServer = createServer();
            namedPipeServer.on('error', reject);
            namedPipeServer.listen(pipeName, () => {
                namedPipeServer?.removeListener('error', reject);
                resolve({ pipeName, namedPipeServer });
            });
            this._register(toDisposable(() => {
                if (namedPipeServer.listening) {
                    namedPipeServer.close();
                }
            }));
        });
    }
    establishProtocol(prepared, extensionHostProcess, opts) {
        const { namedPipeServer, pipeName } = prepared;
        writeExtHostConnection(new IPCExtHostConnection(pipeName), opts.env);
        return new Promise((resolve, reject) => {
            // Wait for the extension host to connect to our named pipe
            // and wrap the socket in the message passing protocol
            const handle = setTimeout(() => {
                if (namedPipeServer.listening) {
                    namedPipeServer.close();
                }
                reject('The local extension host took longer than 60s to connect.');
            }, 60 * 1000);
            namedPipeServer.on('connection', (socket) => {
                clearTimeout(handle);
                if (namedPipeServer.listening) {
                    namedPipeServer.close();
                }
                const nodeSocket = new NodeSocket(socket, 'renderer-exthost');
                const protocol = new PersistentProtocol(nodeSocket);
                this._register(toDisposable(() => {
                    // Send the extension host a request to terminate itself
                    // (graceful termination)
                    protocol.send(createMessageOfType(2 /* MessageType.Terminate */));
                    protocol.flush();
                    socket.end();
                    nodeSocket.dispose();
                    protocol.dispose();
                }));
                resolve(protocol);
            });
            // Now that the named pipe listener is installed, start the ext host process
            const sw = StopWatch.create(false);
            extensionHostProcess.start(opts).then(() => {
                const duration = sw.elapsed();
                if (platform.isCI) {
                    this._logService.info(`IExtensionHostStarter.start() took ${duration} ms.`);
                }
            }, (err) => {
                // Starting the ext host process resulted in an error
                reject(err);
            });
        });
    }
};
ExtHostNamedPipeCommunication = __decorate([
    __param(0, ILogService)
], ExtHostNamedPipeCommunication);

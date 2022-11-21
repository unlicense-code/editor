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
import { ILogService } from 'vs/platform/log/common/log';
import { Disposable, DisposableStore, toDisposable } from 'vs/base/common/lifecycle';
import { ISharedProcessService } from 'vs/platform/ipc/electron-sandbox/services';
import { Client as MessagePortClient } from 'vs/base/parts/ipc/common/ipc.mp';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { ipcSharedProcessWorkerChannelName } from 'vs/platform/sharedProcess/common/sharedProcessWorkerService';
import { ProxyChannel } from 'vs/base/parts/ipc/common/ipc';
import { generateUuid } from 'vs/base/common/uuid';
import { acquirePort } from 'vs/base/parts/ipc/electron-sandbox/ipc.mp';
export const ISharedProcessWorkerWorkbenchService = createDecorator('sharedProcessWorkerWorkbenchService');
let SharedProcessWorkerWorkbenchService = class SharedProcessWorkerWorkbenchService extends Disposable {
    windowId;
    logService;
    sharedProcessService;
    _sharedProcessWorkerService = undefined;
    get sharedProcessWorkerService() {
        if (!this._sharedProcessWorkerService) {
            this._sharedProcessWorkerService = ProxyChannel.toService(this.sharedProcessService.getChannel(ipcSharedProcessWorkerChannelName));
        }
        return this._sharedProcessWorkerService;
    }
    constructor(windowId, logService, sharedProcessService) {
        super();
        this.windowId = windowId;
        this.logService = logService;
        this.sharedProcessService = sharedProcessService;
    }
    async createWorker(process) {
        this.logService.trace('Renderer->SharedProcess#createWorker');
        // Get ready to acquire the message port from the shared process worker
        const nonce = generateUuid();
        const responseChannel = 'vscode:createSharedProcessWorkerMessageChannelResult';
        const portPromise = acquirePort(undefined /* we trigger the request via service call! */, responseChannel, nonce);
        // Actually talk with the shared process service
        // to create a new process from a worker
        const onDidTerminate = this.sharedProcessWorkerService.createWorker({
            process,
            reply: { windowId: this.windowId, channel: responseChannel, nonce }
        });
        // Dispose worker upon disposal via shared process service
        const disposables = new DisposableStore();
        disposables.add(toDisposable(() => {
            this.logService.trace('Renderer->SharedProcess#disposeWorker', process);
            this.sharedProcessWorkerService.disposeWorker({
                process,
                reply: { windowId: this.windowId }
            });
        }));
        const port = await portPromise;
        const client = disposables.add(new MessagePortClient(port, `window:${this.windowId},module:${process.moduleId}`));
        this.logService.trace('Renderer->SharedProcess#createWorkerChannel: connection established');
        return { client, onDidTerminate, dispose: () => disposables.dispose() };
    }
};
SharedProcessWorkerWorkbenchService = __decorate([
    __param(1, ILogService),
    __param(2, ISharedProcessService)
], SharedProcessWorkerWorkbenchService);
export { SharedProcessWorkerWorkbenchService };

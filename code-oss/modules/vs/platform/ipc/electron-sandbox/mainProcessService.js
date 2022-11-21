/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Disposable } from 'vs/base/common/lifecycle';
import { Client as IPCElectronClient } from 'vs/base/parts/ipc/electron-sandbox/ipc.electron';
/**
 * An implementation of `IMainProcessService` that leverages Electron's IPC.
 */
export class ElectronIPCMainProcessService extends Disposable {
    mainProcessConnection;
    constructor(windowId) {
        super();
        this.mainProcessConnection = this._register(new IPCElectronClient(`window:${windowId}`));
    }
    getChannel(channelName) {
        return this.mainProcessConnection.getChannel(channelName);
    }
    registerChannel(channelName, channel) {
        this.mainProcessConnection.registerChannel(channelName, channel);
    }
}

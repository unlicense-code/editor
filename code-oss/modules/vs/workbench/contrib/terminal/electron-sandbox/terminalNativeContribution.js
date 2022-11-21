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
import { ipcRenderer } from 'vs/base/parts/sandbox/electron-sandbox/globals';
import { URI } from 'vs/base/common/uri';
import { IFileService } from 'vs/platform/files/common/files';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { registerRemoteContributions } from 'vs/workbench/contrib/terminal/electron-sandbox/terminalRemote';
import { IRemoteAgentService } from 'vs/workbench/services/remote/common/remoteAgentService';
import { INativeHostService } from 'vs/platform/native/electron-sandbox/native';
import { Disposable } from 'vs/base/common/lifecycle';
import { ITerminalService } from 'vs/workbench/contrib/terminal/browser/terminal';
let TerminalNativeContribution = class TerminalNativeContribution extends Disposable {
    _fileService;
    _terminalService;
    instantiationService;
    remoteAgentService;
    nativeHostService;
    constructor(_fileService, _terminalService, instantiationService, remoteAgentService, nativeHostService) {
        super();
        this._fileService = _fileService;
        this._terminalService = _terminalService;
        this.instantiationService = instantiationService;
        this.remoteAgentService = remoteAgentService;
        this.nativeHostService = nativeHostService;
        ipcRenderer.on('vscode:openFiles', (_, request) => { this._onOpenFileRequest(request); });
        this._register(nativeHostService.onDidResumeOS(() => this._onOsResume()));
        this._terminalService.setNativeDelegate({
            getWindowCount: () => nativeHostService.getWindowCount(),
            openDevTools: () => nativeHostService.openDevTools(),
            toggleDevTools: () => nativeHostService.toggleDevTools()
        });
        const connection = remoteAgentService.getConnection();
        if (connection && connection.remoteAuthority) {
            registerRemoteContributions();
        }
    }
    _onOsResume() {
        for (const instance of this._terminalService.instances) {
            instance.xterm?.forceRedraw();
        }
    }
    async _onOpenFileRequest(request) {
        // if the request to open files is coming in from the integrated terminal (identified though
        // the termProgram variable) and we are instructed to wait for editors close, wait for the
        // marker file to get deleted and then focus back to the integrated terminal.
        if (request.termProgram === 'vscode' && request.filesToWait) {
            const waitMarkerFileUri = URI.revive(request.filesToWait.waitMarkerFileUri);
            await this._whenFileDeleted(waitMarkerFileUri);
            // Focus active terminal
            this._terminalService.activeInstance?.focus();
        }
    }
    _whenFileDeleted(path) {
        // Complete when wait marker file is deleted
        return new Promise(resolve => {
            let running = false;
            const interval = setInterval(async () => {
                if (!running) {
                    running = true;
                    const exists = await this._fileService.exists(path);
                    running = false;
                    if (!exists) {
                        clearInterval(interval);
                        resolve(undefined);
                    }
                }
            }, 1000);
        });
    }
};
TerminalNativeContribution = __decorate([
    __param(0, IFileService),
    __param(1, ITerminalService),
    __param(2, IInstantiationService),
    __param(3, IRemoteAgentService),
    __param(4, INativeHostService)
], TerminalNativeContribution);
export { TerminalNativeContribution };

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
import { Event } from 'vs/base/common/event';
import { URI } from 'vs/base/common/uri';
import { IExtensionHostDebugService } from 'vs/platform/debug/common/extensionHostDebug';
import { ExtensionHostDebugBroadcastChannel, ExtensionHostDebugChannelClient } from 'vs/platform/debug/common/extensionHostDebugIpc';
import { IFileService } from 'vs/platform/files/common/files';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { ILogService } from 'vs/platform/log/common/log';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { isFolderToOpen, isWorkspaceToOpen } from 'vs/platform/window/common/window';
import { IWorkspaceContextService, isSingleFolderWorkspaceIdentifier, isWorkspaceIdentifier, toWorkspaceIdentifier, hasWorkspaceFileExtension } from 'vs/platform/workspace/common/workspace';
import { IBrowserWorkbenchEnvironmentService } from 'vs/workbench/services/environment/browser/environmentService';
import { IHostService } from 'vs/workbench/services/host/browser/host';
import { IRemoteAgentService } from 'vs/workbench/services/remote/common/remoteAgentService';
let BrowserExtensionHostDebugService = class BrowserExtensionHostDebugService extends ExtensionHostDebugChannelClient {
    static LAST_EXTENSION_DEVELOPMENT_WORKSPACE_KEY = 'debug.lastExtensionDevelopmentWorkspace';
    workspaceProvider;
    storageService;
    fileService;
    constructor(remoteAgentService, environmentService, logService, hostService, contextService, storageService, fileService) {
        const connection = remoteAgentService.getConnection();
        let channel;
        if (connection) {
            channel = connection.getChannel(ExtensionHostDebugBroadcastChannel.ChannelName);
        }
        else {
            // Extension host debugging not supported in serverless.
            channel = { call: async () => undefined, listen: () => Event.None };
        }
        super(channel);
        this.storageService = storageService;
        this.fileService = fileService;
        if (environmentService.options && environmentService.options.workspaceProvider) {
            this.workspaceProvider = environmentService.options.workspaceProvider;
        }
        else {
            this.workspaceProvider = { open: async () => true, workspace: undefined, trusted: undefined };
            logService.warn('Extension Host Debugging not available due to missing workspace provider.');
        }
        // Reload window on reload request
        this._register(this.onReload(event => {
            if (environmentService.isExtensionDevelopment && environmentService.debugExtensionHost.debugId === event.sessionId) {
                hostService.reload();
            }
        }));
        // Close window on close request
        this._register(this.onClose(event => {
            if (environmentService.isExtensionDevelopment && environmentService.debugExtensionHost.debugId === event.sessionId) {
                hostService.close();
            }
        }));
        // Remember workspace as last used for extension development
        // (unless this is API tests) to restore for a future session
        if (environmentService.isExtensionDevelopment && !environmentService.extensionTestsLocationURI) {
            const workspaceId = toWorkspaceIdentifier(contextService.getWorkspace());
            if (isSingleFolderWorkspaceIdentifier(workspaceId) || isWorkspaceIdentifier(workspaceId)) {
                const serializedWorkspace = isSingleFolderWorkspaceIdentifier(workspaceId) ? { folderUri: workspaceId.uri.toJSON() } : { workspaceUri: workspaceId.configPath.toJSON() };
                storageService.store(BrowserExtensionHostDebugService.LAST_EXTENSION_DEVELOPMENT_WORKSPACE_KEY, JSON.stringify(serializedWorkspace), 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
            }
            else {
                storageService.remove(BrowserExtensionHostDebugService.LAST_EXTENSION_DEVELOPMENT_WORKSPACE_KEY, 0 /* StorageScope.PROFILE */);
            }
        }
    }
    async openExtensionDevelopmentHostWindow(args, _debugRenderer) {
        // Add environment parameters required for debug to work
        const environment = new Map();
        const fileUriArg = this.findArgument('file-uri', args);
        if (fileUriArg && !hasWorkspaceFileExtension(fileUriArg)) {
            environment.set('openFile', fileUriArg);
        }
        const copyArgs = [
            'extensionDevelopmentPath',
            'extensionTestsPath',
            'extensionEnvironment',
            'debugId',
            'inspect-brk-extensions',
            'inspect-extensions',
        ];
        for (const argName of copyArgs) {
            const value = this.findArgument(argName, args);
            if (value) {
                environment.set(argName, value);
            }
        }
        // Find out which workspace to open debug window on
        let debugWorkspace = undefined;
        const folderUriArg = this.findArgument('folder-uri', args);
        if (folderUriArg) {
            debugWorkspace = { folderUri: URI.parse(folderUriArg) };
        }
        else {
            const fileUriArg = this.findArgument('file-uri', args);
            if (fileUriArg && hasWorkspaceFileExtension(fileUriArg)) {
                debugWorkspace = { workspaceUri: URI.parse(fileUriArg) };
            }
        }
        const extensionTestsPath = this.findArgument('extensionTestsPath', args);
        if (!debugWorkspace && !extensionTestsPath) {
            const lastExtensionDevelopmentWorkspace = this.storageService.get(BrowserExtensionHostDebugService.LAST_EXTENSION_DEVELOPMENT_WORKSPACE_KEY, 0 /* StorageScope.PROFILE */);
            if (lastExtensionDevelopmentWorkspace) {
                try {
                    const serializedWorkspace = JSON.parse(lastExtensionDevelopmentWorkspace);
                    if (serializedWorkspace.workspaceUri) {
                        debugWorkspace = { workspaceUri: URI.revive(serializedWorkspace.workspaceUri) };
                    }
                    else if (serializedWorkspace.folderUri) {
                        debugWorkspace = { folderUri: URI.revive(serializedWorkspace.folderUri) };
                    }
                }
                catch (error) {
                    // ignore
                }
            }
        }
        // Validate workspace exists
        if (debugWorkspace) {
            const debugWorkspaceResource = isFolderToOpen(debugWorkspace) ? debugWorkspace.folderUri : isWorkspaceToOpen(debugWorkspace) ? debugWorkspace.workspaceUri : undefined;
            if (debugWorkspaceResource) {
                const workspaceExists = await this.fileService.exists(debugWorkspaceResource);
                if (!workspaceExists) {
                    debugWorkspace = undefined;
                }
            }
        }
        // Open debug window as new window. Pass arguments over.
        const success = await this.workspaceProvider.open(debugWorkspace, {
            reuse: false,
            payload: Array.from(environment.entries()) // mandatory properties to enable debugging
        });
        return { success };
    }
    findArgument(key, args) {
        for (const a of args) {
            const k = `--${key}=`;
            if (a.indexOf(k) === 0) {
                return a.substring(k.length);
            }
        }
        return undefined;
    }
};
BrowserExtensionHostDebugService = __decorate([
    __param(0, IRemoteAgentService),
    __param(1, IBrowserWorkbenchEnvironmentService),
    __param(2, ILogService),
    __param(3, IHostService),
    __param(4, IWorkspaceContextService),
    __param(5, IStorageService),
    __param(6, IFileService)
], BrowserExtensionHostDebugService);
registerSingleton(IExtensionHostDebugService, BrowserExtensionHostDebugService, 1 /* InstantiationType.Delayed */);

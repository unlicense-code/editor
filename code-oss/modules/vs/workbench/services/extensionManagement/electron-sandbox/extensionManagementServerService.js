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
import { localize } from 'vs/nls';
import { Schemas } from 'vs/base/common/network';
import { IExtensionManagementServerService } from 'vs/workbench/services/extensionManagement/common/extensionManagement';
import { IRemoteAgentService } from 'vs/workbench/services/remote/common/remoteAgentService';
import { ISharedProcessService } from 'vs/platform/ipc/electron-sandbox/services';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { NativeRemoteExtensionManagementService } from 'vs/workbench/services/extensionManagement/electron-sandbox/remoteExtensionManagementService';
import { ILabelService } from 'vs/platform/label/common/label';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IUserDataProfileService } from 'vs/workbench/services/userDataProfile/common/userDataProfile';
import { NativeExtensionManagementService } from 'vs/workbench/services/extensionManagement/electron-sandbox/nativeExtensionManagementService';
import { Disposable } from 'vs/base/common/lifecycle';
import { IUserDataProfilesService } from 'vs/platform/userDataProfile/common/userDataProfile';
let ExtensionManagementServerService = class ExtensionManagementServerService extends Disposable {
    localExtensionManagementServer;
    remoteExtensionManagementServer = null;
    webExtensionManagementServer = null;
    constructor(sharedProcessService, remoteAgentService, labelService, userDataProfilesService, userDataProfileService, instantiationService) {
        super();
        const localExtensionManagementService = this._register(instantiationService.createInstance(NativeExtensionManagementService, sharedProcessService.getChannel('extensions')));
        this.localExtensionManagementServer = { extensionManagementService: localExtensionManagementService, id: 'local', label: localize('local', "Local") };
        const remoteAgentConnection = remoteAgentService.getConnection();
        if (remoteAgentConnection) {
            const extensionManagementService = instantiationService.createInstance(NativeRemoteExtensionManagementService, remoteAgentConnection.getChannel('extensions'), this.localExtensionManagementServer);
            this.remoteExtensionManagementServer = {
                id: 'remote',
                extensionManagementService,
                get label() { return labelService.getHostLabel(Schemas.vscodeRemote, remoteAgentConnection.remoteAuthority) || localize('remote', "Remote"); },
            };
        }
    }
    getExtensionManagementServer(extension) {
        if (extension.location.scheme === Schemas.file) {
            return this.localExtensionManagementServer;
        }
        if (this.remoteExtensionManagementServer && extension.location.scheme === Schemas.vscodeRemote) {
            return this.remoteExtensionManagementServer;
        }
        throw new Error(`Invalid Extension ${extension.location}`);
    }
    getExtensionInstallLocation(extension) {
        const server = this.getExtensionManagementServer(extension);
        return server === this.remoteExtensionManagementServer ? 2 /* ExtensionInstallLocation.Remote */ : 1 /* ExtensionInstallLocation.Local */;
    }
};
ExtensionManagementServerService = __decorate([
    __param(0, ISharedProcessService),
    __param(1, IRemoteAgentService),
    __param(2, ILabelService),
    __param(3, IUserDataProfilesService),
    __param(4, IUserDataProfileService),
    __param(5, IInstantiationService)
], ExtensionManagementServerService);
export { ExtensionManagementServerService };
registerSingleton(IExtensionManagementServerService, ExtensionManagementServerService, 1 /* InstantiationType.Delayed */);

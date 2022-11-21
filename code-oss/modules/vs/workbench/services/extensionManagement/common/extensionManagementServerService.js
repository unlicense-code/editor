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
import { IExtensionManagementServerService } from 'vs/workbench/services/extensionManagement/common/extensionManagement';
import { IRemoteAgentService } from 'vs/workbench/services/remote/common/remoteAgentService';
import { Schemas } from 'vs/base/common/network';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { ILabelService } from 'vs/platform/label/common/label';
import { isWeb } from 'vs/base/common/platform';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { WebExtensionManagementService } from 'vs/workbench/services/extensionManagement/common/webExtensionManagementService';
import { RemoteExtensionManagementService } from 'vs/workbench/services/extensionManagement/common/remoteExtensionManagementService';
let ExtensionManagementServerService = class ExtensionManagementServerService {
    localExtensionManagementServer = null;
    remoteExtensionManagementServer = null;
    webExtensionManagementServer = null;
    constructor(remoteAgentService, labelService, instantiationService) {
        const remoteAgentConnection = remoteAgentService.getConnection();
        if (remoteAgentConnection) {
            const extensionManagementService = instantiationService.createInstance(RemoteExtensionManagementService, remoteAgentConnection.getChannel('extensions'));
            this.remoteExtensionManagementServer = {
                id: 'remote',
                extensionManagementService,
                get label() { return labelService.getHostLabel(Schemas.vscodeRemote, remoteAgentConnection.remoteAuthority) || localize('remote', "Remote"); },
            };
        }
        if (isWeb) {
            const extensionManagementService = instantiationService.createInstance(WebExtensionManagementService);
            this.webExtensionManagementServer = {
                id: 'web',
                extensionManagementService,
                label: localize('browser', "Browser"),
            };
        }
    }
    getExtensionManagementServer(extension) {
        if (extension.location.scheme === Schemas.vscodeRemote) {
            return this.remoteExtensionManagementServer;
        }
        if (this.webExtensionManagementServer) {
            return this.webExtensionManagementServer;
        }
        throw new Error(`Invalid Extension ${extension.location}`);
    }
    getExtensionInstallLocation(extension) {
        const server = this.getExtensionManagementServer(extension);
        return server === this.remoteExtensionManagementServer ? 2 /* ExtensionInstallLocation.Remote */ : 3 /* ExtensionInstallLocation.Web */;
    }
};
ExtensionManagementServerService = __decorate([
    __param(0, IRemoteAgentService),
    __param(1, ILabelService),
    __param(2, IInstantiationService)
], ExtensionManagementServerService);
export { ExtensionManagementServerService };
registerSingleton(IExtensionManagementServerService, ExtensionManagementServerService, 1 /* InstantiationType.Delayed */);

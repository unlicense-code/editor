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
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { IRemoteAgentService } from 'vs/workbench/services/remote/common/remoteAgentService';
import { INativeWorkbenchEnvironmentService } from 'vs/workbench/services/environment/electron-sandbox/environmentService';
import { IPathService, AbstractPathService } from 'vs/workbench/services/path/common/pathService';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
let NativePathService = class NativePathService extends AbstractPathService {
    constructor(remoteAgentService, environmentService, contextService) {
        super(environmentService.userHome, remoteAgentService, environmentService, contextService);
    }
};
NativePathService = __decorate([
    __param(0, IRemoteAgentService),
    __param(1, INativeWorkbenchEnvironmentService),
    __param(2, IWorkspaceContextService)
], NativePathService);
export { NativePathService };
registerSingleton(IPathService, NativePathService, 1 /* InstantiationType.Delayed */);

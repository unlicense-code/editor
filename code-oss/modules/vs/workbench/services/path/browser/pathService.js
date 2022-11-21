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
import { IPathService, AbstractPathService } from 'vs/workbench/services/path/common/pathService';
import { URI } from 'vs/base/common/uri';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { firstOrDefault } from 'vs/base/common/arrays';
import { dirname } from 'vs/base/common/resources';
let BrowserPathService = class BrowserPathService extends AbstractPathService {
    constructor(remoteAgentService, environmentService, contextService) {
        super(guessLocalUserHome(environmentService, contextService), remoteAgentService, environmentService, contextService);
    }
};
BrowserPathService = __decorate([
    __param(0, IRemoteAgentService),
    __param(1, IWorkbenchEnvironmentService),
    __param(2, IWorkspaceContextService)
], BrowserPathService);
export { BrowserPathService };
function guessLocalUserHome(environmentService, contextService) {
    // In web we do not really have the concept of a "local" user home
    // but we still require it in many places as a fallback. As such,
    // we have to come up with a synthetic location derived from the
    // environment.
    const workspace = contextService.getWorkspace();
    const firstFolder = firstOrDefault(workspace.folders);
    if (firstFolder) {
        return firstFolder.uri;
    }
    if (workspace.configuration) {
        return dirname(workspace.configuration);
    }
    // This is not ideal because with a user home location of `/`, all paths
    // will potentially appear with `~/...`, but at this point we really do
    // not have any other good alternative.
    return URI.from({
        scheme: AbstractPathService.findDefaultUriScheme(environmentService, contextService),
        authority: environmentService.remoteAuthority,
        path: '/'
    });
}
registerSingleton(IPathService, BrowserPathService, 1 /* InstantiationType.Delayed */);

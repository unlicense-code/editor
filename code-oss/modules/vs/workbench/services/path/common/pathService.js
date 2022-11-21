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
import { isValidBasename } from 'vs/base/common/extpath';
import { Schemas } from 'vs/base/common/network';
import { win32, posix } from 'vs/base/common/path';
import { OS } from 'vs/base/common/platform';
import { basename } from 'vs/base/common/resources';
import { URI } from 'vs/base/common/uri';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { getVirtualWorkspaceScheme } from 'vs/platform/workspace/common/virtualWorkspace';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { IRemoteAgentService } from 'vs/workbench/services/remote/common/remoteAgentService';
export const IPathService = createDecorator('pathService');
let AbstractPathService = class AbstractPathService {
    localUserHome;
    remoteAgentService;
    environmentService;
    contextService;
    resolveOS;
    resolveUserHome;
    maybeUnresolvedUserHome;
    constructor(localUserHome, remoteAgentService, environmentService, contextService) {
        this.localUserHome = localUserHome;
        this.remoteAgentService = remoteAgentService;
        this.environmentService = environmentService;
        this.contextService = contextService;
        // OS
        this.resolveOS = (async () => {
            const env = await this.remoteAgentService.getEnvironment();
            return env?.os || OS;
        })();
        // User Home
        this.resolveUserHome = (async () => {
            const env = await this.remoteAgentService.getEnvironment();
            const userHome = this.maybeUnresolvedUserHome = env?.userHome ?? localUserHome;
            return userHome;
        })();
    }
    hasValidBasename(resource, arg2, basename) {
        // async version
        if (typeof arg2 === 'string' || typeof arg2 === 'undefined') {
            return this.resolveOS.then(os => this.doHasValidBasename(resource, os, arg2));
        }
        // sync version
        return this.doHasValidBasename(resource, arg2, basename);
    }
    doHasValidBasename(resource, os, name) {
        // Our `isValidBasename` method only works with our
        // standard schemes for files on disk, either locally
        // or remote.
        if (resource.scheme === Schemas.file || resource.scheme === Schemas.vscodeRemote) {
            return isValidBasename(name ?? basename(resource), os === 1 /* OperatingSystem.Windows */);
        }
        return true;
    }
    get defaultUriScheme() {
        return AbstractPathService.findDefaultUriScheme(this.environmentService, this.contextService);
    }
    static findDefaultUriScheme(environmentService, contextService) {
        if (environmentService.remoteAuthority) {
            return Schemas.vscodeRemote;
        }
        const virtualWorkspace = getVirtualWorkspaceScheme(contextService.getWorkspace());
        if (virtualWorkspace) {
            return virtualWorkspace;
        }
        const firstFolder = contextService.getWorkspace().folders[0];
        if (firstFolder) {
            return firstFolder.uri.scheme;
        }
        const configuration = contextService.getWorkspace().configuration;
        if (configuration) {
            return configuration.scheme;
        }
        return Schemas.file;
    }
    userHome(options) {
        return options?.preferLocal ? this.localUserHome : this.resolveUserHome;
    }
    get resolvedUserHome() {
        return this.maybeUnresolvedUserHome;
    }
    get path() {
        return this.resolveOS.then(os => {
            return os === 1 /* OperatingSystem.Windows */ ?
                win32 :
                posix;
        });
    }
    async fileURI(_path) {
        let authority = '';
        // normalize to fwd-slashes on windows,
        // on other systems bwd-slashes are valid
        // filename character, eg /f\oo/ba\r.txt
        const os = await this.resolveOS;
        if (os === 1 /* OperatingSystem.Windows */) {
            _path = _path.replace(/\\/g, '/');
        }
        // check for authority as used in UNC shares
        // or use the path as given
        if (_path[0] === '/' && _path[1] === '/') {
            const idx = _path.indexOf('/', 2);
            if (idx === -1) {
                authority = _path.substring(2);
                _path = '/';
            }
            else {
                authority = _path.substring(2, idx);
                _path = _path.substring(idx) || '/';
            }
        }
        return URI.from({
            scheme: Schemas.file,
            authority,
            path: _path,
            query: '',
            fragment: ''
        });
    }
};
AbstractPathService = __decorate([
    __param(1, IRemoteAgentService),
    __param(2, IWorkbenchEnvironmentService),
    __param(3, IWorkspaceContextService)
], AbstractPathService);
export { AbstractPathService };

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { URI } from 'vs/base/common/uri';
import { createURITransformer } from 'vs/workbench/api/node/uriTransformer';
import { DiskFileSystemProvider } from 'vs/platform/files/node/diskFileSystemProvider';
import { posix, delimiter } from 'vs/base/common/path';
import { AbstractDiskFileSystemProviderChannel, AbstractSessionFileWatcher } from 'vs/platform/files/node/diskFileSystemProviderServer';
export class RemoteAgentFileSystemProviderChannel extends AbstractDiskFileSystemProviderChannel {
    environmentService;
    uriTransformerCache = new Map();
    constructor(logService, environmentService) {
        super(new DiskFileSystemProvider(logService), logService);
        this.environmentService = environmentService;
        this._register(this.provider);
    }
    getUriTransformer(ctx) {
        let transformer = this.uriTransformerCache.get(ctx.remoteAuthority);
        if (!transformer) {
            transformer = createURITransformer(ctx.remoteAuthority);
            this.uriTransformerCache.set(ctx.remoteAuthority, transformer);
        }
        return transformer;
    }
    transformIncoming(uriTransformer, _resource, supportVSCodeResource = false) {
        if (supportVSCodeResource && _resource.path === '/vscode-resource' && _resource.query) {
            const requestResourcePath = JSON.parse(_resource.query).requestResourcePath;
            return URI.from({ scheme: 'file', path: requestResourcePath });
        }
        return URI.revive(uriTransformer.transformIncoming(_resource));
    }
    //#region File Watching
    createSessionFileWatcher(uriTransformer, emitter) {
        return new SessionFileWatcher(uriTransformer, emitter, this.logService, this.environmentService);
    }
}
class SessionFileWatcher extends AbstractSessionFileWatcher {
    constructor(uriTransformer, sessionEmitter, logService, environmentService) {
        super(uriTransformer, sessionEmitter, logService, environmentService);
    }
    getRecursiveWatcherOptions(environmentService) {
        const fileWatcherPolling = environmentService.args['file-watcher-polling'];
        if (fileWatcherPolling) {
            const segments = fileWatcherPolling.split(delimiter);
            const pollingInterval = Number(segments[0]);
            if (pollingInterval > 0) {
                const usePolling = segments.length > 1 ? segments.slice(1) : true;
                return { usePolling, pollingInterval };
            }
        }
        return undefined;
    }
    getExtraExcludes(environmentService) {
        if (environmentService.extensionsPath) {
            // when opening the $HOME folder, we end up watching the extension folder
            // so simply exclude watching the extensions folder
            return [posix.join(environmentService.extensionsPath, '**')];
        }
        return undefined;
    }
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { shell } from 'electron';
import { localize } from 'vs/nls';
import { isWindows } from 'vs/base/common/platform';
import { URI } from 'vs/base/common/uri';
import { createFileSystemProviderError, FileSystemProviderErrorCode } from 'vs/platform/files/common/files';
import { basename, normalize } from 'vs/base/common/path';
import { AbstractDiskFileSystemProviderChannel, AbstractSessionFileWatcher } from 'vs/platform/files/node/diskFileSystemProviderServer';
import { DefaultURITransformer } from 'vs/base/common/uriIpc';
export class DiskFileSystemProviderChannel extends AbstractDiskFileSystemProviderChannel {
    environmentService;
    constructor(provider, logService, environmentService) {
        super(provider, logService);
        this.environmentService = environmentService;
    }
    getUriTransformer(ctx) {
        return DefaultURITransformer;
    }
    transformIncoming(uriTransformer, _resource) {
        return URI.revive(_resource);
    }
    //#region Delete: override to support Electron's trash support
    async delete(uriTransformer, _resource, opts) {
        if (!opts.useTrash) {
            return super.delete(uriTransformer, _resource, opts);
        }
        const resource = this.transformIncoming(uriTransformer, _resource);
        const filePath = normalize(resource.fsPath);
        try {
            await shell.trashItem(filePath);
        }
        catch (error) {
            throw createFileSystemProviderError(isWindows ? localize('binFailed', "Failed to move '{0}' to the recycle bin", basename(filePath)) : localize('trashFailed', "Failed to move '{0}' to the trash", basename(filePath)), FileSystemProviderErrorCode.Unknown);
        }
    }
    //#endregion
    //#region File Watching
    createSessionFileWatcher(uriTransformer, emitter) {
        return new SessionFileWatcher(uriTransformer, emitter, this.logService, this.environmentService);
    }
}
class SessionFileWatcher extends AbstractSessionFileWatcher {
    watch(req, resource, opts) {
        if (opts.recursive) {
            throw createFileSystemProviderError('Recursive file watching is not supported from main process for performance reasons.', FileSystemProviderErrorCode.Unavailable);
        }
        return super.watch(req, resource, opts);
    }
}

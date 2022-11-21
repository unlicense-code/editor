/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { FileType, FileSystemProviderError, FileSystemProviderErrorCode } from 'vs/platform/files/common/files';
import { Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { NotSupportedError } from 'vs/base/common/errors';
export class FetchFileSystemProvider {
    capabilities = 2048 /* FileSystemProviderCapabilities.Readonly */ + 2 /* FileSystemProviderCapabilities.FileReadWrite */ + 1024 /* FileSystemProviderCapabilities.PathCaseSensitive */;
    onDidChangeCapabilities = Event.None;
    onDidChangeFile = Event.None;
    // working implementations
    async readFile(resource) {
        try {
            const res = await fetch(resource.toString(true));
            if (res.status === 200) {
                return new Uint8Array(await res.arrayBuffer());
            }
            throw new FileSystemProviderError(res.statusText, FileSystemProviderErrorCode.Unknown);
        }
        catch (err) {
            throw new FileSystemProviderError(err, FileSystemProviderErrorCode.Unknown);
        }
    }
    // fake implementations
    async stat(_resource) {
        return {
            type: FileType.File,
            size: 0,
            mtime: 0,
            ctime: 0
        };
    }
    watch() {
        return Disposable.None;
    }
    // error implementations
    writeFile(_resource, _content, _opts) {
        throw new NotSupportedError();
    }
    readdir(_resource) {
        throw new NotSupportedError();
    }
    mkdir(_resource) {
        throw new NotSupportedError();
    }
    delete(_resource, _opts) {
        throw new NotSupportedError();
    }
    rename(_from, _to, _opts) {
        throw new NotSupportedError();
    }
}

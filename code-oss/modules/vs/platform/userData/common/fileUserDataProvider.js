/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Emitter } from 'vs/base/common/event';
import { Disposable, toDisposable } from 'vs/base/common/lifecycle';
import { hasFileFolderCopyCapability } from 'vs/platform/files/common/files';
import { newWriteableStream } from 'vs/base/common/stream';
import { TernarySearchTree } from 'vs/base/common/ternarySearchTree';
import { VSBuffer } from 'vs/base/common/buffer';
/**
 * This is a wrapper on top of the local filesystem provider which will
 * 	- Convert the user data resources to file system scheme and vice-versa
 *  - Enforces atomic reads for user data
 */
export class FileUserDataProvider extends Disposable {
    fileSystemScheme;
    fileSystemProvider;
    userDataScheme;
    logService;
    get capabilities() { return this.fileSystemProvider.capabilities & ~4 /* FileSystemProviderCapabilities.FileOpenReadWriteClose */; }
    onDidChangeCapabilities = this.fileSystemProvider.onDidChangeCapabilities;
    _onDidChangeFile = this._register(new Emitter());
    onDidChangeFile = this._onDidChangeFile.event;
    watchResources = TernarySearchTree.forUris(() => !(this.capabilities & 1024 /* FileSystemProviderCapabilities.PathCaseSensitive */));
    constructor(fileSystemScheme, fileSystemProvider, userDataScheme, logService) {
        super();
        this.fileSystemScheme = fileSystemScheme;
        this.fileSystemProvider = fileSystemProvider;
        this.userDataScheme = userDataScheme;
        this.logService = logService;
        this._register(this.fileSystemProvider.onDidChangeFile(e => this.handleFileChanges(e)));
    }
    watch(resource, opts) {
        this.watchResources.set(resource, resource);
        const disposable = this.fileSystemProvider.watch(this.toFileSystemResource(resource), opts);
        return toDisposable(() => {
            this.watchResources.delete(resource);
            disposable.dispose();
        });
    }
    stat(resource) {
        return this.fileSystemProvider.stat(this.toFileSystemResource(resource));
    }
    mkdir(resource) {
        return this.fileSystemProvider.mkdir(this.toFileSystemResource(resource));
    }
    rename(from, to, opts) {
        return this.fileSystemProvider.rename(this.toFileSystemResource(from), this.toFileSystemResource(to), opts);
    }
    readFile(resource) {
        return this.fileSystemProvider.readFile(this.toFileSystemResource(resource), { atomic: true });
    }
    readFileStream(resource, opts, token) {
        const stream = newWriteableStream(data => VSBuffer.concat(data.map(data => VSBuffer.wrap(data))).buffer);
        (async () => {
            try {
                const contents = await this.readFile(resource);
                stream.end(contents);
            }
            catch (error) {
                stream.error(error);
                stream.end();
            }
        })();
        return stream;
    }
    readdir(resource) {
        return this.fileSystemProvider.readdir(this.toFileSystemResource(resource));
    }
    writeFile(resource, content, opts) {
        return this.fileSystemProvider.writeFile(this.toFileSystemResource(resource), content, opts);
    }
    delete(resource, opts) {
        return this.fileSystemProvider.delete(this.toFileSystemResource(resource), opts);
    }
    copy(from, to, opts) {
        if (hasFileFolderCopyCapability(this.fileSystemProvider)) {
            return this.fileSystemProvider.copy(this.toFileSystemResource(from), this.toFileSystemResource(to), opts);
        }
        throw new Error('copy not supported');
    }
    handleFileChanges(changes) {
        const userDataChanges = [];
        for (const change of changes) {
            if (change.resource.scheme !== this.fileSystemScheme) {
                continue; // only interested in file schemes
            }
            const userDataResource = this.toUserDataResource(change.resource);
            if (this.watchResources.findSubstr(userDataResource)) {
                userDataChanges.push({
                    resource: userDataResource,
                    type: change.type
                });
            }
        }
        if (userDataChanges.length) {
            this.logService.debug('User data changed');
            this._onDidChangeFile.fire(userDataChanges);
        }
    }
    toFileSystemResource(userDataResource) {
        return userDataResource.with({ scheme: this.fileSystemScheme });
    }
    toUserDataResource(fileSystemResource) {
        return fileSystemResource.with({ scheme: this.userDataScheme });
    }
}

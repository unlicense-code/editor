/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Emitter } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
export class NullFileSystemProvider {
    disposableFactory;
    capabilities = 2048 /* FileSystemProviderCapabilities.Readonly */;
    _onDidChangeCapabilities = new Emitter();
    onDidChangeCapabilities = this._onDidChangeCapabilities.event;
    _onDidChangeFile = new Emitter();
    onDidChangeFile = this._onDidChangeFile.event;
    constructor(disposableFactory = () => Disposable.None) {
        this.disposableFactory = disposableFactory;
    }
    emitFileChangeEvents(changes) {
        this._onDidChangeFile.fire(changes);
    }
    setCapabilities(capabilities) {
        this.capabilities = capabilities;
        this._onDidChangeCapabilities.fire();
    }
    watch(resource, opts) { return this.disposableFactory(); }
    async stat(resource) { return undefined; }
    async mkdir(resource) { return undefined; }
    async readdir(resource) { return undefined; }
    async delete(resource, opts) { return undefined; }
    async rename(from, to, opts) { return undefined; }
    async copy(from, to, opts) { return undefined; }
    async readFile(resource) { return undefined; }
    async writeFile(resource, content, opts) { return undefined; }
    async open(resource, opts) { return undefined; }
    async close(fd) { return undefined; }
    async read(fd, pos, data, offset, length) { return undefined; }
    async write(fd, pos, data, offset, length) { return undefined; }
}

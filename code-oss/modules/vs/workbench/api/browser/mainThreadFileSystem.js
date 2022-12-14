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
var MainThreadFileSystem_1;
import { Emitter, Event } from 'vs/base/common/event';
import { toDisposable, DisposableStore, DisposableMap } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
import { FileType, FileOperationError, FileSystemProviderErrorCode, FilePermission, toFileSystemProviderErrorCode } from 'vs/platform/files/common/files';
import { extHostNamedCustomer } from 'vs/workbench/services/extensions/common/extHostCustomers';
import { ExtHostContext, MainContext } from '../common/extHost.protocol';
import { VSBuffer } from 'vs/base/common/buffer';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { ILogService } from 'vs/platform/log/common/log';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IWorkbenchFileService } from 'vs/workbench/services/files/common/files';
import { normalizeWatcherPattern } from 'vs/platform/files/common/watcher';
import { GLOBSTAR } from 'vs/base/common/glob';
import { rtrim } from 'vs/base/common/strings';
let MainThreadFileSystem = MainThreadFileSystem_1 = class MainThreadFileSystem {
    _fileService;
    _contextService;
    _logService;
    _configurationService;
    _proxy;
    _fileProvider = new DisposableMap();
    _disposables = new DisposableStore();
    _watches = new DisposableMap();
    constructor(extHostContext, _fileService, _contextService, _logService, _configurationService) {
        this._fileService = _fileService;
        this._contextService = _contextService;
        this._logService = _logService;
        this._configurationService = _configurationService;
        this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostFileSystem);
        const infoProxy = extHostContext.getProxy(ExtHostContext.ExtHostFileSystemInfo);
        for (const entry of _fileService.listCapabilities()) {
            infoProxy.$acceptProviderInfos(URI.from({ scheme: entry.scheme, path: '/dummy' }), entry.capabilities);
        }
        this._disposables.add(_fileService.onDidChangeFileSystemProviderRegistrations(e => infoProxy.$acceptProviderInfos(URI.from({ scheme: e.scheme, path: '/dummy' }), e.provider?.capabilities ?? null)));
        this._disposables.add(_fileService.onDidChangeFileSystemProviderCapabilities(e => infoProxy.$acceptProviderInfos(URI.from({ scheme: e.scheme, path: '/dummy' }), e.provider.capabilities)));
    }
    dispose() {
        this._disposables.dispose();
        this._fileProvider.dispose();
        this._watches.dispose();
    }
    async $registerFileSystemProvider(handle, scheme, capabilities) {
        this._fileProvider.set(handle, new RemoteFileSystemProvider(this._fileService, scheme, capabilities, handle, this._proxy));
    }
    $unregisterProvider(handle) {
        this._fileProvider.deleteAndDispose(handle);
    }
    $onFileSystemChange(handle, changes) {
        const fileProvider = this._fileProvider.get(handle);
        if (!fileProvider) {
            throw new Error('Unknown file provider');
        }
        fileProvider.$onFileSystemChange(changes);
    }
    // --- consumer fs, vscode.workspace.fs
    $stat(uri) {
        return this._fileService.stat(URI.revive(uri)).then(stat => {
            return {
                ctime: stat.ctime,
                mtime: stat.mtime,
                size: stat.size,
                permissions: stat.readonly ? FilePermission.Readonly : undefined,
                type: MainThreadFileSystem_1._asFileType(stat)
            };
        }).catch(MainThreadFileSystem_1._handleError);
    }
    $readdir(uri) {
        return this._fileService.resolve(URI.revive(uri), { resolveMetadata: false }).then(stat => {
            if (!stat.isDirectory) {
                const err = new Error(stat.name);
                err.name = FileSystemProviderErrorCode.FileNotADirectory;
                throw err;
            }
            return !stat.children ? [] : stat.children.map(child => [child.name, MainThreadFileSystem_1._asFileType(child)]);
        }).catch(MainThreadFileSystem_1._handleError);
    }
    static _asFileType(stat) {
        let res = 0;
        if (stat.isFile) {
            res += FileType.File;
        }
        else if (stat.isDirectory) {
            res += FileType.Directory;
        }
        if (stat.isSymbolicLink) {
            res += FileType.SymbolicLink;
        }
        return res;
    }
    $readFile(uri) {
        return this._fileService.readFile(URI.revive(uri)).then(file => file.value).catch(MainThreadFileSystem_1._handleError);
    }
    $writeFile(uri, content) {
        return this._fileService.writeFile(URI.revive(uri), content)
            .then(() => undefined).catch(MainThreadFileSystem_1._handleError);
    }
    $rename(source, target, opts) {
        return this._fileService.move(URI.revive(source), URI.revive(target), opts.overwrite)
            .then(() => undefined).catch(MainThreadFileSystem_1._handleError);
    }
    $copy(source, target, opts) {
        return this._fileService.copy(URI.revive(source), URI.revive(target), opts.overwrite)
            .then(() => undefined).catch(MainThreadFileSystem_1._handleError);
    }
    $mkdir(uri) {
        return this._fileService.createFolder(URI.revive(uri))
            .then(() => undefined).catch(MainThreadFileSystem_1._handleError);
    }
    $delete(uri, opts) {
        return this._fileService.del(URI.revive(uri), opts).catch(MainThreadFileSystem_1._handleError);
    }
    static _handleError(err) {
        if (err instanceof FileOperationError) {
            switch (err.fileOperationResult) {
                case 1 /* FileOperationResult.FILE_NOT_FOUND */:
                    err.name = FileSystemProviderErrorCode.FileNotFound;
                    break;
                case 0 /* FileOperationResult.FILE_IS_DIRECTORY */:
                    err.name = FileSystemProviderErrorCode.FileIsADirectory;
                    break;
                case 6 /* FileOperationResult.FILE_PERMISSION_DENIED */:
                    err.name = FileSystemProviderErrorCode.NoPermissions;
                    break;
                case 4 /* FileOperationResult.FILE_MOVE_CONFLICT */:
                    err.name = FileSystemProviderErrorCode.FileExists;
                    break;
            }
        }
        else if (err instanceof Error) {
            const code = toFileSystemProviderErrorCode(err);
            if (code !== FileSystemProviderErrorCode.Unknown) {
                err.name = code;
            }
        }
        throw err;
    }
    $ensureActivation(scheme) {
        return this._fileService.activateProvider(scheme);
    }
    async $watch(extensionId, session, resource, unvalidatedOpts) {
        const uri = URI.revive(resource);
        const workspaceFolder = this._contextService.getWorkspaceFolder(uri);
        const opts = { ...unvalidatedOpts };
        // Convert a recursive watcher to a flat watcher if the path
        // turns out to not be a folder. Recursive watching is only
        // possible on folders, so we help all file watchers by checking
        // early.
        if (opts.recursive) {
            try {
                const stat = await this._fileService.stat(uri);
                if (!stat.isDirectory) {
                    opts.recursive = false;
                }
            }
            catch (error) {
                this._logService.error(`MainThreadFileSystem#$watch(): failed to stat a resource for file watching (extension: ${extensionId}, path: ${uri.toString(true)}, recursive: ${opts.recursive}, session: ${session}): ${error}`);
            }
        }
        // Refuse to watch anything that is already watched via
        // our workspace watchers in case the request is a
        // recursive file watcher.
        // Still allow for non-recursive watch requests as a way
        // to bypass configured exclude rules though
        // (see https://github.com/microsoft/vscode/issues/146066)
        if (workspaceFolder && opts.recursive) {
            this._logService.trace(`MainThreadFileSystem#$watch(): ignoring request to start watching because path is inside workspace (extension: ${extensionId}, path: ${uri.toString(true)}, recursive: ${opts.recursive}, session: ${session})`);
            return;
        }
        this._logService.trace(`MainThreadFileSystem#$watch(): request to start watching (extension: ${extensionId}, path: ${uri.toString(true)}, recursive: ${opts.recursive}, session: ${session})`);
        // Automatically add `files.watcherExclude` patterns when watching
        // recursively to give users a chance to configure exclude rules
        // for reducing the overhead of watching recursively
        if (opts.recursive) {
            const config = this._configurationService.getValue();
            if (config.files?.watcherExclude) {
                for (const key in config.files.watcherExclude) {
                    if (config.files.watcherExclude[key] === true) {
                        opts.excludes.push(key);
                    }
                }
            }
        }
        // Non-recursive watching inside the workspace will overlap with
        // our standard workspace watchers. To prevent duplicate events,
        // we only want to include events for files that are otherwise
        // excluded via `files.watcherExclude`. As such, we configure
        // to include each configured exclude pattern so that only those
        // events are reported that are otherwise excluded.
        // However, we cannot just use the pattern as is, because a pattern
        // such as `bar` for a exclude, will work to exclude any of
        // `<workspace path>/bar` but will not work as include for files within
        // `bar` unless a suffix of `/**` if added.
        // (https://github.com/microsoft/vscode/issues/148245)
        else if (workspaceFolder) {
            const config = this._configurationService.getValue();
            if (config.files?.watcherExclude) {
                for (const key in config.files.watcherExclude) {
                    if (config.files.watcherExclude[key] === true) {
                        if (!opts.includes) {
                            opts.includes = [];
                        }
                        const includePattern = `${rtrim(key, '/')}/${GLOBSTAR}`;
                        opts.includes.push(normalizeWatcherPattern(workspaceFolder.uri.fsPath, includePattern));
                    }
                }
            }
            // Still ignore watch request if there are actually no configured
            // exclude rules, because in that case our default recursive watcher
            // should be able to take care of all events.
            if (!opts.includes || opts.includes.length === 0) {
                this._logService.trace(`MainThreadFileSystem#$watch(): ignoring request to start watching because path is inside workspace and no excludes are configured (extension: ${extensionId}, path: ${uri.toString(true)}, recursive: ${opts.recursive}, session: ${session})`);
                return;
            }
        }
        const subscription = this._fileService.watch(uri, opts);
        this._watches.set(session, subscription);
    }
    $unwatch(session) {
        if (this._watches.has(session)) {
            this._logService.trace(`MainThreadFileSystem#$unwatch(): request to stop watching (session: ${session})`);
            this._watches.deleteAndDispose(session);
        }
    }
};
MainThreadFileSystem = MainThreadFileSystem_1 = __decorate([
    extHostNamedCustomer(MainContext.MainThreadFileSystem),
    __param(1, IWorkbenchFileService),
    __param(2, IWorkspaceContextService),
    __param(3, ILogService),
    __param(4, IConfigurationService)
], MainThreadFileSystem);
export { MainThreadFileSystem };
class RemoteFileSystemProvider {
    _handle;
    _proxy;
    _onDidChange = new Emitter();
    _registration;
    onDidChangeFile = this._onDidChange.event;
    capabilities;
    onDidChangeCapabilities = Event.None;
    constructor(fileService, scheme, capabilities, _handle, _proxy) {
        this._handle = _handle;
        this._proxy = _proxy;
        this.capabilities = capabilities;
        this._registration = fileService.registerProvider(scheme, this);
    }
    dispose() {
        this._registration.dispose();
        this._onDidChange.dispose();
    }
    watch(resource, opts) {
        const session = Math.random();
        this._proxy.$watch(this._handle, session, resource, opts);
        return toDisposable(() => {
            this._proxy.$unwatch(this._handle, session);
        });
    }
    $onFileSystemChange(changes) {
        this._onDidChange.fire(changes.map(RemoteFileSystemProvider._createFileChange));
    }
    static _createFileChange(dto) {
        return { resource: URI.revive(dto.resource), type: dto.type };
    }
    // --- forwarding calls
    stat(resource) {
        return this._proxy.$stat(this._handle, resource).then(undefined, err => {
            throw err;
        });
    }
    readFile(resource) {
        return this._proxy.$readFile(this._handle, resource).then(buffer => buffer.buffer);
    }
    writeFile(resource, content, opts) {
        return this._proxy.$writeFile(this._handle, resource, VSBuffer.wrap(content), opts);
    }
    delete(resource, opts) {
        return this._proxy.$delete(this._handle, resource, opts);
    }
    mkdir(resource) {
        return this._proxy.$mkdir(this._handle, resource);
    }
    readdir(resource) {
        return this._proxy.$readdir(this._handle, resource);
    }
    rename(resource, target, opts) {
        return this._proxy.$rename(this._handle, resource, target, opts);
    }
    copy(resource, target, opts) {
        return this._proxy.$copy(this._handle, resource, target, opts);
    }
    open(resource, opts) {
        return this._proxy.$open(this._handle, resource, opts);
    }
    close(fd) {
        return this._proxy.$close(this._handle, fd);
    }
    read(fd, pos, data, offset, length) {
        return this._proxy.$read(this._handle, fd, pos, length).then(readData => {
            data.set(readData.buffer, offset);
            return readData.byteLength;
        });
    }
    write(fd, pos, data, offset, length) {
        return this._proxy.$write(this._handle, fd, pos, VSBuffer.wrap(data).slice(offset, offset + length));
    }
}

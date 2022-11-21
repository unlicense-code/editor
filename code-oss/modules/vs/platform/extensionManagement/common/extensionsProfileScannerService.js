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
import { Queue } from 'vs/base/common/async';
import { VSBuffer } from 'vs/base/common/buffer';
import { Disposable } from 'vs/base/common/lifecycle';
import { Emitter } from 'vs/base/common/event';
import { ResourceMap } from 'vs/base/common/map';
import { URI } from 'vs/base/common/uri';
import { areSameExtensions } from 'vs/platform/extensionManagement/common/extensionManagementUtil';
import { IFileService } from 'vs/platform/files/common/files';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { ILogService } from 'vs/platform/log/common/log';
export const IExtensionsProfileScannerService = createDecorator('IExtensionsProfileScannerService');
let ExtensionsProfileScannerService = class ExtensionsProfileScannerService extends Disposable {
    fileService;
    logService;
    _serviceBrand;
    _onAddExtensions = this._register(new Emitter());
    onAddExtensions = this._onAddExtensions.event;
    _onDidAddExtensions = this._register(new Emitter());
    onDidAddExtensions = this._onDidAddExtensions.event;
    _onRemoveExtensions = this._register(new Emitter());
    onRemoveExtensions = this._onRemoveExtensions.event;
    _onDidRemoveExtensions = this._register(new Emitter());
    onDidRemoveExtensions = this._onDidRemoveExtensions.event;
    resourcesAccessQueueMap = new ResourceMap();
    constructor(fileService, logService) {
        super();
        this.fileService = fileService;
        this.logService = logService;
    }
    scanProfileExtensions(profileLocation) {
        return this.withProfileExtensions(profileLocation);
    }
    async addExtensionsToProfile(extensions, profileLocation) {
        const extensionsToRemove = [];
        const extensionsToAdd = [];
        try {
            await this.withProfileExtensions(profileLocation, profileExtensions => {
                const result = [];
                for (const extension of profileExtensions) {
                    if (extensions.some(([e]) => areSameExtensions(e.identifier, extension.identifier) && e.manifest.version !== extension.version)) {
                        // Remove the existing extension with different version
                        extensionsToRemove.push(extension);
                    }
                    else {
                        result.push(extension);
                    }
                }
                for (const [extension, metadata] of extensions) {
                    if (!result.some(e => areSameExtensions(e.identifier, extension.identifier) && e.version === extension.manifest.version)) {
                        // Add only if the same version of the extension is not already added
                        const extensionToAdd = { identifier: extension.identifier, version: extension.manifest.version, location: extension.location, metadata };
                        extensionsToAdd.push(extensionToAdd);
                        result.push(extensionToAdd);
                    }
                }
                if (extensionsToAdd.length) {
                    this._onAddExtensions.fire({ extensions: extensionsToAdd, profileLocation });
                }
                if (extensionsToRemove.length) {
                    this._onRemoveExtensions.fire({ extensions: extensionsToRemove, profileLocation });
                }
                return result;
            });
            if (extensionsToAdd.length) {
                this._onDidAddExtensions.fire({ extensions: extensionsToAdd, profileLocation });
            }
            if (extensionsToRemove.length) {
                this._onDidRemoveExtensions.fire({ extensions: extensionsToRemove, profileLocation });
            }
            return extensionsToAdd;
        }
        catch (error) {
            if (extensionsToAdd.length) {
                this._onDidAddExtensions.fire({ extensions: extensionsToAdd, error, profileLocation });
            }
            if (extensionsToRemove.length) {
                this._onDidRemoveExtensions.fire({ extensions: extensionsToRemove, error, profileLocation });
            }
            throw error;
        }
    }
    async removeExtensionFromProfile(extension, profileLocation) {
        const extensionsToRemove = [];
        this._onRemoveExtensions.fire({ extensions: extensionsToRemove, profileLocation });
        try {
            await this.withProfileExtensions(profileLocation, profileExtensions => {
                const result = [];
                for (const e of profileExtensions) {
                    if (areSameExtensions(e.identifier, extension.identifier)) {
                        extensionsToRemove.push(e);
                    }
                    else {
                        result.push(e);
                    }
                }
                if (extensionsToRemove.length) {
                    this._onRemoveExtensions.fire({ extensions: extensionsToRemove, profileLocation });
                }
                return result;
            });
            if (extensionsToRemove.length) {
                this._onDidRemoveExtensions.fire({ extensions: extensionsToRemove, profileLocation });
            }
        }
        catch (error) {
            if (extensionsToRemove.length) {
                this._onDidRemoveExtensions.fire({ extensions: extensionsToRemove, error, profileLocation });
            }
            throw error;
        }
    }
    async withProfileExtensions(file, updateFn) {
        return this.getResourceAccessQueue(file).queue(async () => {
            let extensions = [];
            // Read
            try {
                const content = await this.fileService.readFile(file);
                const storedWebExtensions = JSON.parse(content.value.toString());
                for (const e of storedWebExtensions) {
                    if (!e.identifier) {
                        this.logService.info('Ignoring invalid extension while scanning. Identifier does not exist.', e);
                        continue;
                    }
                    if (!e.location) {
                        this.logService.info('Ignoring invalid extension while scanning. Location does not exist.', e);
                        continue;
                    }
                    if (!e.version) {
                        this.logService.info('Ignoring invalid extension while scanning. Version does not exist.', e);
                        continue;
                    }
                    extensions.push({
                        identifier: e.identifier,
                        location: URI.revive(e.location),
                        version: e.version,
                        metadata: e.metadata,
                    });
                }
            }
            catch (error) {
                /* Ignore */
                if (error.fileOperationResult !== 1 /* FileOperationResult.FILE_NOT_FOUND */) {
                    this.logService.error(error);
                }
            }
            // Update
            if (updateFn) {
                extensions = updateFn(extensions);
                const storedProfileExtensions = extensions.map(e => ({
                    identifier: e.identifier,
                    version: e.version,
                    location: e.location.toJSON(),
                    metadata: e.metadata
                }));
                await this.fileService.writeFile(file, VSBuffer.fromString(JSON.stringify(storedProfileExtensions)));
            }
            return extensions;
        });
    }
    getResourceAccessQueue(file) {
        let resourceQueue = this.resourcesAccessQueueMap.get(file);
        if (!resourceQueue) {
            resourceQueue = new Queue();
            this.resourcesAccessQueueMap.set(file, resourceQueue);
        }
        return resourceQueue;
    }
};
ExtensionsProfileScannerService = __decorate([
    __param(0, IFileService),
    __param(1, ILogService)
], ExtensionsProfileScannerService);
export { ExtensionsProfileScannerService };

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { joinPath } from 'vs/base/common/resources';
import { VSBuffer } from 'vs/base/common/buffer';
import { Queue } from 'vs/base/common/async';
export class ConfigurationCache {
    donotCacheResourcesWithSchemes;
    fileService;
    cacheHome;
    cachedConfigurations = new Map();
    constructor(donotCacheResourcesWithSchemes, environmentService, fileService) {
        this.donotCacheResourcesWithSchemes = donotCacheResourcesWithSchemes;
        this.fileService = fileService;
        this.cacheHome = environmentService.cacheHome;
    }
    needsCaching(resource) {
        // Cache all non native resources
        return !this.donotCacheResourcesWithSchemes.includes(resource.scheme);
    }
    read(key) {
        return this.getCachedConfiguration(key).read();
    }
    write(key, content) {
        return this.getCachedConfiguration(key).save(content);
    }
    remove(key) {
        return this.getCachedConfiguration(key).remove();
    }
    getCachedConfiguration({ type, key }) {
        const k = `${type}:${key}`;
        let cachedConfiguration = this.cachedConfigurations.get(k);
        if (!cachedConfiguration) {
            cachedConfiguration = new CachedConfiguration({ type, key }, this.cacheHome, this.fileService);
            this.cachedConfigurations.set(k, cachedConfiguration);
        }
        return cachedConfiguration;
    }
}
class CachedConfiguration {
    fileService;
    queue;
    cachedConfigurationFolderResource;
    cachedConfigurationFileResource;
    constructor({ type, key }, cacheHome, fileService) {
        this.fileService = fileService;
        this.cachedConfigurationFolderResource = joinPath(cacheHome, 'CachedConfigurations', type, key);
        this.cachedConfigurationFileResource = joinPath(this.cachedConfigurationFolderResource, type === 'workspaces' ? 'workspace.json' : 'configuration.json');
        this.queue = new Queue();
    }
    async read() {
        try {
            const content = await this.fileService.readFile(this.cachedConfigurationFileResource);
            return content.value.toString();
        }
        catch (e) {
            return '';
        }
    }
    async save(content) {
        const created = await this.createCachedFolder();
        if (created) {
            await this.queue.queue(async () => {
                await this.fileService.writeFile(this.cachedConfigurationFileResource, VSBuffer.fromString(content));
            });
        }
    }
    async remove() {
        try {
            await this.queue.queue(() => this.fileService.del(this.cachedConfigurationFolderResource, { recursive: true, useTrash: false }));
        }
        catch (error) {
            if (error.fileOperationResult !== 1 /* FileOperationResult.FILE_NOT_FOUND */) {
                throw error;
            }
        }
    }
    async createCachedFolder() {
        if (await this.fileService.exists(this.cachedConfigurationFolderResource)) {
            return true;
        }
        try {
            await this.fileService.createFolder(this.cachedConfigurationFolderResource);
            return true;
        }
        catch (error) {
            return false;
        }
    }
}

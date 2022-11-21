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
import { RunOnceScheduler } from 'vs/base/common/async';
import { onUnexpectedError } from 'vs/base/common/errors';
import { Disposable } from 'vs/base/common/lifecycle';
import { basename, dirname, join } from 'vs/base/common/path';
import { Promises } from 'vs/base/node/pfs';
import { ILogService } from 'vs/platform/log/common/log';
import { IProductService } from 'vs/platform/product/common/productService';
let CodeCacheCleaner = class CodeCacheCleaner extends Disposable {
    productService;
    logService;
    _DataMaxAge = this.productService.quality !== 'stable'
        ? 1000 * 60 * 60 * 24 * 7 // roughly 1 week (insiders)
        : 1000 * 60 * 60 * 24 * 30 * 3; // roughly 3 months (stable)
    constructor(currentCodeCachePath, productService, logService) {
        super();
        this.productService = productService;
        this.logService = logService;
        // Cached data is stored as user data and we run a cleanup task every time
        // the editor starts. The strategy is to delete all files that are older than
        // 3 months (1 week respectively)
        if (currentCodeCachePath) {
            const scheduler = this._register(new RunOnceScheduler(() => {
                this.cleanUpCodeCaches(currentCodeCachePath);
            }, 30 * 1000 /* after 30s */));
            scheduler.schedule();
        }
    }
    async cleanUpCodeCaches(currentCodeCachePath) {
        this.logService.trace('[code cache cleanup]: Starting to clean up old code cache folders.');
        try {
            const now = Date.now();
            // The folder which contains folders of cached data.
            // Each of these folders is partioned per commit
            const codeCacheRootPath = dirname(currentCodeCachePath);
            const currentCodeCache = basename(currentCodeCachePath);
            const codeCaches = await Promises.readdir(codeCacheRootPath);
            await Promise.all(codeCaches.map(async (codeCache) => {
                if (codeCache === currentCodeCache) {
                    return; // not the current cache folder
                }
                // Delete cache folder if old enough
                const codeCacheEntryPath = join(codeCacheRootPath, codeCache);
                const codeCacheEntryStat = await Promises.stat(codeCacheEntryPath);
                if (codeCacheEntryStat.isDirectory() && (now - codeCacheEntryStat.mtime.getTime()) > this._DataMaxAge) {
                    this.logService.trace(`[code cache cleanup]: Removing code cache folder ${codeCache}.`);
                    return Promises.rm(codeCacheEntryPath);
                }
            }));
        }
        catch (error) {
            onUnexpectedError(error);
        }
    }
};
CodeCacheCleaner = __decorate([
    __param(1, IProductService),
    __param(2, ILogService)
], CodeCacheCleaner);
export { CodeCacheCleaner };

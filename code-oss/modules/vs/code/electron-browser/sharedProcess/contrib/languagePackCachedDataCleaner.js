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
import { join } from 'vs/base/common/path';
import { Promises } from 'vs/base/node/pfs';
import { INativeEnvironmentService } from 'vs/platform/environment/common/environment';
import { ILogService } from 'vs/platform/log/common/log';
import { IProductService } from 'vs/platform/product/common/productService';
let LanguagePackCachedDataCleaner = class LanguagePackCachedDataCleaner extends Disposable {
    environmentService;
    logService;
    productService;
    _DataMaxAge = this.productService.quality !== 'stable'
        ? 1000 * 60 * 60 * 24 * 7 // roughly 1 week (insiders)
        : 1000 * 60 * 60 * 24 * 30 * 3; // roughly 3 months (stable)
    constructor(environmentService, logService, productService) {
        super();
        this.environmentService = environmentService;
        this.logService = logService;
        this.productService = productService;
        // We have no Language pack support for dev version (run from source)
        // So only cleanup when we have a build version.
        if (this.environmentService.isBuilt) {
            const scheduler = this._register(new RunOnceScheduler(() => {
                this.cleanUpLanguagePackCache();
            }, 40 * 1000 /* after 40s */));
            scheduler.schedule();
        }
    }
    async cleanUpLanguagePackCache() {
        this.logService.trace('[language pack cache cleanup]: Starting to clean up unused language packs.');
        try {
            const installed = Object.create(null);
            const metaData = JSON.parse(await Promises.readFile(join(this.environmentService.userDataPath, 'languagepacks.json'), 'utf8'));
            for (const locale of Object.keys(metaData)) {
                const entry = metaData[locale];
                installed[`${entry.hash}.${locale}`] = true;
            }
            // Cleanup entries for language packs that aren't installed anymore
            const cacheDir = join(this.environmentService.userDataPath, 'clp');
            const cacheDirExists = await Promises.exists(cacheDir);
            if (!cacheDirExists) {
                return;
            }
            const entries = await Promises.readdir(cacheDir);
            for (const entry of entries) {
                if (installed[entry]) {
                    this.logService.trace(`[language pack cache cleanup]: Skipping folder ${entry}. Language pack still in use.`);
                    continue;
                }
                this.logService.trace(`[language pack cache cleanup]: Removing unused language pack: ${entry}`);
                await Promises.rm(join(cacheDir, entry));
            }
            const now = Date.now();
            for (const packEntry of Object.keys(installed)) {
                const folder = join(cacheDir, packEntry);
                const entries = await Promises.readdir(folder);
                for (const entry of entries) {
                    if (entry === 'tcf.json') {
                        continue;
                    }
                    const candidate = join(folder, entry);
                    const stat = await Promises.stat(candidate);
                    if (stat.isDirectory() && (now - stat.mtime.getTime()) > this._DataMaxAge) {
                        this.logService.trace(`[language pack cache cleanup]: Removing language pack cache folder: ${join(packEntry, entry)}`);
                        await Promises.rm(candidate);
                    }
                }
            }
        }
        catch (error) {
            onUnexpectedError(error);
        }
    }
};
LanguagePackCachedDataCleaner = __decorate([
    __param(0, INativeEnvironmentService),
    __param(1, ILogService),
    __param(2, IProductService)
], LanguagePackCachedDataCleaner);
export { LanguagePackCachedDataCleaner };

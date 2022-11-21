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
import { isNonEmptyArray } from 'vs/base/common/arrays';
import { CancellationToken } from 'vs/base/common/cancellation';
import { Disposable } from 'vs/base/common/lifecycle';
import { joinPath } from 'vs/base/common/resources';
import { getDomainsOfRemotes } from 'vs/platform/extensionManagement/common/configRemotes';
import { IFileService } from 'vs/platform/files/common/files';
import { ILogService } from 'vs/platform/log/common/log';
import { IProductService } from 'vs/platform/product/common/productService';
import { asJson, IRequestService } from 'vs/platform/request/common/request';
let ExtensionTipsService = class ExtensionTipsService extends Disposable {
    fileService;
    productService;
    requestService;
    logService;
    _serviceBrand;
    allConfigBasedTips = new Map();
    constructor(fileService, productService, requestService, logService) {
        super();
        this.fileService = fileService;
        this.productService = productService;
        this.requestService = requestService;
        this.logService = logService;
        if (this.productService.configBasedExtensionTips) {
            Object.entries(this.productService.configBasedExtensionTips).forEach(([, value]) => this.allConfigBasedTips.set(value.configPath, value));
        }
    }
    getConfigBasedTips(folder) {
        return this.getValidConfigBasedTips(folder);
    }
    getAllWorkspacesTips() {
        return this.fetchWorkspacesTips();
    }
    async getImportantExecutableBasedTips() {
        return [];
    }
    async getOtherExecutableBasedTips() {
        return [];
    }
    async getValidConfigBasedTips(folder) {
        const result = [];
        for (const [configPath, tip] of this.allConfigBasedTips) {
            if (tip.configScheme && tip.configScheme !== folder.scheme) {
                continue;
            }
            try {
                const content = await this.fileService.readFile(joinPath(folder, configPath));
                const recommendationByRemote = new Map();
                Object.entries(tip.recommendations).forEach(([key, value]) => {
                    if (isNonEmptyArray(value.remotes)) {
                        for (const remote of value.remotes) {
                            recommendationByRemote.set(remote, {
                                extensionId: key,
                                extensionName: value.name,
                                configName: tip.configName,
                                important: !!value.important,
                                isExtensionPack: !!value.isExtensionPack,
                                whenNotInstalled: value.whenNotInstalled
                            });
                        }
                    }
                    else {
                        result.push({
                            extensionId: key,
                            extensionName: value.name,
                            configName: tip.configName,
                            important: !!value.important,
                            isExtensionPack: !!value.isExtensionPack,
                            whenNotInstalled: value.whenNotInstalled
                        });
                    }
                });
                const domains = getDomainsOfRemotes(content.value.toString(), [...recommendationByRemote.keys()]);
                for (const domain of domains) {
                    const remote = recommendationByRemote.get(domain);
                    if (remote) {
                        result.push(remote);
                    }
                }
            }
            catch (error) { /* Ignore */ }
        }
        return result;
    }
    async fetchWorkspacesTips() {
        if (!this.productService.extensionsGallery?.recommendationsUrl) {
            return [];
        }
        try {
            const context = await this.requestService.request({ type: 'GET', url: this.productService.extensionsGallery?.recommendationsUrl }, CancellationToken.None);
            if (context.res.statusCode !== 200) {
                return [];
            }
            const result = await asJson(context);
            if (!result) {
                return [];
            }
            return result.workspaceRecommendations || [];
        }
        catch (error) {
            this.logService.error(error);
            return [];
        }
    }
};
ExtensionTipsService = __decorate([
    __param(0, IFileService),
    __param(1, IProductService),
    __param(2, IRequestService),
    __param(3, ILogService)
], ExtensionTipsService);
export { ExtensionTipsService };

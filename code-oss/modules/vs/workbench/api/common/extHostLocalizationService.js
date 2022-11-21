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
import { LANGUAGE_DEFAULT } from 'vs/base/common/platform';
import { format2 } from 'vs/base/common/strings';
import { URI } from 'vs/base/common/uri';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { ILogService } from 'vs/platform/log/common/log';
import { MainContext } from 'vs/workbench/api/common/extHost.protocol';
import { IExtHostInitDataService } from 'vs/workbench/api/common/extHostInitDataService';
import { IExtHostRpcService } from 'vs/workbench/api/common/extHostRpcService';
let ExtHostLocalizationService = class ExtHostLocalizationService {
    logService;
    _serviceBrand;
    _proxy;
    currentLanguage;
    isDefaultLanguage;
    bundleCache = new Map();
    constructor(initData, rpc, logService) {
        this.logService = logService;
        this._proxy = rpc.getProxy(MainContext.MainThreadLocalization);
        this.currentLanguage = initData.environment.appLanguage;
        this.isDefaultLanguage = this.currentLanguage === LANGUAGE_DEFAULT;
    }
    getMessage(extensionId, details) {
        const { message, args, comment } = details;
        if (this.isDefaultLanguage) {
            return format2(message, (args ?? {}));
        }
        let key = message;
        if (comment && comment.length > 0) {
            key += `/${Array.isArray(comment) ? comment.join() : comment}`;
        }
        const str = this.bundleCache.get(extensionId)?.contents[key];
        if (!str) {
            this.logService.warn(`Using default string since no string found in i18n bundle that has the key: ${key}`);
        }
        return format2(str ?? message, (args ?? {}));
    }
    getBundle(extensionId) {
        return this.bundleCache.get(extensionId)?.contents;
    }
    getBundleUri(extensionId) {
        return this.bundleCache.get(extensionId)?.uri;
    }
    async initializeLocalizedMessages(extension) {
        if (this.isDefaultLanguage
            // TODO: support builtin extensions
            || (!extension.l10n && !extension.isBuiltin)) {
            return;
        }
        if (this.bundleCache.has(extension.identifier.value)) {
            return;
        }
        let contents;
        const bundleUri = await this.getBundleLocation(extension);
        if (!bundleUri) {
            this.logService.error(`No bundle location found for extension ${extension.identifier.value}`);
            return;
        }
        try {
            const response = await this._proxy.$fetchBundleContents(bundleUri);
            const result = JSON.parse(response);
            // 'contents.bundle' is a well-known key in the language pack json file that contains the _code_ translations for the extension
            contents = extension.isBuiltin ? result.contents?.bundle : result;
        }
        catch (e) {
            this.logService.error(`Failed to load translations for ${extension.identifier.value} from ${bundleUri}: ${e.message}`);
            return;
        }
        if (contents) {
            this.bundleCache.set(extension.identifier.value, {
                contents,
                uri: bundleUri
            });
        }
    }
    async getBundleLocation(extension) {
        if (extension.isBuiltin) {
            const uri = await this._proxy.$fetchBuiltInBundleUri(extension.identifier.value);
            return URI.revive(uri);
        }
        return extension.l10n
            ? URI.joinPath(extension.extensionLocation, extension.l10n, `bundle.l10n.${this.currentLanguage}.json`)
            : undefined;
    }
};
ExtHostLocalizationService = __decorate([
    __param(0, IExtHostInitDataService),
    __param(1, IExtHostRpcService),
    __param(2, ILogService)
], ExtHostLocalizationService);
export { ExtHostLocalizationService };
export const IExtHostLocalizationService = createDecorator('IExtHostLocalizationService');

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
import { CancellationTokenSource } from 'vs/base/common/cancellation';
import { Language } from 'vs/base/common/platform';
import { URI } from 'vs/base/common/uri';
import { IExtensionGalleryService } from 'vs/platform/extensionManagement/common/extensionManagement';
import { IExtensionResourceLoaderService } from 'vs/platform/extensionResourceLoader/common/extensionResourceLoader';
import { LanguagePackBaseService } from 'vs/platform/languagePacks/common/languagePacks';
import { ILogService } from 'vs/platform/log/common/log';
let WebLanguagePacksService = class WebLanguagePacksService extends LanguagePackBaseService {
    extensionResourceLoaderService;
    logService;
    constructor(extensionResourceLoaderService, extensionGalleryService, logService) {
        super(extensionGalleryService);
        this.extensionResourceLoaderService = extensionResourceLoaderService;
        this.logService = logService;
    }
    async getBuiltInExtensionTranslationsUri(id) {
        const queryTimeout = new CancellationTokenSource();
        setTimeout(() => queryTimeout.cancel(), 1000);
        // First get the extensions that supports the language (there should only be one but just in case let's include more results)
        let result;
        try {
            result = await this.extensionGalleryService.query({
                text: `tag:"lp-${Language.value()}"`,
                pageSize: 5
            }, queryTimeout.token);
        }
        catch (err) {
            this.logService.error(err);
            return undefined;
        }
        const languagePackExtensions = result.firstPage.find(e => e.properties.localizedLanguages?.length);
        if (!languagePackExtensions) {
            this.logService.trace(`No language pack found for language ${Language.value()}`);
            return undefined;
        }
        // Then get the manifest for that extension
        const manifestTimeout = new CancellationTokenSource();
        setTimeout(() => queryTimeout.cancel(), 1000);
        const manifest = await this.extensionGalleryService.getManifest(languagePackExtensions, manifestTimeout.token);
        // Find the translation from the language pack
        const localization = manifest?.contributes?.localizations?.find(l => l.languageId === Language.value());
        const translation = localization?.translations.find(t => t.id === id);
        if (!translation) {
            this.logService.trace(`No translation found for id '${id}, in ${manifest?.name}`);
            return undefined;
        }
        // get the resource uri and return it
        const uri = this.extensionResourceLoaderService.getExtensionGalleryResourceURL({
            // If translation is defined then manifest should have been defined.
            name: manifest.name,
            publisher: manifest.publisher,
            version: manifest.version
        });
        if (!uri) {
            this.logService.trace('Gallery does not provide extension resources.');
            return undefined;
        }
        return URI.joinPath(uri, translation.path);
    }
    // Web doesn't have a concept of language packs, so we just return an empty array
    getInstalledLanguages() {
        return Promise.resolve([]);
    }
};
WebLanguagePacksService = __decorate([
    __param(0, IExtensionResourceLoaderService),
    __param(1, IExtensionGalleryService),
    __param(2, ILogService)
], WebLanguagePacksService);
export { WebLanguagePacksService };

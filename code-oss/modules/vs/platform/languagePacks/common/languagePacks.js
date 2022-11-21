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
import { Disposable } from 'vs/base/common/lifecycle';
import { language } from 'vs/base/common/platform';
import { localize } from 'vs/nls';
import { IExtensionGalleryService } from 'vs/platform/extensionManagement/common/extensionManagement';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
export const ILanguagePackService = createDecorator('languagePackService');
let LanguagePackBaseService = class LanguagePackBaseService extends Disposable {
    extensionGalleryService;
    constructor(extensionGalleryService) {
        super();
        this.extensionGalleryService = extensionGalleryService;
    }
    async getAvailableLanguages() {
        const timeout = new CancellationTokenSource();
        setTimeout(() => timeout.cancel(), 1000);
        let result;
        try {
            result = await this.extensionGalleryService.query({
                text: 'category:"language packs"',
                pageSize: 20
            }, timeout.token);
        }
        catch (_) {
            // This method is best effort. So, we ignore any errors.
            return [];
        }
        const languagePackExtensions = result.firstPage.filter(e => e.properties.localizedLanguages?.length && e.tags.some(t => t.startsWith('lp-')));
        const allFromMarketplace = languagePackExtensions.map(lp => {
            const languageName = lp.properties.localizedLanguages?.[0];
            const locale = this.getLocale(lp);
            const baseQuickPick = this.createQuickPickItem(locale, languageName, lp);
            return {
                ...baseQuickPick,
                extensionId: lp.identifier.id,
                galleryExtension: lp
            };
        });
        allFromMarketplace.push({
            ...this.createQuickPickItem('en', 'English'),
            extensionId: 'default',
        });
        return allFromMarketplace;
    }
    getLocale(extension) {
        return extension.tags.find(t => t.startsWith('lp-'))?.split('lp-')[1];
    }
    createQuickPickItem(locale, languageName, languagePack) {
        const label = languageName ?? locale;
        let description;
        if (label !== locale) {
            description = `(${locale})`;
        }
        if (locale.toLowerCase() === language.toLowerCase()) {
            description ??= '';
            description += localize('currentDisplayLanguage', " (Current)");
        }
        if (languagePack?.installCount) {
            description ??= '';
            const count = languagePack.installCount;
            let countLabel;
            if (count > 1000000) {
                countLabel = `${Math.floor(count / 100000) / 10}M`;
            }
            else if (count > 1000) {
                countLabel = `${Math.floor(count / 1000)}K`;
            }
            else {
                countLabel = String(count);
            }
            description += ` $(cloud-download) ${countLabel}`;
        }
        return {
            id: locale,
            label,
            description
        };
    }
};
LanguagePackBaseService = __decorate([
    __param(0, IExtensionGalleryService)
], LanguagePackBaseService);
export { LanguagePackBaseService };

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
import { createHash } from 'crypto';
import { equals } from 'vs/base/common/arrays';
import { Queue } from 'vs/base/common/async';
import { Disposable } from 'vs/base/common/lifecycle';
import { Schemas } from 'vs/base/common/network';
import { join } from 'vs/base/common/path';
import { Promises } from 'vs/base/node/pfs';
import { INativeEnvironmentService } from 'vs/platform/environment/common/environment';
import { IExtensionGalleryService, IExtensionManagementService } from 'vs/platform/extensionManagement/common/extensionManagement';
import { areSameExtensions } from 'vs/platform/extensionManagement/common/extensionManagementUtil';
import { ILogService } from 'vs/platform/log/common/log';
import { LanguagePackBaseService } from 'vs/platform/languagePacks/common/languagePacks';
import { Language } from 'vs/base/common/platform';
import { URI } from 'vs/base/common/uri';
let NativeLanguagePackService = class NativeLanguagePackService extends LanguagePackBaseService {
    extensionManagementService;
    logService;
    cache;
    constructor(extensionManagementService, environmentService, extensionGalleryService, logService) {
        super(extensionGalleryService);
        this.extensionManagementService = extensionManagementService;
        this.logService = logService;
        this.cache = this._register(new LanguagePacksCache(environmentService, logService));
        this.extensionManagementService.registerParticipant({
            postInstall: async (extension) => {
                return this.postInstallExtension(extension);
            },
            postUninstall: async (extension) => {
                return this.postUninstallExtension(extension);
            }
        });
    }
    async getBuiltInExtensionTranslationsUri(id) {
        const packs = await this.cache.getLanguagePacks();
        const pack = packs[Language.value()];
        if (!pack) {
            this.logService.warn(`No language pack found for ${Language.value()}`);
            return undefined;
        }
        const translation = pack.translations[id];
        return translation ? URI.file(translation) : undefined;
    }
    async getInstalledLanguages() {
        const languagePacks = await this.cache.getLanguagePacks();
        const languages = Object.keys(languagePacks).map(locale => {
            const languagePack = languagePacks[locale];
            const baseQuickPick = this.createQuickPickItem(locale, languagePack.label);
            return {
                ...baseQuickPick,
                extensionId: languagePack.extensions[0].extensionIdentifier.id,
            };
        });
        languages.push({
            ...this.createQuickPickItem('en', 'English'),
            extensionId: 'default',
        });
        languages.sort((a, b) => a.label.localeCompare(b.label));
        return languages;
    }
    async postInstallExtension(extension) {
        if (extension && extension.manifest && extension.manifest.contributes && extension.manifest.contributes.localizations && extension.manifest.contributes.localizations.length) {
            this.logService.info('Adding language packs from the extension', extension.identifier.id);
            await this.update();
        }
    }
    async postUninstallExtension(extension) {
        const languagePacks = await this.cache.getLanguagePacks();
        if (Object.keys(languagePacks).some(language => languagePacks[language] && languagePacks[language].extensions.some(e => areSameExtensions(e.extensionIdentifier, extension.identifier)))) {
            this.logService.info('Removing language packs from the extension', extension.identifier.id);
            await this.update();
        }
    }
    async update() {
        const [current, installed] = await Promise.all([this.cache.getLanguagePacks(), this.extensionManagementService.getInstalled()]);
        const updated = await this.cache.update(installed);
        return !equals(Object.keys(current), Object.keys(updated));
    }
};
NativeLanguagePackService = __decorate([
    __param(0, IExtensionManagementService),
    __param(1, INativeEnvironmentService),
    __param(2, IExtensionGalleryService),
    __param(3, ILogService)
], NativeLanguagePackService);
export { NativeLanguagePackService };
let LanguagePacksCache = class LanguagePacksCache extends Disposable {
    logService;
    languagePacks = {};
    languagePacksFilePath;
    languagePacksFileLimiter;
    initializedCache;
    constructor(environmentService, logService) {
        super();
        this.logService = logService;
        this.languagePacksFilePath = join(environmentService.userDataPath, 'languagepacks.json');
        this.languagePacksFileLimiter = new Queue();
    }
    getLanguagePacks() {
        // if queue is not empty, fetch from disk
        if (this.languagePacksFileLimiter.size || !this.initializedCache) {
            return this.withLanguagePacks()
                .then(() => this.languagePacks);
        }
        return Promise.resolve(this.languagePacks);
    }
    update(extensions) {
        return this.withLanguagePacks(languagePacks => {
            Object.keys(languagePacks).forEach(language => delete languagePacks[language]);
            this.createLanguagePacksFromExtensions(languagePacks, ...extensions);
        }).then(() => this.languagePacks);
    }
    createLanguagePacksFromExtensions(languagePacks, ...extensions) {
        for (const extension of extensions) {
            if (extension && extension.manifest && extension.manifest.contributes && extension.manifest.contributes.localizations && extension.manifest.contributes.localizations.length) {
                this.createLanguagePacksFromExtension(languagePacks, extension);
            }
        }
        Object.keys(languagePacks).forEach(languageId => this.updateHash(languagePacks[languageId]));
    }
    createLanguagePacksFromExtension(languagePacks, extension) {
        const extensionIdentifier = extension.identifier;
        const localizations = extension.manifest.contributes && extension.manifest.contributes.localizations ? extension.manifest.contributes.localizations : [];
        for (const localizationContribution of localizations) {
            if (extension.location.scheme === Schemas.file && isValidLocalization(localizationContribution)) {
                let languagePack = languagePacks[localizationContribution.languageId];
                if (!languagePack) {
                    languagePack = {
                        hash: '',
                        extensions: [],
                        translations: {},
                        label: localizationContribution.localizedLanguageName ?? localizationContribution.languageName
                    };
                    languagePacks[localizationContribution.languageId] = languagePack;
                }
                const extensionInLanguagePack = languagePack.extensions.filter(e => areSameExtensions(e.extensionIdentifier, extensionIdentifier))[0];
                if (extensionInLanguagePack) {
                    extensionInLanguagePack.version = extension.manifest.version;
                }
                else {
                    languagePack.extensions.push({ extensionIdentifier, version: extension.manifest.version });
                }
                for (const translation of localizationContribution.translations) {
                    languagePack.translations[translation.id] = join(extension.location.fsPath, translation.path);
                }
            }
        }
    }
    updateHash(languagePack) {
        if (languagePack) {
            const md5 = createHash('md5');
            for (const extension of languagePack.extensions) {
                md5.update(extension.extensionIdentifier.uuid || extension.extensionIdentifier.id).update(extension.version);
            }
            languagePack.hash = md5.digest('hex');
        }
    }
    withLanguagePacks(fn = () => null) {
        return this.languagePacksFileLimiter.queue(() => {
            let result = null;
            return Promises.readFile(this.languagePacksFilePath, 'utf8')
                .then(undefined, err => err.code === 'ENOENT' ? Promise.resolve('{}') : Promise.reject(err))
                .then(raw => { try {
                return JSON.parse(raw);
            }
            catch (e) {
                return {};
            } })
                .then(languagePacks => { result = fn(languagePacks); return languagePacks; })
                .then(languagePacks => {
                for (const language of Object.keys(languagePacks)) {
                    if (!languagePacks[language]) {
                        delete languagePacks[language];
                    }
                }
                this.languagePacks = languagePacks;
                this.initializedCache = true;
                const raw = JSON.stringify(this.languagePacks);
                this.logService.debug('Writing language packs', raw);
                return Promises.writeFile(this.languagePacksFilePath, raw);
            })
                .then(() => result, error => this.logService.error(error));
        });
    }
};
LanguagePacksCache = __decorate([
    __param(0, INativeEnvironmentService),
    __param(1, ILogService)
], LanguagePacksCache);
function isValidLocalization(localization) {
    if (typeof localization.languageId !== 'string') {
        return false;
    }
    if (!Array.isArray(localization.translations) || localization.translations.length === 0) {
        return false;
    }
    for (const translation of localization.translations) {
        if (typeof translation.id !== 'string') {
            return false;
        }
        if (typeof translation.path !== 'string') {
            return false;
        }
    }
    if (localization.languageName && typeof localization.languageName !== 'string') {
        return false;
    }
    if (localization.localizedLanguageName && typeof localization.localizedLanguageName !== 'string') {
        return false;
    }
    return true;
}

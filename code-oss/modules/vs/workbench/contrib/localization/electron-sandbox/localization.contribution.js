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
import { localize } from 'vs/nls';
import { Registry } from 'vs/platform/registry/common/platform';
import { Extensions as WorkbenchExtensions } from 'vs/workbench/common/contributions';
import { Disposable } from 'vs/base/common/lifecycle';
import { ExtensionsRegistry } from 'vs/workbench/services/extensions/common/extensionsRegistry';
import * as platform from 'vs/base/common/platform';
import { IExtensionManagementService, IExtensionGalleryService } from 'vs/platform/extensionManagement/common/extensionManagement';
import { INotificationService, NeverShowAgainScope } from 'vs/platform/notification/common/notification';
import Severity from 'vs/base/common/severity';
import { IJSONEditingService } from 'vs/workbench/services/configuration/common/jsonEditing';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { IHostService } from 'vs/workbench/services/host/browser/host';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { VIEWLET_ID as EXTENSIONS_VIEWLET_ID } from 'vs/workbench/contrib/extensions/common/extensions';
import { minimumTranslatedStrings } from 'vs/workbench/contrib/localization/electron-sandbox/minimalTranslations';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { CancellationToken } from 'vs/base/common/cancellation';
import { IPaneCompositePartService } from 'vs/workbench/services/panecomposite/browser/panecomposite';
import { registerAction2 } from 'vs/platform/actions/common/actions';
import { ClearDisplayLanguageAction, ConfigureDisplayLanguageAction } from 'vs/workbench/contrib/localization/browser/localizationsActions';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { ILocaleService } from 'vs/workbench/contrib/localization/common/locale';
import { NativeLocaleService } from 'vs/workbench/contrib/localization/electron-sandbox/localeService';
registerSingleton(ILocaleService, NativeLocaleService, 1 /* InstantiationType.Delayed */);
// Register action to configure locale and related settings
registerAction2(ConfigureDisplayLanguageAction);
registerAction2(ClearDisplayLanguageAction);
const LANGUAGEPACK_SUGGESTION_IGNORE_STORAGE_KEY = 'extensionsAssistant/languagePackSuggestionIgnore';
let LocalizationWorkbenchContribution = class LocalizationWorkbenchContribution extends Disposable {
    notificationService;
    jsonEditingService;
    environmentService;
    hostService;
    storageService;
    extensionManagementService;
    galleryService;
    paneCompositeService;
    telemetryService;
    constructor(notificationService, jsonEditingService, environmentService, hostService, storageService, extensionManagementService, galleryService, paneCompositeService, telemetryService) {
        super();
        this.notificationService = notificationService;
        this.jsonEditingService = jsonEditingService;
        this.environmentService = environmentService;
        this.hostService = hostService;
        this.storageService = storageService;
        this.extensionManagementService = extensionManagementService;
        this.galleryService = galleryService;
        this.paneCompositeService = paneCompositeService;
        this.telemetryService = telemetryService;
        this.checkAndInstall();
        this._register(this.extensionManagementService.onDidInstallExtensions(e => this.onDidInstallExtensions(e)));
    }
    onDidInstallExtensions(results) {
        for (const e of results) {
            if (e.local && e.operation === 2 /* InstallOperation.Install */ && e.local.manifest.contributes && e.local.manifest.contributes.localizations && e.local.manifest.contributes.localizations.length) {
                const locale = e.local.manifest.contributes.localizations[0].languageId;
                if (platform.language !== locale) {
                    const updateAndRestart = platform.locale !== locale;
                    this.notificationService.prompt(Severity.Info, updateAndRestart ? localize('updateLocale', "Would you like to change VS Code's UI language to {0} and restart?", e.local.manifest.contributes.localizations[0].languageName || e.local.manifest.contributes.localizations[0].languageId)
                        : localize('activateLanguagePack', "In order to use VS Code in {0}, VS Code needs to restart.", e.local.manifest.contributes.localizations[0].languageName || e.local.manifest.contributes.localizations[0].languageId), [{
                            label: updateAndRestart ? localize('changeAndRestart', "Change Language and Restart") : localize('restart', "Restart"),
                            run: () => {
                                const updatePromise = updateAndRestart ? this.jsonEditingService.write(this.environmentService.argvResource, [{ path: ['locale'], value: locale }], true) : Promise.resolve(undefined);
                                updatePromise.then(() => this.hostService.restart(), e => this.notificationService.error(e));
                            }
                        }, {
                            label: updateAndRestart ? localize('doNotChangeAndRestart', "Don't Change Language") : localize('doNotRestart', "Don't Restart"),
                            run: () => { }
                        }], {
                        sticky: true,
                        neverShowAgain: { id: 'langugage.update.donotask', isSecondary: true, scope: NeverShowAgainScope.APPLICATION }
                    });
                }
            }
        }
    }
    checkAndInstall() {
        const language = platform.language;
        let locale = platform.locale ?? '';
        if (locale.startsWith('zh-hans')) {
            locale = 'zh-cn';
        }
        else if (locale.startsWith('zh-hant')) {
            locale = 'zh-tw';
        }
        const languagePackSuggestionIgnoreList = JSON.parse(this.storageService.get(LANGUAGEPACK_SUGGESTION_IGNORE_STORAGE_KEY, -1 /* StorageScope.APPLICATION */, '[]'));
        if (!this.galleryService.isEnabled()) {
            return;
        }
        if (!language || !locale || locale === 'en' || locale.indexOf('en-') === 0) {
            return;
        }
        if (locale.startsWith(language) || languagePackSuggestionIgnoreList.includes(locale)) {
            return;
        }
        this.isLocaleInstalled(locale)
            .then(async (installed) => {
            if (installed) {
                return;
            }
            let searchLocale = locale;
            let tagResult = await this.galleryService.query({ text: `tag:lp-${searchLocale}` }, CancellationToken.None);
            if (tagResult.total === 0) {
                // Trim the locale and try again.
                searchLocale = locale.split('-')[0];
                tagResult = await this.galleryService.query({ text: `tag:lp-${searchLocale}` }, CancellationToken.None);
                if (tagResult.total === 0) {
                    return;
                }
            }
            const extensionToInstall = tagResult.total === 1 ? tagResult.firstPage[0] : tagResult.firstPage.find(e => e.publisher === 'MS-CEINTL' && e.name.startsWith('vscode-language-pack'));
            const extensionToFetchTranslationsFrom = extensionToInstall ?? tagResult.firstPage[0];
            if (!extensionToFetchTranslationsFrom.assets.manifest) {
                return;
            }
            Promise.all([this.galleryService.getManifest(extensionToFetchTranslationsFrom, CancellationToken.None), this.galleryService.getCoreTranslation(extensionToFetchTranslationsFrom, searchLocale)])
                .then(([manifest, translation]) => {
                const loc = manifest && manifest.contributes && manifest.contributes.localizations && manifest.contributes.localizations.find(x => locale.startsWith(x.languageId.toLowerCase()));
                const languageName = loc ? (loc.languageName || locale) : locale;
                const languageDisplayName = loc ? (loc.localizedLanguageName || loc.languageName || locale) : locale;
                const translationsFromPack = translation?.contents?.['vs/workbench/contrib/localization/electron-sandbox/minimalTranslations'] ?? {};
                const promptMessageKey = extensionToInstall ? 'installAndRestartMessage' : 'showLanguagePackExtensions';
                const useEnglish = !translationsFromPack[promptMessageKey];
                const translations = {};
                Object.keys(minimumTranslatedStrings).forEach(key => {
                    if (!translationsFromPack[key] || useEnglish) {
                        translations[key] = minimumTranslatedStrings[key].replace('{0}', languageName);
                    }
                    else {
                        translations[key] = `${translationsFromPack[key].replace('{0}', languageDisplayName)} (${minimumTranslatedStrings[key].replace('{0}', languageName)})`;
                    }
                });
                const logUserReaction = (userReaction) => {
                    /* __GDPR__
                        "languagePackSuggestion:popup" : {
                            "owner": "TylerLeonhardt",
                            "userReaction" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                            "language": { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
                        }
                    */
                    this.telemetryService.publicLog('languagePackSuggestion:popup', { userReaction, language: locale });
                };
                const searchAction = {
                    label: translations['searchMarketplace'],
                    run: () => {
                        logUserReaction('search');
                        this.paneCompositeService.openPaneComposite(EXTENSIONS_VIEWLET_ID, 0 /* ViewContainerLocation.Sidebar */, true)
                            .then(viewlet => viewlet?.getViewPaneContainer())
                            .then(viewlet => {
                            viewlet.search(`tag:lp-${searchLocale}`);
                            viewlet.focus();
                        });
                    }
                };
                const installAndRestartAction = {
                    label: translations['installAndRestart'],
                    run: () => {
                        logUserReaction('installAndRestart');
                        this.installExtension(extensionToInstall).then(() => this.hostService.restart());
                    }
                };
                const promptMessage = translations[promptMessageKey];
                this.notificationService.prompt(Severity.Info, promptMessage, [extensionToInstall ? installAndRestartAction : searchAction,
                    {
                        label: localize('neverAgain', "Don't Show Again"),
                        isSecondary: true,
                        run: () => {
                            languagePackSuggestionIgnoreList.push(locale);
                            this.storageService.store(LANGUAGEPACK_SUGGESTION_IGNORE_STORAGE_KEY, JSON.stringify(languagePackSuggestionIgnoreList), -1 /* StorageScope.APPLICATION */, 0 /* StorageTarget.USER */);
                            logUserReaction('neverShowAgain');
                        }
                    }], {
                    onCancel: () => {
                        logUserReaction('cancelled');
                    }
                });
            });
        });
    }
    async isLocaleInstalled(locale) {
        const installed = await this.extensionManagementService.getInstalled();
        return installed.some(i => !!(i.manifest
            && i.manifest.contributes
            && i.manifest.contributes.localizations
            && i.manifest.contributes.localizations.length
            && i.manifest.contributes.localizations.some(l => locale.startsWith(l.languageId.toLowerCase()))));
    }
    installExtension(extension) {
        return this.paneCompositeService.openPaneComposite(EXTENSIONS_VIEWLET_ID, 0 /* ViewContainerLocation.Sidebar */)
            .then(viewlet => viewlet?.getViewPaneContainer())
            .then(viewlet => viewlet.search(`@id:${extension.identifier.id}`))
            .then(() => this.extensionManagementService.installFromGallery(extension))
            .then(() => undefined, err => this.notificationService.error(err));
    }
};
LocalizationWorkbenchContribution = __decorate([
    __param(0, INotificationService),
    __param(1, IJSONEditingService),
    __param(2, IEnvironmentService),
    __param(3, IHostService),
    __param(4, IStorageService),
    __param(5, IExtensionManagementService),
    __param(6, IExtensionGalleryService),
    __param(7, IPaneCompositePartService),
    __param(8, ITelemetryService)
], LocalizationWorkbenchContribution);
export { LocalizationWorkbenchContribution };
const workbenchRegistry = Registry.as(WorkbenchExtensions.Workbench);
workbenchRegistry.registerWorkbenchContribution(LocalizationWorkbenchContribution, 4 /* LifecyclePhase.Eventually */);
ExtensionsRegistry.registerExtensionPoint({
    extensionPoint: 'localizations',
    defaultExtensionKind: ['ui', 'workspace'],
    jsonSchema: {
        description: localize('vscode.extension.contributes.localizations', "Contributes localizations to the editor"),
        type: 'array',
        default: [],
        items: {
            type: 'object',
            required: ['languageId', 'translations'],
            defaultSnippets: [{ body: { languageId: '', languageName: '', localizedLanguageName: '', translations: [{ id: 'vscode', path: '' }] } }],
            properties: {
                languageId: {
                    description: localize('vscode.extension.contributes.localizations.languageId', 'Id of the language into which the display strings are translated.'),
                    type: 'string'
                },
                languageName: {
                    description: localize('vscode.extension.contributes.localizations.languageName', 'Name of the language in English.'),
                    type: 'string'
                },
                localizedLanguageName: {
                    description: localize('vscode.extension.contributes.localizations.languageNameLocalized', 'Name of the language in contributed language.'),
                    type: 'string'
                },
                translations: {
                    description: localize('vscode.extension.contributes.localizations.translations', 'List of translations associated to the language.'),
                    type: 'array',
                    default: [{ id: 'vscode', path: '' }],
                    items: {
                        type: 'object',
                        required: ['id', 'path'],
                        properties: {
                            id: {
                                type: 'string',
                                description: localize('vscode.extension.contributes.localizations.translations.id', "Id of VS Code or Extension for which this translation is contributed to. Id of VS Code is always `vscode` and of extension should be in format `publisherId.extensionName`."),
                                pattern: '^((vscode)|([a-z0-9A-Z][a-z0-9A-Z-]*)\\.([a-z0-9A-Z][a-z0-9A-Z-]*))$',
                                patternErrorMessage: localize('vscode.extension.contributes.localizations.translations.id.pattern', "Id should be `vscode` or in format `publisherId.extensionName` for translating VS code or an extension respectively.")
                            },
                            path: {
                                type: 'string',
                                description: localize('vscode.extension.contributes.localizations.translations.path', "A relative path to a file containing translations for the language.")
                            }
                        },
                        defaultSnippets: [{ body: { id: '', path: '' } }],
                    },
                }
            }
        }
    }
});

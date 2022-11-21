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
import { Language } from 'vs/base/common/platform';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { INotificationService, Severity } from 'vs/platform/notification/common/notification';
import { IJSONEditingService } from 'vs/workbench/services/configuration/common/jsonEditing';
import { ILanguagePackService } from 'vs/platform/languagePacks/common/languagePacks';
import { IPaneCompositePartService } from 'vs/workbench/services/panecomposite/browser/panecomposite';
import { VIEWLET_ID as EXTENSIONS_VIEWLET_ID } from 'vs/workbench/contrib/extensions/common/extensions';
import { IExtensionManagementService } from 'vs/platform/extensionManagement/common/extensionManagement';
import { IProgressService } from 'vs/platform/progress/common/progress';
import { localize } from 'vs/nls';
import { toAction } from 'vs/base/common/actions';
import { ITextFileService } from 'vs/workbench/services/textfile/common/textfiles';
import { stripComments } from 'vs/base/common/stripComments';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IHostService } from 'vs/workbench/services/host/browser/host';
import { IDialogService } from 'vs/platform/dialogs/common/dialogs';
import { IProductService } from 'vs/platform/product/common/productService';
let NativeLocaleService = class NativeLocaleService {
    jsonEditingService;
    environmentService;
    notificationService;
    languagePackService;
    paneCompositePartService;
    extensionManagementService;
    progressService;
    textFileService;
    editorService;
    dialogService;
    hostService;
    productService;
    _serviceBrand;
    constructor(jsonEditingService, environmentService, notificationService, languagePackService, paneCompositePartService, extensionManagementService, progressService, textFileService, editorService, dialogService, hostService, productService) {
        this.jsonEditingService = jsonEditingService;
        this.environmentService = environmentService;
        this.notificationService = notificationService;
        this.languagePackService = languagePackService;
        this.paneCompositePartService = paneCompositePartService;
        this.extensionManagementService = extensionManagementService;
        this.progressService = progressService;
        this.textFileService = textFileService;
        this.editorService = editorService;
        this.dialogService = dialogService;
        this.hostService = hostService;
        this.productService = productService;
    }
    async validateLocaleFile() {
        try {
            const content = await this.textFileService.read(this.environmentService.argvResource, { encoding: 'utf8' });
            // This is the same logic that we do where argv.json is parsed so mirror that:
            // https://github.com/microsoft/vscode/blob/32d40cf44e893e87ac33ac4f08de1e5f7fe077fc/src/main.js#L238-L246
            JSON.parse(stripComments(content.value));
        }
        catch (error) {
            this.notificationService.notify({
                severity: Severity.Error,
                message: localize('argvInvalid', 'Unable to write display language. Please open the runtime settings, correct errors/warnings in it and try again.'),
                actions: {
                    primary: [
                        toAction({
                            id: 'openArgv',
                            label: localize('openArgv', "Open Runtime Settings"),
                            run: () => this.editorService.openEditor({ resource: this.environmentService.argvResource })
                        })
                    ]
                }
            });
            return false;
        }
        return true;
    }
    async writeLocaleValue(locale) {
        if (!(await this.validateLocaleFile())) {
            return false;
        }
        await this.jsonEditingService.write(this.environmentService.argvResource, [{ path: ['locale'], value: locale }], true);
        return true;
    }
    async setLocale(languagePackItem) {
        const locale = languagePackItem.id;
        if (locale === Language.value() || (!locale && Language.isDefaultVariant())) {
            return;
        }
        const installedLanguages = await this.languagePackService.getInstalledLanguages();
        try {
            // Only Desktop has the concept of installing language packs so we only do this for Desktop
            // and only if the language pack is not installed
            if (!installedLanguages.some(installedLanguage => installedLanguage.id === languagePackItem.id)) {
                // Only actually install a language pack from Microsoft
                if (languagePackItem.galleryExtension?.publisher.toLowerCase() !== 'ms-ceintl') {
                    // Show the view so the user can see the language pack that they should install
                    // as of now, there are no 3rd party language packs available on the Marketplace.
                    const viewlet = await this.paneCompositePartService.openPaneComposite(EXTENSIONS_VIEWLET_ID, 0 /* ViewContainerLocation.Sidebar */);
                    (viewlet?.getViewPaneContainer()).search(`@id:${languagePackItem.extensionId}`);
                    return;
                }
                await this.progressService.withProgress({
                    location: 15 /* ProgressLocation.Notification */,
                    title: localize('installing', "Installing {0} language support...", languagePackItem.label),
                }, progress => this.extensionManagementService.installFromGallery(languagePackItem.galleryExtension, {
                    // Setting this to false is how you get the extension to be synced with Settings Sync (if enabled).
                    isMachineScoped: false,
                }));
            }
            if (await this.writeLocaleValue(locale)) {
                await this.showRestartDialog(languagePackItem.label);
            }
        }
        catch (err) {
            this.notificationService.error(err);
        }
    }
    async clearLocalePreference() {
        try {
            await this.writeLocaleValue(undefined);
            if (!Language.isDefaultVariant()) {
                await this.showRestartDialog('English');
            }
        }
        catch (err) {
            this.notificationService.error(err);
        }
    }
    async showRestartDialog(languageName) {
        const restartDialog = await this.dialogService.confirm({
            type: 'info',
            message: localize('restartDisplayLanguageMessage', "To change the display language, {0} needs to restart", this.productService.nameLong),
            detail: localize('restartDisplayLanguageDetail', "Press the restart button to restart {0} and set the display language to {1}.", this.productService.nameLong, languageName),
            primaryButton: localize({ key: 'restart', comment: ['&& denotes a mnemonic character'] }, "&&Restart"),
        });
        if (restartDialog.confirmed) {
            this.hostService.restart();
        }
    }
};
NativeLocaleService = __decorate([
    __param(0, IJSONEditingService),
    __param(1, IEnvironmentService),
    __param(2, INotificationService),
    __param(3, ILanguagePackService),
    __param(4, IPaneCompositePartService),
    __param(5, IExtensionManagementService),
    __param(6, IProgressService),
    __param(7, ITextFileService),
    __param(8, IEditorService),
    __param(9, IDialogService),
    __param(10, IHostService),
    __param(11, IProductService)
], NativeLocaleService);
export { NativeLocaleService };

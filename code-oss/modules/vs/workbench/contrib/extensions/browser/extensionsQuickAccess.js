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
import { PickerQuickAccessProvider } from 'vs/platform/quickinput/browser/pickerQuickAccess';
import { localize } from 'vs/nls';
import { VIEWLET_ID } from 'vs/workbench/contrib/extensions/common/extensions';
import { IExtensionGalleryService, IExtensionManagementService } from 'vs/platform/extensionManagement/common/extensionManagement';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { ILogService } from 'vs/platform/log/common/log';
import { IPaneCompositePartService } from 'vs/workbench/services/panecomposite/browser/panecomposite';
let InstallExtensionQuickAccessProvider = class InstallExtensionQuickAccessProvider extends PickerQuickAccessProvider {
    paneCompositeService;
    galleryService;
    extensionsService;
    notificationService;
    logService;
    static PREFIX = 'ext install ';
    constructor(paneCompositeService, galleryService, extensionsService, notificationService, logService) {
        super(InstallExtensionQuickAccessProvider.PREFIX);
        this.paneCompositeService = paneCompositeService;
        this.galleryService = galleryService;
        this.extensionsService = extensionsService;
        this.notificationService = notificationService;
        this.logService = logService;
    }
    _getPicks(filter, disposables, token) {
        // Nothing typed
        if (!filter) {
            return [{
                    label: localize('type', "Type an extension name to install or search.")
                }];
        }
        const genericSearchPickItem = {
            label: localize('searchFor', "Press Enter to search for extension '{0}'.", filter),
            accept: () => this.searchExtension(filter)
        };
        // Extension ID typed: try to find it
        if (/\./.test(filter)) {
            return this.getPicksForExtensionId(filter, genericSearchPickItem, token);
        }
        // Extension name typed: offer to search it
        return [genericSearchPickItem];
    }
    async getPicksForExtensionId(filter, fallback, token) {
        try {
            const [galleryExtension] = await this.galleryService.getExtensions([{ id: filter }], token);
            if (token.isCancellationRequested) {
                return []; // return early if canceled
            }
            if (!galleryExtension) {
                return [fallback];
            }
            return [{
                    label: localize('install', "Press Enter to install extension '{0}'.", filter),
                    accept: () => this.installExtension(galleryExtension, filter)
                }];
        }
        catch (error) {
            if (token.isCancellationRequested) {
                return []; // expected error
            }
            this.logService.error(error);
            return [fallback];
        }
    }
    async installExtension(extension, name) {
        try {
            await openExtensionsViewlet(this.paneCompositeService, `@id:${name}`);
            await this.extensionsService.installFromGallery(extension);
        }
        catch (error) {
            this.notificationService.error(error);
        }
    }
    async searchExtension(name) {
        openExtensionsViewlet(this.paneCompositeService, name);
    }
};
InstallExtensionQuickAccessProvider = __decorate([
    __param(0, IPaneCompositePartService),
    __param(1, IExtensionGalleryService),
    __param(2, IExtensionManagementService),
    __param(3, INotificationService),
    __param(4, ILogService)
], InstallExtensionQuickAccessProvider);
export { InstallExtensionQuickAccessProvider };
let ManageExtensionsQuickAccessProvider = class ManageExtensionsQuickAccessProvider extends PickerQuickAccessProvider {
    paneCompositeService;
    static PREFIX = 'ext ';
    constructor(paneCompositeService) {
        super(ManageExtensionsQuickAccessProvider.PREFIX);
        this.paneCompositeService = paneCompositeService;
    }
    _getPicks() {
        return [{
                label: localize('manage', "Press Enter to manage your extensions."),
                accept: () => openExtensionsViewlet(this.paneCompositeService)
            }];
    }
};
ManageExtensionsQuickAccessProvider = __decorate([
    __param(0, IPaneCompositePartService)
], ManageExtensionsQuickAccessProvider);
export { ManageExtensionsQuickAccessProvider };
async function openExtensionsViewlet(paneCompositeService, search = '') {
    const viewlet = await paneCompositeService.openPaneComposite(VIEWLET_ID, 0 /* ViewContainerLocation.Sidebar */, true);
    const view = viewlet?.getViewPaneContainer();
    view?.search(search);
    view?.focus();
}

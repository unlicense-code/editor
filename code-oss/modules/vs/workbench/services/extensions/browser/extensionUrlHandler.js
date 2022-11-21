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
import { toDisposable, combinedDisposable } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IDialogService } from 'vs/platform/dialogs/common/dialogs';
import { IExtensionGalleryService, IExtensionManagementService } from 'vs/platform/extensionManagement/common/extensionManagement';
import { IWorkbenchExtensionEnablementService } from 'vs/workbench/services/extensionManagement/common/extensionManagement';
import { areSameExtensions } from 'vs/platform/extensionManagement/common/extensionManagementUtil';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IURLService } from 'vs/platform/url/common/url';
import { IHostService } from 'vs/workbench/services/host/browser/host';
import { IExtensionService, toExtensionDescription } from 'vs/workbench/services/extensions/common/extensions';
import { ExtensionIdentifier } from 'vs/platform/extensions/common/extensions';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { Registry } from 'vs/platform/registry/common/platform';
import { Extensions as WorkbenchExtensions } from 'vs/workbench/common/contributions';
import { Action2, MenuId, registerAction2 } from 'vs/platform/actions/common/actions';
import { IQuickInputService } from 'vs/platform/quickinput/common/quickInput';
import { IProgressService } from 'vs/platform/progress/common/progress';
import { IsWebContext } from 'vs/platform/contextkey/common/contextkeys';
import { IExtensionUrlTrustService } from 'vs/platform/extensionManagement/common/extensionUrlTrust';
import { CancellationToken } from 'vs/base/common/cancellation';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
const FIVE_MINUTES = 5 * 60 * 1000;
const THIRTY_SECONDS = 30 * 1000;
const URL_TO_HANDLE = 'extensionUrlHandler.urlToHandle';
const USER_TRUSTED_EXTENSIONS_CONFIGURATION_KEY = 'extensions.confirmedUriHandlerExtensionIds';
const USER_TRUSTED_EXTENSIONS_STORAGE_KEY = 'extensionUrlHandler.confirmedExtensions';
function isExtensionId(value) {
    return /^[a-z0-9][a-z0-9\-]*\.[a-z0-9][a-z0-9\-]*$/i.test(value);
}
class UserTrustedExtensionIdStorage {
    storageService;
    get extensions() {
        const userTrustedExtensionIdsJson = this.storageService.get(USER_TRUSTED_EXTENSIONS_STORAGE_KEY, 0 /* StorageScope.PROFILE */, '[]');
        try {
            return JSON.parse(userTrustedExtensionIdsJson);
        }
        catch {
            return [];
        }
    }
    constructor(storageService) {
        this.storageService = storageService;
    }
    has(id) {
        return this.extensions.indexOf(id) > -1;
    }
    add(id) {
        this.set([...this.extensions, id]);
    }
    set(ids) {
        this.storageService.store(USER_TRUSTED_EXTENSIONS_STORAGE_KEY, JSON.stringify(ids), 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
    }
}
export const IExtensionUrlHandler = createDecorator('extensionUrlHandler');
/**
 * This class handles URLs which are directed towards extensions.
 * If a URL is directed towards an inactive extension, it buffers it,
 * activates the extension and re-opens the URL once the extension registers
 * a URL handler. If the extension never registers a URL handler, the urls
 * will eventually be garbage collected.
 *
 * It also makes sure the user confirms opening URLs directed towards extensions.
 */
let ExtensionUrlHandler = class ExtensionUrlHandler {
    extensionService;
    dialogService;
    notificationService;
    extensionManagementService;
    extensionEnablementService;
    hostService;
    galleryService;
    storageService;
    configurationService;
    progressService;
    telemetryService;
    extensionUrlTrustService;
    _serviceBrand;
    extensionHandlers = new Map();
    uriBuffer = new Map();
    userTrustedExtensionsStorage;
    disposable;
    constructor(urlService, extensionService, dialogService, notificationService, extensionManagementService, extensionEnablementService, hostService, galleryService, storageService, configurationService, progressService, telemetryService, extensionUrlTrustService) {
        this.extensionService = extensionService;
        this.dialogService = dialogService;
        this.notificationService = notificationService;
        this.extensionManagementService = extensionManagementService;
        this.extensionEnablementService = extensionEnablementService;
        this.hostService = hostService;
        this.galleryService = galleryService;
        this.storageService = storageService;
        this.configurationService = configurationService;
        this.progressService = progressService;
        this.telemetryService = telemetryService;
        this.extensionUrlTrustService = extensionUrlTrustService;
        this.userTrustedExtensionsStorage = new UserTrustedExtensionIdStorage(storageService);
        const interval = setInterval(() => this.garbageCollect(), THIRTY_SECONDS);
        const urlToHandleValue = this.storageService.get(URL_TO_HANDLE, 1 /* StorageScope.WORKSPACE */);
        if (urlToHandleValue) {
            this.storageService.remove(URL_TO_HANDLE, 1 /* StorageScope.WORKSPACE */);
            this.handleURL(URI.revive(JSON.parse(urlToHandleValue)), { trusted: true });
        }
        this.disposable = combinedDisposable(urlService.registerHandler(this), toDisposable(() => clearInterval(interval)));
        const cache = ExtensionUrlBootstrapHandler.cache;
        setTimeout(() => cache.forEach(([uri, option]) => this.handleURL(uri, option)));
    }
    async handleURL(uri, options) {
        if (!isExtensionId(uri.authority)) {
            return false;
        }
        const extensionId = uri.authority;
        this.telemetryService.publicLog2('uri_invoked/start', { extensionId });
        const wasHandlerAvailable = this.extensionHandlers.has(ExtensionIdentifier.toKey(extensionId));
        const extension = await this.extensionService.getExtension(extensionId);
        if (!extension) {
            await this.handleUnhandledURL(uri, { id: extensionId }, options);
            return true;
        }
        const trusted = options?.trusted
            || (options?.originalUrl ? await this.extensionUrlTrustService.isExtensionUrlTrusted(extensionId, options.originalUrl) : false)
            || this.didUserTrustExtension(ExtensionIdentifier.toKey(extensionId));
        if (!trusted) {
            let uriString = uri.toString(false);
            if (uriString.length > 40) {
                uriString = `${uriString.substring(0, 30)}...${uriString.substring(uriString.length - 5)}`;
            }
            const result = await this.dialogService.confirm({
                message: localize('confirmUrl', "Allow an extension to open this URI?", extensionId),
                checkbox: {
                    label: localize('rememberConfirmUrl', "Don't ask again for this extension."),
                },
                detail: `${extension.displayName || extension.name} (${extensionId}) wants to open a URI:\n\n${uriString}`,
                primaryButton: localize('open', "&&Open"),
                type: 'question'
            });
            if (!result.confirmed) {
                this.telemetryService.publicLog2('uri_invoked/cancel', { extensionId });
                return true;
            }
            if (result.checkboxChecked) {
                this.userTrustedExtensionsStorage.add(ExtensionIdentifier.toKey(extensionId));
            }
        }
        const handler = this.extensionHandlers.get(ExtensionIdentifier.toKey(extensionId));
        if (handler) {
            if (!wasHandlerAvailable) {
                // forward it directly
                return await this.handleURLByExtension(extensionId, handler, uri, options);
            }
            // let the ExtensionUrlHandler instance handle this
            return false;
        }
        // collect URI for eventual extension activation
        const timestamp = new Date().getTime();
        let uris = this.uriBuffer.get(ExtensionIdentifier.toKey(extensionId));
        if (!uris) {
            uris = [];
            this.uriBuffer.set(ExtensionIdentifier.toKey(extensionId), uris);
        }
        uris.push({ timestamp, uri });
        // activate the extension
        await this.extensionService.activateByEvent(`onUri:${ExtensionIdentifier.toKey(extensionId)}`);
        return true;
    }
    registerExtensionHandler(extensionId, handler) {
        this.extensionHandlers.set(ExtensionIdentifier.toKey(extensionId), handler);
        const uris = this.uriBuffer.get(ExtensionIdentifier.toKey(extensionId)) || [];
        for (const { uri } of uris) {
            this.handleURLByExtension(extensionId, handler, uri);
        }
        this.uriBuffer.delete(ExtensionIdentifier.toKey(extensionId));
    }
    unregisterExtensionHandler(extensionId) {
        this.extensionHandlers.delete(ExtensionIdentifier.toKey(extensionId));
    }
    async handleURLByExtension(extensionId, handler, uri, options) {
        this.telemetryService.publicLog2('uri_invoked/end', { extensionId: ExtensionIdentifier.toKey(extensionId) });
        return await handler.handleURL(uri, options);
    }
    async handleUnhandledURL(uri, extensionIdentifier, options) {
        const installedExtensions = await this.extensionManagementService.getInstalled();
        let extension = installedExtensions.find(e => areSameExtensions(e.identifier, extensionIdentifier));
        // Extension is not installed
        if (!extension) {
            let galleryExtension;
            try {
                galleryExtension = (await this.galleryService.getExtensions([extensionIdentifier], CancellationToken.None))[0] ?? undefined;
            }
            catch (err) {
                return;
            }
            if (!galleryExtension) {
                return;
            }
            this.telemetryService.publicLog2('uri_invoked/install_extension/start', { extensionId: extensionIdentifier.id });
            // Install the Extension and reload the window to handle.
            const result = await this.dialogService.confirm({
                message: localize('installAndHandle', "Extension '{0}' is not installed. Would you like to install the extension and open this URL?", galleryExtension.displayName || galleryExtension.name),
                detail: `${galleryExtension.displayName || galleryExtension.name} (${extensionIdentifier.id}) wants to open a URL:\n\n${uri.toString()}`,
                primaryButton: localize('install and open', "&&Install and Open"),
                type: 'question'
            });
            if (!result.confirmed) {
                this.telemetryService.publicLog2('uri_invoked/install_extension/cancel', { extensionId: extensionIdentifier.id });
                return;
            }
            this.telemetryService.publicLog2('uri_invoked/install_extension/accept', { extensionId: extensionIdentifier.id });
            try {
                extension = await this.progressService.withProgress({
                    location: 15 /* ProgressLocation.Notification */,
                    title: localize('Installing', "Installing Extension '{0}'...", galleryExtension.displayName || galleryExtension.name)
                }, () => this.extensionManagementService.installFromGallery(galleryExtension));
            }
            catch (error) {
                this.notificationService.error(error);
                return;
            }
        }
        // Extension is installed but not enabled
        if (!this.extensionEnablementService.isEnabled(extension)) {
            this.telemetryService.publicLog2('uri_invoked/enable_extension/start', { extensionId: extensionIdentifier.id });
            const result = await this.dialogService.confirm({
                message: localize('enableAndHandle', "Extension '{0}' is disabled. Would you like to enable the extension and open the URL?", extension.manifest.displayName || extension.manifest.name),
                detail: `${extension.manifest.displayName || extension.manifest.name} (${extensionIdentifier.id}) wants to open a URL:\n\n${uri.toString()}`,
                primaryButton: localize('enableAndReload', "&&Enable and Open"),
                type: 'question'
            });
            if (!result.confirmed) {
                this.telemetryService.publicLog2('uri_invoked/enable_extension/cancel', { extensionId: extensionIdentifier.id });
                return;
            }
            this.telemetryService.publicLog2('uri_invoked/enable_extension/accept', { extensionId: extensionIdentifier.id });
            await this.extensionEnablementService.setEnablement([extension], 8 /* EnablementState.EnabledGlobally */);
        }
        if (this.extensionService.canAddExtension(toExtensionDescription(extension))) {
            await this.waitUntilExtensionIsAdded(extensionIdentifier);
            await this.handleURL(uri, { ...options, trusted: true });
        }
        /* Extension cannot be added and require window reload */
        else {
            this.telemetryService.publicLog2('uri_invoked/activate_extension/start', { extensionId: extensionIdentifier.id });
            const result = await this.dialogService.confirm({
                message: localize('reloadAndHandle', "Extension '{0}' is not loaded. Would you like to reload the window to load the extension and open the URL?", extension.manifest.displayName || extension.manifest.name),
                detail: `${extension.manifest.displayName || extension.manifest.name} (${extensionIdentifier.id}) wants to open a URL:\n\n${uri.toString()}`,
                primaryButton: localize('reloadAndOpen', "&&Reload Window and Open"),
                type: 'question'
            });
            if (!result.confirmed) {
                this.telemetryService.publicLog2('uri_invoked/activate_extension/cancel', { extensionId: extensionIdentifier.id });
                return;
            }
            this.telemetryService.publicLog2('uri_invoked/activate_extension/accept', { extensionId: extensionIdentifier.id });
            this.storageService.store(URL_TO_HANDLE, JSON.stringify(uri.toJSON()), 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            await this.hostService.reload();
        }
    }
    async waitUntilExtensionIsAdded(extensionId) {
        if (!(await this.extensionService.getExtension(extensionId.id))) {
            await new Promise((c, e) => {
                const disposable = this.extensionService.onDidChangeExtensions(async () => {
                    try {
                        if (await this.extensionService.getExtension(extensionId.id)) {
                            disposable.dispose();
                            c();
                        }
                    }
                    catch (error) {
                        e(error);
                    }
                });
            });
        }
    }
    // forget about all uris buffered more than 5 minutes ago
    garbageCollect() {
        const now = new Date().getTime();
        const uriBuffer = new Map();
        this.uriBuffer.forEach((uris, extensionId) => {
            uris = uris.filter(({ timestamp }) => now - timestamp < FIVE_MINUTES);
            if (uris.length > 0) {
                uriBuffer.set(extensionId, uris);
            }
        });
        this.uriBuffer = uriBuffer;
    }
    didUserTrustExtension(id) {
        if (this.userTrustedExtensionsStorage.has(id)) {
            return true;
        }
        return this.getConfirmedTrustedExtensionIdsFromConfiguration().indexOf(id) > -1;
    }
    getConfirmedTrustedExtensionIdsFromConfiguration() {
        const trustedExtensionIds = this.configurationService.getValue(USER_TRUSTED_EXTENSIONS_CONFIGURATION_KEY);
        if (!Array.isArray(trustedExtensionIds)) {
            return [];
        }
        return trustedExtensionIds;
    }
    dispose() {
        this.disposable.dispose();
        this.extensionHandlers.clear();
        this.uriBuffer.clear();
    }
};
ExtensionUrlHandler = __decorate([
    __param(0, IURLService),
    __param(1, IExtensionService),
    __param(2, IDialogService),
    __param(3, INotificationService),
    __param(4, IExtensionManagementService),
    __param(5, IWorkbenchExtensionEnablementService),
    __param(6, IHostService),
    __param(7, IExtensionGalleryService),
    __param(8, IStorageService),
    __param(9, IConfigurationService),
    __param(10, IProgressService),
    __param(11, ITelemetryService),
    __param(12, IExtensionUrlTrustService)
], ExtensionUrlHandler);
registerSingleton(IExtensionUrlHandler, ExtensionUrlHandler, 0 /* InstantiationType.Eager */);
/**
 * This class handles URLs before `ExtensionUrlHandler` is instantiated.
 * More info: https://github.com/microsoft/vscode/issues/73101
 */
let ExtensionUrlBootstrapHandler = class ExtensionUrlBootstrapHandler {
    static _cache = [];
    static disposable;
    static get cache() {
        ExtensionUrlBootstrapHandler.disposable.dispose();
        const result = ExtensionUrlBootstrapHandler._cache;
        ExtensionUrlBootstrapHandler._cache = [];
        return result;
    }
    constructor(urlService) {
        ExtensionUrlBootstrapHandler.disposable = urlService.registerHandler(this);
    }
    async handleURL(uri, options) {
        if (!isExtensionId(uri.authority)) {
            return false;
        }
        ExtensionUrlBootstrapHandler._cache.push([uri, options]);
        return true;
    }
};
ExtensionUrlBootstrapHandler = __decorate([
    __param(0, IURLService)
], ExtensionUrlBootstrapHandler);
const workbenchRegistry = Registry.as(WorkbenchExtensions.Workbench);
workbenchRegistry.registerWorkbenchContribution(ExtensionUrlBootstrapHandler, 2 /* LifecyclePhase.Ready */);
class ManageAuthorizedExtensionURIsAction extends Action2 {
    constructor() {
        super({
            id: 'workbench.extensions.action.manageAuthorizedExtensionURIs',
            title: { value: localize('manage', "Manage Authorized Extension URIs..."), original: 'Manage Authorized Extension URIs...' },
            category: { value: localize('extensions', "Extensions"), original: 'Extensions' },
            menu: {
                id: MenuId.CommandPalette,
                when: IsWebContext.toNegated()
            }
        });
    }
    async run(accessor) {
        const storageService = accessor.get(IStorageService);
        const quickInputService = accessor.get(IQuickInputService);
        const storage = new UserTrustedExtensionIdStorage(storageService);
        const items = storage.extensions.map(label => ({ label, picked: true }));
        if (items.length === 0) {
            await quickInputService.pick([{ label: localize('no', 'There are currently no authorized extension URIs.') }]);
            return;
        }
        const result = await quickInputService.pick(items, { canPickMany: true });
        if (!result) {
            return;
        }
        storage.set(result.map(item => item.label));
    }
}
registerAction2(ManageAuthorizedExtensionURIsAction);

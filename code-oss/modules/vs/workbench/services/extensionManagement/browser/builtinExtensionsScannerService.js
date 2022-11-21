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
import { IBuiltinExtensionsScannerService } from 'vs/platform/extensions/common/extensions';
import { isWeb, Language } from 'vs/base/common/platform';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { getGalleryExtensionId } from 'vs/platform/extensionManagement/common/extensionManagementUtil';
import { builtinExtensionsPath, FileAccess } from 'vs/base/common/network';
import { URI } from 'vs/base/common/uri';
import { IExtensionResourceLoaderService } from 'vs/platform/extensionResourceLoader/common/extensionResourceLoader';
import { IProductService } from 'vs/platform/product/common/productService';
import { localizeManifest } from 'vs/platform/extensionManagement/common/extensionNls';
import { ILogService } from 'vs/platform/log/common/log';
import { ImplicitActivationEvents } from 'vs/platform/extensionManagement/common/implicitActivationEvents';
let BuiltinExtensionsScannerService = class BuiltinExtensionsScannerService {
    extensionResourceLoaderService;
    logService;
    builtinExtensionsPromises = [];
    nlsUrl;
    constructor(environmentService, uriIdentityService, extensionResourceLoaderService, productService, logService) {
        this.extensionResourceLoaderService = extensionResourceLoaderService;
        this.logService = logService;
        if (isWeb) {
            const nlsBaseUrl = productService.extensionsGallery?.nlsBaseUrl;
            // Only use the nlsBaseUrl if we are using a language other than the default, English.
            if (nlsBaseUrl && productService.commit && !Language.isDefaultVariant()) {
                this.nlsUrl = URI.joinPath(URI.parse(nlsBaseUrl), productService.commit, productService.version, Language.value());
            }
            const builtinExtensionsServiceUrl = FileAccess.asBrowserUri(builtinExtensionsPath);
            if (builtinExtensionsServiceUrl) {
                let bundledExtensions = [];
                if (environmentService.isBuilt) {
                    // Built time configuration (do NOT modify)
                    bundledExtensions = [ /*BUILD->INSERT_BUILTIN_EXTENSIONS*/];
                }
                else {
                    // Find builtin extensions by checking for DOM
                    const builtinExtensionsElement = document.getElementById('vscode-workbench-builtin-extensions');
                    const builtinExtensionsElementAttribute = builtinExtensionsElement ? builtinExtensionsElement.getAttribute('data-settings') : undefined;
                    if (builtinExtensionsElementAttribute) {
                        try {
                            bundledExtensions = JSON.parse(builtinExtensionsElementAttribute);
                        }
                        catch (error) { /* ignore error*/ }
                    }
                }
                this.builtinExtensionsPromises = bundledExtensions.map(async (e) => {
                    const id = getGalleryExtensionId(e.packageJSON.publisher, e.packageJSON.name);
                    const browserNlsBundleUris = {};
                    if (e.browserNlsMetadataPath) {
                        if (this.nlsUrl) {
                            browserNlsBundleUris[Language.value()] = uriIdentityService.extUri.joinPath(this.nlsUrl, id, 'main');
                        }
                        browserNlsBundleUris.en = uriIdentityService.extUri.resolvePath(builtinExtensionsServiceUrl, e.browserNlsMetadataPath);
                    }
                    ImplicitActivationEvents.updateManifest(e.packageJSON);
                    return {
                        identifier: { id },
                        location: uriIdentityService.extUri.joinPath(builtinExtensionsServiceUrl, e.extensionPath),
                        type: 0 /* ExtensionType.System */,
                        isBuiltin: true,
                        browserNlsBundleUris,
                        manifest: e.packageNLS ? await this.localizeManifest(id, e.packageJSON, e.packageNLS) : e.packageJSON,
                        readmeUrl: e.readmePath ? uriIdentityService.extUri.joinPath(builtinExtensionsServiceUrl, e.readmePath) : undefined,
                        changelogUrl: e.changelogPath ? uriIdentityService.extUri.joinPath(builtinExtensionsServiceUrl, e.changelogPath) : undefined,
                        targetPlatform: "web" /* TargetPlatform.WEB */,
                        validations: [],
                        isValid: true
                    };
                });
            }
        }
    }
    async scanBuiltinExtensions() {
        return [...await Promise.all(this.builtinExtensionsPromises)];
    }
    async localizeManifest(extensionId, manifest, fallbackTranslations) {
        if (!this.nlsUrl) {
            return localizeManifest(manifest, fallbackTranslations);
        }
        // the `package` endpoint returns the translations in a key-value format similar to the package.nls.json file.
        const uri = URI.joinPath(this.nlsUrl, extensionId, 'package');
        try {
            const res = await this.extensionResourceLoaderService.readExtensionResource(uri);
            const json = JSON.parse(res.toString());
            return localizeManifest(manifest, json, fallbackTranslations);
        }
        catch (e) {
            this.logService.error(e);
            return localizeManifest(manifest, fallbackTranslations);
        }
    }
};
BuiltinExtensionsScannerService = __decorate([
    __param(0, IWorkbenchEnvironmentService),
    __param(1, IUriIdentityService),
    __param(2, IExtensionResourceLoaderService),
    __param(3, IProductService),
    __param(4, ILogService)
], BuiltinExtensionsScannerService);
export { BuiltinExtensionsScannerService };
registerSingleton(IBuiltinExtensionsScannerService, BuiltinExtensionsScannerService, 1 /* InstantiationType.Delayed */);

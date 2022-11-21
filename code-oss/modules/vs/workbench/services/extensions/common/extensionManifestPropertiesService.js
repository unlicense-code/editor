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
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { ExtensionIdentifier, ALL_EXTENSION_KINDS } from 'vs/platform/extensions/common/extensions';
import { ExtensionsRegistry } from 'vs/workbench/services/extensions/common/extensionsRegistry';
import { getGalleryExtensionId } from 'vs/platform/extensionManagement/common/extensionManagementUtil';
import { isNonEmptyArray } from 'vs/base/common/arrays';
import { IProductService } from 'vs/platform/product/common/productService';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { Disposable } from 'vs/base/common/lifecycle';
import { WORKSPACE_TRUST_EXTENSION_SUPPORT } from 'vs/workbench/services/workspaces/common/workspaceTrust';
import { isBoolean } from 'vs/base/common/types';
import { IWorkspaceTrustEnablementService } from 'vs/platform/workspace/common/workspaceTrust';
import { ILogService } from 'vs/platform/log/common/log';
import { isWeb } from 'vs/base/common/platform';
export const IExtensionManifestPropertiesService = createDecorator('extensionManifestPropertiesService');
let ExtensionManifestPropertiesService = class ExtensionManifestPropertiesService extends Disposable {
    productService;
    configurationService;
    workspaceTrustEnablementService;
    logService;
    _serviceBrand;
    _extensionPointExtensionKindsMap = null;
    _productExtensionKindsMap = null;
    _configuredExtensionKindsMap = null;
    _productVirtualWorkspaceSupportMap = null;
    _configuredVirtualWorkspaceSupportMap = null;
    _configuredExtensionWorkspaceTrustRequestMap;
    _productExtensionWorkspaceTrustRequestMap;
    constructor(productService, configurationService, workspaceTrustEnablementService, logService) {
        super();
        this.productService = productService;
        this.configurationService = configurationService;
        this.workspaceTrustEnablementService = workspaceTrustEnablementService;
        this.logService = logService;
        // Workspace trust request type (settings.json)
        this._configuredExtensionWorkspaceTrustRequestMap = new Map();
        const configuredExtensionWorkspaceTrustRequests = configurationService.inspect(WORKSPACE_TRUST_EXTENSION_SUPPORT).userValue || {};
        for (const id of Object.keys(configuredExtensionWorkspaceTrustRequests)) {
            this._configuredExtensionWorkspaceTrustRequestMap.set(ExtensionIdentifier.toKey(id), configuredExtensionWorkspaceTrustRequests[id]);
        }
        // Workspace trust request type (products.json)
        this._productExtensionWorkspaceTrustRequestMap = new Map();
        if (productService.extensionUntrustedWorkspaceSupport) {
            for (const id of Object.keys(productService.extensionUntrustedWorkspaceSupport)) {
                this._productExtensionWorkspaceTrustRequestMap.set(ExtensionIdentifier.toKey(id), productService.extensionUntrustedWorkspaceSupport[id]);
            }
        }
    }
    prefersExecuteOnUI(manifest) {
        const extensionKind = this.getExtensionKind(manifest);
        return (extensionKind.length > 0 && extensionKind[0] === 'ui');
    }
    prefersExecuteOnWorkspace(manifest) {
        const extensionKind = this.getExtensionKind(manifest);
        return (extensionKind.length > 0 && extensionKind[0] === 'workspace');
    }
    prefersExecuteOnWeb(manifest) {
        const extensionKind = this.getExtensionKind(manifest);
        return (extensionKind.length > 0 && extensionKind[0] === 'web');
    }
    canExecuteOnUI(manifest) {
        const extensionKind = this.getExtensionKind(manifest);
        return extensionKind.some(kind => kind === 'ui');
    }
    canExecuteOnWorkspace(manifest) {
        const extensionKind = this.getExtensionKind(manifest);
        return extensionKind.some(kind => kind === 'workspace');
    }
    canExecuteOnWeb(manifest) {
        const extensionKind = this.getExtensionKind(manifest);
        return extensionKind.some(kind => kind === 'web');
    }
    getExtensionKind(manifest) {
        const deducedExtensionKind = this.deduceExtensionKind(manifest);
        const configuredExtensionKind = this.getConfiguredExtensionKind(manifest);
        if (configuredExtensionKind && configuredExtensionKind.length > 0) {
            const result = [];
            for (const extensionKind of configuredExtensionKind) {
                if (extensionKind !== '-web') {
                    result.push(extensionKind);
                }
            }
            // If opted out from web without specifying other extension kinds then default to ui, workspace
            if (configuredExtensionKind.includes('-web') && !result.length) {
                result.push('ui');
                result.push('workspace');
            }
            // Add web kind if not opted out from web and can run in web
            if (isWeb && !configuredExtensionKind.includes('-web') && !configuredExtensionKind.includes('web') && deducedExtensionKind.includes('web')) {
                result.push('web');
            }
            return result;
        }
        return deducedExtensionKind;
    }
    getUserConfiguredExtensionKind(extensionIdentifier) {
        if (this._configuredExtensionKindsMap === null) {
            const configuredExtensionKindsMap = new Map();
            const configuredExtensionKinds = this.configurationService.getValue('remote.extensionKind') || {};
            for (const id of Object.keys(configuredExtensionKinds)) {
                configuredExtensionKindsMap.set(ExtensionIdentifier.toKey(id), configuredExtensionKinds[id]);
            }
            this._configuredExtensionKindsMap = configuredExtensionKindsMap;
        }
        const userConfiguredExtensionKind = this._configuredExtensionKindsMap.get(ExtensionIdentifier.toKey(extensionIdentifier.id));
        return userConfiguredExtensionKind ? this.toArray(userConfiguredExtensionKind) : undefined;
    }
    getExtensionUntrustedWorkspaceSupportType(manifest) {
        // Workspace trust feature is disabled, or extension has no entry point
        if (!this.workspaceTrustEnablementService.isWorkspaceTrustEnabled() || !manifest.main) {
            return true;
        }
        // Get extension workspace trust requirements from settings.json
        const configuredWorkspaceTrustRequest = this.getConfiguredExtensionWorkspaceTrustRequest(manifest);
        // Get extension workspace trust requirements from product.json
        const productWorkspaceTrustRequest = this.getProductExtensionWorkspaceTrustRequest(manifest);
        // Use settings.json override value if it exists
        if (configuredWorkspaceTrustRequest !== undefined) {
            return configuredWorkspaceTrustRequest;
        }
        // Use product.json override value if it exists
        if (productWorkspaceTrustRequest?.override !== undefined) {
            return productWorkspaceTrustRequest.override;
        }
        // Use extension manifest value if it exists
        if (manifest.capabilities?.untrustedWorkspaces?.supported !== undefined) {
            return manifest.capabilities.untrustedWorkspaces.supported;
        }
        // Use product.json default value if it exists
        if (productWorkspaceTrustRequest?.default !== undefined) {
            return productWorkspaceTrustRequest.default;
        }
        return false;
    }
    getExtensionVirtualWorkspaceSupportType(manifest) {
        // check user configured
        const userConfiguredVirtualWorkspaceSupport = this.getConfiguredVirtualWorkspaceSupport(manifest);
        if (userConfiguredVirtualWorkspaceSupport !== undefined) {
            return userConfiguredVirtualWorkspaceSupport;
        }
        const productConfiguredWorkspaceSchemes = this.getProductVirtualWorkspaceSupport(manifest);
        // check override from product
        if (productConfiguredWorkspaceSchemes?.override !== undefined) {
            return productConfiguredWorkspaceSchemes.override;
        }
        // check the manifest
        const virtualWorkspaces = manifest.capabilities?.virtualWorkspaces;
        if (isBoolean(virtualWorkspaces)) {
            return virtualWorkspaces;
        }
        else if (virtualWorkspaces) {
            const supported = virtualWorkspaces.supported;
            if (isBoolean(supported) || supported === 'limited') {
                return supported;
            }
        }
        // check default from product
        if (productConfiguredWorkspaceSchemes?.default !== undefined) {
            return productConfiguredWorkspaceSchemes.default;
        }
        // Default - supports virtual workspace
        return true;
    }
    deduceExtensionKind(manifest) {
        // Not an UI extension if it has main
        if (manifest.main) {
            if (manifest.browser) {
                return isWeb ? ['workspace', 'web'] : ['workspace'];
            }
            return ['workspace'];
        }
        if (manifest.browser) {
            return ['web'];
        }
        let result = [...ALL_EXTENSION_KINDS];
        if (isNonEmptyArray(manifest.extensionPack) || isNonEmptyArray(manifest.extensionDependencies)) {
            // Extension pack defaults to [workspace, web] in web and only [workspace] in desktop
            result = isWeb ? ['workspace', 'web'] : ['workspace'];
        }
        if (manifest.contributes) {
            for (const contribution of Object.keys(manifest.contributes)) {
                const supportedExtensionKinds = this.getSupportedExtensionKindsForExtensionPoint(contribution);
                if (supportedExtensionKinds.length) {
                    result = result.filter(extensionKind => supportedExtensionKinds.includes(extensionKind));
                }
            }
        }
        if (!result.length) {
            this.logService.warn('Cannot deduce extensionKind for extension', getGalleryExtensionId(manifest.publisher, manifest.name));
        }
        return result;
    }
    getSupportedExtensionKindsForExtensionPoint(extensionPoint) {
        if (this._extensionPointExtensionKindsMap === null) {
            const extensionPointExtensionKindsMap = new Map();
            ExtensionsRegistry.getExtensionPoints().forEach(e => extensionPointExtensionKindsMap.set(e.name, e.defaultExtensionKind || [] /* supports all */));
            this._extensionPointExtensionKindsMap = extensionPointExtensionKindsMap;
        }
        let extensionPointExtensionKind = this._extensionPointExtensionKindsMap.get(extensionPoint);
        if (extensionPointExtensionKind) {
            return extensionPointExtensionKind;
        }
        extensionPointExtensionKind = this.productService.extensionPointExtensionKind ? this.productService.extensionPointExtensionKind[extensionPoint] : undefined;
        if (extensionPointExtensionKind) {
            return extensionPointExtensionKind;
        }
        /* Unknown extension point */
        return isWeb ? ['workspace', 'web'] : ['workspace'];
    }
    getConfiguredExtensionKind(manifest) {
        const extensionIdentifier = { id: getGalleryExtensionId(manifest.publisher, manifest.name) };
        // check in config
        let result = this.getUserConfiguredExtensionKind(extensionIdentifier);
        if (typeof result !== 'undefined') {
            return this.toArray(result);
        }
        // check product.json
        result = this.getProductExtensionKind(manifest);
        if (typeof result !== 'undefined') {
            return result;
        }
        // check the manifest itself
        result = manifest.extensionKind;
        if (typeof result !== 'undefined') {
            result = this.toArray(result);
            return result.filter(r => ['ui', 'workspace'].includes(r));
        }
        return null;
    }
    getProductExtensionKind(manifest) {
        if (this._productExtensionKindsMap === null) {
            const productExtensionKindsMap = new Map();
            if (this.productService.extensionKind) {
                for (const id of Object.keys(this.productService.extensionKind)) {
                    productExtensionKindsMap.set(ExtensionIdentifier.toKey(id), this.productService.extensionKind[id]);
                }
            }
            this._productExtensionKindsMap = productExtensionKindsMap;
        }
        const extensionId = getGalleryExtensionId(manifest.publisher, manifest.name);
        return this._productExtensionKindsMap.get(ExtensionIdentifier.toKey(extensionId));
    }
    getProductVirtualWorkspaceSupport(manifest) {
        if (this._productVirtualWorkspaceSupportMap === null) {
            const productWorkspaceSchemesMap = new Map();
            if (this.productService.extensionVirtualWorkspacesSupport) {
                for (const id of Object.keys(this.productService.extensionVirtualWorkspacesSupport)) {
                    productWorkspaceSchemesMap.set(ExtensionIdentifier.toKey(id), this.productService.extensionVirtualWorkspacesSupport[id]);
                }
            }
            this._productVirtualWorkspaceSupportMap = productWorkspaceSchemesMap;
        }
        const extensionId = getGalleryExtensionId(manifest.publisher, manifest.name);
        return this._productVirtualWorkspaceSupportMap.get(ExtensionIdentifier.toKey(extensionId));
    }
    getConfiguredVirtualWorkspaceSupport(manifest) {
        if (this._configuredVirtualWorkspaceSupportMap === null) {
            const configuredWorkspaceSchemesMap = new Map();
            const configuredWorkspaceSchemes = this.configurationService.getValue('extensions.supportVirtualWorkspaces') || {};
            for (const id of Object.keys(configuredWorkspaceSchemes)) {
                if (configuredWorkspaceSchemes[id] !== undefined) {
                    configuredWorkspaceSchemesMap.set(ExtensionIdentifier.toKey(id), configuredWorkspaceSchemes[id]);
                }
            }
            this._configuredVirtualWorkspaceSupportMap = configuredWorkspaceSchemesMap;
        }
        const extensionId = getGalleryExtensionId(manifest.publisher, manifest.name);
        return this._configuredVirtualWorkspaceSupportMap.get(ExtensionIdentifier.toKey(extensionId));
    }
    getConfiguredExtensionWorkspaceTrustRequest(manifest) {
        const extensionId = getGalleryExtensionId(manifest.publisher, manifest.name);
        const extensionWorkspaceTrustRequest = this._configuredExtensionWorkspaceTrustRequestMap.get(ExtensionIdentifier.toKey(extensionId));
        if (extensionWorkspaceTrustRequest && (extensionWorkspaceTrustRequest.version === undefined || extensionWorkspaceTrustRequest.version === manifest.version)) {
            return extensionWorkspaceTrustRequest.supported;
        }
        return undefined;
    }
    getProductExtensionWorkspaceTrustRequest(manifest) {
        const extensionId = getGalleryExtensionId(manifest.publisher, manifest.name);
        return this._productExtensionWorkspaceTrustRequestMap.get(ExtensionIdentifier.toKey(extensionId));
    }
    toArray(extensionKind) {
        if (Array.isArray(extensionKind)) {
            return extensionKind;
        }
        return extensionKind === 'ui' ? ['ui', 'workspace'] : [extensionKind];
    }
};
ExtensionManifestPropertiesService = __decorate([
    __param(0, IProductService),
    __param(1, IConfigurationService),
    __param(2, IWorkspaceTrustEnablementService),
    __param(3, ILogService)
], ExtensionManifestPropertiesService);
export { ExtensionManifestPropertiesService };
registerSingleton(IExtensionManifestPropertiesService, ExtensionManifestPropertiesService, 1 /* InstantiationType.Delayed */);

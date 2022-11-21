/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { isWeb } from 'vs/base/common/platform';
import { format2 } from 'vs/base/common/strings';
import { URI } from 'vs/base/common/uri';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { getServiceMachineId } from 'vs/platform/externalServices/common/serviceMachineId';
import { getTelemetryLevel, supportsTelemetry } from 'vs/platform/telemetry/common/telemetryUtils';
import { RemoteAuthorities } from 'vs/base/common/network';
import { getRemoteServerRootPath } from 'vs/platform/remote/common/remoteHosts';
export const WEB_EXTENSION_RESOURCE_END_POINT = 'web-extension-resource';
export const IExtensionResourceLoaderService = createDecorator('extensionResourceLoaderService');
export class AbstractExtensionResourceLoaderService {
    _fileService;
    _storageService;
    _productService;
    _environmentService;
    _configurationService;
    _serviceBrand;
    _webExtensionResourceEndPoint;
    _extensionGalleryResourceUrlTemplate;
    _extensionGalleryAuthority;
    constructor(_fileService, _storageService, _productService, _environmentService, _configurationService) {
        this._fileService = _fileService;
        this._storageService = _storageService;
        this._productService = _productService;
        this._environmentService = _environmentService;
        this._configurationService = _configurationService;
        this._webExtensionResourceEndPoint = `${getRemoteServerRootPath(_productService)}/${WEB_EXTENSION_RESOURCE_END_POINT}/`;
        if (_productService.extensionsGallery) {
            this._extensionGalleryResourceUrlTemplate = _productService.extensionsGallery.resourceUrlTemplate;
            this._extensionGalleryAuthority = this._extensionGalleryResourceUrlTemplate ? this._getExtensionGalleryAuthority(URI.parse(this._extensionGalleryResourceUrlTemplate)) : undefined;
        }
    }
    get supportsExtensionGalleryResources() {
        return this._extensionGalleryResourceUrlTemplate !== undefined;
    }
    getExtensionGalleryResourceURL(galleryExtension, path) {
        if (this._extensionGalleryResourceUrlTemplate) {
            const uri = URI.parse(format2(this._extensionGalleryResourceUrlTemplate, { publisher: galleryExtension.publisher, name: galleryExtension.name, version: galleryExtension.version, path: 'extension' }));
            return this._isWebExtensionResourceEndPoint(uri) ? uri.with({ scheme: RemoteAuthorities.getPreferredWebSchema() }) : uri;
        }
        return undefined;
    }
    isExtensionGalleryResource(uri) {
        return this._extensionGalleryAuthority && this._extensionGalleryAuthority === this._getExtensionGalleryAuthority(uri);
    }
    async getExtensionGalleryRequestHeaders() {
        const headers = {
            'X-Client-Name': `${this._productService.applicationName}${isWeb ? '-web' : ''}`,
            'X-Client-Version': this._productService.version
        };
        if (supportsTelemetry(this._productService, this._environmentService) && getTelemetryLevel(this._configurationService) === 3 /* TelemetryLevel.USAGE */) {
            headers['X-Machine-Id'] = await this._getServiceMachineId();
        }
        if (this._productService.commit) {
            headers['X-Client-Commit'] = this._productService.commit;
        }
        return headers;
    }
    _serviceMachineIdPromise;
    _getServiceMachineId() {
        if (!this._serviceMachineIdPromise) {
            this._serviceMachineIdPromise = getServiceMachineId(this._environmentService, this._fileService, this._storageService);
        }
        return this._serviceMachineIdPromise;
    }
    _getExtensionGalleryAuthority(uri) {
        if (this._isWebExtensionResourceEndPoint(uri)) {
            return uri.authority;
        }
        const index = uri.authority.indexOf('.');
        return index !== -1 ? uri.authority.substring(index + 1) : undefined;
    }
    _isWebExtensionResourceEndPoint(uri) {
        return uri.path.startsWith(this._webExtensionResourceEndPoint);
    }
}

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
import { IURLService } from 'vs/platform/url/common/url';
import { URI } from 'vs/base/common/uri';
import { IMainProcessService } from 'vs/platform/ipc/electron-sandbox/services';
import { URLHandlerChannel } from 'vs/platform/url/common/urlIpc';
import { IOpenerService, matchesScheme } from 'vs/platform/opener/common/opener';
import { IProductService } from 'vs/platform/product/common/productService';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { ProxyChannel } from 'vs/base/parts/ipc/common/ipc';
import { INativeHostService } from 'vs/platform/native/electron-sandbox/native';
import { NativeURLService } from 'vs/platform/url/common/urlService';
let RelayURLService = class RelayURLService extends NativeURLService {
    nativeHostService;
    urlService;
    constructor(mainProcessService, openerService, nativeHostService, productService) {
        super(productService);
        this.nativeHostService = nativeHostService;
        this.urlService = ProxyChannel.toService(mainProcessService.getChannel('url'));
        mainProcessService.registerChannel('urlHandler', new URLHandlerChannel(this));
        openerService.registerOpener(this);
    }
    create(options) {
        const uri = super.create(options);
        let query = uri.query;
        if (!query) {
            query = `windowId=${encodeURIComponent(this.nativeHostService.windowId)}`;
        }
        else {
            query += `&windowId=${encodeURIComponent(this.nativeHostService.windowId)}`;
        }
        return uri.with({ query });
    }
    async open(resource, options) {
        if (!matchesScheme(resource, this.productService.urlProtocol)) {
            return false;
        }
        if (typeof resource === 'string') {
            resource = URI.parse(resource);
        }
        return await this.urlService.open(resource, options);
    }
    async handleURL(uri, options) {
        const result = await super.open(uri, options);
        if (result) {
            await this.nativeHostService.focusWindow({ force: true /* Application may not be active */ });
        }
        return result;
    }
};
RelayURLService = __decorate([
    __param(0, IMainProcessService),
    __param(1, IOpenerService),
    __param(2, INativeHostService),
    __param(3, IProductService)
], RelayURLService);
export { RelayURLService };
registerSingleton(IURLService, RelayURLService, 0 /* InstantiationType.Eager */);

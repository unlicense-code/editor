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
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { AbstractURLService } from 'vs/platform/url/common/urlService';
import { IBrowserWorkbenchEnvironmentService } from 'vs/workbench/services/environment/browser/environmentService';
import { IOpenerService, matchesScheme } from 'vs/platform/opener/common/opener';
import { IProductService } from 'vs/platform/product/common/productService';
class BrowserURLOpener {
    urlService;
    productService;
    constructor(urlService, productService) {
        this.urlService = urlService;
        this.productService = productService;
    }
    async open(resource, options) {
        if (options?.openExternal) {
            return false;
        }
        if (!matchesScheme(resource, this.productService.urlProtocol)) {
            return false;
        }
        if (typeof resource === 'string') {
            resource = URI.parse(resource);
        }
        return this.urlService.open(resource, { trusted: true });
    }
}
let BrowserURLService = class BrowserURLService extends AbstractURLService {
    provider;
    constructor(environmentService, openerService, productService) {
        super();
        this.provider = environmentService.options?.urlCallbackProvider;
        if (this.provider) {
            this._register(this.provider.onCallback(uri => this.open(uri, { trusted: true })));
        }
        this._register(openerService.registerOpener(new BrowserURLOpener(this, productService)));
    }
    create(options) {
        if (this.provider) {
            return this.provider.create(options);
        }
        return URI.parse('unsupported://');
    }
};
BrowserURLService = __decorate([
    __param(0, IBrowserWorkbenchEnvironmentService),
    __param(1, IOpenerService),
    __param(2, IProductService)
], BrowserURLService);
export { BrowserURLService };
registerSingleton(IURLService, BrowserURLService, 1 /* InstantiationType.Delayed */);

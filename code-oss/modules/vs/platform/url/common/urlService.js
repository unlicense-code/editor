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
import { first } from 'vs/base/common/async';
import { Disposable, toDisposable } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
import { IProductService } from 'vs/platform/product/common/productService';
export class AbstractURLService extends Disposable {
    handlers = new Set();
    open(uri, options) {
        const handlers = [...this.handlers.values()];
        return first(handlers.map(h => () => h.handleURL(uri, options)), undefined, false).then(val => val || false);
    }
    registerHandler(handler) {
        this.handlers.add(handler);
        return toDisposable(() => this.handlers.delete(handler));
    }
}
let NativeURLService = class NativeURLService extends AbstractURLService {
    productService;
    constructor(productService) {
        super();
        this.productService = productService;
    }
    create(options) {
        let { authority, path, query, fragment } = options ? options : { authority: undefined, path: undefined, query: undefined, fragment: undefined };
        if (authority && path && path.indexOf('/') !== 0) {
            path = `/${path}`; // URI validation requires a path if there is an authority
        }
        return URI.from({ scheme: this.productService.urlProtocol, authority, path, query, fragment });
    }
};
NativeURLService = __decorate([
    __param(0, IProductService)
], NativeURLService);
export { NativeURLService };

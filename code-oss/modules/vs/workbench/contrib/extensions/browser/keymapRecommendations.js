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
import { ExtensionRecommendations } from 'vs/workbench/contrib/extensions/browser/extensionRecommendations';
import { IProductService } from 'vs/platform/product/common/productService';
let KeymapRecommendations = class KeymapRecommendations extends ExtensionRecommendations {
    productService;
    _recommendations = [];
    get recommendations() { return this._recommendations; }
    constructor(productService) {
        super();
        this.productService = productService;
    }
    async doActivate() {
        if (this.productService.keymapExtensionTips) {
            this._recommendations = this.productService.keymapExtensionTips.map(extensionId => ({
                extensionId: extensionId.toLowerCase(),
                reason: {
                    reasonId: 6 /* ExtensionRecommendationReason.Application */,
                    reasonText: ''
                }
            }));
        }
    }
};
KeymapRecommendations = __decorate([
    __param(0, IProductService)
], KeymapRecommendations);
export { KeymapRecommendations };
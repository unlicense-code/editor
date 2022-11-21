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
import { ContextKeyExpr, IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
let Breakpoints = class Breakpoints {
    breakpointContribution;
    contextKeyService;
    breakpointsWhen;
    constructor(breakpointContribution, contextKeyService) {
        this.breakpointContribution = breakpointContribution;
        this.contextKeyService = contextKeyService;
        this.breakpointsWhen = typeof breakpointContribution.when === 'string' ? ContextKeyExpr.deserialize(breakpointContribution.when) : undefined;
    }
    get language() {
        return this.breakpointContribution.language;
    }
    get enabled() {
        return !this.breakpointsWhen || this.contextKeyService.contextMatchesRules(this.breakpointsWhen);
    }
};
Breakpoints = __decorate([
    __param(1, IContextKeyService)
], Breakpoints);
export { Breakpoints };

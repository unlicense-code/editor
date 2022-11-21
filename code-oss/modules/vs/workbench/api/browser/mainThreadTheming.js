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
import { MainContext, ExtHostContext } from '../common/extHost.protocol';
import { extHostNamedCustomer } from 'vs/workbench/services/extensions/common/extHostCustomers';
import { IThemeService } from 'vs/platform/theme/common/themeService';
let MainThreadTheming = class MainThreadTheming {
    _themeService;
    _proxy;
    _themeChangeListener;
    constructor(extHostContext, themeService) {
        this._themeService = themeService;
        this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostTheming);
        this._themeChangeListener = this._themeService.onDidColorThemeChange(e => {
            this._proxy.$onColorThemeChange(this._themeService.getColorTheme().type);
        });
        this._proxy.$onColorThemeChange(this._themeService.getColorTheme().type);
    }
    dispose() {
        this._themeChangeListener.dispose();
    }
};
MainThreadTheming = __decorate([
    extHostNamedCustomer(MainContext.MainThreadTheming),
    __param(1, IThemeService)
], MainThreadTheming);
export { MainThreadTheming };

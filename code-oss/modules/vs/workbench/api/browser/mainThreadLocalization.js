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
import { MainContext } from 'vs/workbench/api/common/extHost.protocol';
import { extHostNamedCustomer } from 'vs/workbench/services/extensions/common/extHostCustomers';
import { URI } from 'vs/base/common/uri';
import { IFileService } from 'vs/platform/files/common/files';
import { Disposable } from 'vs/base/common/lifecycle';
import { ILanguagePackService } from 'vs/platform/languagePacks/common/languagePacks';
let MainThreadLocalization = class MainThreadLocalization extends Disposable {
    fileService;
    languagePackService;
    constructor(extHostContext, fileService, languagePackService) {
        super();
        this.fileService = fileService;
        this.languagePackService = languagePackService;
    }
    async $fetchBuiltInBundleUri(id) {
        try {
            const uri = await this.languagePackService.getBuiltInExtensionTranslationsUri(id);
            return uri;
        }
        catch (e) {
            return undefined;
        }
    }
    async $fetchBundleContents(uriComponents) {
        const contents = await this.fileService.readFile(URI.revive(uriComponents));
        return contents.value.toString();
    }
};
MainThreadLocalization = __decorate([
    extHostNamedCustomer(MainContext.MainThreadLocalization),
    __param(1, IFileService),
    __param(2, ILanguagePackService)
], MainThreadLocalization);
export { MainThreadLocalization };

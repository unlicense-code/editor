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
import { Disposable } from 'vs/base/common/lifecycle';
import { MainContext } from 'vs/workbench/api/common/extHost.protocol';
import { extHostNamedCustomer } from 'vs/workbench/services/extensions/common/extHostCustomers';
import { IDownloadService } from 'vs/platform/download/common/download';
import { URI } from 'vs/base/common/uri';
let MainThreadDownloadService = class MainThreadDownloadService extends Disposable {
    downloadService;
    constructor(extHostContext, downloadService) {
        super();
        this.downloadService = downloadService;
    }
    $download(uri, to) {
        return this.downloadService.download(URI.revive(uri), URI.revive(to));
    }
};
MainThreadDownloadService = __decorate([
    extHostNamedCustomer(MainContext.MainThreadDownloadService),
    __param(1, IDownloadService)
], MainThreadDownloadService);
export { MainThreadDownloadService };

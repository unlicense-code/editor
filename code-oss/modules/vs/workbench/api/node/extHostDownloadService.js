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
import { join } from 'vs/base/common/path';
import { tmpdir } from 'os';
import { generateUuid } from 'vs/base/common/uuid';
import { IExtHostCommands } from 'vs/workbench/api/common/extHostCommands';
import { Disposable } from 'vs/base/common/lifecycle';
import { MainContext } from 'vs/workbench/api/common/extHost.protocol';
import { URI } from 'vs/base/common/uri';
import { IExtHostRpcService } from 'vs/workbench/api/common/extHostRpcService';
let ExtHostDownloadService = class ExtHostDownloadService extends Disposable {
    constructor(extHostRpc, commands) {
        super();
        const proxy = extHostRpc.getProxy(MainContext.MainThreadDownloadService);
        commands.registerCommand(false, '_workbench.downloadResource', async (resource) => {
            const location = URI.file(join(tmpdir(), generateUuid()));
            await proxy.$download(resource, location);
            return location;
        });
    }
};
ExtHostDownloadService = __decorate([
    __param(0, IExtHostRpcService),
    __param(1, IExtHostCommands)
], ExtHostDownloadService);
export { ExtHostDownloadService };

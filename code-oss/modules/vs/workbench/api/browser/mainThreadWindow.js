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
import { Event } from 'vs/base/common/event';
import { DisposableStore } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { extHostNamedCustomer } from 'vs/workbench/services/extensions/common/extHostCustomers';
import { ExtHostContext, MainContext } from '../common/extHost.protocol';
import { IHostService } from 'vs/workbench/services/host/browser/host';
let MainThreadWindow = class MainThreadWindow {
    hostService;
    openerService;
    proxy;
    disposables = new DisposableStore();
    constructor(extHostContext, hostService, openerService) {
        this.hostService = hostService;
        this.openerService = openerService;
        this.proxy = extHostContext.getProxy(ExtHostContext.ExtHostWindow);
        Event.latch(hostService.onDidChangeFocus)(this.proxy.$onDidChangeWindowFocus, this.proxy, this.disposables);
    }
    dispose() {
        this.disposables.dispose();
    }
    $getWindowVisibility() {
        return Promise.resolve(this.hostService.hasFocus);
    }
    async $openUri(uriComponents, uriString, options) {
        const uri = URI.from(uriComponents);
        let target;
        if (uriString && URI.parse(uriString).toString() === uri.toString()) {
            // called with string and no transformation happened -> keep string
            target = uriString;
        }
        else {
            // called with URI or transformed -> use uri
            target = uri;
        }
        return this.openerService.open(target, {
            openExternal: true,
            allowTunneling: options.allowTunneling,
            allowContributedOpeners: options.allowContributedOpeners,
        });
    }
    async $asExternalUri(uriComponents, options) {
        const result = await this.openerService.resolveExternalUri(URI.revive(uriComponents), options);
        return result.resolved;
    }
};
MainThreadWindow = __decorate([
    extHostNamedCustomer(MainContext.MainThreadWindow),
    __param(1, IHostService),
    __param(2, IOpenerService)
], MainThreadWindow);
export { MainThreadWindow };

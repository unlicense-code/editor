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
import { extHostNamedCustomer } from 'vs/workbench/services/extensions/common/extHostCustomers';
import { MainContext } from 'vs/workbench/api/common/extHost.protocol';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { log } from 'vs/base/common/console';
import { logRemoteEntry, logRemoteEntryIfError } from 'vs/workbench/services/extensions/common/remoteConsoleUtil';
import { parseExtensionDevOptions } from 'vs/workbench/services/extensions/common/extensionDevOptions';
import { ILogService } from 'vs/platform/log/common/log';
let MainThreadConsole = class MainThreadConsole {
    _environmentService;
    _logService;
    _isExtensionDevTestFromCli;
    constructor(_extHostContext, _environmentService, _logService) {
        this._environmentService = _environmentService;
        this._logService = _logService;
        const devOpts = parseExtensionDevOptions(this._environmentService);
        this._isExtensionDevTestFromCli = devOpts.isExtensionDevTestFromCli;
    }
    dispose() {
        //
    }
    $logExtensionHostMessage(entry) {
        if (this._isExtensionDevTestFromCli) {
            // If running tests from cli, log to the log service everything
            logRemoteEntry(this._logService, entry);
        }
        else {
            // Log to the log service only errors and log everything to local console
            logRemoteEntryIfError(this._logService, entry, 'Extension Host');
            log(entry, 'Extension Host');
        }
    }
};
MainThreadConsole = __decorate([
    extHostNamedCustomer(MainContext.MainThreadConsole),
    __param(1, IEnvironmentService),
    __param(2, ILogService)
], MainThreadConsole);
export { MainThreadConsole };

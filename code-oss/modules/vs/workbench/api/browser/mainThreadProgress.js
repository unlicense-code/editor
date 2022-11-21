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
import { IProgressService } from 'vs/platform/progress/common/progress';
import { MainContext, ExtHostContext } from '../common/extHost.protocol';
import { extHostNamedCustomer } from 'vs/workbench/services/extensions/common/extHostCustomers';
import { Action } from 'vs/base/common/actions';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { localize } from 'vs/nls';
class ManageExtensionAction extends Action {
    constructor(extensionId, label, commandService) {
        super(extensionId, label, undefined, true, () => {
            return commandService.executeCommand('_extensions.manage', extensionId);
        });
    }
}
let MainThreadProgress = class MainThreadProgress {
    _commandService;
    _progressService;
    _progress = new Map();
    _proxy;
    constructor(extHostContext, progressService, _commandService) {
        this._commandService = _commandService;
        this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostProgress);
        this._progressService = progressService;
    }
    dispose() {
        this._progress.forEach(handle => handle.resolve());
        this._progress.clear();
    }
    async $startProgress(handle, options, extensionId) {
        const task = this._createTask(handle);
        if (options.location === 15 /* ProgressLocation.Notification */ && extensionId) {
            const notificationOptions = {
                ...options,
                location: 15 /* ProgressLocation.Notification */,
                secondaryActions: [new ManageExtensionAction(extensionId, localize('manageExtension', "Manage Extension"), this._commandService)]
            };
            options = notificationOptions;
        }
        this._progressService.withProgress(options, task, () => this._proxy.$acceptProgressCanceled(handle));
    }
    $progressReport(handle, message) {
        const entry = this._progress.get(handle);
        entry?.progress.report(message);
    }
    $progressEnd(handle) {
        const entry = this._progress.get(handle);
        if (entry) {
            entry.resolve();
            this._progress.delete(handle);
        }
    }
    _createTask(handle) {
        return (progress) => {
            return new Promise(resolve => {
                this._progress.set(handle, { resolve, progress });
            });
        };
    }
};
MainThreadProgress = __decorate([
    extHostNamedCustomer(MainContext.MainThreadProgress),
    __param(1, IProgressService),
    __param(2, ICommandService)
], MainThreadProgress);
export { MainThreadProgress };

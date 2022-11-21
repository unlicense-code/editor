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
import { Extensions as WorkbenchExtensions } from 'vs/workbench/common/contributions';
import { Registry } from 'vs/platform/registry/common/platform';
import { UserDataSyncWorkbenchContribution } from 'vs/workbench/contrib/userDataSync/browser/userDataSync';
import { IUserDataAutoSyncService } from 'vs/platform/userDataSync/common/userDataSync';
import { INotificationService, Severity } from 'vs/platform/notification/common/notification';
import { Disposable } from 'vs/base/common/lifecycle';
import { localize } from 'vs/nls';
import { isWeb } from 'vs/base/common/platform';
import { UserDataSyncTrigger } from 'vs/workbench/contrib/userDataSync/browser/userDataSyncTrigger';
import { Action } from 'vs/base/common/actions';
import { IProductService } from 'vs/platform/product/common/productService';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { IHostService } from 'vs/workbench/services/host/browser/host';
import { SHOW_SYNC_LOG_COMMAND_ID } from 'vs/workbench/services/userDataSync/common/userDataSync';
let UserDataSyncReportIssueContribution = class UserDataSyncReportIssueContribution extends Disposable {
    notificationService;
    productService;
    commandService;
    hostService;
    constructor(userDataAutoSyncService, notificationService, productService, commandService, hostService) {
        super();
        this.notificationService = notificationService;
        this.productService = productService;
        this.commandService = commandService;
        this.hostService = hostService;
        this._register(userDataAutoSyncService.onError(error => this.onAutoSyncError(error)));
    }
    onAutoSyncError(error) {
        switch (error.code) {
            case "LocalTooManyRequests" /* UserDataSyncErrorCode.LocalTooManyRequests */: {
                const message = isWeb ? localize({ key: 'local too many requests - reload', comment: ['Settings Sync is the name of the feature'] }, "Settings sync is suspended temporarily because the current device is making too many requests. Please reload {0} to resume.", this.productService.nameLong)
                    : localize({ key: 'local too many requests - restart', comment: ['Settings Sync is the name of the feature'] }, "Settings sync is suspended temporarily because the current device is making too many requests. Please restart {0} to resume.", this.productService.nameLong);
                this.notificationService.notify({
                    severity: Severity.Error,
                    message,
                    actions: {
                        primary: [
                            new Action('Show Sync Logs', localize('show sync logs', "Show Log"), undefined, true, () => this.commandService.executeCommand(SHOW_SYNC_LOG_COMMAND_ID)),
                            new Action('Restart', isWeb ? localize('reload', "Reload") : localize('restart', "Restart"), undefined, true, () => this.hostService.restart())
                        ]
                    }
                });
                return;
            }
            case "RemoteTooManyRequests" /* UserDataSyncErrorCode.TooManyRequests */: {
                const operationId = error.operationId ? localize('operationId', "Operation Id: {0}", error.operationId) : undefined;
                const message = localize({ key: 'server too many requests', comment: ['Settings Sync is the name of the feature'] }, "Settings sync is disabled because the current device is making too many requests. Please wait for 10 minutes and turn on sync.");
                this.notificationService.notify({
                    severity: Severity.Error,
                    message: operationId ? `${message} ${operationId}` : message,
                    source: error.operationId ? localize('settings sync', "Settings Sync. Operation Id: {0}", error.operationId) : undefined,
                    actions: {
                        primary: [
                            new Action('Show Sync Logs', localize('show sync logs', "Show Log"), undefined, true, () => this.commandService.executeCommand(SHOW_SYNC_LOG_COMMAND_ID)),
                        ]
                    }
                });
                return;
            }
        }
    }
};
UserDataSyncReportIssueContribution = __decorate([
    __param(0, IUserDataAutoSyncService),
    __param(1, INotificationService),
    __param(2, IProductService),
    __param(3, ICommandService),
    __param(4, IHostService)
], UserDataSyncReportIssueContribution);
const workbenchRegistry = Registry.as(WorkbenchExtensions.Workbench);
workbenchRegistry.registerWorkbenchContribution(UserDataSyncWorkbenchContribution, 3 /* LifecyclePhase.Restored */);
workbenchRegistry.registerWorkbenchContribution(UserDataSyncTrigger, 4 /* LifecyclePhase.Eventually */);
workbenchRegistry.registerWorkbenchContribution(UserDataSyncReportIssueContribution, 4 /* LifecyclePhase.Eventually */);

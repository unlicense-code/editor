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
import { localize } from 'vs/nls';
import { WorkingCopyBackupService } from 'vs/workbench/services/workingCopy/common/workingCopyBackupService';
import { URI } from 'vs/base/common/uri';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { IWorkingCopyBackupService } from 'vs/workbench/services/workingCopy/common/workingCopyBackup';
import { IFileService } from 'vs/platform/files/common/files';
import { ILogService } from 'vs/platform/log/common/log';
import { INativeWorkbenchEnvironmentService } from 'vs/workbench/services/environment/electron-sandbox/environmentService';
import { Registry } from 'vs/platform/registry/common/platform';
import { Extensions as WorkbenchExtensions } from 'vs/workbench/common/contributions';
import { ILifecycleService } from 'vs/workbench/services/lifecycle/common/lifecycle';
import { NativeWorkingCopyBackupTracker } from 'vs/workbench/services/workingCopy/electron-sandbox/workingCopyBackupTracker';
let NativeWorkingCopyBackupService = class NativeWorkingCopyBackupService extends WorkingCopyBackupService {
    lifecycleService;
    constructor(environmentService, fileService, logService, lifecycleService) {
        super(environmentService.backupPath ? URI.file(environmentService.backupPath).with({ scheme: environmentService.userRoamingDataHome.scheme }) : undefined, fileService, logService);
        this.lifecycleService = lifecycleService;
        this.registerListeners();
    }
    registerListeners() {
        // Lifecycle: ensure to prolong the shutdown for as long
        // as pending backup operations have not finished yet.
        // Otherwise, we risk writing partial backups to disk.
        this.lifecycleService.onWillShutdown(event => event.join(this.joinBackups(), { id: 'join.workingCopyBackups', label: localize('join.workingCopyBackups', "Backup working copies") }));
    }
};
NativeWorkingCopyBackupService = __decorate([
    __param(0, INativeWorkbenchEnvironmentService),
    __param(1, IFileService),
    __param(2, ILogService),
    __param(3, ILifecycleService)
], NativeWorkingCopyBackupService);
export { NativeWorkingCopyBackupService };
// Register Service
registerSingleton(IWorkingCopyBackupService, NativeWorkingCopyBackupService, 0 /* InstantiationType.Eager */);
// Register Backup Tracker
Registry.as(WorkbenchExtensions.Workbench).registerWorkbenchContribution(NativeWorkingCopyBackupTracker, 1 /* LifecyclePhase.Starting */);

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
import { IFileService } from 'vs/platform/files/common/files';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { ILogService } from 'vs/platform/log/common/log';
import { WorkingCopyBackupService } from 'vs/workbench/services/workingCopy/common/workingCopyBackupService';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { IWorkingCopyBackupService } from 'vs/workbench/services/workingCopy/common/workingCopyBackup';
import { joinPath } from 'vs/base/common/resources';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { Registry } from 'vs/platform/registry/common/platform';
import { Extensions as WorkbenchExtensions } from 'vs/workbench/common/contributions';
import { BrowserWorkingCopyBackupTracker } from 'vs/workbench/services/workingCopy/browser/workingCopyBackupTracker';
let BrowserWorkingCopyBackupService = class BrowserWorkingCopyBackupService extends WorkingCopyBackupService {
    constructor(contextService, environmentService, fileService, logService) {
        super(joinPath(environmentService.userRoamingDataHome, 'Backups', contextService.getWorkspace().id), fileService, logService);
    }
};
BrowserWorkingCopyBackupService = __decorate([
    __param(0, IWorkspaceContextService),
    __param(1, IWorkbenchEnvironmentService),
    __param(2, IFileService),
    __param(3, ILogService)
], BrowserWorkingCopyBackupService);
export { BrowserWorkingCopyBackupService };
// Register Service
registerSingleton(IWorkingCopyBackupService, BrowserWorkingCopyBackupService, 0 /* InstantiationType.Eager */);
// Register Backup Tracker
Registry.as(WorkbenchExtensions.Workbench).registerWorkbenchContribution(BrowserWorkingCopyBackupTracker, 1 /* LifecyclePhase.Starting */);

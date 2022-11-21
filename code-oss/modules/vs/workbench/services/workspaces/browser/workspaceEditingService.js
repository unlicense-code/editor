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
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { IJSONEditingService } from 'vs/workbench/services/configuration/common/jsonEditing';
import { IWorkspacesService } from 'vs/platform/workspaces/common/workspaces';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { IFileService } from 'vs/platform/files/common/files';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { IFileDialogService, IDialogService } from 'vs/platform/dialogs/common/dialogs';
import { ITextFileService } from 'vs/workbench/services/textfile/common/textfiles';
import { IHostService } from 'vs/workbench/services/host/browser/host';
import { AbstractWorkspaceEditingService } from 'vs/workbench/services/workspaces/browser/abstractWorkspaceEditingService';
import { IWorkspaceEditingService } from 'vs/workbench/services/workspaces/common/workspaceEditing';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
import { IWorkspaceTrustManagementService } from 'vs/platform/workspace/common/workspaceTrust';
import { IWorkbenchConfigurationService } from 'vs/workbench/services/configuration/common/configuration';
import { IUserDataProfilesService } from 'vs/platform/userDataProfile/common/userDataProfile';
import { IUserDataProfileService } from 'vs/workbench/services/userDataProfile/common/userDataProfile';
let BrowserWorkspaceEditingService = class BrowserWorkspaceEditingService extends AbstractWorkspaceEditingService {
    constructor(jsonEditingService, contextService, configurationService, notificationService, commandService, fileService, textFileService, workspacesService, environmentService, fileDialogService, dialogService, hostService, uriIdentityService, workspaceTrustManagementService, userDataProfilesService, userDataProfileService) {
        super(jsonEditingService, contextService, configurationService, notificationService, commandService, fileService, textFileService, workspacesService, environmentService, fileDialogService, dialogService, hostService, uriIdentityService, workspaceTrustManagementService, userDataProfilesService, userDataProfileService);
    }
    async enterWorkspace(workspaceUri) {
        const result = await this.doEnterWorkspace(workspaceUri);
        if (result) {
            // Open workspace in same window
            await this.hostService.openWindow([{ workspaceUri }], { forceReuseWindow: true });
        }
    }
};
BrowserWorkspaceEditingService = __decorate([
    __param(0, IJSONEditingService),
    __param(1, IWorkspaceContextService),
    __param(2, IWorkbenchConfigurationService),
    __param(3, INotificationService),
    __param(4, ICommandService),
    __param(5, IFileService),
    __param(6, ITextFileService),
    __param(7, IWorkspacesService),
    __param(8, IWorkbenchEnvironmentService),
    __param(9, IFileDialogService),
    __param(10, IDialogService),
    __param(11, IHostService),
    __param(12, IUriIdentityService),
    __param(13, IWorkspaceTrustManagementService),
    __param(14, IUserDataProfilesService),
    __param(15, IUserDataProfileService)
], BrowserWorkspaceEditingService);
export { BrowserWorkspaceEditingService };
registerSingleton(IWorkspaceEditingService, BrowserWorkspaceEditingService, 1 /* InstantiationType.Delayed */);

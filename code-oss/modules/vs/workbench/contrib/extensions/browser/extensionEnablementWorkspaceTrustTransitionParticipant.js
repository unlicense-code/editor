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
import { IWorkspaceTrustEnablementService, IWorkspaceTrustManagementService } from 'vs/platform/workspace/common/workspaceTrust';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { IWorkbenchExtensionEnablementService } from 'vs/workbench/services/extensionManagement/common/extensionManagement';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { IHostService } from 'vs/workbench/services/host/browser/host';
let ExtensionEnablementWorkspaceTrustTransitionParticipant = class ExtensionEnablementWorkspaceTrustTransitionParticipant extends Disposable {
    constructor(extensionService, hostService, environmentService, extensionEnablementService, workspaceTrustEnablementService, workspaceTrustManagementService) {
        super();
        if (workspaceTrustEnablementService.isWorkspaceTrustEnabled()) {
            // The extension enablement participant will be registered only after the
            // workspace trust state has been initialized. There is no need to execute
            // the participant as part of the initialization process, as the workspace
            // trust state is initialized before starting the extension host.
            workspaceTrustManagementService.workspaceTrustInitialized.then(() => {
                const workspaceTrustTransitionParticipant = new class {
                    async participate(trusted) {
                        if (trusted) {
                            // Untrusted -> Trusted
                            await extensionEnablementService.updateExtensionsEnablementsWhenWorkspaceTrustChanges();
                        }
                        else {
                            // Trusted -> Untrusted
                            if (environmentService.remoteAuthority) {
                                hostService.reload();
                            }
                            else {
                                extensionService.stopExtensionHosts();
                                await extensionEnablementService.updateExtensionsEnablementsWhenWorkspaceTrustChanges();
                                extensionService.startExtensionHosts();
                            }
                        }
                    }
                };
                // Execute BEFORE the workspace trust transition completes
                this._register(workspaceTrustManagementService.addWorkspaceTrustTransitionParticipant(workspaceTrustTransitionParticipant));
            });
        }
    }
};
ExtensionEnablementWorkspaceTrustTransitionParticipant = __decorate([
    __param(0, IExtensionService),
    __param(1, IHostService),
    __param(2, IWorkbenchEnvironmentService),
    __param(3, IWorkbenchExtensionEnablementService),
    __param(4, IWorkspaceTrustEnablementService),
    __param(5, IWorkspaceTrustManagementService)
], ExtensionEnablementWorkspaceTrustTransitionParticipant);
export { ExtensionEnablementWorkspaceTrustTransitionParticipant };

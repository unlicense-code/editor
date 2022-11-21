import { Disposable } from 'vs/base/common/lifecycle';
import { IWorkspaceTrustEnablementService, IWorkspaceTrustManagementService } from 'vs/platform/workspace/common/workspaceTrust';
import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { IWorkbenchExtensionEnablementService } from 'vs/workbench/services/extensionManagement/common/extensionManagement';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { IHostService } from 'vs/workbench/services/host/browser/host';
export declare class ExtensionEnablementWorkspaceTrustTransitionParticipant extends Disposable implements IWorkbenchContribution {
    constructor(extensionService: IExtensionService, hostService: IHostService, environmentService: IWorkbenchEnvironmentService, extensionEnablementService: IWorkbenchExtensionEnablementService, workspaceTrustEnablementService: IWorkspaceTrustEnablementService, workspaceTrustManagementService: IWorkspaceTrustManagementService);
}

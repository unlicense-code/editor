import { IssueReporterStyles, IssueReporterData } from 'vs/platform/issue/common/issue';
import { IIssueService } from 'vs/platform/issue/electron-sandbox/issue';
import { IColorTheme, IThemeService } from 'vs/platform/theme/common/themeService';
import { IExtensionManagementService } from 'vs/platform/extensionManagement/common/extensionManagement';
import { IWorkbenchExtensionEnablementService } from 'vs/workbench/services/extensionManagement/common/extensionManagement';
import { IWorkbenchIssueService } from 'vs/workbench/services/issue/common/issue';
import { INativeWorkbenchEnvironmentService } from 'vs/workbench/services/environment/electron-sandbox/environmentService';
import { IProductService } from 'vs/platform/product/common/productService';
import { IWorkbenchAssignmentService } from 'vs/workbench/services/assignment/common/assignmentService';
import { IAuthenticationService } from 'vs/workbench/services/authentication/common/authentication';
import { IWorkspaceTrustManagementService } from 'vs/platform/workspace/common/workspaceTrust';
import { IIntegrityService } from 'vs/workbench/services/integrity/common/integrity';
export declare class WorkbenchIssueService implements IWorkbenchIssueService {
    private readonly issueService;
    private readonly themeService;
    private readonly extensionManagementService;
    private readonly extensionEnablementService;
    private readonly environmentService;
    private readonly workspaceTrustManagementService;
    private readonly productService;
    private readonly experimentService;
    private readonly authenticationService;
    private readonly integrityService;
    readonly _serviceBrand: undefined;
    constructor(issueService: IIssueService, themeService: IThemeService, extensionManagementService: IExtensionManagementService, extensionEnablementService: IWorkbenchExtensionEnablementService, environmentService: INativeWorkbenchEnvironmentService, workspaceTrustManagementService: IWorkspaceTrustManagementService, productService: IProductService, experimentService: IWorkbenchAssignmentService, authenticationService: IAuthenticationService, integrityService: IIntegrityService);
    openReporter(dataOverrides?: Partial<IssueReporterData>): Promise<void>;
    openProcessExplorer(): Promise<void>;
}
export declare function getIssueReporterStyles(theme: IColorTheme): IssueReporterStyles;

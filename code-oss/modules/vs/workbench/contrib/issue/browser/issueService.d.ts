import { IExtensionManagementService } from 'vs/platform/extensionManagement/common/extensionManagement';
import { IProductService } from 'vs/platform/product/common/productService';
import { IWorkbenchIssueService } from 'vs/workbench/services/issue/common/issue';
import { IssueReporterData } from 'vs/platform/issue/common/issue';
export declare class WebIssueService implements IWorkbenchIssueService {
    private readonly extensionManagementService;
    private readonly productService;
    readonly _serviceBrand: undefined;
    constructor(extensionManagementService: IExtensionManagementService, productService: IProductService);
    openProcessExplorer(): Promise<void>;
    openReporter(options: Partial<IssueReporterData>): Promise<void>;
    private getExtensionGitHubUrl;
    private getIssueDescription;
}

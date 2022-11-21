import { Action } from 'vs/base/common/actions';
import { IExtensionDescription } from 'vs/platform/extensions/common/extensions';
import { IWorkbenchIssueService } from 'vs/workbench/services/issue/common/issue';
export declare class ReportExtensionIssueAction extends Action {
    private extension;
    private readonly issueService;
    private static readonly _id;
    private static readonly _label;
    constructor(extension: IExtensionDescription, issueService: IWorkbenchIssueService);
    run(): Promise<void>;
}

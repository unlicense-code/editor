import { IssueReporterData } from 'vs/platform/issue/common/issue';
export declare const IWorkbenchIssueService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IWorkbenchIssueService>;
export interface IWorkbenchIssueService {
    readonly _serviceBrand: undefined;
    openReporter(dataOverrides?: Partial<IssueReporterData>): Promise<void>;
    openProcessExplorer(): Promise<void>;
}

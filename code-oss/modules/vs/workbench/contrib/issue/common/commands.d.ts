export declare const OpenIssueReporterActionId = "workbench.action.openIssueReporter";
export declare const OpenIssueReporterApiCommandId = "vscode.openIssueReporter";
export interface OpenIssueReporterArgs {
    readonly extensionId?: string;
    readonly issueTitle?: string;
    readonly issueBody?: string;
}

import { Action2 } from 'vs/platform/actions/common/actions';
import { ServicesAccessor } from 'vs/platform/instantiation/common/instantiation';
export declare class OpenProcessExplorer extends Action2 {
    static readonly ID = "workbench.action.openProcessExplorer";
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class ReportPerformanceIssueUsingReporterAction extends Action2 {
    static readonly ID = "workbench.action.reportPerformanceIssueUsingReporter";
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class StopTracing extends Action2 {
    static readonly ID = "workbench.action.stopTracing";
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}

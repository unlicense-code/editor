import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
import { IDebugService, State, IDebugSession } from 'vs/workbench/contrib/debug/common/debug';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { IStatusbarService } from 'vs/workbench/services/statusbar/browser/statusbar';
export declare const STATUS_BAR_DEBUGGING_BACKGROUND: string;
export declare const STATUS_BAR_DEBUGGING_FOREGROUND: string;
export declare const STATUS_BAR_DEBUGGING_BORDER: string;
export declare class StatusBarColorProvider implements IWorkbenchContribution {
    private readonly debugService;
    private readonly contextService;
    private readonly statusbarService;
    private readonly disposables;
    private disposable;
    private set enabled(value);
    constructor(debugService: IDebugService, contextService: IWorkspaceContextService, statusbarService: IStatusbarService);
    protected update(): void;
    dispose(): void;
}
export declare function isStatusbarInDebugMode(state: State, sessions: IDebugSession[]): boolean;

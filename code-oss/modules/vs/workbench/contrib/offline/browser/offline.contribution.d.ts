import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { IDebugService } from 'vs/workbench/contrib/debug/common/debug';
import { IStatusbarService } from 'vs/workbench/services/statusbar/browser/statusbar';
export declare const STATUS_BAR_OFFLINE_BACKGROUND: string;
export declare const STATUS_BAR_OFFLINE_FOREGROUND: string;
export declare const STATUS_BAR_OFFLINE_BORDER: string;
export declare class OfflineStatusBarController implements IWorkbenchContribution {
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

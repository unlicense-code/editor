import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
import { IDebugService } from 'vs/workbench/contrib/debug/common/debug';
import { IProgressService } from 'vs/platform/progress/common/progress';
import { IViewsService } from 'vs/workbench/common/views';
export declare class DebugProgressContribution implements IWorkbenchContribution {
    private toDispose;
    constructor(debugService: IDebugService, progressService: IProgressService, viewsService: IViewsService);
    dispose(): void;
}

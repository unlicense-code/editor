import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
import { IDebugService } from 'vs/workbench/contrib/debug/common/debug';
import { IHostService } from 'vs/workbench/services/host/browser/host';
import { ITitleService } from 'vs/workbench/services/title/common/titleService';
export declare class DebugTitleContribution implements IWorkbenchContribution {
    readonly debugService: IDebugService;
    readonly hostService: IHostService;
    readonly titleService: ITitleService;
    private toDispose;
    constructor(debugService: IDebugService, hostService: IHostService, titleService: ITitleService);
    dispose(): void;
}

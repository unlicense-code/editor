import { IDebugService } from 'vs/workbench/contrib/debug/common/debug';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IStatusbarService } from 'vs/workbench/services/statusbar/browser/statusbar';
import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
export declare class DebugStatusContribution implements IWorkbenchContribution {
    private readonly statusBarService;
    readonly debugService: IDebugService;
    readonly configurationService: IConfigurationService;
    private showInStatusBar;
    private toDispose;
    private entryAccessor;
    constructor(statusBarService: IStatusbarService, debugService: IDebugService, configurationService: IConfigurationService);
    private get entry();
    dispose(): void;
}

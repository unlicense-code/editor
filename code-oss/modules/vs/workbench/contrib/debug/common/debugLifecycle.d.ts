import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IDialogService } from 'vs/platform/dialogs/common/dialogs';
import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
import { IDebugService } from 'vs/workbench/contrib/debug/common/debug';
import { ILifecycleService } from 'vs/workbench/services/lifecycle/common/lifecycle';
export declare class DebugLifecycle implements IWorkbenchContribution {
    private readonly debugService;
    private readonly configurationService;
    private readonly dialogService;
    constructor(lifecycleService: ILifecycleService, debugService: IDebugService, configurationService: IConfigurationService, dialogService: IDialogService);
    private shouldVetoShutdown;
    private showWindowCloseConfirmation;
}

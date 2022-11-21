import { INotificationService } from 'vs/platform/notification/common/notification';
import { IExperimentService } from 'vs/workbench/contrib/experiments/common/experimentService';
import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
import { Disposable } from 'vs/base/common/lifecycle';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { IPaneCompositePartService } from 'vs/workbench/services/panecomposite/browser/panecomposite';
export declare class ExperimentalPrompts extends Disposable implements IWorkbenchContribution {
    private readonly experimentService;
    private readonly paneCompositeService;
    private readonly notificationService;
    private readonly openerService;
    private readonly commandService;
    constructor(experimentService: IExperimentService, paneCompositeService: IPaneCompositePartService, notificationService: INotificationService, openerService: IOpenerService, commandService: ICommandService);
    private showExperimentalPrompts;
    static getLocalizedText(text: string | {
        [key: string]: string;
    }, displayLanguage: string): string;
}

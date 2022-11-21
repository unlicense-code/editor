import { Disposable } from 'vs/base/common/lifecycle';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IProductService } from 'vs/platform/product/common/productService';
import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
import { IStatusbarService } from 'vs/workbench/services/statusbar/browser/statusbar';
import { ICommandService } from 'vs/platform/commands/common/commands';
export declare class FeedbackStatusbarConribution extends Disposable implements IWorkbenchContribution {
    private readonly statusbarService;
    private readonly instantiationService;
    private readonly commandService;
    private static readonly TOGGLE_FEEDBACK_COMMAND;
    private widget;
    private entry;
    constructor(statusbarService: IStatusbarService, productService: IProductService, instantiationService: IInstantiationService, commandService: ICommandService);
    private createFeedbackStatusEntry;
    private toggleFeedback;
    private getStatusEntry;
}

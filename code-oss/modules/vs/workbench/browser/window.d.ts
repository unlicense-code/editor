import { Disposable } from 'vs/base/common/lifecycle';
import { IDialogService } from 'vs/platform/dialogs/common/dialogs';
import { ILabelService } from 'vs/platform/label/common/label';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { IProductService } from 'vs/platform/product/common/productService';
import { IBrowserWorkbenchEnvironmentService } from 'vs/workbench/services/environment/browser/environmentService';
import { IWorkbenchLayoutService } from 'vs/workbench/services/layout/browser/layoutService';
import { BrowserLifecycleService } from 'vs/workbench/services/lifecycle/browser/lifecycleService';
import { IHostService } from 'vs/workbench/services/host/browser/host';
export declare class BrowserWindow extends Disposable {
    private readonly openerService;
    private readonly lifecycleService;
    private readonly dialogService;
    private readonly labelService;
    private readonly productService;
    private readonly environmentService;
    private readonly layoutService;
    private readonly hostService;
    constructor(openerService: IOpenerService, lifecycleService: BrowserLifecycleService, dialogService: IDialogService, labelService: ILabelService, productService: IProductService, environmentService: IBrowserWorkbenchEnvironmentService, layoutService: IWorkbenchLayoutService, hostService: IHostService);
    private registerListeners;
    private onWillShutdown;
    private create;
    private setupDriver;
    private setupOpenHandlers;
    private registerLabelFormatters;
    private registerCommands;
}

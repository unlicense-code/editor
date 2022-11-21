import { IClipboardService } from 'vs/platform/clipboard/common/clipboardService';
import { IDialogService } from 'vs/platform/dialogs/common/dialogs';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { ILayoutService } from 'vs/platform/layout/browser/layoutService';
import { ILogService } from 'vs/platform/log/common/log';
import { IProductService } from 'vs/platform/product/common/productService';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
import { Disposable } from 'vs/base/common/lifecycle';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
export declare class DialogHandlerContribution extends Disposable implements IWorkbenchContribution {
    private dialogService;
    private readonly model;
    private readonly impl;
    private currentDialog;
    constructor(dialogService: IDialogService, logService: ILogService, layoutService: ILayoutService, themeService: IThemeService, keybindingService: IKeybindingService, instantiationService: IInstantiationService, productService: IProductService, clipboardService: IClipboardService);
    private processDialogs;
}

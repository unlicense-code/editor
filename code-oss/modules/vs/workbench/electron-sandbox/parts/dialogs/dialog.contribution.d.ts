import { IClipboardService } from 'vs/platform/clipboard/common/clipboardService';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IDialogService } from 'vs/platform/dialogs/common/dialogs';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { ILayoutService } from 'vs/platform/layout/browser/layoutService';
import { ILogService } from 'vs/platform/log/common/log';
import { INativeHostService } from 'vs/platform/native/electron-sandbox/native';
import { IProductService } from 'vs/platform/product/common/productService';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
import { Disposable } from 'vs/base/common/lifecycle';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
export declare class DialogHandlerContribution extends Disposable implements IWorkbenchContribution {
    private configurationService;
    private dialogService;
    private nativeImpl;
    private browserImpl;
    private model;
    private currentDialog;
    constructor(configurationService: IConfigurationService, dialogService: IDialogService, logService: ILogService, layoutService: ILayoutService, themeService: IThemeService, keybindingService: IKeybindingService, instantiationService: IInstantiationService, productService: IProductService, clipboardService: IClipboardService, nativeHostService: INativeHostService);
    private processDialogs;
    private get useCustomDialog();
}

import { IDialogOptions, IConfirmation, IConfirmationResult, IShowResult, IInputResult, IInput, IDialogHandler } from 'vs/platform/dialogs/common/dialogs';
import { ILayoutService } from 'vs/platform/layout/browser/layoutService';
import { ILogService } from 'vs/platform/log/common/log';
import Severity from 'vs/base/common/severity';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { IProductService } from 'vs/platform/product/common/productService';
import { IClipboardService } from 'vs/platform/clipboard/common/clipboardService';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
export declare class BrowserDialogHandler implements IDialogHandler {
    private readonly logService;
    private readonly layoutService;
    private readonly themeService;
    private readonly keybindingService;
    private readonly instantiationService;
    private readonly productService;
    private readonly clipboardService;
    private static readonly ALLOWABLE_COMMANDS;
    private readonly markdownRenderer;
    constructor(logService: ILogService, layoutService: ILayoutService, themeService: IThemeService, keybindingService: IKeybindingService, instantiationService: IInstantiationService, productService: IProductService, clipboardService: IClipboardService);
    confirm(confirmation: IConfirmation): Promise<IConfirmationResult>;
    private getDialogType;
    show(severity: Severity, message: string, buttons?: string[], options?: IDialogOptions): Promise<IShowResult>;
    private doShow;
    input(severity: Severity, message: string, buttons: string[], inputs: IInput[], options?: IDialogOptions): Promise<IInputResult>;
    about(): Promise<void>;
}

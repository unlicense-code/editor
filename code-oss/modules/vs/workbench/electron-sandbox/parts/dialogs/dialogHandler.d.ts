import Severity from 'vs/base/common/severity';
import { IClipboardService } from 'vs/platform/clipboard/common/clipboardService';
import { IConfirmation, IConfirmationResult, IDialogHandler, IDialogOptions, IShowResult } from 'vs/platform/dialogs/common/dialogs';
import { ILogService } from 'vs/platform/log/common/log';
import { INativeHostService } from 'vs/platform/native/electron-sandbox/native';
import { IProductService } from 'vs/platform/product/common/productService';
export declare class NativeDialogHandler implements IDialogHandler {
    private readonly logService;
    private readonly nativeHostService;
    private readonly productService;
    private readonly clipboardService;
    constructor(logService: ILogService, nativeHostService: INativeHostService, productService: IProductService, clipboardService: IClipboardService);
    confirm(confirmation: IConfirmation): Promise<IConfirmationResult>;
    private getConfirmOptions;
    show(severity: Severity, message: string, buttons?: string[], dialogOptions?: IDialogOptions): Promise<IShowResult>;
    private massageMessageBoxOptions;
    input(): never;
    about(): Promise<void>;
}

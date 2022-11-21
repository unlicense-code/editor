import { URI } from 'vs/base/common/uri';
import { MainThreadDiaglogsShape, MainThreadDialogOpenOptions, MainThreadDialogSaveOptions } from '../common/extHost.protocol';
import { IExtHostContext } from 'vs/workbench/services/extensions/common/extHostCustomers';
import { IFileDialogService } from 'vs/platform/dialogs/common/dialogs';
export declare class MainThreadDialogs implements MainThreadDiaglogsShape {
    private readonly _fileDialogService;
    constructor(context: IExtHostContext, _fileDialogService: IFileDialogService);
    dispose(): void;
    $showOpenDialog(options?: MainThreadDialogOpenOptions): Promise<URI[] | undefined>;
    $showSaveDialog(options?: MainThreadDialogSaveOptions): Promise<URI | undefined>;
    private static _convertOpenOptions;
    private static _convertSaveOptions;
}

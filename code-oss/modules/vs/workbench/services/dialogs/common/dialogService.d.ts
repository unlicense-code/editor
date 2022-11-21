import Severity from 'vs/base/common/severity';
import { Disposable } from 'vs/base/common/lifecycle';
import { IConfirmation, IConfirmationResult, IDialogOptions, IDialogService, IInput, IInputResult, IShowResult } from 'vs/platform/dialogs/common/dialogs';
import { DialogsModel } from 'vs/workbench/common/dialogs';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { ILogService } from 'vs/platform/log/common/log';
export declare class DialogService extends Disposable implements IDialogService {
    private readonly environmentService;
    private readonly logService;
    readonly _serviceBrand: undefined;
    readonly model: DialogsModel;
    readonly onWillShowDialog: import("../../../workbench.web.main").Event<void>;
    readonly onDidShowDialog: import("../../../workbench.web.main").Event<void>;
    constructor(environmentService: IWorkbenchEnvironmentService, logService: ILogService);
    private skipDialogs;
    confirm(confirmation: IConfirmation): Promise<IConfirmationResult>;
    show(severity: Severity, message: string, buttons?: string[], options?: IDialogOptions): Promise<IShowResult>;
    input(severity: Severity, message: string, buttons: string[], inputs: IInput[], options?: IDialogOptions): Promise<IInputResult>;
    about(): Promise<void>;
}

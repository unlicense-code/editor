import { Event } from 'vs/base/common/event';
import Severity from 'vs/base/common/severity';
import { IConfirmation, IConfirmationResult, IDialogOptions, IDialogService, IInputResult, IShowResult } from 'vs/platform/dialogs/common/dialogs';
export declare class TestDialogService implements IDialogService {
    readonly _serviceBrand: undefined;
    readonly onWillShowDialog: Event<any>;
    readonly onDidShowDialog: Event<any>;
    private confirmResult;
    setConfirmResult(result: IConfirmationResult): void;
    confirm(confirmation: IConfirmation): Promise<IConfirmationResult>;
    show(severity: Severity, message: string, buttons?: string[], options?: IDialogOptions): Promise<IShowResult>;
    input(): Promise<IInputResult>;
    about(): Promise<void>;
}

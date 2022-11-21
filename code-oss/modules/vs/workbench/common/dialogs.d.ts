import { Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { IDialog, IDialogResult } from 'vs/platform/dialogs/common/dialogs';
export interface IDialogViewItem {
    args: IDialog;
    close(result?: IDialogResult): void;
}
export interface IDialogHandle {
    item: IDialogViewItem;
    result: Promise<IDialogResult | undefined>;
}
export interface IDialogsModel {
    readonly onWillShowDialog: Event<void>;
    readonly onDidShowDialog: Event<void>;
    readonly dialogs: IDialogViewItem[];
    show(dialog: IDialog): IDialogHandle;
}
export declare class DialogsModel extends Disposable implements IDialogsModel {
    readonly dialogs: IDialogViewItem[];
    private readonly _onWillShowDialog;
    readonly onWillShowDialog: Event<void>;
    private readonly _onDidShowDialog;
    readonly onDidShowDialog: Event<void>;
    show(dialog: IDialog): IDialogHandle;
}

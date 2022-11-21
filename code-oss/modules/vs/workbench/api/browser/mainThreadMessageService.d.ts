import Severity from 'vs/base/common/severity';
import { MainThreadMessageServiceShape, MainThreadMessageOptions } from '../common/extHost.protocol';
import { IExtHostContext } from 'vs/workbench/services/extensions/common/extHostCustomers';
import { IDialogService } from 'vs/platform/dialogs/common/dialogs';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { ICommandService } from 'vs/platform/commands/common/commands';
export declare class MainThreadMessageService implements MainThreadMessageServiceShape {
    private readonly _notificationService;
    private readonly _commandService;
    private readonly _dialogService;
    constructor(extHostContext: IExtHostContext, _notificationService: INotificationService, _commandService: ICommandService, _dialogService: IDialogService);
    dispose(): void;
    $showMessage(severity: Severity, message: string, options: MainThreadMessageOptions, commands: {
        title: string;
        isCloseAffordance: boolean;
        handle: number;
    }[]): Promise<number | undefined>;
    private _showMessage;
    private _showModalMessage;
}

import { IPickOptions, IQuickInputService } from 'vs/platform/quickinput/common/quickInput';
import { MainThreadQuickOpenShape, TransferQuickPickItem, TransferQuickInput, IInputBoxOptions, TransferQuickPickItemOrSeparator } from 'vs/workbench/api/common/extHost.protocol';
import { IExtHostContext } from 'vs/workbench/services/extensions/common/extHostCustomers';
import { CancellationToken } from 'vs/base/common/cancellation';
export declare class MainThreadQuickOpen implements MainThreadQuickOpenShape {
    private readonly _proxy;
    private readonly _quickInputService;
    private readonly _items;
    constructor(extHostContext: IExtHostContext, quickInputService: IQuickInputService);
    dispose(): void;
    $show(instance: number, options: IPickOptions<TransferQuickPickItem>, token: CancellationToken): Promise<number | number[] | undefined>;
    $setItems(instance: number, items: TransferQuickPickItemOrSeparator[]): Promise<void>;
    $setError(instance: number, error: Error): Promise<void>;
    $input(options: IInputBoxOptions | undefined, validateInput: boolean, token: CancellationToken): Promise<string | undefined>;
    private sessions;
    $createOrUpdate(params: TransferQuickInput): Promise<void>;
    $dispose(sessionId: number): Promise<void>;
}

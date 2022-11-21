import { ISharedProcessService } from 'vs/platform/ipc/electron-sandbox/services';
import { Disposable } from 'vs/base/common/lifecycle';
import { Event } from 'vs/base/common/event';
import { IUserDataSyncAccountService, IUserDataSyncAccount } from 'vs/platform/userDataSync/common/userDataSyncAccount';
export declare class UserDataSyncAccountService extends Disposable implements IUserDataSyncAccountService {
    readonly _serviceBrand: undefined;
    private readonly channel;
    private _account;
    get account(): IUserDataSyncAccount | undefined;
    get onTokenFailed(): Event<boolean>;
    private _onDidChangeAccount;
    readonly onDidChangeAccount: Event<IUserDataSyncAccount | undefined>;
    constructor(sharedProcessService: ISharedProcessService);
    updateAccount(account: IUserDataSyncAccount | undefined): Promise<undefined>;
}

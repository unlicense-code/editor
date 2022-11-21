import { Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { IUserDataSyncLogService, IUserDataSyncStoreService } from 'vs/platform/userDataSync/common/userDataSync';
export interface IUserDataSyncAccount {
    readonly authenticationProviderId: string;
    readonly token: string;
}
export declare const IUserDataSyncAccountService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IUserDataSyncAccountService>;
export interface IUserDataSyncAccountService {
    readonly _serviceBrand: undefined;
    readonly onTokenFailed: Event<boolean>;
    readonly account: IUserDataSyncAccount | undefined;
    readonly onDidChangeAccount: Event<IUserDataSyncAccount | undefined>;
    updateAccount(account: IUserDataSyncAccount | undefined): Promise<void>;
}
export declare class UserDataSyncAccountService extends Disposable implements IUserDataSyncAccountService {
    private readonly userDataSyncStoreService;
    private readonly logService;
    _serviceBrand: any;
    private _account;
    get account(): IUserDataSyncAccount | undefined;
    private _onDidChangeAccount;
    readonly onDidChangeAccount: Event<IUserDataSyncAccount | undefined>;
    private _onTokenFailed;
    readonly onTokenFailed: Event<boolean>;
    private wasTokenFailed;
    constructor(userDataSyncStoreService: IUserDataSyncStoreService, logService: IUserDataSyncLogService);
    updateAccount(account: IUserDataSyncAccount | undefined): Promise<void>;
}

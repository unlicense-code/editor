import { IAuthenticationProvider, SyncResource, IUserDataSyncResource, IResourcePreview } from 'vs/platform/userDataSync/common/userDataSync';
import { Event } from 'vs/base/common/event';
import { RawContextKey } from 'vs/platform/contextkey/common/contextkey';
import { URI } from 'vs/base/common/uri';
import { IView } from 'vs/workbench/common/views';
export interface IUserDataSyncAccount {
    readonly authenticationProviderId: string;
    readonly accountName: string;
    readonly accountId: string;
}
export declare const IUserDataSyncWorkbenchService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IUserDataSyncWorkbenchService>;
export interface IUserDataSyncWorkbenchService {
    _serviceBrand: any;
    readonly enabled: boolean;
    readonly authenticationProviders: IAuthenticationProvider[];
    readonly all: IUserDataSyncAccount[];
    readonly current: IUserDataSyncAccount | undefined;
    readonly accountStatus: AccountStatus;
    readonly onDidChangeAccountStatus: Event<AccountStatus>;
    turnOn(): Promise<void>;
    turnOnUsingCurrentAccount(): Promise<void>;
    turnoff(everyWhere: boolean): Promise<void>;
    signIn(): Promise<void>;
    resetSyncedData(): Promise<void>;
    showSyncActivity(): Promise<void>;
    syncNow(): Promise<void>;
    synchroniseUserDataSyncStoreType(): Promise<void>;
    showConflicts(conflictToOpen?: IResourcePreview): Promise<void>;
    accept(resource: IUserDataSyncResource, conflictResource: URI, content: string | null | undefined, apply: boolean): Promise<void>;
}
export declare function getSyncAreaLabel(source: SyncResource): string;
export declare const enum AccountStatus {
    Uninitialized = "uninitialized",
    Unavailable = "unavailable",
    Available = "available"
}
export interface IUserDataSyncConflictsView extends IView {
    open(conflict: IResourcePreview): Promise<void>;
}
export declare const SYNC_TITLE: string;
export declare const SYNC_VIEW_ICON: import("../../../../platform/theme/common/themeService").ThemeIcon;
export declare const CONTEXT_SYNC_STATE: RawContextKey<string>;
export declare const CONTEXT_SYNC_ENABLEMENT: RawContextKey<boolean>;
export declare const CONTEXT_ACCOUNT_STATE: RawContextKey<string>;
export declare const CONTEXT_ENABLE_ACTIVITY_VIEWS: RawContextKey<boolean>;
export declare const CONTEXT_ENABLE_SYNC_CONFLICTS_VIEW: RawContextKey<boolean>;
export declare const CONTEXT_HAS_CONFLICTS: RawContextKey<boolean>;
export declare const CONFIGURE_SYNC_COMMAND_ID = "workbench.userDataSync.actions.configure";
export declare const SHOW_SYNC_LOG_COMMAND_ID = "workbench.userDataSync.actions.showLog";
export declare const SYNC_VIEW_CONTAINER_ID = "workbench.view.sync";
export declare const SYNC_CONFLICTS_VIEW_ID = "workbench.views.sync.conflicts";

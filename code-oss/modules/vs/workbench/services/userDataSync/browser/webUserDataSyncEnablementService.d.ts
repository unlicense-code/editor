import { IUserDataSyncEnablementService, SyncResource } from 'vs/platform/userDataSync/common/userDataSync';
import { UserDataSyncEnablementService } from 'vs/workbench/services/userDataSync/browser/userDataSyncEnablementService';
export declare class WebUserDataSyncEnablementService extends UserDataSyncEnablementService implements IUserDataSyncEnablementService {
    private enabled;
    canToggleEnablement(): boolean;
    isEnabled(): boolean;
    setEnablement(enabled: boolean): void;
    getResourceSyncStateVersion(resource: SyncResource): string | undefined;
    private isTrusted;
}

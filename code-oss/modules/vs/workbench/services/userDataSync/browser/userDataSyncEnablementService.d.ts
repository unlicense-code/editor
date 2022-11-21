import { IUserDataSyncEnablementService, SyncResource } from 'vs/platform/userDataSync/common/userDataSync';
import { UserDataSyncEnablementService as BaseUserDataSyncEnablementService } from 'vs/platform/userDataSync/common/userDataSyncEnablementService';
import { IBrowserWorkbenchEnvironmentService } from 'vs/workbench/services/environment/browser/environmentService';
export declare class UserDataSyncEnablementService extends BaseUserDataSyncEnablementService implements IUserDataSyncEnablementService {
    protected get workbenchEnvironmentService(): IBrowserWorkbenchEnvironmentService;
    getResourceSyncStateVersion(resource: SyncResource): string | undefined;
}

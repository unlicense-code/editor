import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ILogService } from 'vs/platform/log/common/log';
import { IRemoteAuthorityResolverService } from 'vs/platform/remote/common/remoteAuthorityResolver';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IUserDataSyncStoreManagementService } from 'vs/platform/userDataSync/common/userDataSync';
import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
import { IAuthenticationService } from 'vs/workbench/services/authentication/common/authentication';
import { IExtensionManagementServerService } from 'vs/workbench/services/extensionManagement/common/extensionManagement';
import { IRemoteAgentService } from 'vs/workbench/services/remote/common/remoteAgentService';
export declare class RemoteExtensionsInitializerContribution implements IWorkbenchContribution {
    private readonly extensionManagementServerService;
    private readonly storageService;
    private readonly remoteAgentService;
    private readonly userDataSyncStoreManagementService;
    private readonly instantiationService;
    private readonly logService;
    private readonly authenticationService;
    private readonly remoteAuthorityResolverService;
    constructor(extensionManagementServerService: IExtensionManagementServerService, storageService: IStorageService, remoteAgentService: IRemoteAgentService, userDataSyncStoreManagementService: IUserDataSyncStoreManagementService, instantiationService: IInstantiationService, logService: ILogService, authenticationService: IAuthenticationService, remoteAuthorityResolverService: IRemoteAuthorityResolverService);
    private initializeRemoteExtensions;
}

import { ILifecycleService } from 'vs/workbench/services/lifecycle/common/lifecycle';
import { IFileService } from 'vs/platform/files/common/files';
import { IRemoteAgentService } from 'vs/workbench/services/remote/common/remoteAgentService';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
import { ILabelService } from 'vs/platform/label/common/label';
import { ILogService } from 'vs/platform/log/common/log';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IWorkingCopyHistoryModelOptions, WorkingCopyHistoryService } from 'vs/workbench/services/workingCopy/common/workingCopyHistoryService';
export declare class NativeWorkingCopyHistoryService extends WorkingCopyHistoryService {
    private readonly lifecycleService;
    private static readonly STORE_ALL_INTERVAL;
    private readonly isRemotelyStored;
    private readonly storeAllCts;
    private readonly storeAllScheduler;
    constructor(fileService: IFileService, remoteAgentService: IRemoteAgentService, environmentService: IWorkbenchEnvironmentService, uriIdentityService: IUriIdentityService, labelService: ILabelService, lifecycleService: ILifecycleService, logService: ILogService, configurationService: IConfigurationService);
    private registerListeners;
    protected getModelOptions(): IWorkingCopyHistoryModelOptions;
    private onWillShutdown;
    private onDidChangeModels;
    private storeAll;
}

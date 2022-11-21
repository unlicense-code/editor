import { IRemoteAgentService } from 'vs/workbench/services/remote/common/remoteAgentService';
import { INativeWorkbenchEnvironmentService } from 'vs/workbench/services/environment/electron-sandbox/environmentService';
import { AbstractPathService } from 'vs/workbench/services/path/common/pathService';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
export declare class NativePathService extends AbstractPathService {
    constructor(remoteAgentService: IRemoteAgentService, environmentService: INativeWorkbenchEnvironmentService, contextService: IWorkspaceContextService);
}

import { IRemoteAgentService } from 'vs/workbench/services/remote/common/remoteAgentService';
import { AbstractPathService } from 'vs/workbench/services/path/common/pathService';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
export declare class BrowserPathService extends AbstractPathService {
    constructor(remoteAgentService: IRemoteAgentService, environmentService: IWorkbenchEnvironmentService, contextService: IWorkspaceContextService);
}

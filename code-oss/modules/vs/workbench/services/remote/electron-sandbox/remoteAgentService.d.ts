import { IRemoteAgentService } from 'vs/workbench/services/remote/common/remoteAgentService';
import { IRemoteAuthorityResolverService } from 'vs/platform/remote/common/remoteAuthorityResolver';
import { IProductService } from 'vs/platform/product/common/productService';
import { AbstractRemoteAgentService } from 'vs/workbench/services/remote/common/abstractRemoteAgentService';
import { ISignService } from 'vs/platform/sign/common/sign';
import { ILogService } from 'vs/platform/log/common/log';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
export declare class RemoteAgentService extends AbstractRemoteAgentService implements IRemoteAgentService {
    constructor(environmentService: IWorkbenchEnvironmentService, productService: IProductService, remoteAuthorityResolverService: IRemoteAuthorityResolverService, signService: ISignService, logService: ILogService);
}

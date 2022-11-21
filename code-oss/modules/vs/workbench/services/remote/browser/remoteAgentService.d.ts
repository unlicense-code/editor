import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { IRemoteAgentService } from 'vs/workbench/services/remote/common/remoteAgentService';
import { IRemoteAuthorityResolverService } from 'vs/platform/remote/common/remoteAuthorityResolver';
import { AbstractRemoteAgentService } from 'vs/workbench/services/remote/common/abstractRemoteAgentService';
import { IProductService } from 'vs/platform/product/common/productService';
import { IWebSocketFactory } from 'vs/platform/remote/browser/browserSocketFactory';
import { ISignService } from 'vs/platform/sign/common/sign';
import { ILogService } from 'vs/platform/log/common/log';
export declare class RemoteAgentService extends AbstractRemoteAgentService implements IRemoteAgentService {
    constructor(webSocketFactory: IWebSocketFactory | null | undefined, environmentService: IWorkbenchEnvironmentService, productService: IProductService, remoteAuthorityResolverService: IRemoteAuthorityResolverService, signService: ISignService, logService: ILogService);
}

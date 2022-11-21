import { IExtHostContext } from 'vs/workbench/services/extensions/common/extHostCustomers';
import { IRemoteAuthorityResolverService } from 'vs/platform/remote/common/remoteAuthorityResolver';
import { Disposable } from 'vs/base/common/lifecycle';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
export declare class MainThreadRemoteConnectionData extends Disposable {
    protected readonly _environmentService: IWorkbenchEnvironmentService;
    private readonly _proxy;
    constructor(extHostContext: IExtHostContext, _environmentService: IWorkbenchEnvironmentService, remoteAuthorityResolverService: IRemoteAuthorityResolverService);
}

import { UriComponents } from 'vs/base/common/uri';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { IExtHostContext } from 'vs/workbench/services/extensions/common/extHostCustomers';
import { IOpenUriOptions, MainThreadWindowShape } from '../common/extHost.protocol';
import { IHostService } from 'vs/workbench/services/host/browser/host';
export declare class MainThreadWindow implements MainThreadWindowShape {
    private readonly hostService;
    private readonly openerService;
    private readonly proxy;
    private readonly disposables;
    constructor(extHostContext: IExtHostContext, hostService: IHostService, openerService: IOpenerService);
    dispose(): void;
    $getWindowVisibility(): Promise<boolean>;
    $openUri(uriComponents: UriComponents, uriString: string | undefined, options: IOpenUriOptions): Promise<boolean>;
    $asExternalUri(uriComponents: UriComponents, options: IOpenUriOptions): Promise<UriComponents>;
}

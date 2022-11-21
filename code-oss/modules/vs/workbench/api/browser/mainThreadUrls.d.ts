import { MainThreadUrlsShape } from 'vs/workbench/api/common/extHost.protocol';
import { IExtHostContext } from '../../services/extensions/common/extHostCustomers';
import { IURLService } from 'vs/platform/url/common/url';
import { URI, UriComponents } from 'vs/base/common/uri';
import { IExtensionUrlHandler } from 'vs/workbench/services/extensions/browser/extensionUrlHandler';
import { ExtensionIdentifier } from 'vs/platform/extensions/common/extensions';
export declare class MainThreadUrls implements MainThreadUrlsShape {
    private readonly urlService;
    private readonly extensionUrlHandler;
    private readonly proxy;
    private handlers;
    constructor(context: IExtHostContext, urlService: IURLService, extensionUrlHandler: IExtensionUrlHandler);
    $registerUriHandler(handle: number, extensionId: ExtensionIdentifier): Promise<void>;
    $unregisterUriHandler(handle: number): Promise<void>;
    $createAppUri(uri: UriComponents): Promise<URI>;
    dispose(): void;
}

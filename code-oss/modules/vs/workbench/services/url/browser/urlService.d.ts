import { URI, UriComponents } from 'vs/base/common/uri';
import { AbstractURLService } from 'vs/platform/url/common/urlService';
import { Event } from 'vs/base/common/event';
import { IBrowserWorkbenchEnvironmentService } from 'vs/workbench/services/environment/browser/environmentService';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { IProductService } from 'vs/platform/product/common/productService';
export interface IURLCallbackProvider {
    /**
     * Indicates that a Uri has been opened outside of VSCode. The Uri
     * will be forwarded to all installed Uri handlers in the system.
     */
    readonly onCallback: Event<URI>;
    /**
     * Creates a Uri that - if opened in a browser - must result in
     * the `onCallback` to fire.
     *
     * The optional `Partial<UriComponents>` must be properly restored for
     * the Uri passed to the `onCallback` handler.
     *
     * For example: if a Uri is to be created with `scheme:"vscode"`,
     * `authority:"foo"` and `path:"bar"` the `onCallback` should fire
     * with a Uri `vscode://foo/bar`.
     *
     * If there are additional `query` values in the Uri, they should
     * be added to the list of provided `query` arguments from the
     * `Partial<UriComponents>`.
     */
    create(options?: Partial<UriComponents>): URI;
}
export declare class BrowserURLService extends AbstractURLService {
    private provider;
    constructor(environmentService: IBrowserWorkbenchEnvironmentService, openerService: IOpenerService, productService: IProductService);
    create(options?: Partial<UriComponents>): URI;
}

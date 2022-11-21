import { IProcessEnvironment } from 'vs/base/common/platform';
import { IProductConfiguration } from 'vs/base/common/product';
/**
 * The common properties required for any sandboxed
 * renderer to function.
 */
export interface ISandboxConfiguration {
    /**
     * Identifier of the sandboxed renderer.
     */
    windowId: number;
    /**
     * Root path of the JavaScript sources.
     *
     * Note: This is NOT the installation root
     * directory itself but contained in it at
     * a level that is platform dependent.
     */
    appRoot: string;
    /**
     * Per window process environment.
     */
    userEnv: IProcessEnvironment;
    /**
     * Product configuration.
     */
    product: IProductConfiguration;
    /**
     * Configured zoom level.
     */
    zoomLevel?: number;
    /**
     * Location of V8 code cache.
     */
    codeCachePath?: string;
}
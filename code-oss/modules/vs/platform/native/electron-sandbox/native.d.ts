import { ICommonNativeHostService } from 'vs/platform/native/common/native';
export declare const INativeHostService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<INativeHostService>;
/**
 * A set of methods specific to a native host, i.e. unsupported in web
 * environments.
 *
 * @see {@link IHostService} for methods that can be used in native and web
 * hosts.
 */
export interface INativeHostService extends ICommonNativeHostService {
}

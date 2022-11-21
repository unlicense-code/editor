import { URI, UriComponents } from 'vs/base/common/uri';
import { CancellationToken } from 'vs/base/common/cancellation';
import { IExtensionDescription } from 'vs/platform/extensions/common/extensions';
import { ServicesAccessor } from 'vs/platform/instantiation/common/instantiation';
import { ILogService } from 'vs/platform/log/common/log';
export interface IExtensionActivationHost {
    readonly logService: ILogService;
    readonly folders: readonly UriComponents[];
    readonly forceUsingSearch: boolean;
    exists(uri: URI): Promise<boolean>;
    checkExists(folders: readonly UriComponents[], includes: string[], token: CancellationToken): Promise<boolean>;
}
export interface IExtensionActivationResult {
    activationEvent: string;
}
export declare function checkActivateWorkspaceContainsExtension(host: IExtensionActivationHost, desc: IExtensionDescription): Promise<IExtensionActivationResult | undefined>;
export declare function checkGlobFileExists(accessor: ServicesAccessor, folders: readonly UriComponents[], includes: string[], token: CancellationToken): Promise<boolean>;

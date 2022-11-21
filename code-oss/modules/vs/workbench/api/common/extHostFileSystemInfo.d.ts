import { IExtUri } from 'vs/base/common/resources';
import { UriComponents } from 'vs/base/common/uri';
import { ExtHostFileSystemInfoShape } from 'vs/workbench/api/common/extHost.protocol';
export declare class ExtHostFileSystemInfo implements ExtHostFileSystemInfoShape {
    readonly _serviceBrand: undefined;
    private readonly _systemSchemes;
    private readonly _providerInfo;
    readonly extUri: IExtUri;
    constructor();
    $acceptProviderInfos(uri: UriComponents, capabilities: number | null): void;
    isFreeScheme(scheme: string): boolean;
    getCapabilities(scheme: string): number | undefined;
}
export interface IExtHostFileSystemInfo extends ExtHostFileSystemInfo {
    readonly extUri: IExtUri;
}
export declare const IExtHostFileSystemInfo: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IExtHostFileSystemInfo>;

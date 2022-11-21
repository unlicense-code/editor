import { URI } from 'vs/base/common/uri';
import { IExtensionDescription } from 'vs/platform/extensions/common/extensions';
import { ILogService } from 'vs/platform/log/common/log';
import { ExtHostLocalizationShape, IStringDetails } from 'vs/workbench/api/common/extHost.protocol';
import { IExtHostInitDataService } from 'vs/workbench/api/common/extHostInitDataService';
import { IExtHostRpcService } from 'vs/workbench/api/common/extHostRpcService';
export declare class ExtHostLocalizationService implements ExtHostLocalizationShape {
    private readonly logService;
    readonly _serviceBrand: undefined;
    private readonly _proxy;
    private readonly currentLanguage;
    private readonly isDefaultLanguage;
    private readonly bundleCache;
    constructor(initData: IExtHostInitDataService, rpc: IExtHostRpcService, logService: ILogService);
    getMessage(extensionId: string, details: IStringDetails): string;
    getBundle(extensionId: string): {
        [key: string]: string;
    } | undefined;
    getBundleUri(extensionId: string): URI | undefined;
    initializeLocalizedMessages(extension: IExtensionDescription): Promise<void>;
    private getBundleLocation;
}
export declare const IExtHostLocalizationService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IExtHostLocalizationService>;
export interface IExtHostLocalizationService extends ExtHostLocalizationService {
}

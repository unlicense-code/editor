import { URI } from 'vs/base/common/uri';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { ITextResourcePropertiesService } from 'vs/editor/common/services/textResourceConfiguration';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { IRemoteAgentService } from 'vs/workbench/services/remote/common/remoteAgentService';
export declare class TextResourcePropertiesService implements ITextResourcePropertiesService {
    private readonly configurationService;
    private readonly environmentService;
    private readonly storageService;
    readonly _serviceBrand: undefined;
    private remoteEnvironment;
    constructor(configurationService: IConfigurationService, remoteAgentService: IRemoteAgentService, environmentService: IWorkbenchEnvironmentService, storageService: IStorageService);
    getEOL(resource?: URI, language?: string): string;
    private getOS;
}

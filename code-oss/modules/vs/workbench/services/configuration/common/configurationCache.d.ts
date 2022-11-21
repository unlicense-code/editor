import { IConfigurationCache, ConfigurationKey } from 'vs/workbench/services/configuration/common/configuration';
import { URI } from 'vs/base/common/uri';
import { IFileService } from 'vs/platform/files/common/files';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
export declare class ConfigurationCache implements IConfigurationCache {
    private readonly donotCacheResourcesWithSchemes;
    private readonly fileService;
    private readonly cacheHome;
    private readonly cachedConfigurations;
    constructor(donotCacheResourcesWithSchemes: string[], environmentService: IEnvironmentService, fileService: IFileService);
    needsCaching(resource: URI): boolean;
    read(key: ConfigurationKey): Promise<string>;
    write(key: ConfigurationKey, content: string): Promise<void>;
    remove(key: ConfigurationKey): Promise<void>;
    private getCachedConfiguration;
}

import { IConfigurationCache } from 'vs/workbench/services/configuration/common/configuration';
import { URI } from 'vs/base/common/uri';
export declare class ConfigurationCache implements IConfigurationCache {
    needsCaching(resource: URI): boolean;
    read(): Promise<string>;
    write(): Promise<void>;
    remove(): Promise<void>;
}

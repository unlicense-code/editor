import { URI } from 'vs/base/common/uri';
import { IConfigurationCache } from 'vs/workbench/services/configuration/common/configuration';
export declare class ConfigurationCache implements IConfigurationCache {
    needsCaching(resource: URI): boolean;
    read(): Promise<string>;
    write(): Promise<void>;
    remove(): Promise<void>;
}

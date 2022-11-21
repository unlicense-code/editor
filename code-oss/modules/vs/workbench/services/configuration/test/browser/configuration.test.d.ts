import { URI } from 'vs/base/common/uri';
import { ConfigurationKey, IConfigurationCache } from 'vs/workbench/services/configuration/common/configuration';
export declare class ConfigurationCache implements IConfigurationCache {
    private readonly cache;
    needsCaching(resource: URI): boolean;
    read({ type, key }: ConfigurationKey): Promise<string>;
    write({ type, key }: ConfigurationKey, content: string): Promise<void>;
    remove({ type, key }: ConfigurationKey): Promise<void>;
}

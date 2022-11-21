import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
export declare const enum DispatchConfig {
    Code = 0,
    KeyCode = 1
}
export declare function getDispatchConfig(configurationService: IConfigurationService): DispatchConfig;

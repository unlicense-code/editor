import { IStringDictionary } from 'vs/base/common/collections';
import { Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { ConfigurationModel } from 'vs/platform/configuration/common/configurationModels';
import { ILogService } from 'vs/platform/log/common/log';
import { IPolicyService } from 'vs/platform/policy/common/policy';
export declare class DefaultConfiguration extends Disposable {
    private readonly _onDidChangeConfiguration;
    readonly onDidChangeConfiguration: Event<{
        defaults: ConfigurationModel;
        properties: string[];
    }>;
    private _configurationModel;
    get configurationModel(): ConfigurationModel;
    initialize(): Promise<ConfigurationModel>;
    reload(): ConfigurationModel;
    protected onDidUpdateConfiguration(properties: string[], defaultsOverrides?: boolean): void;
    protected getConfigurationDefaultOverrides(): IStringDictionary<any>;
}
export declare class DefaultConfigurationModel extends ConfigurationModel {
    constructor(configurationDefaultsOverrides?: IStringDictionary<any>);
}
export interface IPolicyConfiguration {
    readonly onDidChangeConfiguration: Event<ConfigurationModel>;
    readonly configurationModel: ConfigurationModel;
    initialize(): Promise<ConfigurationModel>;
}
export declare class NullPolicyConfiguration implements IPolicyConfiguration {
    readonly onDidChangeConfiguration: Event<any>;
    readonly configurationModel: ConfigurationModel;
    initialize(): Promise<ConfigurationModel>;
}
export declare class PolicyConfiguration extends Disposable implements IPolicyConfiguration {
    private readonly defaultConfiguration;
    private readonly policyService;
    private readonly logService;
    private readonly _onDidChangeConfiguration;
    readonly onDidChangeConfiguration: Event<ConfigurationModel>;
    private _configurationModel;
    get configurationModel(): ConfigurationModel;
    constructor(defaultConfiguration: DefaultConfiguration, policyService: IPolicyService, logService: ILogService);
    initialize(): Promise<ConfigurationModel>;
    private updatePolicyDefinitions;
    private onDidChangePolicies;
    private update;
}

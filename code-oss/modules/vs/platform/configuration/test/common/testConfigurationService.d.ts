import { Emitter } from 'vs/base/common/event';
import { URI } from 'vs/base/common/uri';
import { IConfigurationChangeEvent, IConfigurationOverrides, IConfigurationService, IConfigurationValue } from 'vs/platform/configuration/common/configuration';
export declare class TestConfigurationService implements IConfigurationService {
    _serviceBrand: undefined;
    private configuration;
    readonly onDidChangeConfigurationEmitter: Emitter<IConfigurationChangeEvent>;
    readonly onDidChangeConfiguration: import("vs/base/common/event").Event<IConfigurationChangeEvent>;
    constructor(configuration?: any);
    private configurationByRoot;
    reloadConfiguration<T>(): Promise<T>;
    getValue(arg1?: any, arg2?: any): any;
    updateValue(key: string, value: any): Promise<void>;
    setUserConfiguration(key: any, value: any, root?: URI): Promise<void>;
    private overrideIdentifiers;
    setOverrideIdentifiers(key: string, identifiers: string[]): void;
    inspect<T>(key: string, overrides?: IConfigurationOverrides): IConfigurationValue<T>;
    keys(): {
        default: string[];
        user: string[];
        workspace: never[];
        workspaceFolder: never[];
    };
    getConfigurationData(): null;
}

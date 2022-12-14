import { Event } from 'vs/base/common/event';
import { URI, UriComponents } from 'vs/base/common/uri';
import { IWorkspaceFolder } from 'vs/platform/workspace/common/workspace';
export declare const IConfigurationService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IConfigurationService>;
export declare function isConfigurationOverrides(thing: any): thing is IConfigurationOverrides;
export interface IConfigurationOverrides {
    overrideIdentifier?: string | null;
    resource?: URI | null;
}
export declare function isConfigurationUpdateOverrides(thing: any): thing is IConfigurationUpdateOverrides;
export declare type IConfigurationUpdateOverrides = Omit<IConfigurationOverrides, 'overrideIdentifier'> & {
    overrideIdentifiers?: string[] | null;
};
export declare const enum ConfigurationTarget {
    APPLICATION = 1,
    USER = 2,
    USER_LOCAL = 3,
    USER_REMOTE = 4,
    WORKSPACE = 5,
    WORKSPACE_FOLDER = 6,
    DEFAULT = 7,
    MEMORY = 8
}
export declare function ConfigurationTargetToString(configurationTarget: ConfigurationTarget): "APPLICATION" | "USER" | "USER_LOCAL" | "USER_REMOTE" | "WORKSPACE" | "WORKSPACE_FOLDER" | "DEFAULT" | "MEMORY";
export interface IConfigurationChange {
    keys: string[];
    overrides: [string, string[]][];
}
export interface IConfigurationChangeEvent {
    readonly source: ConfigurationTarget;
    readonly affectedKeys: string[];
    readonly change: IConfigurationChange;
    affectsConfiguration(configuration: string, overrides?: IConfigurationOverrides): boolean;
    readonly sourceConfig: any;
}
export interface IConfigurationValue<T> {
    readonly defaultValue?: T;
    readonly applicationValue?: T;
    readonly userValue?: T;
    readonly userLocalValue?: T;
    readonly userRemoteValue?: T;
    readonly workspaceValue?: T;
    readonly workspaceFolderValue?: T;
    readonly memoryValue?: T;
    readonly policyValue?: T;
    readonly value?: T;
    readonly default?: {
        value?: T;
        override?: T;
    };
    readonly application?: {
        value?: T;
        override?: T;
    };
    readonly user?: {
        value?: T;
        override?: T;
    };
    readonly userLocal?: {
        value?: T;
        override?: T;
    };
    readonly userRemote?: {
        value?: T;
        override?: T;
    };
    readonly workspace?: {
        value?: T;
        override?: T;
    };
    readonly workspaceFolder?: {
        value?: T;
        override?: T;
    };
    readonly memory?: {
        value?: T;
        override?: T;
    };
    readonly policy?: {
        value?: T;
    };
    readonly overrideIdentifiers?: string[];
}
export interface IConfigurationService {
    readonly _serviceBrand: undefined;
    onDidChangeConfiguration: Event<IConfigurationChangeEvent>;
    getConfigurationData(): IConfigurationData | null;
    /**
     * Fetches the value of the section for the given overrides.
     * Value can be of native type or an object keyed off the section name.
     *
     * @param section - Section of the configuraion. Can be `null` or `undefined`.
     * @param overrides - Overrides that has to be applied while fetching
     *
     */
    getValue<T>(): T;
    getValue<T>(section: string): T;
    getValue<T>(overrides: IConfigurationOverrides): T;
    getValue<T>(section: string, overrides: IConfigurationOverrides): T;
    /**
     * Update a configuration value.
     *
     * Use `target` to update the configuration in a specific `ConfigurationTarget`.
     *
     * Use `overrides` to update the configuration for a resource or for override identifiers or both.
     *
     * Passing a resource through overrides will update the configuration in the workspace folder containing that resource.
     *
     * *Note 1:* Updating configuraiton to a default value will remove the configuration from the requested target. If not target is passed, it will be removed from all writeable targets.
     *
     * *Note 2:* Use `undefined` value to remove the configuration from the given target. If not target is passed, it will be removed from all writeable targets.
     *
     * Use `donotNotifyError` and set it to `true` to surpresss errors.
     *
     * @param key setting to be updated
     * @param value The new value
     */
    updateValue(key: string, value: any): Promise<void>;
    updateValue(key: string, value: any, target: ConfigurationTarget): Promise<void>;
    updateValue(key: string, value: any, overrides: IConfigurationOverrides | IConfigurationUpdateOverrides): Promise<void>;
    updateValue(key: string, value: any, overrides: IConfigurationOverrides | IConfigurationUpdateOverrides, target: ConfigurationTarget, donotNotifyError?: boolean): Promise<void>;
    inspect<T>(key: string, overrides?: IConfigurationOverrides): IConfigurationValue<Readonly<T>>;
    reloadConfiguration(target?: ConfigurationTarget | IWorkspaceFolder): Promise<void>;
    keys(): {
        default: string[];
        user: string[];
        workspace: string[];
        workspaceFolder: string[];
        memory?: string[];
    };
}
export interface IConfigurationModel {
    contents: any;
    keys: string[];
    overrides: IOverrides[];
}
export interface IOverrides {
    keys: string[];
    contents: any;
    identifiers: string[];
}
export interface IConfigurationData {
    defaults: IConfigurationModel;
    policy: IConfigurationModel;
    application: IConfigurationModel;
    user: IConfigurationModel;
    workspace: IConfigurationModel;
    folders: [UriComponents, IConfigurationModel][];
}
export interface IConfigurationCompareResult {
    added: string[];
    removed: string[];
    updated: string[];
    overrides: [string, string[]][];
}
export declare function toValuesTree(properties: {
    [qualifiedKey: string]: any;
}, conflictReporter: (message: string) => void): any;
export declare function addToValueTree(settingsTreeRoot: any, key: string, value: any, conflictReporter: (message: string) => void): void;
export declare function removeFromValueTree(valueTree: any, key: string): void;
/**
 * A helper function to get the configuration value with a specific settings path (e.g. config.some.setting)
 */
export declare function getConfigurationValue<T>(config: any, settingPath: string, defaultValue?: T): T;
export declare function merge(base: any, add: any, overwrite: boolean): void;
export declare function getMigratedSettingValue<T>(configurationService: IConfigurationService, currentSettingName: string, legacySettingName: string): T;
export declare function getLanguageTagSettingPlainKey(settingKey: string): string;

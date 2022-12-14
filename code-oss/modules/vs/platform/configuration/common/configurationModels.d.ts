import { IStringDictionary } from 'vs/base/common/collections';
import { Emitter, Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { ResourceMap } from 'vs/base/common/map';
import { IExtUri } from 'vs/base/common/resources';
import { URI } from 'vs/base/common/uri';
import { ConfigurationTarget, IConfigurationChange, IConfigurationChangeEvent, IConfigurationData, IConfigurationModel, IConfigurationOverrides, IConfigurationUpdateOverrides, IConfigurationValue, IOverrides } from 'vs/platform/configuration/common/configuration';
import { ConfigurationScope } from 'vs/platform/configuration/common/configurationRegistry';
import { IFileService } from 'vs/platform/files/common/files';
import { Workspace } from 'vs/platform/workspace/common/workspace';
export interface IInspectValue<V> {
    value?: V;
    override?: V;
    merged?: V;
}
export declare class ConfigurationModel implements IConfigurationModel {
    private readonly _contents;
    private readonly _keys;
    private readonly _overrides;
    readonly raw?: readonly (IStringDictionary<any> | ConfigurationModel)[] | undefined;
    private frozen;
    private readonly overrideConfigurations;
    constructor(_contents?: any, _keys?: string[], _overrides?: IOverrides[], raw?: readonly (IStringDictionary<any> | ConfigurationModel)[] | undefined);
    private _rawConfiguration;
    get rawConfiguration(): ConfigurationModel;
    get contents(): any;
    get overrides(): IOverrides[];
    get keys(): string[];
    isEmpty(): boolean;
    isFrozen(): boolean;
    getValue<V>(section: string | undefined): V;
    inspect<V>(section: string | undefined, overrideIdentifier?: string | null): IInspectValue<V>;
    getOverrideValue<V>(section: string | undefined, overrideIdentifier: string): V | undefined;
    getKeysForOverrideIdentifier(identifier: string): string[];
    getAllOverrideIdentifiers(): string[];
    override(identifier: string): ConfigurationModel;
    merge(...others: ConfigurationModel[]): ConfigurationModel;
    freeze(): ConfigurationModel;
    clone(): ConfigurationModel;
    private createOverrideConfigurationModel;
    private mergeContents;
    private checkAndFreeze;
    private getContentsForOverrideIdentifer;
    toJSON(): IConfigurationModel;
    setValue(key: string, value: any): void;
    removeValue(key: string): void;
    private addKey;
    private removeKey;
}
export interface ConfigurationParseOptions {
    scopes: ConfigurationScope[] | undefined;
    skipRestricted?: boolean;
}
export declare class ConfigurationModelParser {
    protected readonly _name: string;
    private _raw;
    private _configurationModel;
    private _restrictedConfigurations;
    private _parseErrors;
    constructor(_name: string);
    get configurationModel(): ConfigurationModel;
    get restrictedConfigurations(): string[];
    get errors(): any[];
    parse(content: string | null | undefined, options?: ConfigurationParseOptions): void;
    reparse(options: ConfigurationParseOptions): void;
    parseRaw(raw: any, options?: ConfigurationParseOptions): void;
    private doParseContent;
    protected doParseRaw(raw: any, options?: ConfigurationParseOptions): IConfigurationModel & {
        restricted?: string[];
        hasExcludedProperties?: boolean;
    };
    private filter;
    private toOverrides;
}
export declare class UserSettings extends Disposable {
    private readonly userSettingsResource;
    private readonly scopes;
    private readonly fileService;
    private readonly parser;
    private readonly parseOptions;
    protected readonly _onDidChange: Emitter<void>;
    readonly onDidChange: Event<void>;
    constructor(userSettingsResource: URI, scopes: ConfigurationScope[] | undefined, extUri: IExtUri, fileService: IFileService);
    loadConfiguration(): Promise<ConfigurationModel>;
    reparse(): ConfigurationModel;
    getRestrictedSettings(): string[];
}
export declare class Configuration {
    private _defaultConfiguration;
    private _policyConfiguration;
    private _applicationConfiguration;
    private _localUserConfiguration;
    private _remoteUserConfiguration;
    private _workspaceConfiguration;
    private _folderConfigurations;
    private _memoryConfiguration;
    private _memoryConfigurationByResource;
    private _freeze;
    private _workspaceConsolidatedConfiguration;
    private _foldersConsolidatedConfigurations;
    constructor(_defaultConfiguration: ConfigurationModel, _policyConfiguration: ConfigurationModel, _applicationConfiguration: ConfigurationModel, _localUserConfiguration: ConfigurationModel, _remoteUserConfiguration?: ConfigurationModel, _workspaceConfiguration?: ConfigurationModel, _folderConfigurations?: ResourceMap<ConfigurationModel>, _memoryConfiguration?: ConfigurationModel, _memoryConfigurationByResource?: ResourceMap<ConfigurationModel>, _freeze?: boolean);
    getValue(section: string | undefined, overrides: IConfigurationOverrides, workspace: Workspace | undefined): any;
    updateValue(key: string, value: any, overrides?: IConfigurationUpdateOverrides): void;
    inspect<C>(key: string, overrides: IConfigurationOverrides, workspace: Workspace | undefined): IConfigurationValue<C>;
    keys(workspace: Workspace | undefined): {
        default: string[];
        user: string[];
        workspace: string[];
        workspaceFolder: string[];
    };
    updateDefaultConfiguration(defaultConfiguration: ConfigurationModel): void;
    updatePolicyConfiguration(policyConfiguration: ConfigurationModel): void;
    updateApplicationConfiguration(applicationConfiguration: ConfigurationModel): void;
    updateLocalUserConfiguration(localUserConfiguration: ConfigurationModel): void;
    updateRemoteUserConfiguration(remoteUserConfiguration: ConfigurationModel): void;
    updateWorkspaceConfiguration(workspaceConfiguration: ConfigurationModel): void;
    updateFolderConfiguration(resource: URI, configuration: ConfigurationModel): void;
    deleteFolderConfiguration(resource: URI): void;
    compareAndUpdateDefaultConfiguration(defaults: ConfigurationModel, keys?: string[]): IConfigurationChange;
    compareAndUpdatePolicyConfiguration(policyConfiguration: ConfigurationModel): IConfigurationChange;
    compareAndUpdateApplicationConfiguration(application: ConfigurationModel): IConfigurationChange;
    compareAndUpdateLocalUserConfiguration(user: ConfigurationModel): IConfigurationChange;
    compareAndUpdateRemoteUserConfiguration(user: ConfigurationModel): IConfigurationChange;
    compareAndUpdateWorkspaceConfiguration(workspaceConfiguration: ConfigurationModel): IConfigurationChange;
    compareAndUpdateFolderConfiguration(resource: URI, folderConfiguration: ConfigurationModel): IConfigurationChange;
    compareAndDeleteFolderConfiguration(folder: URI): IConfigurationChange;
    get defaults(): ConfigurationModel;
    get applicationConfiguration(): ConfigurationModel;
    private _userConfiguration;
    get userConfiguration(): ConfigurationModel;
    get localUserConfiguration(): ConfigurationModel;
    get remoteUserConfiguration(): ConfigurationModel;
    get workspaceConfiguration(): ConfigurationModel;
    protected get folderConfigurations(): ResourceMap<ConfigurationModel>;
    private getConsolidatedConfigurationModel;
    private getConsolidatedConfigurationModelForResource;
    private getWorkspaceConsolidatedConfiguration;
    private getFolderConsolidatedConfiguration;
    private getFolderConfigurationModelForResource;
    toData(): IConfigurationData;
    allKeys(): string[];
    protected allOverrideIdentifiers(): string[];
    protected getAllKeysForOverrideIdentifier(overrideIdentifier: string): string[];
    static parse(data: IConfigurationData): Configuration;
    private static parseConfigurationModel;
}
export declare function mergeChanges(...changes: IConfigurationChange[]): IConfigurationChange;
export declare class ConfigurationChangeEvent implements IConfigurationChangeEvent {
    readonly change: IConfigurationChange;
    private readonly previous;
    private readonly currentConfiguraiton;
    private readonly currentWorkspace?;
    private readonly affectedKeysTree;
    readonly affectedKeys: string[];
    source: ConfigurationTarget;
    sourceConfig: any;
    constructor(change: IConfigurationChange, previous: {
        workspace?: Workspace;
        data: IConfigurationData;
    } | undefined, currentConfiguraiton: Configuration, currentWorkspace?: Workspace | undefined);
    private _previousConfiguration;
    get previousConfiguration(): Configuration | undefined;
    affectsConfiguration(section: string, overrides?: IConfigurationOverrides): boolean;
    private doesAffectedKeysTreeContains;
}

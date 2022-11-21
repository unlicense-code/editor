import { IConfigurationModel, IConfigurationOverrides, IConfigurationValue, IConfigurationChange } from 'vs/platform/configuration/common/configuration';
import { Configuration as BaseConfiguration, ConfigurationModelParser, ConfigurationModel, ConfigurationParseOptions } from 'vs/platform/configuration/common/configurationModels';
import { IStoredWorkspaceFolder } from 'vs/platform/workspaces/common/workspaces';
import { Workspace } from 'vs/platform/workspace/common/workspace';
import { ResourceMap } from 'vs/base/common/map';
import { URI } from 'vs/base/common/uri';
export declare class WorkspaceConfigurationModelParser extends ConfigurationModelParser {
    private _folders;
    private _transient;
    private _settingsModelParser;
    private _launchModel;
    private _tasksModel;
    constructor(name: string);
    get folders(): IStoredWorkspaceFolder[];
    get transient(): boolean;
    get settingsModel(): ConfigurationModel;
    get launchModel(): ConfigurationModel;
    get tasksModel(): ConfigurationModel;
    reparseWorkspaceSettings(configurationParseOptions: ConfigurationParseOptions): void;
    getRestrictedWorkspaceSettings(): string[];
    protected doParseRaw(raw: any, configurationParseOptions?: ConfigurationParseOptions): IConfigurationModel;
    private createConfigurationModelFrom;
}
export declare class StandaloneConfigurationModelParser extends ConfigurationModelParser {
    private readonly scope;
    constructor(name: string, scope: string);
    protected doParseRaw(raw: any, configurationParseOptions?: ConfigurationParseOptions): IConfigurationModel;
}
export declare class Configuration extends BaseConfiguration {
    private readonly _workspace?;
    constructor(defaults: ConfigurationModel, policy: ConfigurationModel, application: ConfigurationModel, localUser: ConfigurationModel, remoteUser: ConfigurationModel, workspaceConfiguration: ConfigurationModel, folders: ResourceMap<ConfigurationModel>, memoryConfiguration: ConfigurationModel, memoryConfigurationByResource: ResourceMap<ConfigurationModel>, _workspace?: Workspace | undefined);
    getValue(key: string | undefined, overrides?: IConfigurationOverrides): any;
    inspect<C>(key: string, overrides?: IConfigurationOverrides): IConfigurationValue<C>;
    keys(): {
        default: string[];
        user: string[];
        workspace: string[];
        workspaceFolder: string[];
    };
    compareAndDeleteFolderConfiguration(folder: URI): IConfigurationChange;
    compare(other: Configuration): IConfigurationChange;
}

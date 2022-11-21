import { ConfigurationScope } from 'vs/platform/configuration/common/configurationRegistry';
import { URI } from 'vs/base/common/uri';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { Event } from 'vs/base/common/event';
import { ResourceMap } from 'vs/base/common/map';
import { IAnyWorkspaceIdentifier } from 'vs/platform/workspace/common/workspace';
export declare const FOLDER_CONFIG_FOLDER_NAME = ".vscode";
export declare const FOLDER_SETTINGS_NAME = "settings";
export declare const FOLDER_SETTINGS_PATH: string;
export declare const defaultSettingsSchemaId = "vscode://schemas/settings/default";
export declare const userSettingsSchemaId = "vscode://schemas/settings/user";
export declare const profileSettingsSchemaId = "vscode://schemas/settings/profile";
export declare const machineSettingsSchemaId = "vscode://schemas/settings/machine";
export declare const workspaceSettingsSchemaId = "vscode://schemas/settings/workspace";
export declare const folderSettingsSchemaId = "vscode://schemas/settings/folder";
export declare const launchSchemaId = "vscode://schemas/launch";
export declare const tasksSchemaId = "vscode://schemas/tasks";
export declare const APPLICATION_SCOPES: ConfigurationScope[];
export declare const PROFILE_SCOPES: ConfigurationScope[];
export declare const LOCAL_MACHINE_PROFILE_SCOPES: ConfigurationScope[];
export declare const LOCAL_MACHINE_SCOPES: ConfigurationScope[];
export declare const REMOTE_MACHINE_SCOPES: ConfigurationScope[];
export declare const WORKSPACE_SCOPES: ConfigurationScope[];
export declare const FOLDER_SCOPES: ConfigurationScope[];
export declare const TASKS_CONFIGURATION_KEY = "tasks";
export declare const LAUNCH_CONFIGURATION_KEY = "launch";
export declare const WORKSPACE_STANDALONE_CONFIGURATIONS: any;
export declare const USER_STANDALONE_CONFIGURATIONS: any;
export declare type ConfigurationKey = {
    type: 'defaults' | 'user' | 'workspaces' | 'folder';
    key: string;
};
export interface IConfigurationCache {
    needsCaching(resource: URI): boolean;
    read(key: ConfigurationKey): Promise<string>;
    write(key: ConfigurationKey, content: string): Promise<void>;
    remove(key: ConfigurationKey): Promise<void>;
}
export declare type RestrictedSettings = {
    default: ReadonlyArray<string>;
    application?: ReadonlyArray<string>;
    userLocal?: ReadonlyArray<string>;
    userRemote?: ReadonlyArray<string>;
    workspace?: ReadonlyArray<string>;
    workspaceFolder?: ResourceMap<ReadonlyArray<string>>;
};
export declare const IWorkbenchConfigurationService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IWorkbenchConfigurationService>;
export interface IWorkbenchConfigurationService extends IConfigurationService {
    /**
     * Restricted settings defined in each configuration target
     */
    readonly restrictedSettings: RestrictedSettings;
    /**
     * Event that triggers when the restricted settings changes
     */
    readonly onDidChangeRestrictedSettings: Event<RestrictedSettings>;
    /**
     * A promise that resolves when the remote configuration is loaded in a remote window.
     * The promise is resolved immediately if the window is not remote.
     */
    whenRemoteConfigurationLoaded(): Promise<void>;
    /**
     * Initialize configuration service for the given workspace
     * @param arg workspace Identifier
     */
    initialize(arg: IAnyWorkspaceIdentifier): Promise<void>;
}
export declare const TASKS_DEFAULT = "{\n\t\"version\": \"2.0.0\",\n\t\"tasks\": []\n}";

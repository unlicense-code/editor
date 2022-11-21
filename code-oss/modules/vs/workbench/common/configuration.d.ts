import { IConfigurationNode } from 'vs/platform/configuration/common/configurationRegistry';
import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { Disposable } from 'vs/base/common/lifecycle';
export declare const workbenchConfigurationNodeBase: Readonly<IConfigurationNode>;
export declare const Extensions: {
    ConfigurationMigration: string;
};
export declare type ConfigurationValue = {
    value: any | undefined;
};
export declare type ConfigurationKeyValuePairs = [string, ConfigurationValue][];
export declare type ConfigurationMigrationFn = (value: any, valueAccessor: (key: string) => any) => ConfigurationValue | ConfigurationKeyValuePairs | Promise<ConfigurationValue | ConfigurationKeyValuePairs>;
export declare type ConfigurationMigration = {
    key: string;
    migrateFn: ConfigurationMigrationFn;
};
export interface IConfigurationMigrationRegistry {
    registerConfigurationMigrations(configurationMigrations: ConfigurationMigration[]): void;
}
export declare class ConfigurationMigrationWorkbenchContribution extends Disposable implements IWorkbenchContribution {
    private readonly configurationService;
    private readonly workspaceService;
    constructor(configurationService: IConfigurationService, workspaceService: IWorkspaceContextService);
    private migrateConfigurations;
    private migrateConfigurationsForFolder;
    private migrateConfigurationsForFolderAndOverride;
    private migrateConfigurationForFolderOverrideAndTarget;
}

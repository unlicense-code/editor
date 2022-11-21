/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { localize } from 'vs/nls';
import { Registry } from 'vs/platform/registry/common/platform';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { Disposable } from 'vs/base/common/lifecycle';
import { Emitter } from 'vs/base/common/event';
export const workbenchConfigurationNodeBase = Object.freeze({
    'id': 'workbench',
    'order': 7,
    'title': localize('workbenchConfigurationTitle', "Workbench"),
    'type': 'object',
});
export const Extensions = {
    ConfigurationMigration: 'base.contributions.configuration.migration'
};
class ConfigurationMigrationRegistry {
    migrations = [];
    _onDidRegisterConfigurationMigrations = new Emitter();
    onDidRegisterConfigurationMigration = this._onDidRegisterConfigurationMigrations.event;
    registerConfigurationMigrations(configurationMigrations) {
        this.migrations.push(...configurationMigrations);
    }
}
const configurationMigrationRegistry = new ConfigurationMigrationRegistry();
Registry.add(Extensions.ConfigurationMigration, configurationMigrationRegistry);
let ConfigurationMigrationWorkbenchContribution = class ConfigurationMigrationWorkbenchContribution extends Disposable {
    configurationService;
    workspaceService;
    constructor(configurationService, workspaceService) {
        super();
        this.configurationService = configurationService;
        this.workspaceService = workspaceService;
        this._register(this.workspaceService.onDidChangeWorkspaceFolders(async (e) => {
            for (const folder of e.added) {
                await this.migrateConfigurationsForFolder(folder, configurationMigrationRegistry.migrations);
            }
        }));
        this.migrateConfigurations(configurationMigrationRegistry.migrations);
        this._register(configurationMigrationRegistry.onDidRegisterConfigurationMigration(migration => this.migrateConfigurations(migration)));
    }
    async migrateConfigurations(migrations) {
        await this.migrateConfigurationsForFolder(undefined, migrations);
        for (const folder of this.workspaceService.getWorkspace().folders) {
            await this.migrateConfigurationsForFolder(folder, migrations);
        }
    }
    async migrateConfigurationsForFolder(folder, migrations) {
        await Promise.all(migrations.map(migration => this.migrateConfigurationsForFolderAndOverride(migration, { resource: folder?.uri })));
    }
    async migrateConfigurationsForFolderAndOverride(migration, overrides) {
        const data = this.configurationService.inspect(migration.key, overrides);
        await this.migrateConfigurationForFolderOverrideAndTarget(migration, overrides, data, 'userValue', 2 /* ConfigurationTarget.USER */);
        await this.migrateConfigurationForFolderOverrideAndTarget(migration, overrides, data, 'userLocalValue', 3 /* ConfigurationTarget.USER_LOCAL */);
        await this.migrateConfigurationForFolderOverrideAndTarget(migration, overrides, data, 'userRemoteValue', 4 /* ConfigurationTarget.USER_REMOTE */);
        await this.migrateConfigurationForFolderOverrideAndTarget(migration, overrides, data, 'workspaceFolderValue', 6 /* ConfigurationTarget.WORKSPACE_FOLDER */);
        await this.migrateConfigurationForFolderOverrideAndTarget(migration, overrides, data, 'workspaceValue', 5 /* ConfigurationTarget.WORKSPACE */);
        if (typeof overrides.overrideIdentifier === 'undefined' && typeof data.overrideIdentifiers !== 'undefined') {
            for (const overrideIdentifier of data.overrideIdentifiers) {
                await this.migrateConfigurationsForFolderAndOverride(migration, { resource: overrides.resource, overrideIdentifier });
            }
        }
    }
    async migrateConfigurationForFolderOverrideAndTarget(migration, overrides, data, dataKey, target) {
        const value = data[dataKey];
        if (typeof value === 'undefined') {
            return;
        }
        const valueAccessor = (key) => this.configurationService.inspect(key, overrides)[dataKey];
        const result = await migration.migrateFn(value, valueAccessor);
        const keyValuePairs = Array.isArray(result) ? result : [[migration.key, result]];
        await Promise.allSettled(keyValuePairs.map(async ([key, value]) => this.configurationService.updateValue(key, value.value, overrides, target)));
    }
};
ConfigurationMigrationWorkbenchContribution = __decorate([
    __param(0, IConfigurationService),
    __param(1, IWorkspaceContextService)
], ConfigurationMigrationWorkbenchContribution);
export { ConfigurationMigrationWorkbenchContribution };

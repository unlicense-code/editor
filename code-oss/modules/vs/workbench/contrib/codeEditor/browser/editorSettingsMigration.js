/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Registry } from 'vs/platform/registry/common/platform';
import { EditorSettingMigration } from 'vs/editor/browser/config/migrateOptions';
import { Extensions } from 'vs/workbench/common/configuration';
Registry.as(Extensions.ConfigurationMigration)
    .registerConfigurationMigrations(EditorSettingMigration.items.map(item => ({
    key: `editor.${item.key}`,
    migrateFn: (value, accessor) => {
        const configurationKeyValuePairs = [];
        const writer = (key, value) => configurationKeyValuePairs.push([`editor.${key}`, { value }]);
        item.migrate(value, key => accessor(`editor.${key}`), writer);
        return configurationKeyValuePairs;
    }
})));

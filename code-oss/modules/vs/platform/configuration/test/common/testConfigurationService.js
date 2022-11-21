/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Emitter } from 'vs/base/common/event';
import { TernarySearchTree } from 'vs/base/common/ternarySearchTree';
import { getConfigurationValue, isConfigurationOverrides } from 'vs/platform/configuration/common/configuration';
import { Extensions } from 'vs/platform/configuration/common/configurationRegistry';
import { Registry } from 'vs/platform/registry/common/platform';
export class TestConfigurationService {
    _serviceBrand;
    configuration;
    onDidChangeConfigurationEmitter = new Emitter();
    onDidChangeConfiguration = this.onDidChangeConfigurationEmitter.event;
    constructor(configuration) {
        this.configuration = configuration || Object.create(null);
    }
    configurationByRoot = TernarySearchTree.forPaths();
    reloadConfiguration() {
        return Promise.resolve(this.getValue());
    }
    getValue(arg1, arg2) {
        let configuration;
        const overrides = isConfigurationOverrides(arg1) ? arg1 : isConfigurationOverrides(arg2) ? arg2 : undefined;
        if (overrides) {
            if (overrides.resource) {
                configuration = this.configurationByRoot.findSubstr(overrides.resource.fsPath);
            }
        }
        configuration = configuration ? configuration : this.configuration;
        if (arg1 && typeof arg1 === 'string') {
            return configuration[arg1] ?? getConfigurationValue(configuration, arg1);
        }
        return configuration;
    }
    updateValue(key, value) {
        return Promise.resolve(undefined);
    }
    setUserConfiguration(key, value, root) {
        if (root) {
            const configForRoot = this.configurationByRoot.get(root.fsPath) || Object.create(null);
            configForRoot[key] = value;
            this.configurationByRoot.set(root.fsPath, configForRoot);
        }
        else {
            this.configuration[key] = value;
        }
        return Promise.resolve(undefined);
    }
    overrideIdentifiers = new Map();
    setOverrideIdentifiers(key, identifiers) {
        this.overrideIdentifiers.set(key, identifiers);
    }
    inspect(key, overrides) {
        const config = this.getValue(undefined, overrides);
        return {
            value: getConfigurationValue(config, key),
            defaultValue: getConfigurationValue(config, key),
            userValue: getConfigurationValue(config, key),
            overrideIdentifiers: this.overrideIdentifiers.get(key)
        };
    }
    keys() {
        return {
            default: Object.keys(Registry.as(Extensions.Configuration).getConfigurationProperties()),
            user: Object.keys(this.configuration),
            workspace: [],
            workspaceFolder: []
        };
    }
    getConfigurationData() {
        return null;
    }
}

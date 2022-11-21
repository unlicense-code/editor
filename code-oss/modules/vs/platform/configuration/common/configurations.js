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
import { coalesce } from 'vs/base/common/arrays';
import { Emitter, Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { equals } from 'vs/base/common/objects';
import { isEmptyObject } from 'vs/base/common/types';
import { addToValueTree, toValuesTree } from 'vs/platform/configuration/common/configuration';
import { ConfigurationModel } from 'vs/platform/configuration/common/configurationModels';
import { Extensions, overrideIdentifiersFromKey, OVERRIDE_PROPERTY_REGEX } from 'vs/platform/configuration/common/configurationRegistry';
import { ILogService } from 'vs/platform/log/common/log';
import { IPolicyService } from 'vs/platform/policy/common/policy';
import { Registry } from 'vs/platform/registry/common/platform';
export class DefaultConfiguration extends Disposable {
    _onDidChangeConfiguration = this._register(new Emitter());
    onDidChangeConfiguration = this._onDidChangeConfiguration.event;
    _configurationModel;
    get configurationModel() {
        if (!this._configurationModel) {
            this._configurationModel = new DefaultConfigurationModel(this.getConfigurationDefaultOverrides());
        }
        return this._configurationModel;
    }
    async initialize() {
        this._configurationModel = undefined;
        this._register(Registry.as(Extensions.Configuration).onDidUpdateConfiguration(({ properties, defaultsOverrides }) => this.onDidUpdateConfiguration(properties, defaultsOverrides)));
        return this.configurationModel;
    }
    reload() {
        this._configurationModel = undefined;
        return this.configurationModel;
    }
    onDidUpdateConfiguration(properties, defaultsOverrides) {
        this._configurationModel = undefined;
        this._onDidChangeConfiguration.fire({ defaults: this.configurationModel, properties });
    }
    getConfigurationDefaultOverrides() {
        return {};
    }
}
export class DefaultConfigurationModel extends ConfigurationModel {
    constructor(configurationDefaultsOverrides = {}) {
        const properties = Registry.as(Extensions.Configuration).getConfigurationProperties();
        const keys = Object.keys(properties);
        const contents = Object.create(null);
        const overrides = [];
        for (const key in properties) {
            const defaultOverrideValue = configurationDefaultsOverrides[key];
            const value = defaultOverrideValue !== undefined ? defaultOverrideValue : properties[key].default;
            addToValueTree(contents, key, value, message => console.error(`Conflict in default settings: ${message}`));
        }
        for (const key of Object.keys(contents)) {
            if (OVERRIDE_PROPERTY_REGEX.test(key)) {
                overrides.push({
                    identifiers: overrideIdentifiersFromKey(key),
                    keys: Object.keys(contents[key]),
                    contents: toValuesTree(contents[key], message => console.error(`Conflict in default settings file: ${message}`)),
                });
            }
        }
        super(contents, keys, overrides);
    }
}
export class NullPolicyConfiguration {
    onDidChangeConfiguration = Event.None;
    configurationModel = new ConfigurationModel();
    async initialize() { return this.configurationModel; }
}
let PolicyConfiguration = class PolicyConfiguration extends Disposable {
    defaultConfiguration;
    policyService;
    logService;
    _onDidChangeConfiguration = this._register(new Emitter());
    onDidChangeConfiguration = this._onDidChangeConfiguration.event;
    _configurationModel = new ConfigurationModel();
    get configurationModel() { return this._configurationModel; }
    constructor(defaultConfiguration, policyService, logService) {
        super();
        this.defaultConfiguration = defaultConfiguration;
        this.policyService = policyService;
        this.logService = logService;
    }
    async initialize() {
        this.update(await this.updatePolicyDefinitions(this.defaultConfiguration.configurationModel.keys), false);
        this._register(this.policyService.onDidChange(policyNames => this.onDidChangePolicies(policyNames)));
        this._register(this.defaultConfiguration.onDidChangeConfiguration(async ({ properties }) => this.update(await this.updatePolicyDefinitions(properties), true)));
        return this._configurationModel;
    }
    async updatePolicyDefinitions(properties) {
        const policyDefinitions = {};
        const keys = [];
        const configurationProperties = Registry.as(Extensions.Configuration).getConfigurationProperties();
        for (const key of properties) {
            const config = configurationProperties[key];
            if (!config) {
                // Config is removed. So add it to the list if in case it was registered as policy before
                keys.push(key);
                continue;
            }
            if (config.policy) {
                if (config.type !== 'string' && config.type !== 'number') {
                    this.logService.warn(`Policy ${config.policy.name} has unsupported type ${config.type}`);
                    continue;
                }
                keys.push(key);
                policyDefinitions[config.policy.name] = { type: config.type };
            }
        }
        if (!isEmptyObject(policyDefinitions)) {
            await this.policyService.updatePolicyDefinitions(policyDefinitions);
        }
        return keys;
    }
    onDidChangePolicies(policyNames) {
        const policyConfigurations = Registry.as(Extensions.Configuration).getPolicyConfigurations();
        const keys = coalesce(policyNames.map(policyName => policyConfigurations.get(policyName)));
        this.update(keys, true);
    }
    update(keys, trigger) {
        const configurationProperties = Registry.as(Extensions.Configuration).getConfigurationProperties();
        const changed = [];
        const wasEmpty = this._configurationModel.isEmpty();
        for (const key of keys) {
            const policyName = configurationProperties[key]?.policy?.name;
            if (policyName) {
                const policyValue = this.policyService.getPolicyValue(policyName);
                if (wasEmpty ? policyValue !== undefined : !equals(this._configurationModel.getValue(key), policyValue)) {
                    changed.push([key, policyValue]);
                }
            }
            else {
                if (this._configurationModel.getValue(key) !== undefined) {
                    changed.push([key, undefined]);
                }
            }
        }
        if (changed.length) {
            const old = this._configurationModel;
            this._configurationModel = new ConfigurationModel();
            for (const key of old.keys) {
                this._configurationModel.setValue(key, old.getValue(key));
            }
            for (const [key, policyValue] of changed) {
                if (policyValue === undefined) {
                    this._configurationModel.removeValue(key);
                }
                else {
                    this._configurationModel.setValue(key, policyValue);
                }
            }
            if (trigger) {
                this._onDidChangeConfiguration.fire(this._configurationModel);
            }
        }
    }
};
PolicyConfiguration = __decorate([
    __param(1, IPolicyService),
    __param(2, ILogService)
], PolicyConfiguration);
export { PolicyConfiguration };

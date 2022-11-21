/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { RunOnceScheduler } from 'vs/base/common/async';
import { Emitter } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { extUriBiasedIgnorePathCase } from 'vs/base/common/resources';
import { isConfigurationOverrides } from 'vs/platform/configuration/common/configuration';
import { Configuration, ConfigurationChangeEvent, ConfigurationModel, UserSettings } from 'vs/platform/configuration/common/configurationModels';
import { DefaultConfiguration, NullPolicyConfiguration, PolicyConfiguration } from 'vs/platform/configuration/common/configurations';
import { NullPolicyService } from 'vs/platform/policy/common/policy';
export class ConfigurationService extends Disposable {
    settingsResource;
    configuration;
    defaultConfiguration;
    policyConfiguration;
    userConfiguration;
    reloadConfigurationScheduler;
    _onDidChangeConfiguration = this._register(new Emitter());
    onDidChangeConfiguration = this._onDidChangeConfiguration.event;
    constructor(settingsResource, fileService, policyService, logService) {
        super();
        this.settingsResource = settingsResource;
        this.defaultConfiguration = this._register(new DefaultConfiguration());
        this.policyConfiguration = policyService instanceof NullPolicyService ? new NullPolicyConfiguration() : this._register(new PolicyConfiguration(this.defaultConfiguration, policyService, logService));
        this.userConfiguration = this._register(new UserSettings(this.settingsResource, undefined, extUriBiasedIgnorePathCase, fileService));
        this.configuration = new Configuration(this.defaultConfiguration.configurationModel, this.policyConfiguration.configurationModel, new ConfigurationModel(), new ConfigurationModel());
        this.reloadConfigurationScheduler = this._register(new RunOnceScheduler(() => this.reloadConfiguration(), 50));
        this._register(this.defaultConfiguration.onDidChangeConfiguration(({ defaults, properties }) => this.onDidDefaultConfigurationChange(defaults, properties)));
        this._register(this.policyConfiguration.onDidChangeConfiguration(model => this.onDidPolicyConfigurationChange(model)));
        this._register(this.userConfiguration.onDidChange(() => this.reloadConfigurationScheduler.schedule()));
    }
    async initialize() {
        const [defaultModel, policyModel, userModel] = await Promise.all([this.defaultConfiguration.initialize(), this.policyConfiguration.initialize(), this.userConfiguration.loadConfiguration()]);
        this.configuration = new Configuration(defaultModel, policyModel, new ConfigurationModel(), userModel);
    }
    getConfigurationData() {
        return this.configuration.toData();
    }
    getValue(arg1, arg2) {
        const section = typeof arg1 === 'string' ? arg1 : undefined;
        const overrides = isConfigurationOverrides(arg1) ? arg1 : isConfigurationOverrides(arg2) ? arg2 : {};
        return this.configuration.getValue(section, overrides, undefined);
    }
    updateValue(key, value, arg3, arg4) {
        return Promise.reject(new Error('not supported'));
    }
    inspect(key) {
        return this.configuration.inspect(key, {}, undefined);
    }
    keys() {
        return this.configuration.keys(undefined);
    }
    async reloadConfiguration() {
        const configurationModel = await this.userConfiguration.loadConfiguration();
        this.onDidChangeUserConfiguration(configurationModel);
    }
    onDidChangeUserConfiguration(userConfigurationModel) {
        const previous = this.configuration.toData();
        const change = this.configuration.compareAndUpdateLocalUserConfiguration(userConfigurationModel);
        this.trigger(change, previous, 2 /* ConfigurationTarget.USER */);
    }
    onDidDefaultConfigurationChange(defaultConfigurationModel, properties) {
        const previous = this.configuration.toData();
        const change = this.configuration.compareAndUpdateDefaultConfiguration(defaultConfigurationModel, properties);
        this.trigger(change, previous, 7 /* ConfigurationTarget.DEFAULT */);
    }
    onDidPolicyConfigurationChange(policyConfiguration) {
        const previous = this.configuration.toData();
        const change = this.configuration.compareAndUpdatePolicyConfiguration(policyConfiguration);
        this.trigger(change, previous, 7 /* ConfigurationTarget.DEFAULT */);
    }
    trigger(configurationChange, previous, source) {
        const event = new ConfigurationChangeEvent(configurationChange, { data: previous }, this.configuration);
        event.source = source;
        event.sourceConfig = this.getTargetConfiguration(source);
        this._onDidChangeConfiguration.fire(event);
    }
    getTargetConfiguration(target) {
        switch (target) {
            case 7 /* ConfigurationTarget.DEFAULT */:
                return this.configuration.defaults.contents;
            case 2 /* ConfigurationTarget.USER */:
                return this.configuration.localUserConfiguration.contents;
        }
        return {};
    }
}

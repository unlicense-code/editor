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
import { URI } from 'vs/base/common/uri';
import { Registry } from 'vs/platform/registry/common/platform';
import { Extensions as ConfigurationExtensions, getScopes } from 'vs/platform/configuration/common/configurationRegistry';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { MainContext, ExtHostContext } from '../common/extHost.protocol';
import { extHostNamedCustomer } from 'vs/workbench/services/extensions/common/extHostCustomers';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
let MainThreadConfiguration = class MainThreadConfiguration {
    _workspaceContextService;
    configurationService;
    _environmentService;
    _configurationListener;
    constructor(extHostContext, _workspaceContextService, configurationService, _environmentService) {
        this._workspaceContextService = _workspaceContextService;
        this.configurationService = configurationService;
        this._environmentService = _environmentService;
        const proxy = extHostContext.getProxy(ExtHostContext.ExtHostConfiguration);
        proxy.$initializeConfiguration(this._getConfigurationData());
        this._configurationListener = configurationService.onDidChangeConfiguration(e => {
            proxy.$acceptConfigurationChanged(this._getConfigurationData(), e.change);
        });
    }
    _getConfigurationData() {
        const configurationData = { ...(this.configurationService.getConfigurationData()), configurationScopes: [] };
        // Send configurations scopes only in development mode.
        if (!this._environmentService.isBuilt || this._environmentService.isExtensionDevelopment) {
            configurationData.configurationScopes = getScopes();
        }
        return configurationData;
    }
    dispose() {
        this._configurationListener.dispose();
    }
    $updateConfigurationOption(target, key, value, overrides, scopeToLanguage) {
        overrides = { resource: overrides?.resource ? URI.revive(overrides.resource) : undefined, overrideIdentifier: overrides?.overrideIdentifier };
        return this.writeConfiguration(target, key, value, overrides, scopeToLanguage);
    }
    $removeConfigurationOption(target, key, overrides, scopeToLanguage) {
        overrides = { resource: overrides?.resource ? URI.revive(overrides.resource) : undefined, overrideIdentifier: overrides?.overrideIdentifier };
        return this.writeConfiguration(target, key, undefined, overrides, scopeToLanguage);
    }
    writeConfiguration(target, key, value, overrides, scopeToLanguage) {
        target = target !== null && target !== undefined ? target : this.deriveConfigurationTarget(key, overrides);
        const configurationValue = this.configurationService.inspect(key, overrides);
        switch (target) {
            case 8 /* ConfigurationTarget.MEMORY */:
                return this._updateValue(key, value, target, configurationValue?.memory?.override, overrides, scopeToLanguage);
            case 6 /* ConfigurationTarget.WORKSPACE_FOLDER */:
                return this._updateValue(key, value, target, configurationValue?.workspaceFolder?.override, overrides, scopeToLanguage);
            case 5 /* ConfigurationTarget.WORKSPACE */:
                return this._updateValue(key, value, target, configurationValue?.workspace?.override, overrides, scopeToLanguage);
            case 4 /* ConfigurationTarget.USER_REMOTE */:
                return this._updateValue(key, value, target, configurationValue?.userRemote?.override, overrides, scopeToLanguage);
            default:
                return this._updateValue(key, value, target, configurationValue?.userLocal?.override, overrides, scopeToLanguage);
        }
    }
    _updateValue(key, value, configurationTarget, overriddenValue, overrides, scopeToLanguage) {
        overrides = scopeToLanguage === true ? overrides
            : scopeToLanguage === false ? { resource: overrides.resource }
                : overrides.overrideIdentifier && overriddenValue !== undefined ? overrides
                    : { resource: overrides.resource };
        return this.configurationService.updateValue(key, value, overrides, configurationTarget, true);
    }
    deriveConfigurationTarget(key, overrides) {
        if (overrides.resource && this._workspaceContextService.getWorkbenchState() === 3 /* WorkbenchState.WORKSPACE */) {
            const configurationProperties = Registry.as(ConfigurationExtensions.Configuration).getConfigurationProperties();
            if (configurationProperties[key] && (configurationProperties[key].scope === 4 /* ConfigurationScope.RESOURCE */ || configurationProperties[key].scope === 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */)) {
                return 6 /* ConfigurationTarget.WORKSPACE_FOLDER */;
            }
        }
        return 5 /* ConfigurationTarget.WORKSPACE */;
    }
};
MainThreadConfiguration = __decorate([
    extHostNamedCustomer(MainContext.MainThreadConfiguration),
    __param(1, IWorkspaceContextService),
    __param(2, IConfigurationService),
    __param(3, IEnvironmentService)
], MainThreadConfiguration);
export { MainThreadConfiguration };

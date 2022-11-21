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
import * as performance from 'vs/base/common/performance';
import { URI } from 'vs/base/common/uri';
import { MainContext } from 'vs/workbench/api/common/extHost.protocol';
import { IExtHostConfiguration } from 'vs/workbench/api/common/extHostConfiguration';
import { nullExtensionDescription } from 'vs/workbench/services/extensions/common/extensions';
import { ExtensionIdentifier } from 'vs/platform/extensions/common/extensions';
import { IExtHostRpcService } from 'vs/workbench/api/common/extHostRpcService';
import { IExtHostInitDataService } from 'vs/workbench/api/common/extHostInitDataService';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IExtHostExtensionService } from 'vs/workbench/api/common/extHostExtensionService';
import { platform } from 'vs/base/common/process';
import { ILogService } from 'vs/platform/log/common/log';
import { escapeRegExpCharacters } from 'vs/base/common/strings';
let RequireInterceptor = class RequireInterceptor {
    _apiFactory;
    _extensionRegistry;
    _instaService;
    _extHostConfiguration;
    _extHostExtensionService;
    _initData;
    _logService;
    _factories;
    _alternatives;
    constructor(_apiFactory, _extensionRegistry, _instaService, _extHostConfiguration, _extHostExtensionService, _initData, _logService) {
        this._apiFactory = _apiFactory;
        this._extensionRegistry = _extensionRegistry;
        this._instaService = _instaService;
        this._extHostConfiguration = _extHostConfiguration;
        this._extHostExtensionService = _extHostExtensionService;
        this._initData = _initData;
        this._logService = _logService;
        this._factories = new Map();
        this._alternatives = [];
    }
    async install() {
        this._installInterceptor();
        performance.mark('code/extHost/willWaitForConfig');
        const configProvider = await this._extHostConfiguration.getConfigProvider();
        performance.mark('code/extHost/didWaitForConfig');
        const extensionPaths = await this._extHostExtensionService.getExtensionPathIndex();
        this.register(new VSCodeNodeModuleFactory(this._apiFactory, extensionPaths, this._extensionRegistry, configProvider, this._logService));
        this.register(this._instaService.createInstance(KeytarNodeModuleFactory, extensionPaths));
        this.register(this._instaService.createInstance(NodeModuleAliasingModuleFactory));
        if (this._initData.remote.isRemote) {
            this.register(this._instaService.createInstance(OpenNodeModuleFactory, extensionPaths, this._initData.environment.appUriScheme));
        }
    }
    register(interceptor) {
        if ('nodeModuleName' in interceptor) {
            if (Array.isArray(interceptor.nodeModuleName)) {
                for (const moduleName of interceptor.nodeModuleName) {
                    this._factories.set(moduleName, interceptor);
                }
            }
            else {
                this._factories.set(interceptor.nodeModuleName, interceptor);
            }
        }
        if (typeof interceptor.alternativeModuleName === 'function') {
            this._alternatives.push((moduleName) => {
                return interceptor.alternativeModuleName(moduleName);
            });
        }
    }
};
RequireInterceptor = __decorate([
    __param(2, IInstantiationService),
    __param(3, IExtHostConfiguration),
    __param(4, IExtHostExtensionService),
    __param(5, IExtHostInitDataService),
    __param(6, ILogService)
], RequireInterceptor);
export { RequireInterceptor };
//#region --- module renames
let NodeModuleAliasingModuleFactory = class NodeModuleAliasingModuleFactory {
    /**
     * Map of aliased internal node_modules, used to allow for modules to be
     * renamed without breaking extensions. In the form "original -> new name".
     */
    static aliased = new Map([
        ['vscode-ripgrep', '@vscode/ripgrep'],
        ['vscode-windows-registry', '@vscode/windows-registry'],
    ]);
    re;
    constructor(initData) {
        if (initData.environment.appRoot && NodeModuleAliasingModuleFactory.aliased.size) {
            const root = escapeRegExpCharacters(this.forceForwardSlashes(initData.environment.appRoot.fsPath));
            // decompose ${appRoot}/node_modules/foo/bin to ['${appRoot}/node_modules/', 'foo', '/bin'],
            // and likewise the more complex form ${appRoot}/node_modules.asar.unpacked/@vcode/foo/bin
            // to ['${appRoot}/node_modules.asar.unpacked/',' @vscode/foo', '/bin'].
            const npmIdChrs = `[a-z0-9_.-]`;
            const npmModuleName = `@${npmIdChrs}+\\/${npmIdChrs}+|${npmIdChrs}+`;
            const moduleFolders = 'node_modules|node_modules\\.asar(?:\\.unpacked)?';
            this.re = new RegExp(`^(${root}/${moduleFolders}\\/)(${npmModuleName})(.*)$`, 'i');
        }
    }
    alternativeModuleName(name) {
        if (!this.re) {
            return;
        }
        const result = this.re.exec(this.forceForwardSlashes(name));
        if (!result) {
            return;
        }
        const [, prefix, moduleName, suffix] = result;
        const dealiased = NodeModuleAliasingModuleFactory.aliased.get(moduleName);
        if (dealiased === undefined) {
            return;
        }
        console.warn(`${moduleName} as been renamed to ${dealiased}, please update your imports`);
        return prefix + dealiased + suffix;
    }
    forceForwardSlashes(str) {
        return str.replace(/\\/g, '/');
    }
};
NodeModuleAliasingModuleFactory = __decorate([
    __param(0, IExtHostInitDataService)
], NodeModuleAliasingModuleFactory);
//#endregion
//#region --- vscode-module
class VSCodeNodeModuleFactory {
    _apiFactory;
    _extensionPaths;
    _extensionRegistry;
    _configProvider;
    _logService;
    nodeModuleName = 'vscode';
    _extApiImpl = new Map();
    _defaultApiImpl;
    constructor(_apiFactory, _extensionPaths, _extensionRegistry, _configProvider, _logService) {
        this._apiFactory = _apiFactory;
        this._extensionPaths = _extensionPaths;
        this._extensionRegistry = _extensionRegistry;
        this._configProvider = _configProvider;
        this._logService = _logService;
    }
    load(_request, parent) {
        // get extension id from filename and api for extension
        const ext = this._extensionPaths.findSubstr(parent);
        if (ext) {
            let apiImpl = this._extApiImpl.get(ExtensionIdentifier.toKey(ext.identifier));
            if (!apiImpl) {
                apiImpl = this._apiFactory(ext, this._extensionRegistry, this._configProvider);
                this._extApiImpl.set(ExtensionIdentifier.toKey(ext.identifier), apiImpl);
            }
            return apiImpl;
        }
        // fall back to a default implementation
        if (!this._defaultApiImpl) {
            let extensionPathsPretty = '';
            this._extensionPaths.forEach((value, index) => extensionPathsPretty += `\t${index} -> ${value.identifier.value}\n`);
            this._logService.warn(`Could not identify extension for 'vscode' require call from ${parent}. These are the extension path mappings: \n${extensionPathsPretty}`);
            this._defaultApiImpl = this._apiFactory(nullExtensionDescription, this._extensionRegistry, this._configProvider);
        }
        return this._defaultApiImpl;
    }
}
let KeytarNodeModuleFactory = class KeytarNodeModuleFactory {
    _extensionPaths;
    nodeModuleName = 'keytar';
    _mainThreadTelemetry;
    alternativeNames;
    _impl;
    constructor(_extensionPaths, rpcService, initData) {
        this._extensionPaths = _extensionPaths;
        this._mainThreadTelemetry = rpcService.getProxy(MainContext.MainThreadTelemetry);
        const { environment } = initData;
        const mainThreadKeytar = rpcService.getProxy(MainContext.MainThreadKeytar);
        if (environment.appRoot) {
            let appRoot = environment.appRoot.fsPath;
            if (platform === 'win32') {
                appRoot = appRoot.replace(/\\/g, '/');
            }
            if (appRoot[appRoot.length - 1] === '/') {
                appRoot = appRoot.substr(0, appRoot.length - 1);
            }
            this.alternativeNames = new Set();
            this.alternativeNames.add(`${appRoot}/node_modules.asar/keytar`);
            this.alternativeNames.add(`${appRoot}/node_modules/keytar`);
        }
        this._impl = {
            getPassword: (service, account) => {
                return mainThreadKeytar.$getPassword(service, account);
            },
            setPassword: (service, account, password) => {
                return mainThreadKeytar.$setPassword(service, account, password);
            },
            deletePassword: (service, account) => {
                return mainThreadKeytar.$deletePassword(service, account);
            },
            findPassword: (service) => {
                return mainThreadKeytar.$findPassword(service);
            },
            findCredentials(service) {
                return mainThreadKeytar.$findCredentials(service);
            }
        };
    }
    load(_request, parent) {
        const ext = this._extensionPaths.findSubstr(parent);
        this._mainThreadTelemetry.$publicLog2('shimming.keytar', { extension: ext?.identifier.value ?? 'unknown_extension' });
        return this._impl;
    }
    alternativeModuleName(name) {
        const length = name.length;
        // We need at least something like: `?/keytar` which requires
        // more than 7 characters.
        if (length <= 7 || !this.alternativeNames) {
            return undefined;
        }
        const sep = length - 7;
        if ((name.charAt(sep) === '/' || name.charAt(sep) === '\\') && name.endsWith('keytar')) {
            name = name.replace(/\\/g, '/');
            if (this.alternativeNames.has(name)) {
                return 'keytar';
            }
        }
        return undefined;
    }
};
KeytarNodeModuleFactory = __decorate([
    __param(1, IExtHostRpcService),
    __param(2, IExtHostInitDataService)
], KeytarNodeModuleFactory);
let OpenNodeModuleFactory = class OpenNodeModuleFactory {
    _extensionPaths;
    _appUriScheme;
    nodeModuleName = ['open', 'opn'];
    _extensionId;
    _original;
    _impl;
    _mainThreadTelemetry;
    constructor(_extensionPaths, _appUriScheme, rpcService) {
        this._extensionPaths = _extensionPaths;
        this._appUriScheme = _appUriScheme;
        this._mainThreadTelemetry = rpcService.getProxy(MainContext.MainThreadTelemetry);
        const mainThreadWindow = rpcService.getProxy(MainContext.MainThreadWindow);
        this._impl = (target, options) => {
            const uri = URI.parse(target);
            // If we have options use the original method.
            if (options) {
                return this.callOriginal(target, options);
            }
            if (uri.scheme === 'http' || uri.scheme === 'https') {
                return mainThreadWindow.$openUri(uri, target, { allowTunneling: true });
            }
            else if (uri.scheme === 'mailto' || uri.scheme === this._appUriScheme) {
                return mainThreadWindow.$openUri(uri, target, {});
            }
            return this.callOriginal(target, options);
        };
    }
    load(request, parent, original) {
        // get extension id from filename and api for extension
        const extension = this._extensionPaths.findSubstr(parent);
        if (extension) {
            this._extensionId = extension.identifier.value;
            this.sendShimmingTelemetry();
        }
        this._original = original(request);
        return this._impl;
    }
    callOriginal(target, options) {
        this.sendNoForwardTelemetry();
        return this._original(target, options);
    }
    sendShimmingTelemetry() {
        if (!this._extensionId) {
            return;
        }
        this._mainThreadTelemetry.$publicLog2('shimming.open', { extension: this._extensionId });
    }
    sendNoForwardTelemetry() {
        if (!this._extensionId) {
            return;
        }
        this._mainThreadTelemetry.$publicLog2('shimming.open.call.noForward', { extension: this._extensionId });
    }
};
OpenNodeModuleFactory = __decorate([
    __param(2, IExtHostRpcService)
], OpenNodeModuleFactory);
//#endregion

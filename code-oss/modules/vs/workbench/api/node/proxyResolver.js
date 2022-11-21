/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as http from 'http';
import * as https from 'https';
import * as tls from 'tls';
import { URI } from 'vs/base/common/uri';
import { LogLevel, createHttpPatch, createProxyResolver, createTlsPatch } from 'vscode-proxy-agent';
export function connectProxyResolver(extHostWorkspace, configProvider, extensionService, extHostLogService, mainThreadTelemetry, initData) {
    const useHostProxy = initData.environment.useHostProxy;
    const doUseHostProxy = typeof useHostProxy === 'boolean' ? useHostProxy : !initData.remote.isRemote;
    const resolveProxy = createProxyResolver({
        resolveProxy: url => extHostWorkspace.resolveProxy(url),
        getHttpProxySetting: () => configProvider.getConfiguration('http').get('proxy'),
        log: (level, message, ...args) => {
            switch (level) {
                case LogLevel.Trace:
                    extHostLogService.trace(message, ...args);
                    break;
                case LogLevel.Debug:
                    extHostLogService.debug(message, ...args);
                    break;
                case LogLevel.Info:
                    extHostLogService.info(message, ...args);
                    break;
                case LogLevel.Warning:
                    extHostLogService.warn(message, ...args);
                    break;
                case LogLevel.Error:
                    extHostLogService.error(message, ...args);
                    break;
                case LogLevel.Critical:
                    extHostLogService.error(message, ...args);
                    break;
                case LogLevel.Off: break;
                default:
                    never(level, message, args);
                    break;
            }
            function never(level, message, ...args) {
                extHostLogService.error('Unknown log level', level);
                extHostLogService.error(message, ...args);
            }
        },
        getLogLevel: () => extHostLogService.getLevel(),
        // TODO @chrmarti Remove this from proxy agent
        proxyResolveTelemetry: () => { },
        useHostProxy: doUseHostProxy,
        env: process.env,
    });
    const lookup = createPatchedModules(configProvider, resolveProxy);
    return configureModuleLoading(extensionService, lookup);
}
function createPatchedModules(configProvider, resolveProxy) {
    const proxySetting = {
        config: configProvider.getConfiguration('http')
            .get('proxySupport') || 'off'
    };
    configProvider.onDidChangeConfiguration(e => {
        proxySetting.config = configProvider.getConfiguration('http')
            .get('proxySupport') || 'off';
    });
    const certSetting = {
        config: !!configProvider.getConfiguration('http')
            .get('systemCertificates')
    };
    configProvider.onDidChangeConfiguration(e => {
        certSetting.config = !!configProvider.getConfiguration('http')
            .get('systemCertificates');
    });
    return {
        http: {
            off: Object.assign({}, http, createHttpPatch(http, resolveProxy, { config: 'off' }, certSetting, true)),
            on: Object.assign({}, http, createHttpPatch(http, resolveProxy, { config: 'on' }, certSetting, true)),
            override: Object.assign({}, http, createHttpPatch(http, resolveProxy, { config: 'override' }, certSetting, true)),
            onRequest: Object.assign({}, http, createHttpPatch(http, resolveProxy, proxySetting, certSetting, true)),
            default: Object.assign(http, createHttpPatch(http, resolveProxy, proxySetting, certSetting, false)) // run last
        },
        https: {
            off: Object.assign({}, https, createHttpPatch(https, resolveProxy, { config: 'off' }, certSetting, true)),
            on: Object.assign({}, https, createHttpPatch(https, resolveProxy, { config: 'on' }, certSetting, true)),
            override: Object.assign({}, https, createHttpPatch(https, resolveProxy, { config: 'override' }, certSetting, true)),
            onRequest: Object.assign({}, https, createHttpPatch(https, resolveProxy, proxySetting, certSetting, true)),
            default: Object.assign(https, createHttpPatch(https, resolveProxy, proxySetting, certSetting, false)) // run last
        },
        tls: Object.assign(tls, createTlsPatch(tls))
    };
}
const modulesCache = new Map();
function configureModuleLoading(extensionService, lookup) {
    return extensionService.getExtensionPathIndex()
        .then(extensionPaths => {
        const node_module = require.__$__nodeRequire('module');
        const original = node_module._load;
        node_module._load = function load(request, parent, isMain) {
            if (request === 'tls') {
                return lookup.tls;
            }
            if (request !== 'http' && request !== 'https') {
                return original.apply(this, arguments);
            }
            const modules = lookup[request];
            const ext = extensionPaths.findSubstr(URI.file(parent.filename));
            let cache = modulesCache.get(ext);
            if (!cache) {
                modulesCache.set(ext, cache = {});
            }
            if (!cache[request]) {
                const mod = modules.default;
                cache[request] = { ...mod }; // Copy to work around #93167.
            }
            return cache[request];
        };
    });
}

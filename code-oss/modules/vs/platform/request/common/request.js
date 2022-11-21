/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { streamToBuffer } from 'vs/base/common/buffer';
import { localize } from 'vs/nls';
import { Extensions } from 'vs/platform/configuration/common/configurationRegistry';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { Registry } from 'vs/platform/registry/common/platform';
export const IRequestService = createDecorator('requestService');
export function isSuccess(context) {
    return (context.res.statusCode && context.res.statusCode >= 200 && context.res.statusCode < 300) || context.res.statusCode === 1223;
}
function hasNoContent(context) {
    return context.res.statusCode === 204;
}
export async function asText(context) {
    if (hasNoContent(context)) {
        return null;
    }
    const buffer = await streamToBuffer(context.stream);
    return buffer.toString();
}
export async function asTextOrError(context) {
    if (!isSuccess(context)) {
        throw new Error('Server returned ' + context.res.statusCode);
    }
    return asText(context);
}
export async function asJson(context) {
    if (!isSuccess(context)) {
        throw new Error('Server returned ' + context.res.statusCode);
    }
    if (hasNoContent(context)) {
        return null;
    }
    const buffer = await streamToBuffer(context.stream);
    const str = buffer.toString();
    try {
        return JSON.parse(str);
    }
    catch (err) {
        err.message += ':\n' + str;
        throw err;
    }
}
export function updateProxyConfigurationsScope(scope) {
    registerProxyConfigurations(scope);
}
let proxyConfiguration;
function registerProxyConfigurations(scope) {
    const configurationRegistry = Registry.as(Extensions.Configuration);
    const oldProxyConfiguration = proxyConfiguration;
    proxyConfiguration = {
        id: 'http',
        order: 15,
        title: localize('httpConfigurationTitle', "HTTP"),
        type: 'object',
        scope,
        properties: {
            'http.proxy': {
                type: 'string',
                pattern: '^(https?|socks5?)://([^:]*(:[^@]*)?@)?([^:]+|\\[[:0-9a-fA-F]+\\])(:\\d+)?/?$|^$',
                markdownDescription: localize('proxy', "The proxy setting to use. If not set, will be inherited from the `http_proxy` and `https_proxy` environment variables."),
                restricted: true
            },
            'http.proxyStrictSSL': {
                type: 'boolean',
                default: true,
                description: localize('strictSSL', "Controls whether the proxy server certificate should be verified against the list of supplied CAs."),
                restricted: true
            },
            'http.proxyAuthorization': {
                type: ['null', 'string'],
                default: null,
                markdownDescription: localize('proxyAuthorization', "The value to send as the `Proxy-Authorization` header for every network request."),
                restricted: true
            },
            'http.proxySupport': {
                type: 'string',
                enum: ['off', 'on', 'fallback', 'override'],
                enumDescriptions: [
                    localize('proxySupportOff', "Disable proxy support for extensions."),
                    localize('proxySupportOn', "Enable proxy support for extensions."),
                    localize('proxySupportFallback', "Enable proxy support for extensions, fall back to request options, when no proxy found."),
                    localize('proxySupportOverride', "Enable proxy support for extensions, override request options."),
                ],
                default: 'override',
                description: localize('proxySupport', "Use the proxy support for extensions."),
                restricted: true
            },
            'http.systemCertificates': {
                type: 'boolean',
                default: true,
                description: localize('systemCertificates', "Controls whether CA certificates should be loaded from the OS. (On Windows and macOS, a reload of the window is required after turning this off.)"),
                restricted: true
            }
        }
    };
    configurationRegistry.updateConfigurations({ add: [proxyConfiguration], remove: oldProxyConfiguration ? [oldProxyConfiguration] : [] });
}
registerProxyConfigurations(2 /* ConfigurationScope.MACHINE */);

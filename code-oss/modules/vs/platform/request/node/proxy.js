/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { parse as parseUrl } from 'url';
import { isBoolean } from 'vs/base/common/types';
function getSystemProxyURI(requestURL, env) {
    if (requestURL.protocol === 'http:') {
        return env.HTTP_PROXY || env.http_proxy || null;
    }
    else if (requestURL.protocol === 'https:') {
        return env.HTTPS_PROXY || env.https_proxy || env.HTTP_PROXY || env.http_proxy || null;
    }
    return null;
}
export async function getProxyAgent(rawRequestURL, env, options = {}) {
    const requestURL = parseUrl(rawRequestURL);
    const proxyURL = options.proxyUrl || getSystemProxyURI(requestURL, env);
    if (!proxyURL) {
        return null;
    }
    const proxyEndpoint = parseUrl(proxyURL);
    if (!/^https?:$/.test(proxyEndpoint.protocol || '')) {
        return null;
    }
    const opts = {
        host: proxyEndpoint.hostname || '',
        port: proxyEndpoint.port || (proxyEndpoint.protocol === 'https' ? '443' : '80'),
        auth: proxyEndpoint.auth,
        rejectUnauthorized: isBoolean(options.strictSSL) ? options.strictSSL : true,
    };
    return requestURL.protocol === 'http:'
        ? new (await import('http-proxy-agent'))(opts)
        : new (await import('https-proxy-agent'))(opts);
}

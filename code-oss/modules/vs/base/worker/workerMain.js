"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
(function () {
    const MonacoEnvironment = self.MonacoEnvironment;
    const monacoBaseUrl = MonacoEnvironment && MonacoEnvironment.baseUrl ? MonacoEnvironment.baseUrl : '../../../';
    const trustedTypesPolicy = (typeof self.trustedTypes?.createPolicy === 'function'
        ? self.trustedTypes?.createPolicy('amdLoader', {
            createScriptURL: value => value,
            createScript: (_, ...args) => {
                // workaround a chrome issue not allowing to create new functions
                // see https://github.com/w3c/webappsec-trusted-types/wiki/Trusted-Types-for-function-constructor
                const fnArgs = args.slice(0, -1).join(',');
                const fnBody = args.pop().toString();
                // Do not add a new line to fnBody, as this will confuse source maps.
                const body = `(function anonymous(${fnArgs}) { ${fnBody}\n})`;
                return body;
            }
        })
        : undefined);
    function canUseEval() {
        try {
            const func = (trustedTypesPolicy
                ? self.eval(trustedTypesPolicy.createScript('', 'true'))
                : new Function('true'));
            func.call(self);
            return true;
        }
        catch (err) {
            return false;
        }
    }
    function loadAMDLoader() {
        return new Promise((resolve, reject) => {
            if (typeof self.define === 'function' && self.define.amd) {
                return resolve();
            }
            const loaderSrc = monacoBaseUrl + 'vs/loader.js';
            const isCrossOrigin = (/^((http:)|(https:)|(file:))/.test(loaderSrc) && loaderSrc.substring(0, self.origin.length) !== self.origin);
            if (!isCrossOrigin && canUseEval()) {
                // use `fetch` if possible because `importScripts`
                // is synchronous and can lead to deadlocks on Safari
                fetch(loaderSrc).then((response) => {
                    if (response.status !== 200) {
                        throw new Error(response.statusText);
                    }
                    return response.text();
                }).then((text) => {
                    text = `${text}\n//# sourceURL=${loaderSrc}`;
                    const func = (trustedTypesPolicy
                        ? self.eval(trustedTypesPolicy.createScript('', text))
                        : new Function(text));
                    func.call(self);
                    resolve();
                }).then(undefined, reject);
                return;
            }
            if (trustedTypesPolicy) {
                importScripts(trustedTypesPolicy.createScriptURL(loaderSrc));
            }
            else {
                importScripts(loaderSrc);
            }
            resolve();
        });
    }
    function configureAMDLoader() {
        require.config({
            baseUrl: monacoBaseUrl,
            catchError: true,
            trustedTypesPolicy,
            amdModulesPattern: /^vs\//
        });
    }
    function loadCode(moduleId) {
        loadAMDLoader().then(() => {
            configureAMDLoader();
            require([moduleId], function (ws) {
                setTimeout(function () {
                    const messageHandler = ws.create((msg, transfer) => {
                        self.postMessage(msg, transfer);
                    }, null);
                    self.onmessage = (e) => messageHandler.onmessage(e.data, e.ports);
                    while (beforeReadyMessages.length > 0) {
                        self.onmessage(beforeReadyMessages.shift());
                    }
                }, 0);
            });
        });
    }
    // If the loader is already defined, configure it immediately
    // This helps in the bundled case, where we must load nls files
    // and they need a correct baseUrl to be loaded.
    if (typeof self.define === 'function' && self.define.amd) {
        configureAMDLoader();
    }
    let isFirstMessage = true;
    const beforeReadyMessages = [];
    self.onmessage = (message) => {
        if (!isFirstMessage) {
            beforeReadyMessages.push(message);
            return;
        }
        isFirstMessage = false;
        loadCode(message.data);
    };
})();

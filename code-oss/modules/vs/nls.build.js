/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const buildMap = {};
const buildMapKeys = {};
const entryPoints = {};
export function localize(data, message, ...args) {
    throw new Error(`Not supported at build time!`);
}
export function getConfiguredDefaultLocale() {
    throw new Error(`Not supported at build time!`);
}
/**
 * Invoked by the loader at build-time
 */
export function load(name, req, load, config) {
    if (!name || name.length === 0) {
        load({ localize, getConfiguredDefaultLocale });
    }
    else {
        req([name + '.nls', name + '.nls.keys'], function (messages, keys) {
            buildMap[name] = messages;
            buildMapKeys[name] = keys;
            load(messages);
        });
    }
}
/**
 * Invoked by the loader at build-time
 */
export function write(pluginName, moduleName, write) {
    const entryPoint = write.getEntryPoint();
    entryPoints[entryPoint] = entryPoints[entryPoint] || [];
    entryPoints[entryPoint].push(moduleName);
    if (moduleName !== entryPoint) {
        write.asModule(pluginName + '!' + moduleName, 'define([\'vs/nls\', \'vs/nls!' + entryPoint + '\'], function(nls, data) { return nls.create("' + moduleName + '", data); });');
    }
}
/**
 * Invoked by the loader at build-time
 */
export function writeFile(pluginName, moduleName, req, write, config) {
    if (entryPoints.hasOwnProperty(moduleName)) {
        const fileName = req.toUrl(moduleName + '.nls.js');
        const contents = [
            '/*---------------------------------------------------------',
            ' * Copyright (c) Microsoft Corporation. All rights reserved.',
            ' *--------------------------------------------------------*/'
        ], entries = entryPoints[moduleName];
        const data = {};
        for (let i = 0; i < entries.length; i++) {
            data[entries[i]] = buildMap[entries[i]];
        }
        contents.push('define("' + moduleName + '.nls", ' + JSON.stringify(data, null, '\t') + ');');
        write(fileName, contents.join('\r\n'));
    }
}
/**
 * Invoked by the loader at build-time
 */
export function finishBuild(write) {
    write('nls.metadata.json', JSON.stringify({
        keys: buildMapKeys,
        messages: buildMap,
        bundles: entryPoints
    }, null, '\t'));
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as assert from 'assert';
import * as path from 'vs/base/common/path';
import { getPathFromAmdModule } from 'vs/base/test/node/testUtils';
import { Promises } from 'vs/base/node/pfs';
function toIResolvedKeybinding(kb) {
    return {
        label: kb.getLabel(),
        ariaLabel: kb.getAriaLabel(),
        electronAccelerator: kb.getElectronAccelerator(),
        userSettingsLabel: kb.getUserSettingsLabel(),
        isWYSIWYG: kb.isWYSIWYG(),
        isChord: kb.isChord(),
        dispatchParts: kb.getDispatchParts(),
        singleModifierDispatchParts: kb.getSingleModifierDispatchParts()
    };
}
export function assertResolveKeybinding(mapper, keybinding, expected) {
    const actual = mapper.resolveKeybinding(keybinding).map(toIResolvedKeybinding);
    assert.deepStrictEqual(actual, expected);
}
export function assertResolveKeyboardEvent(mapper, keyboardEvent, expected) {
    const actual = toIResolvedKeybinding(mapper.resolveKeyboardEvent(keyboardEvent));
    assert.deepStrictEqual(actual, expected);
}
export function assertResolveUserBinding(mapper, parts, expected) {
    const actual = mapper.resolveUserBinding(parts).map(toIResolvedKeybinding);
    assert.deepStrictEqual(actual, expected);
}
export function readRawMapping(file) {
    return Promises.readFile(getPathFromAmdModule(require, `vs/workbench/services/keybinding/test/node/${file}.js`)).then((buff) => {
        const contents = buff.toString();
        const func = new Function('define', contents);
        let rawMappings = null;
        func(function (value) {
            rawMappings = value;
        });
        return rawMappings;
    });
}
export function assertMapping(writeFileIfDifferent, mapper, file) {
    const filePath = path.normalize(getPathFromAmdModule(require, `vs/workbench/services/keybinding/test/node/${file}`));
    return Promises.readFile(filePath).then((buff) => {
        const expected = buff.toString().replace(/\r\n/g, '\n');
        const actual = mapper.dumpDebugInfo().replace(/\r\n/g, '\n');
        if (actual !== expected && writeFileIfDifferent) {
            const destPath = filePath.replace(/[\/\\]out[\/\\]vs[\/\\]workbench/, '/src/vs/workbench');
            Promises.writeFile(destPath, actual);
        }
        assert.deepStrictEqual(actual, expected);
    });
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { SimpleKeybinding } from 'vs/base/common/keybindings';
import { USLayoutResolvedKeybinding } from 'vs/platform/keybinding/common/usLayoutResolvedKeybinding';
/**
 * A keyboard mapper to be used when reading the keymap from the OS fails.
 */
export class MacLinuxFallbackKeyboardMapper {
    /**
     * OS (can be Linux or Macintosh)
     */
    _OS;
    constructor(OS) {
        this._OS = OS;
    }
    dumpDebugInfo() {
        return 'FallbackKeyboardMapper dispatching on keyCode';
    }
    resolveKeybinding(keybinding) {
        return [new USLayoutResolvedKeybinding(keybinding, this._OS)];
    }
    resolveKeyboardEvent(keyboardEvent) {
        const keybinding = new SimpleKeybinding(keyboardEvent.ctrlKey, keyboardEvent.shiftKey, keyboardEvent.altKey, keyboardEvent.metaKey, keyboardEvent.keyCode);
        return new USLayoutResolvedKeybinding(keybinding.toChord(), this._OS);
    }
    resolveUserBinding(input) {
        return USLayoutResolvedKeybinding.resolveUserBinding(input, this._OS);
    }
}

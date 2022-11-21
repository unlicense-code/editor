/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { CancellationTokenSource } from 'vs/base/common/cancellation';
import { Emitter } from 'vs/base/common/event';
import { KeyChord } from 'vs/base/common/keyCodes';
import { URI } from 'vs/base/common/uri';
import { Position } from 'vs/editor/common/core/position';
import { Range } from 'vs/editor/common/core/range';
import { Selection } from 'vs/editor/common/core/selection';
import { Token } from 'vs/editor/common/languages';
import * as standaloneEnums from 'vs/editor/common/standalone/standaloneEnums';
export class KeyMod {
    static CtrlCmd = 2048 /* ConstKeyMod.CtrlCmd */;
    static Shift = 1024 /* ConstKeyMod.Shift */;
    static Alt = 512 /* ConstKeyMod.Alt */;
    static WinCtrl = 256 /* ConstKeyMod.WinCtrl */;
    static chord(firstPart, secondPart) {
        return KeyChord(firstPart, secondPart);
    }
}
export function createMonacoBaseAPI() {
    return {
        editor: undefined,
        languages: undefined,
        CancellationTokenSource: CancellationTokenSource,
        Emitter: Emitter,
        KeyCode: standaloneEnums.KeyCode,
        KeyMod: KeyMod,
        Position: Position,
        Range: Range,
        Selection: Selection,
        SelectionDirection: standaloneEnums.SelectionDirection,
        MarkerSeverity: standaloneEnums.MarkerSeverity,
        MarkerTag: standaloneEnums.MarkerTag,
        Uri: URI,
        Token: Token
    };
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { EditorInput } from 'vs/workbench/common/editor/editorInput';
import { localize } from 'vs/nls';
export class DisassemblyViewInput extends EditorInput {
    static ID = 'debug.disassemblyView.input';
    get typeId() {
        return DisassemblyViewInput.ID;
    }
    static _instance;
    static get instance() {
        if (!DisassemblyViewInput._instance || DisassemblyViewInput._instance.isDisposed()) {
            DisassemblyViewInput._instance = new DisassemblyViewInput();
        }
        return DisassemblyViewInput._instance;
    }
    resource = undefined;
    getName() {
        return localize('disassemblyInputName', "Disassembly");
    }
    matches(other) {
        return other instanceof DisassemblyViewInput;
    }
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as nls from 'vs/nls';
import { URI } from 'vs/base/common/uri';
import { EditorInput } from 'vs/workbench/common/editor/editorInput';
export class RuntimeExtensionsInput extends EditorInput {
    static ID = 'workbench.runtimeExtensions.input';
    get typeId() {
        return RuntimeExtensionsInput.ID;
    }
    get capabilities() {
        return 2 /* EditorInputCapabilities.Readonly */ | 8 /* EditorInputCapabilities.Singleton */;
    }
    static _instance;
    static get instance() {
        if (!RuntimeExtensionsInput._instance || RuntimeExtensionsInput._instance.isDisposed()) {
            RuntimeExtensionsInput._instance = new RuntimeExtensionsInput();
        }
        return RuntimeExtensionsInput._instance;
    }
    resource = URI.from({
        scheme: 'runtime-extensions',
        path: 'default'
    });
    getName() {
        return nls.localize('extensionsInputName', "Running Extensions");
    }
    matches(other) {
        if (super.matches(other)) {
            return true;
        }
        return other instanceof RuntimeExtensionsInput;
    }
}

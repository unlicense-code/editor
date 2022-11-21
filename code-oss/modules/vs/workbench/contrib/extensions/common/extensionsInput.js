/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Schemas } from 'vs/base/common/network';
import { URI } from 'vs/base/common/uri';
import { localize } from 'vs/nls';
import { EditorInput } from 'vs/workbench/common/editor/editorInput';
import { areSameExtensions } from 'vs/platform/extensionManagement/common/extensionManagementUtil';
import { join } from 'vs/base/common/path';
export class ExtensionsInput extends EditorInput {
    _extension;
    static ID = 'workbench.extensions.input2';
    get typeId() {
        return ExtensionsInput.ID;
    }
    get capabilities() {
        return 2 /* EditorInputCapabilities.Readonly */ | 8 /* EditorInputCapabilities.Singleton */;
    }
    get resource() {
        return URI.from({
            scheme: Schemas.extension,
            path: join(this._extension.identifier.id, 'extension')
        });
    }
    constructor(_extension) {
        super();
        this._extension = _extension;
    }
    get extension() { return this._extension; }
    getName() {
        return localize('extensionsInputName', "Extension: {0}", this._extension.displayName);
    }
    matches(other) {
        if (super.matches(other)) {
            return true;
        }
        return other instanceof ExtensionsInput && areSameExtensions(this._extension.identifier, other._extension.identifier);
    }
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Schemas } from 'vs/base/common/network';
import { URI } from 'vs/base/common/uri';
import { localize } from 'vs/nls';
import { EditorInput } from 'vs/workbench/common/editor/editorInput';
export class WorkspaceTrustEditorInput extends EditorInput {
    static ID = 'workbench.input.workspaceTrust';
    get capabilities() {
        return 2 /* EditorInputCapabilities.Readonly */ | 8 /* EditorInputCapabilities.Singleton */;
    }
    get typeId() {
        return WorkspaceTrustEditorInput.ID;
    }
    resource = URI.from({
        scheme: Schemas.vscodeWorkspaceTrust,
        path: `workspaceTrustEditor`
    });
    matches(otherInput) {
        return super.matches(otherInput) || otherInput instanceof WorkspaceTrustEditorInput;
    }
    getName() {
        return localize('workspaceTrustEditorInputName', "Workspace Trust");
    }
}

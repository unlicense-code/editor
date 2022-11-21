/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { EditorAction2 } from 'vs/editor/browser/editorExtensions';
import { localize } from 'vs/nls';
import { Action2 } from 'vs/platform/actions/common/actions';
const defaultOptions = {
    category: {
        value: localize('snippets', 'Snippets'),
        original: 'Snippets'
    },
};
export class SnippetsAction extends Action2 {
    constructor(desc) {
        super({ ...defaultOptions, ...desc });
    }
}
export class SnippetEditorAction extends EditorAction2 {
    constructor(desc) {
        super({ ...defaultOptions, ...desc });
    }
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { distinct } from 'vs/base/common/arrays';
import * as nls from 'vs/nls';
import { RawContextKey } from 'vs/platform/contextkey/common/contextkey';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { globMatchesResource, priorityToRank, RegisteredEditorPriority } from 'vs/workbench/services/editor/common/editorResolverService';
export const ICustomEditorService = createDecorator('customEditorService');
export const CONTEXT_ACTIVE_CUSTOM_EDITOR_ID = new RawContextKey('activeCustomEditorId', '', {
    type: 'string',
    description: nls.localize('context.customEditor', "The viewType of the currently active custom editor."),
});
export const CONTEXT_FOCUSED_CUSTOM_EDITOR_IS_EDITABLE = new RawContextKey('focusedCustomEditorIsEditable', false);
export var CustomEditorPriority;
(function (CustomEditorPriority) {
    CustomEditorPriority["default"] = "default";
    CustomEditorPriority["builtin"] = "builtin";
    CustomEditorPriority["option"] = "option";
})(CustomEditorPriority || (CustomEditorPriority = {}));
export class CustomEditorInfo {
    id;
    displayName;
    providerDisplayName;
    priority;
    selector;
    constructor(descriptor) {
        this.id = descriptor.id;
        this.displayName = descriptor.displayName;
        this.providerDisplayName = descriptor.providerDisplayName;
        this.priority = descriptor.priority;
        this.selector = descriptor.selector;
    }
    matches(resource) {
        return this.selector.some(selector => selector.filenamePattern && globMatchesResource(selector.filenamePattern, resource));
    }
}
export class CustomEditorInfoCollection {
    allEditors;
    constructor(editors) {
        this.allEditors = distinct(editors, editor => editor.id);
    }
    get length() { return this.allEditors.length; }
    /**
     * Find the single default editor to use (if any) by looking at the editor's priority and the
     * other contributed editors.
     */
    get defaultEditor() {
        return this.allEditors.find(editor => {
            switch (editor.priority) {
                case RegisteredEditorPriority.default:
                case RegisteredEditorPriority.builtin:
                    // A default editor must have higher priority than all other contributed editors.
                    return this.allEditors.every(otherEditor => otherEditor === editor || isLowerPriority(otherEditor, editor));
                default:
                    return false;
            }
        });
    }
    /**
     * Find the best available editor to use.
     *
     * Unlike the `defaultEditor`, a bestAvailableEditor can exist even if there are other editors with
     * the same priority.
     */
    get bestAvailableEditor() {
        const editors = Array.from(this.allEditors).sort((a, b) => {
            return priorityToRank(a.priority) - priorityToRank(b.priority);
        });
        return editors[0];
    }
}
function isLowerPriority(otherEditor, editor) {
    return priorityToRank(otherEditor.priority) < priorityToRank(editor.priority);
}

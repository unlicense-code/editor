/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { localize } from 'vs/nls';
import { assertIsDefined, withNullAsUndefined } from 'vs/base/common/types';
import { applyTextEditorOptions } from 'vs/workbench/common/editor/editorOptions';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { isEqual } from 'vs/base/common/resources';
import { CodeEditorWidget } from 'vs/editor/browser/widget/codeEditorWidget';
import { AbstractTextEditor } from 'vs/workbench/browser/parts/editor/textEditor';
/**
 * A text editor using the code editor widget.
 */
export class AbstractTextCodeEditor extends AbstractTextEditor {
    editorControl = undefined;
    get scopedContextKeyService() {
        return this.editorControl?.invokeWithinContext(accessor => accessor.get(IContextKeyService));
    }
    getTitle() {
        if (this.input) {
            return this.input.getName();
        }
        return localize('textEditor', "Text Editor");
    }
    createEditorControl(parent, initialOptions) {
        this.editorControl = this._register(this.instantiationService.createInstance(CodeEditorWidget, parent, initialOptions, this.getCodeEditorWidgetOptions()));
    }
    getCodeEditorWidgetOptions() {
        return Object.create(null);
    }
    updateEditorControlOptions(options) {
        this.editorControl?.updateOptions(options);
    }
    getMainControl() {
        return this.editorControl;
    }
    getControl() {
        return this.editorControl;
    }
    computeEditorViewState(resource) {
        if (!this.editorControl) {
            return undefined;
        }
        const model = this.editorControl.getModel();
        if (!model) {
            return undefined; // view state always needs a model
        }
        const modelUri = model.uri;
        if (!modelUri) {
            return undefined; // model URI is needed to make sure we save the view state correctly
        }
        if (!isEqual(modelUri, resource)) {
            return undefined; // prevent saving view state for a model that is not the expected one
        }
        return withNullAsUndefined(this.editorControl.saveViewState());
    }
    setOptions(options) {
        super.setOptions(options);
        if (options) {
            applyTextEditorOptions(options, assertIsDefined(this.editorControl), 0 /* ScrollType.Smooth */);
        }
    }
    focus() {
        this.editorControl?.focus();
    }
    hasFocus() {
        return this.editorControl?.hasTextFocus() || super.hasFocus();
    }
    setEditorVisible(visible, group) {
        super.setEditorVisible(visible, group);
        if (visible) {
            this.editorControl?.onVisible();
        }
        else {
            this.editorControl?.onHide();
        }
    }
    layout(dimension) {
        this.editorControl?.layout(dimension);
    }
}

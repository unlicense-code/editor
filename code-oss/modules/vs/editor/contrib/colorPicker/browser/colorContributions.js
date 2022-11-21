/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Disposable } from 'vs/base/common/lifecycle';
import { registerEditorContribution } from 'vs/editor/browser/editorExtensions';
import { Range } from 'vs/editor/common/core/range';
import { ColorDecorationInjectedTextMarker } from 'vs/editor/contrib/colorPicker/browser/colorDetector';
import { ColorHoverParticipant } from 'vs/editor/contrib/colorPicker/browser/colorHoverParticipant';
import { ModesHoverController } from 'vs/editor/contrib/hover/browser/hover';
import { HoverParticipantRegistry } from 'vs/editor/contrib/hover/browser/hoverTypes';
export class ColorContribution extends Disposable {
    _editor;
    static ID = 'editor.contrib.colorContribution';
    static RECOMPUTE_TIME = 1000; // ms
    constructor(_editor) {
        super();
        this._editor = _editor;
        this._register(_editor.onMouseDown((e) => this.onMouseDown(e)));
    }
    dispose() {
        super.dispose();
    }
    onMouseDown(mouseEvent) {
        const target = mouseEvent.target;
        if (target.type !== 6 /* MouseTargetType.CONTENT_TEXT */) {
            return;
        }
        if (!target.detail.injectedText) {
            return;
        }
        if (target.detail.injectedText.options.attachedData !== ColorDecorationInjectedTextMarker) {
            return;
        }
        if (!target.range) {
            return;
        }
        const hoverController = this._editor.getContribution(ModesHoverController.ID);
        if (!hoverController) {
            return;
        }
        if (!hoverController.isColorPickerVisible()) {
            const range = new Range(target.range.startLineNumber, target.range.startColumn + 1, target.range.endLineNumber, target.range.endColumn + 1);
            hoverController.showContentHover(range, 1 /* HoverStartMode.Immediate */, 0 /* HoverStartSource.Mouse */, false);
        }
    }
}
registerEditorContribution(ColorContribution.ID, ColorContribution);
HoverParticipantRegistry.register(ColorHoverParticipant);

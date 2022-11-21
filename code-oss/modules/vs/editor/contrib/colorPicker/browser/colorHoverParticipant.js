/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { AsyncIterableObject } from 'vs/base/common/async';
import { CancellationToken } from 'vs/base/common/cancellation';
import { Color, RGBA } from 'vs/base/common/color';
import { Disposable, DisposableStore } from 'vs/base/common/lifecycle';
import { Range } from 'vs/editor/common/core/range';
import { getColorPresentations } from 'vs/editor/contrib/colorPicker/browser/color';
import { ColorDetector } from 'vs/editor/contrib/colorPicker/browser/colorDetector';
import { ColorPickerModel } from 'vs/editor/contrib/colorPicker/browser/colorPickerModel';
import { ColorPickerWidget } from 'vs/editor/contrib/colorPicker/browser/colorPickerWidget';
import { IThemeService } from 'vs/platform/theme/common/themeService';
export class ColorHover {
    owner;
    range;
    model;
    provider;
    /**
     * Force the hover to always be rendered at this specific range,
     * even in the case of multiple hover parts.
     */
    forceShowAtRange = true;
    constructor(owner, range, model, provider) {
        this.owner = owner;
        this.range = range;
        this.model = model;
        this.provider = provider;
    }
    isValidForHoverAnchor(anchor) {
        return (anchor.type === 1 /* HoverAnchorType.Range */
            && this.range.startColumn <= anchor.range.startColumn
            && this.range.endColumn >= anchor.range.endColumn);
    }
}
let ColorHoverParticipant = class ColorHoverParticipant {
    _editor;
    _themeService;
    hoverOrdinal = 1;
    constructor(_editor, _themeService) {
        this._editor = _editor;
        this._themeService = _themeService;
    }
    computeSync(anchor, lineDecorations) {
        return [];
    }
    computeAsync(anchor, lineDecorations, token) {
        return AsyncIterableObject.fromPromise(this._computeAsync(anchor, lineDecorations, token));
    }
    async _computeAsync(anchor, lineDecorations, token) {
        if (!this._editor.hasModel()) {
            return [];
        }
        const colorDetector = ColorDetector.get(this._editor);
        if (!colorDetector) {
            return [];
        }
        for (const d of lineDecorations) {
            if (!colorDetector.isColorDecoration(d)) {
                continue;
            }
            const colorData = colorDetector.getColorData(d.range.getStartPosition());
            if (colorData) {
                const colorHover = await this._createColorHover(this._editor.getModel(), colorData.colorInfo, colorData.provider);
                return [colorHover];
            }
        }
        return [];
    }
    async _createColorHover(editorModel, colorInfo, provider) {
        const originalText = editorModel.getValueInRange(colorInfo.range);
        const { red, green, blue, alpha } = colorInfo.color;
        const rgba = new RGBA(Math.round(red * 255), Math.round(green * 255), Math.round(blue * 255), alpha);
        const color = new Color(rgba);
        const colorPresentations = await getColorPresentations(editorModel, colorInfo, provider, CancellationToken.None);
        const model = new ColorPickerModel(color, [], 0);
        model.colorPresentations = colorPresentations || [];
        model.guessColorPresentation(color, originalText);
        return new ColorHover(this, Range.lift(colorInfo.range), model, provider);
    }
    renderHoverParts(context, hoverParts) {
        if (hoverParts.length === 0 || !this._editor.hasModel()) {
            return Disposable.None;
        }
        const disposables = new DisposableStore();
        const colorHover = hoverParts[0];
        const editorModel = this._editor.getModel();
        const model = colorHover.model;
        const widget = disposables.add(new ColorPickerWidget(context.fragment, model, this._editor.getOption(131 /* EditorOption.pixelRatio */), this._themeService));
        context.setColorPicker(widget);
        let range = new Range(colorHover.range.startLineNumber, colorHover.range.startColumn, colorHover.range.endLineNumber, colorHover.range.endColumn);
        const updateEditorModel = () => {
            let textEdits;
            let newRange;
            if (model.presentation.textEdit) {
                textEdits = [model.presentation.textEdit];
                newRange = new Range(model.presentation.textEdit.range.startLineNumber, model.presentation.textEdit.range.startColumn, model.presentation.textEdit.range.endLineNumber, model.presentation.textEdit.range.endColumn);
                const trackedRange = this._editor.getModel()._setTrackedRange(null, newRange, 3 /* TrackedRangeStickiness.GrowsOnlyWhenTypingAfter */);
                this._editor.pushUndoStop();
                this._editor.executeEdits('colorpicker', textEdits);
                newRange = this._editor.getModel()._getTrackedRange(trackedRange) || newRange;
            }
            else {
                textEdits = [{ range, text: model.presentation.label, forceMoveMarkers: false }];
                newRange = range.setEndPosition(range.endLineNumber, range.startColumn + model.presentation.label.length);
                this._editor.pushUndoStop();
                this._editor.executeEdits('colorpicker', textEdits);
            }
            if (model.presentation.additionalTextEdits) {
                textEdits = [...model.presentation.additionalTextEdits];
                this._editor.executeEdits('colorpicker', textEdits);
                context.hide();
            }
            this._editor.pushUndoStop();
            range = newRange;
        };
        const updateColorPresentations = (color) => {
            return getColorPresentations(editorModel, {
                range: range,
                color: {
                    red: color.rgba.r / 255,
                    green: color.rgba.g / 255,
                    blue: color.rgba.b / 255,
                    alpha: color.rgba.a
                }
            }, colorHover.provider, CancellationToken.None).then((colorPresentations) => {
                model.colorPresentations = colorPresentations || [];
            });
        };
        disposables.add(model.onColorFlushed((color) => {
            updateColorPresentations(color).then(updateEditorModel);
        }));
        disposables.add(model.onDidChangeColor(updateColorPresentations));
        return disposables;
    }
};
ColorHoverParticipant = __decorate([
    __param(1, IThemeService)
], ColorHoverParticipant);
export { ColorHoverParticipant };

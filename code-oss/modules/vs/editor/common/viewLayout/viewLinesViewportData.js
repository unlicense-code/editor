/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Range } from 'vs/editor/common/core/range';
/**
 * Contains all data needed to render at a specific viewport.
 */
export class ViewportData {
    selections;
    /**
     * The line number at which to start rendering (inclusive).
     */
    startLineNumber;
    /**
     * The line number at which to end rendering (inclusive).
     */
    endLineNumber;
    /**
     * relativeVerticalOffset[i] is the `top` position for line at `i` + `startLineNumber`.
     */
    relativeVerticalOffset;
    /**
     * The viewport as a range (startLineNumber,1) -> (endLineNumber,maxColumn(endLineNumber)).
     */
    visibleRange;
    /**
     * Value to be substracted from `scrollTop` (in order to vertical offset numbers < 1MM)
     */
    bigNumbersDelta;
    /**
     * Positioning information about gaps whitespace.
     */
    whitespaceViewportData;
    _model;
    constructor(selections, partialData, whitespaceViewportData, model) {
        this.selections = selections;
        this.startLineNumber = partialData.startLineNumber | 0;
        this.endLineNumber = partialData.endLineNumber | 0;
        this.relativeVerticalOffset = partialData.relativeVerticalOffset;
        this.bigNumbersDelta = partialData.bigNumbersDelta | 0;
        this.whitespaceViewportData = whitespaceViewportData;
        this._model = model;
        this.visibleRange = new Range(partialData.startLineNumber, this._model.getLineMinColumn(partialData.startLineNumber), partialData.endLineNumber, this._model.getLineMaxColumn(partialData.endLineNumber));
    }
    getViewLineRenderingData(lineNumber) {
        return this._model.getViewportViewLineRenderingData(this.visibleRange, lineNumber);
    }
    getDecorationsInViewport() {
        return this._model.getDecorationsInViewport(this.visibleRange);
    }
}

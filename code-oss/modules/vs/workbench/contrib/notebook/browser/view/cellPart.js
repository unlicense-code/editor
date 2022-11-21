/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as DOM from 'vs/base/browser/dom';
import { Disposable, DisposableStore, MutableDisposable } from 'vs/base/common/lifecycle';
/**
 * A content part is a non-floating element that is rendered inside a cell.
 * The rendering of the content part is synchronous to avoid flickering.
 */
export class CellContentPart extends Disposable {
    currentCell;
    cellDisposables = new DisposableStore();
    constructor() {
        super();
    }
    /**
     * Prepare model for cell part rendering
     * No DOM operations recommended within this operation
     */
    prepareRenderCell(element) { }
    /**
     * Update the DOM for the cell `element`
     */
    renderCell(element) {
        this.currentCell = element;
        this.didRenderCell(element);
    }
    didRenderCell(element) { }
    /**
     * Dispose any disposables generated from `didRenderCell`
     */
    unrenderCell(element) {
        this.currentCell = undefined;
        this.cellDisposables.clear();
    }
    /**
     * Perform DOM read operations to prepare for the list/cell layout update.
     */
    prepareLayout() { }
    /**
     * Update internal DOM (top positions) per cell layout info change
     * Note that a cell part doesn't need to call `DOM.scheduleNextFrame`,
     * the list view will ensure that layout call is invoked in the right frame
     */
    updateInternalLayoutNow(element) { }
    /**
     * Update per cell state change
     */
    updateState(element, e) { }
    /**
     * Update per execution state change.
     */
    updateForExecutionState(element, e) { }
}
/**
 * An overlay part renders on top of other components.
 * The rendering of the overlay part might be postponed to the next animation frame to avoid forced reflow.
 */
export class CellOverlayPart extends Disposable {
    currentCell;
    cellDisposables = this._register(new DisposableStore());
    constructor() {
        super();
    }
    /**
     * Prepare model for cell part rendering
     * No DOM operations recommended within this operation
     */
    prepareRenderCell(element) { }
    /**
     * Update the DOM for the cell `element`
     */
    renderCell(element) {
        this.currentCell = element;
        this.didRenderCell(element);
    }
    didRenderCell(element) { }
    /**
     * Dispose any disposables generated from `didRenderCell`
     */
    unrenderCell(element) {
        this.currentCell = undefined;
        this.cellDisposables.clear();
    }
    /**
     * Update internal DOM (top positions) per cell layout info change
     * Note that a cell part doesn't need to call `DOM.scheduleNextFrame`,
     * the list view will ensure that layout call is invoked in the right frame
     */
    updateInternalLayoutNow(element) { }
    /**
     * Update per cell state change
     */
    updateState(element, e) { }
    /**
     * Update per execution state change.
     */
    updateForExecutionState(element, e) { }
}
export class CellPartsCollection extends Disposable {
    contentParts;
    overlayParts;
    _scheduledOverlayRendering = this._register(new MutableDisposable());
    _scheduledOverlayUpdateState = this._register(new MutableDisposable());
    _scheduledOverlayUpdateExecutionState = this._register(new MutableDisposable());
    constructor(contentParts, overlayParts) {
        super();
        this.contentParts = contentParts;
        this.overlayParts = overlayParts;
    }
    concatContentPart(other) {
        return new CellPartsCollection(this.contentParts.concat(other), this.overlayParts);
    }
    concatOverlayPart(other) {
        return new CellPartsCollection(this.contentParts, this.overlayParts.concat(other));
    }
    scheduleRenderCell(element) {
        // prepare model
        for (const part of this.contentParts) {
            part.prepareRenderCell(element);
        }
        for (const part of this.overlayParts) {
            part.prepareRenderCell(element);
        }
        // render content parts
        for (const part of this.contentParts) {
            part.renderCell(element);
        }
        this._scheduledOverlayRendering.value = DOM.modify(() => {
            for (const part of this.overlayParts) {
                part.renderCell(element);
            }
        });
    }
    unrenderCell(element) {
        for (const part of this.contentParts) {
            part.unrenderCell(element);
        }
        this._scheduledOverlayRendering.value = undefined;
        this._scheduledOverlayUpdateState.value = undefined;
        this._scheduledOverlayUpdateExecutionState.value = undefined;
        for (const part of this.overlayParts) {
            part.unrenderCell(element);
        }
    }
    updateInternalLayoutNow(viewCell) {
        for (const part of this.contentParts) {
            part.updateInternalLayoutNow(viewCell);
        }
        for (const part of this.overlayParts) {
            part.updateInternalLayoutNow(viewCell);
        }
    }
    prepareLayout() {
        for (const part of this.contentParts) {
            part.prepareLayout();
        }
    }
    updateState(viewCell, e) {
        for (const part of this.contentParts) {
            part.updateState(viewCell, e);
        }
        this._scheduledOverlayUpdateState.value = DOM.modify(() => {
            for (const part of this.overlayParts) {
                part.updateState(viewCell, e);
            }
        });
    }
    updateForExecutionState(viewCell, e) {
        for (const part of this.contentParts) {
            part.updateForExecutionState(viewCell, e);
        }
        this._scheduledOverlayUpdateExecutionState.value = DOM.modify(() => {
            for (const part of this.overlayParts) {
                part.updateForExecutionState(viewCell, e);
            }
        });
    }
}

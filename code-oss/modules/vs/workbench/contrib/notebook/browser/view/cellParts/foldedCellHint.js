/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as DOM from 'vs/base/browser/dom';
import { Codicon, CSSIcon } from 'vs/base/common/codicons';
import { localize } from 'vs/nls';
import { FoldingController } from 'vs/workbench/contrib/notebook/browser/controller/foldingController';
import { CellEditState } from 'vs/workbench/contrib/notebook/browser/notebookBrowser';
import { CellContentPart } from 'vs/workbench/contrib/notebook/browser/view/cellPart';
export class FoldedCellHint extends CellContentPart {
    _notebookEditor;
    _container;
    constructor(_notebookEditor, _container) {
        super();
        this._notebookEditor = _notebookEditor;
        this._container = _container;
    }
    didRenderCell(element) {
        this.update(element);
    }
    update(element) {
        if (!this._notebookEditor.hasModel()) {
            return;
        }
        if (element.isInputCollapsed || element.getEditState() === CellEditState.Editing) {
            DOM.hide(this._container);
        }
        else if (element.foldingState === 2 /* CellFoldingState.Collapsed */) {
            const idx = this._notebookEditor._getViewModel().getCellIndex(element);
            const length = this._notebookEditor._getViewModel().getFoldedLength(idx);
            DOM.reset(this._container, this.getHiddenCellsLabel(length), this.getHiddenCellHintButton(element));
            DOM.show(this._container);
            const foldHintTop = element.layoutInfo.previewHeight;
            this._container.style.top = `${foldHintTop}px`;
        }
        else {
            DOM.hide(this._container);
        }
    }
    getHiddenCellsLabel(num) {
        const label = num === 1 ?
            localize('hiddenCellsLabel', "1 cell hidden") :
            localize('hiddenCellsLabelPlural', "{0} cells hidden", num);
        return DOM.$('span.notebook-folded-hint-label', undefined, label);
    }
    getHiddenCellHintButton(element) {
        const expandIcon = DOM.$('span.cell-expand-part-button');
        expandIcon.classList.add(...CSSIcon.asClassNameArray(Codicon.more));
        this._register(DOM.addDisposableListener(expandIcon, DOM.EventType.CLICK, () => {
            const controller = this._notebookEditor.getContribution(FoldingController.id);
            const idx = this._notebookEditor.getCellIndex(element);
            if (typeof idx === 'number') {
                controller.setFoldingStateDown(idx, 1 /* CellFoldingState.Expanded */, 1);
            }
        }));
        return expandIcon;
    }
    updateInternalLayoutNow(element) {
        this.update(element);
    }
}

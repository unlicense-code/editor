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
import { RunOnceScheduler } from 'vs/base/common/async';
import { Disposable } from 'vs/base/common/lifecycle';
import { IAccessibilityService } from 'vs/platform/accessibility/common/accessibility';
import { CellEditState } from 'vs/workbench/contrib/notebook/browser/notebookBrowser';
import { registerNotebookContribution } from 'vs/workbench/contrib/notebook/browser/notebookEditorExtensions';
import { CellKind } from 'vs/workbench/contrib/notebook/common/notebookCommon';
import { cellRangesToIndexes } from 'vs/workbench/contrib/notebook/common/notebookRange';
import { INotebookService } from 'vs/workbench/contrib/notebook/common/notebookService';
let NotebookViewportContribution = class NotebookViewportContribution extends Disposable {
    _notebookEditor;
    _notebookService;
    static id = 'workbench.notebook.viewportCustomMarkdown';
    _warmupViewport;
    _warmupDocument = null;
    constructor(_notebookEditor, _notebookService, accessibilityService) {
        super();
        this._notebookEditor = _notebookEditor;
        this._notebookService = _notebookService;
        this._warmupViewport = new RunOnceScheduler(() => this._warmupViewportNow(), 200);
        this._register(this._warmupViewport);
        this._register(this._notebookEditor.onDidScroll(() => {
            this._warmupViewport.schedule();
        }));
        if (accessibilityService.isScreenReaderOptimized()) {
            this._warmupDocument = new RunOnceScheduler(() => this._warmupDocumentNow(), 200);
            this._register(this._warmupDocument);
            this._register(this._notebookEditor.onDidChangeModel(() => {
                if (this._notebookEditor.hasModel()) {
                    this._warmupDocument?.schedule();
                }
            }));
            if (this._notebookEditor.hasModel()) {
                this._warmupDocument?.schedule();
            }
        }
    }
    _warmupDocumentNow() {
        if (this._notebookEditor.hasModel()) {
            for (let i = 0; i < this._notebookEditor.getLength(); i++) {
                const cell = this._notebookEditor.cellAt(i);
                if (cell?.cellKind === CellKind.Markup && cell?.getEditState() === CellEditState.Preview && !cell.isInputCollapsed) {
                    // TODO@rebornix currently we disable markdown cell rendering in webview for accessibility
                    // this._notebookEditor.createMarkupPreview(cell);
                }
                else if (cell?.cellKind === CellKind.Code) {
                    this._renderCell(cell);
                }
            }
        }
    }
    _warmupViewportNow() {
        if (this._notebookEditor.isDisposed) {
            return;
        }
        if (!this._notebookEditor.hasModel()) {
            return;
        }
        const visibleRanges = this._notebookEditor.getVisibleRangesPlusViewportAboveAndBelow();
        cellRangesToIndexes(visibleRanges).forEach(index => {
            const cell = this._notebookEditor.cellAt(index);
            if (cell?.cellKind === CellKind.Markup && cell?.getEditState() === CellEditState.Preview && !cell.isInputCollapsed) {
                this._notebookEditor.createMarkupPreview(cell);
            }
            else if (cell?.cellKind === CellKind.Code) {
                this._renderCell(cell);
            }
        });
    }
    _renderCell(viewCell) {
        if (viewCell.isOutputCollapsed) {
            return;
        }
        const outputs = viewCell.outputsViewModels;
        for (const output of outputs) {
            const [mimeTypes, pick] = output.resolveMimeTypes(this._notebookEditor.textModel, undefined);
            if (!mimeTypes.find(mimeType => mimeType.isTrusted) || mimeTypes.length === 0) {
                continue;
            }
            const pickedMimeTypeRenderer = mimeTypes[pick];
            if (!pickedMimeTypeRenderer) {
                return;
            }
            if (!this._notebookEditor.hasModel()) {
                return;
            }
            const renderer = this._notebookService.getRendererInfo(pickedMimeTypeRenderer.rendererId);
            if (!renderer) {
                return;
            }
            const result = { type: 1 /* RenderOutputType.Extension */, renderer, source: output, mimeType: pickedMimeTypeRenderer.mimeType };
            this._notebookEditor.createOutput(viewCell, result, 0);
        }
    }
};
NotebookViewportContribution = __decorate([
    __param(1, INotebookService),
    __param(2, IAccessibilityService)
], NotebookViewportContribution);
registerNotebookContribution(NotebookViewportContribution.id, NotebookViewportContribution);

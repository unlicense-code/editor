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
import { throttle } from 'vs/base/common/decorators';
import { Disposable } from 'vs/base/common/lifecycle';
import { registerNotebookContribution } from 'vs/workbench/contrib/notebook/browser/notebookEditorExtensions';
import { NotebookCellExecutionState } from 'vs/workbench/contrib/notebook/common/notebookCommon';
import { INotebookExecutionStateService } from 'vs/workbench/contrib/notebook/common/notebookExecutionStateService';
let ExecutionEditorProgressController = class ExecutionEditorProgressController extends Disposable {
    _notebookEditor;
    _notebookExecutionStateService;
    static id = 'workbench.notebook.executionEditorProgress';
    constructor(_notebookEditor, _notebookExecutionStateService) {
        super();
        this._notebookEditor = _notebookEditor;
        this._notebookExecutionStateService = _notebookExecutionStateService;
        this._register(_notebookEditor.onDidScroll(() => this._update()));
        this._register(_notebookExecutionStateService.onDidChangeCellExecution(e => {
            if (e.notebook.toString() !== this._notebookEditor.textModel?.uri.toString()) {
                return;
            }
            this._update();
        }));
        this._register(_notebookEditor.onDidChangeModel(() => this._update()));
    }
    _update() {
        if (!this._notebookEditor.hasModel()) {
            return;
        }
        const executing = this._notebookExecutionStateService.getCellExecutionsForNotebook(this._notebookEditor.textModel?.uri)
            .filter(exe => exe.state === NotebookCellExecutionState.Executing);
        const executionIsVisible = (exe) => {
            for (const range of this._notebookEditor.visibleRanges) {
                for (const cell of this._notebookEditor.getCellsInRange(range)) {
                    if (cell.handle === exe.cellHandle) {
                        const top = this._notebookEditor.getAbsoluteTopOfElement(cell);
                        if (this._notebookEditor.scrollTop < top + 30) {
                            return true;
                        }
                    }
                }
            }
            return false;
        };
        if (!executing.length || executing.some(executionIsVisible) || executing.some(e => e.isPaused)) {
            this._notebookEditor.hideProgress();
        }
        else {
            this._notebookEditor.showProgress();
        }
    }
};
__decorate([
    throttle(100)
], ExecutionEditorProgressController.prototype, "_update", null);
ExecutionEditorProgressController = __decorate([
    __param(1, INotebookExecutionStateService)
], ExecutionEditorProgressController);
export { ExecutionEditorProgressController };
registerNotebookContribution(ExecutionEditorProgressController.id, ExecutionEditorProgressController);

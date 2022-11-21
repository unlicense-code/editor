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
import * as nls from 'vs/nls';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { ILogService } from 'vs/platform/log/common/log';
import { IWorkspaceTrustRequestService } from 'vs/platform/workspace/common/workspaceTrust';
import { SELECT_KERNEL_ID } from 'vs/workbench/contrib/notebook/browser/controller/coreActions';
import { CellKind, NotebookCellExecutionState } from 'vs/workbench/contrib/notebook/common/notebookCommon';
import { INotebookExecutionStateService } from 'vs/workbench/contrib/notebook/common/notebookExecutionStateService';
import { INotebookKernelService } from 'vs/workbench/contrib/notebook/common/notebookKernelService';
let NotebookExecutionService = class NotebookExecutionService {
    _commandService;
    _notebookKernelService;
    _workspaceTrustRequestService;
    _logService;
    _notebookExecutionStateService;
    _activeProxyKernelExecutionToken;
    constructor(_commandService, _notebookKernelService, _workspaceTrustRequestService, _logService, _notebookExecutionStateService) {
        this._commandService = _commandService;
        this._notebookKernelService = _notebookKernelService;
        this._workspaceTrustRequestService = _workspaceTrustRequestService;
        this._logService = _logService;
        this._notebookExecutionStateService = _notebookExecutionStateService;
    }
    async executeNotebookCells(notebook, cells, contextKeyService) {
        const cellsArr = Array.from(cells);
        this._logService.debug(`NotebookExecutionService#executeNotebookCells ${JSON.stringify(cellsArr.map(c => c.handle))}`);
        const message = nls.localize('notebookRunTrust', "Executing a notebook cell will run code from this workspace.");
        const trust = await this._workspaceTrustRequestService.requestWorkspaceTrust({ message });
        if (!trust) {
            return;
        }
        // create cell executions
        const cellExecutions = [];
        for (const cell of cellsArr) {
            const cellExe = this._notebookExecutionStateService.getCellExecution(cell.uri);
            if (cell.cellKind !== CellKind.Code || !!cellExe) {
                continue;
            }
            cellExecutions.push([cell, this._notebookExecutionStateService.createCellExecution(notebook.uri, cell.handle)]);
        }
        let kernel = this._notebookKernelService.getSelectedOrSuggestedKernel(notebook);
        if (!kernel) {
            kernel = await this.resolveSourceActions(notebook, contextKeyService);
        }
        if (!kernel) {
            kernel = await this.resolveKernelFromKernelPicker(notebook);
        }
        if (!kernel) {
            // clear all pending cell executions
            cellExecutions.forEach(cellExe => cellExe[1].complete({}));
            return;
        }
        // filter cell executions based on selected kernel
        const validCellExecutions = [];
        for (const [cell, cellExecution] of cellExecutions) {
            if (!kernel.supportedLanguages.includes(cell.language)) {
                cellExecution.complete({});
            }
            else {
                validCellExecutions.push(cellExecution);
            }
        }
        // request execution
        if (validCellExecutions.length > 0) {
            this._notebookKernelService.selectKernelForNotebook(kernel, notebook);
            await kernel.executeNotebookCellsRequest(notebook.uri, validCellExecutions.map(c => c.cellHandle));
            // the connecting state can change before the kernel resolves executeNotebookCellsRequest
            const unconfirmed = validCellExecutions.filter(exe => exe.state === NotebookCellExecutionState.Unconfirmed);
            if (unconfirmed.length) {
                this._logService.debug(`NotebookExecutionService#executeNotebookCells completing unconfirmed executions ${JSON.stringify(unconfirmed.map(exe => exe.cellHandle))}`);
                unconfirmed.forEach(exe => exe.complete({}));
            }
        }
    }
    async resolveKernelFromKernelPicker(notebook, attempt = 1) {
        if (attempt > 3) {
            // we couldnt resolve kernels through kernel picker multiple times, skip
            return;
        }
        await this._commandService.executeCommand(SELECT_KERNEL_ID);
        const runningSourceActions = this._notebookKernelService.getRunningSourceActions(notebook);
        if (runningSourceActions.length) {
            await Promise.all(runningSourceActions.map(action => action.runAction()));
            const kernel = this._notebookKernelService.getSelectedOrSuggestedKernel(notebook);
            if (kernel) {
                return kernel;
            }
            attempt += 1;
            return this.resolveKernelFromKernelPicker(notebook, attempt);
        }
        else {
            return this._notebookKernelService.getSelectedOrSuggestedKernel(notebook);
        }
    }
    async resolveSourceActions(notebook, contextKeyService) {
        let kernel;
        const info = this._notebookKernelService.getMatchingKernel(notebook);
        if (info.all.length === 0) {
            // no kernel at all
            const sourceActions = this._notebookKernelService.getSourceActions(notebook, contextKeyService);
            const primaryActions = sourceActions.filter(action => action.isPrimary);
            const action = sourceActions.length === 1
                ? sourceActions[0]
                : (primaryActions.length === 1 ? primaryActions[0] : undefined);
            if (action) {
                await action.runAction();
                kernel = this._notebookKernelService.getSelectedOrSuggestedKernel(notebook);
            }
        }
        return kernel;
    }
    async cancelNotebookCellHandles(notebook, cells) {
        const cellsArr = Array.from(cells);
        this._logService.debug(`NotebookExecutionService#cancelNotebookCellHandles ${JSON.stringify(cellsArr)}`);
        const kernel = this._notebookKernelService.getSelectedOrSuggestedKernel(notebook);
        if (kernel) {
            await kernel.cancelNotebookCellExecution(notebook.uri, cellsArr);
        }
    }
    async cancelNotebookCells(notebook, cells) {
        this.cancelNotebookCellHandles(notebook, Array.from(cells, cell => cell.handle));
    }
    dispose() {
        this._activeProxyKernelExecutionToken?.dispose(true);
    }
};
NotebookExecutionService = __decorate([
    __param(0, ICommandService),
    __param(1, INotebookKernelService),
    __param(2, IWorkspaceTrustRequestService),
    __param(3, ILogService),
    __param(4, INotebookExecutionStateService)
], NotebookExecutionService);
export { NotebookExecutionService };

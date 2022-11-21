import { ILogService } from 'vs/platform/log/common/log';
import { ExtHostNotebookEditorsShape, INotebookEditorPropertiesChangeData, INotebookEditorViewColumnInfo } from 'vs/workbench/api/common/extHost.protocol';
import { ExtHostNotebookController } from 'vs/workbench/api/common/extHostNotebook';
import type * as vscode from 'vscode';
export declare class ExtHostNotebookEditors implements ExtHostNotebookEditorsShape {
    private readonly _logService;
    private readonly _notebooksAndEditors;
    private readonly _onDidChangeNotebookEditorSelection;
    private readonly _onDidChangeNotebookEditorVisibleRanges;
    readonly onDidChangeNotebookEditorSelection: import("vs/base/common/event").Event<vscode.NotebookEditorSelectionChangeEvent>;
    readonly onDidChangeNotebookEditorVisibleRanges: import("vs/base/common/event").Event<vscode.NotebookEditorVisibleRangesChangeEvent>;
    constructor(_logService: ILogService, _notebooksAndEditors: ExtHostNotebookController);
    $acceptEditorPropertiesChanged(id: string, data: INotebookEditorPropertiesChangeData): void;
    $acceptEditorViewColumns(data: INotebookEditorViewColumnInfo): void;
}

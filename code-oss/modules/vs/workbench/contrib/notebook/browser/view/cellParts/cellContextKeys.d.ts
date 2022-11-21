import { Disposable } from 'vs/base/common/lifecycle';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ICellViewModel, INotebookEditorDelegate } from 'vs/workbench/contrib/notebook/browser/notebookBrowser';
import { CellContentPart } from 'vs/workbench/contrib/notebook/browser/view/cellPart';
import { INotebookExecutionStateService } from 'vs/workbench/contrib/notebook/common/notebookExecutionStateService';
export declare class CellContextKeyPart extends CellContentPart {
    private readonly instantiationService;
    private cellContextKeyManager;
    constructor(notebookEditor: INotebookEditorDelegate, instantiationService: IInstantiationService);
    protected didRenderCell(element: ICellViewModel): void;
}
export declare class CellContextKeyManager extends Disposable {
    private readonly notebookEditor;
    private element;
    private readonly _contextKeyService;
    private readonly _notebookExecutionStateService;
    private cellType;
    private cellEditable;
    private cellFocused;
    private cellEditorFocused;
    private cellRunState;
    private cellExecuting;
    private cellHasOutputs;
    private cellContentCollapsed;
    private cellOutputCollapsed;
    private cellLineNumbers;
    private cellResource;
    private markdownEditMode;
    private readonly elementDisposables;
    constructor(notebookEditor: INotebookEditorDelegate, element: ICellViewModel | undefined, _contextKeyService: IContextKeyService, _notebookExecutionStateService: INotebookExecutionStateService);
    updateForElement(element: ICellViewModel | undefined): void;
    private onDidChangeState;
    private updateForFocusState;
    private updateForExecutionState;
    private updateForEditState;
    private updateForCollapseState;
    private updateForOutputs;
}

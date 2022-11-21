import { FastDomNode } from 'vs/base/browser/fastDomNode';
import { ICellViewModel, INotebookEditorDelegate } from 'vs/workbench/contrib/notebook/browser/notebookBrowser';
import { CellContentPart } from 'vs/workbench/contrib/notebook/browser/view/cellPart';
import { CellTitleToolbarPart } from 'vs/workbench/contrib/notebook/browser/view/cellParts/cellToolbars';
export declare class CellFocusIndicator extends CellContentPart {
    readonly notebookEditor: INotebookEditorDelegate;
    readonly titleToolbar: CellTitleToolbarPart;
    readonly top: FastDomNode<HTMLElement>;
    readonly left: FastDomNode<HTMLElement>;
    readonly right: FastDomNode<HTMLElement>;
    readonly bottom: FastDomNode<HTMLElement>;
    codeFocusIndicator: FastDomNode<HTMLElement>;
    outputFocusIndicator: FastDomNode<HTMLElement>;
    constructor(notebookEditor: INotebookEditorDelegate, titleToolbar: CellTitleToolbarPart, top: FastDomNode<HTMLElement>, left: FastDomNode<HTMLElement>, right: FastDomNode<HTMLElement>, bottom: FastDomNode<HTMLElement>);
    updateInternalLayoutNow(element: ICellViewModel): void;
    private updateFocusIndicatorsForTitleMenu;
    private getIndicatorTopMargin;
}

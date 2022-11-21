import { ICellViewModel } from 'vs/workbench/contrib/notebook/browser/notebookBrowser';
import { CellContentPart } from 'vs/workbench/contrib/notebook/browser/view/cellPart';
export declare class CellDecorations extends CellContentPart {
    readonly rootContainer: HTMLElement;
    readonly decorationContainer: HTMLElement;
    constructor(rootContainer: HTMLElement, decorationContainer: HTMLElement);
    protected didRenderCell(element: ICellViewModel): void;
}

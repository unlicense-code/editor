import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { INotebookEditor } from 'vs/workbench/contrib/notebook/browser/notebookBrowser';
import { CellContentPart } from 'vs/workbench/contrib/notebook/browser/view/cellPart';
export declare class CollapsedCellOutput extends CellContentPart {
    private readonly notebookEditor;
    constructor(notebookEditor: INotebookEditor, cellOutputCollapseContainer: HTMLElement, keybindingService: IKeybindingService);
    private expand;
}

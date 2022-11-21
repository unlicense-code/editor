import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
import { BaseCellRenderTemplate } from 'vs/workbench/contrib/notebook/browser/view/notebookRenderingCommon';
export declare class CodeCellDragImageRenderer {
    getDragImage(templateData: BaseCellRenderTemplate, editor: ICodeEditor, type: 'code' | 'markdown'): HTMLElement;
    private getDragImageImpl;
}

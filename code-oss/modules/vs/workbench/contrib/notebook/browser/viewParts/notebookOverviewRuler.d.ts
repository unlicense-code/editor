import { IThemeService, Themable } from 'vs/platform/theme/common/themeService';
import { INotebookEditorDelegate } from 'vs/workbench/contrib/notebook/browser/notebookBrowser';
export declare class NotebookOverviewRuler extends Themable {
    readonly notebookEditor: INotebookEditorDelegate;
    private readonly _domNode;
    private _lanes;
    constructor(notebookEditor: INotebookEditorDelegate, container: HTMLElement, themeService: IThemeService);
    layout(): void;
    private _render;
}

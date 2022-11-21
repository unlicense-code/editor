import { IThemeService, Themable } from 'vs/platform/theme/common/themeService';
import { DiffElementViewModelBase } from 'vs/workbench/contrib/notebook/browser/diff/diffElementViewModel';
import { NotebookDiffEditorEventDispatcher } from 'vs/workbench/contrib/notebook/browser/diff/eventDispatcher';
import { INotebookTextDiffEditor } from 'vs/workbench/contrib/notebook/browser/diff/notebookDiffEditorBrowser';
export declare class NotebookDiffOverviewRuler extends Themable {
    readonly notebookEditor: INotebookTextDiffEditor;
    readonly width: number;
    private readonly _domNode;
    private readonly _overviewViewportDomElement;
    private _diffElementViewModels;
    private _lanes;
    private _insertColor;
    private _insertColorHex;
    private _removeColor;
    private _removeColorHex;
    private _disposables;
    private _renderAnimationFrame;
    constructor(notebookEditor: INotebookTextDiffEditor, width: number, container: HTMLElement, themeService: IThemeService);
    private applyColors;
    layout(): void;
    updateViewModels(elements: DiffElementViewModelBase[], eventDispatcher: NotebookDiffEditorEventDispatcher | undefined): void;
    private _scheduleRender;
    private _onRenderScheduled;
    private _layoutNow;
    private _renderOverviewViewport;
    private _computeOverviewViewport;
    private _renderCanvas;
    dispose(): void;
}

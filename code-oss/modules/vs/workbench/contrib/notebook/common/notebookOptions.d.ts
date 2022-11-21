import { Emitter } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { InteractiveWindowCollapseCodeCells, NotebookCellDefaultCollapseConfig, NotebookCellInternalMetadata, ShowCellStatusBarType } from 'vs/workbench/contrib/notebook/common/notebookCommon';
import { INotebookExecutionStateService } from 'vs/workbench/contrib/notebook/common/notebookExecutionStateService';
export declare const EditorTopPaddingChangeEvent: import("vs/base/common/event").Event<void>;
export declare function updateEditorTopPadding(top: number): void;
export declare function getEditorTopPadding(): number;
export declare const OutputInnerContainerTopPadding = 4;
export interface NotebookLayoutConfiguration {
    cellRightMargin: number;
    cellRunGutter: number;
    cellTopMargin: number;
    cellBottomMargin: number;
    cellOutputPadding: number;
    codeCellLeftMargin: number;
    markdownCellLeftMargin: number;
    markdownCellGutter: number;
    markdownCellTopMargin: number;
    markdownCellBottomMargin: number;
    markdownPreviewPadding: number;
    markdownFoldHintHeight: number;
    editorToolbarHeight: number;
    editorTopPadding: number;
    editorBottomPadding: number;
    editorBottomPaddingWithoutStatusBar: number;
    collapsedIndicatorHeight: number;
    showCellStatusBar: ShowCellStatusBarType;
    cellStatusBarHeight: number;
    cellToolbarLocation: string | {
        [key: string]: string;
    };
    cellToolbarInteraction: string;
    compactView: boolean;
    focusIndicator: 'border' | 'gutter';
    insertToolbarPosition: 'betweenCells' | 'notebookToolbar' | 'both' | 'hidden';
    insertToolbarAlignment: 'left' | 'center';
    globalToolbar: boolean;
    consolidatedOutputButton: boolean;
    consolidatedRunButton: boolean;
    showFoldingControls: 'always' | 'never' | 'mouseover';
    dragAndDropEnabled: boolean;
    fontSize: number;
    outputFontSize: number;
    outputFontFamily: string;
    outputLineHeight: number;
    markupFontSize: number;
    focusIndicatorLeftMargin: number;
    editorOptionsCustomizations: any | undefined;
    focusIndicatorGap: number;
    interactiveWindowCollapseCodeCells: InteractiveWindowCollapseCodeCells;
}
export interface NotebookOptionsChangeEvent {
    readonly cellStatusBarVisibility?: boolean;
    readonly cellToolbarLocation?: boolean;
    readonly cellToolbarInteraction?: boolean;
    readonly editorTopPadding?: boolean;
    readonly compactView?: boolean;
    readonly focusIndicator?: boolean;
    readonly insertToolbarPosition?: boolean;
    readonly insertToolbarAlignment?: boolean;
    readonly globalToolbar?: boolean;
    readonly showFoldingControls?: boolean;
    readonly consolidatedOutputButton?: boolean;
    readonly consolidatedRunButton?: boolean;
    readonly dragAndDropEnabled?: boolean;
    readonly fontSize?: boolean;
    readonly outputFontSize?: boolean;
    readonly markupFontSize?: boolean;
    readonly fontFamily?: boolean;
    readonly outputFontFamily?: boolean;
    readonly editorOptionsCustomizations?: boolean;
    readonly interactiveWindowCollapseCodeCells?: boolean;
    readonly outputLineHeight?: boolean;
}
export declare class NotebookOptions extends Disposable {
    private readonly configurationService;
    private readonly notebookExecutionStateService;
    private readonly overrides?;
    private _layoutConfiguration;
    protected readonly _onDidChangeOptions: Emitter<NotebookOptionsChangeEvent>;
    readonly onDidChangeOptions: import("vs/base/common/event").Event<NotebookOptionsChangeEvent>;
    constructor(configurationService: IConfigurationService, notebookExecutionStateService: INotebookExecutionStateService, overrides?: {
        cellToolbarInteraction: string;
        globalToolbar: boolean;
        defaultCellCollapseConfig?: NotebookCellDefaultCollapseConfig | undefined;
    } | undefined);
    private _computeOutputLineHeight;
    private _updateConfiguration;
    private _computeInsertToolbarPositionOption;
    private _computeInsertToolbarAlignmentOption;
    private _computeShowFoldingControlsOption;
    private _computeFocusIndicatorOption;
    getCellCollapseDefault(): NotebookCellDefaultCollapseConfig;
    getLayoutConfiguration(): NotebookLayoutConfiguration;
    computeCollapsedMarkdownCellHeight(viewType: string): number;
    computeBottomToolbarOffset(totalHeight: number, viewType: string): number;
    computeCodeCellEditorWidth(outerWidth: number): number;
    computeMarkdownCellEditorWidth(outerWidth: number): number;
    computeStatusBarHeight(): number;
    private _computeBottomToolbarDimensions;
    computeBottomToolbarDimensions(viewType?: string): {
        bottomToolbarGap: number;
        bottomToolbarHeight: number;
    };
    computeCellToolbarLocation(viewType?: string): 'right' | 'left' | 'hidden';
    computeTopInsertToolbarHeight(viewType?: string): number;
    computeEditorPadding(internalMetadata: NotebookCellInternalMetadata, cellUri: URI): {
        top: number;
        bottom: number;
    };
    computeEditorStatusbarHeight(internalMetadata: NotebookCellInternalMetadata, cellUri: URI): number;
    private statusBarIsVisible;
    computeWebviewOptions(): {
        outputNodePadding: number;
        outputNodeLeftPadding: number;
        previewNodePadding: number;
        markdownLeftMargin: number;
        leftMargin: number;
        rightMargin: number;
        runGutter: number;
        dragAndDropEnabled: boolean;
        fontSize: number;
        outputFontSize: number;
        outputFontFamily: string;
        markupFontSize: number;
        outputLineHeight: number;
    };
    computeDiffWebviewOptions(): {
        outputNodePadding: number;
        outputNodeLeftPadding: number;
        previewNodePadding: number;
        markdownLeftMargin: number;
        leftMargin: number;
        rightMargin: number;
        runGutter: number;
        dragAndDropEnabled: boolean;
        fontSize: number;
        outputFontSize: number;
        outputFontFamily: string;
        markupFontSize: number;
        outputLineHeight: number;
    };
    computeIndicatorPosition(totalHeight: number, foldHintHeight: number, viewType?: string): {
        bottomIndicatorTop: number;
        verticalIndicatorHeight: number;
    };
}
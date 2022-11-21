import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
import { IModelDecorationOptions, IModelDecorationsChangeAccessor } from 'vs/editor/common/model';
import { IDecorationProvider } from 'vs/editor/contrib/folding/browser/foldingModel';
import { ThemeIcon } from 'vs/platform/theme/common/themeService';
export declare const foldingExpandedIcon: ThemeIcon;
export declare const foldingCollapsedIcon: ThemeIcon;
export declare const foldingManualCollapsedIcon: ThemeIcon;
export declare const foldingManualExpandedIcon: ThemeIcon;
export declare class FoldingDecorationProvider implements IDecorationProvider {
    private readonly editor;
    private static readonly COLLAPSED_VISUAL_DECORATION;
    private static readonly COLLAPSED_HIGHLIGHTED_VISUAL_DECORATION;
    private static readonly MANUALLY_COLLAPSED_VISUAL_DECORATION;
    private static readonly MANUALLY_COLLAPSED_HIGHLIGHTED_VISUAL_DECORATION;
    private static readonly NO_CONTROLS_COLLAPSED_RANGE_DECORATION;
    private static readonly NO_CONTROLS_COLLAPSED_HIGHLIGHTED_RANGE_DECORATION;
    private static readonly EXPANDED_VISUAL_DECORATION;
    private static readonly EXPANDED_AUTO_HIDE_VISUAL_DECORATION;
    private static readonly MANUALLY_EXPANDED_VISUAL_DECORATION;
    private static readonly MANUALLY_EXPANDED_AUTO_HIDE_VISUAL_DECORATION;
    private static readonly NO_CONTROLS_EXPANDED_RANGE_DECORATION;
    private static readonly HIDDEN_RANGE_DECORATION;
    showFoldingControls: 'always' | 'never' | 'mouseover';
    showFoldingHighlights: boolean;
    constructor(editor: ICodeEditor);
    getDecorationOption(isCollapsed: boolean, isHidden: boolean, isManual: boolean): IModelDecorationOptions;
    changeDecorations<T>(callback: (changeAccessor: IModelDecorationsChangeAccessor) => T): T;
    removeDecorations(decorationIds: string[]): void;
}

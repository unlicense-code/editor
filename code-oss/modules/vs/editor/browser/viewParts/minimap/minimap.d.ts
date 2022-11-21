import 'vs/css!./minimap';
import { FastDomNode } from 'vs/base/browser/fastDomNode';
import { ViewPart } from 'vs/editor/browser/view/viewPart';
import { RenderMinimap } from 'vs/editor/common/config/editorOptions';
import { RGBA8 } from 'vs/editor/common/core/rgba';
import { IEditorConfiguration } from 'vs/editor/common/config/editorConfiguration';
import { MinimapCharRenderer } from 'vs/editor/browser/viewParts/minimap/minimapCharRenderer';
import { MinimapTokensColorTracker } from 'vs/editor/common/viewModel/minimapTokensColorTracker';
import { RenderingContext, RestrictedRenderingContext } from 'vs/editor/browser/view/renderingContext';
import { ViewContext } from 'vs/editor/common/viewModel/viewContext';
import { EditorTheme } from 'vs/editor/common/editorTheme';
import * as viewEvents from 'vs/editor/common/viewEvents';
import { ViewLineData, ViewModelDecoration } from 'vs/editor/common/viewModel';
import { Selection } from 'vs/editor/common/core/selection';
import { TextModelResolvedOptions } from 'vs/editor/common/model';
declare class MinimapOptions {
    readonly renderMinimap: RenderMinimap;
    readonly size: 'proportional' | 'fill' | 'fit';
    readonly minimapHeightIsEditorHeight: boolean;
    readonly scrollBeyondLastLine: boolean;
    readonly showSlider: 'always' | 'mouseover';
    readonly autohide: boolean;
    readonly pixelRatio: number;
    readonly typicalHalfwidthCharacterWidth: number;
    readonly lineHeight: number;
    /**
     * container dom node left position (in CSS px)
     */
    readonly minimapLeft: number;
    /**
     * container dom node width (in CSS px)
     */
    readonly minimapWidth: number;
    /**
     * container dom node height (in CSS px)
     */
    readonly minimapHeight: number;
    /**
     * canvas backing store width (in device px)
     */
    readonly canvasInnerWidth: number;
    /**
     * canvas backing store height (in device px)
     */
    readonly canvasInnerHeight: number;
    /**
     * canvas width (in CSS px)
     */
    readonly canvasOuterWidth: number;
    /**
     * canvas height (in CSS px)
     */
    readonly canvasOuterHeight: number;
    readonly isSampling: boolean;
    readonly editorHeight: number;
    readonly fontScale: number;
    readonly minimapLineHeight: number;
    readonly minimapCharWidth: number;
    readonly charRenderer: () => MinimapCharRenderer;
    readonly defaultBackgroundColor: RGBA8;
    readonly backgroundColor: RGBA8;
    /**
     * foreground alpha: integer in [0-255]
     */
    readonly foregroundAlpha: number;
    constructor(configuration: IEditorConfiguration, theme: EditorTheme, tokensColorTracker: MinimapTokensColorTracker);
    private static _getMinimapBackground;
    private static _getMinimapForegroundOpacity;
    equals(other: MinimapOptions): boolean;
}
export interface IMinimapModel {
    readonly tokensColorTracker: MinimapTokensColorTracker;
    readonly options: MinimapOptions;
    getLineCount(): number;
    getRealLineCount(): number;
    getLineContent(lineNumber: number): string;
    getLineMaxColumn(lineNumber: number): number;
    getMinimapLinesRenderingData(startLineNumber: number, endLineNumber: number, needed: boolean[]): (ViewLineData | null)[];
    getSelections(): Selection[];
    getMinimapDecorationsInViewport(startLineNumber: number, endLineNumber: number): ViewModelDecoration[];
    getOptions(): TextModelResolvedOptions;
    revealLineNumber(lineNumber: number): void;
    setScrollTop(scrollTop: number): void;
}
export declare class Minimap extends ViewPart implements IMinimapModel {
    readonly tokensColorTracker: MinimapTokensColorTracker;
    private _selections;
    private _minimapSelections;
    options: MinimapOptions;
    private _samplingState;
    private _shouldCheckSampling;
    private _actual;
    constructor(context: ViewContext);
    dispose(): void;
    getDomNode(): FastDomNode<HTMLElement>;
    private _onOptionsMaybeChanged;
    onConfigurationChanged(e: viewEvents.ViewConfigurationChangedEvent): boolean;
    onCursorStateChanged(e: viewEvents.ViewCursorStateChangedEvent): boolean;
    onDecorationsChanged(e: viewEvents.ViewDecorationsChangedEvent): boolean;
    onFlushed(e: viewEvents.ViewFlushedEvent): boolean;
    onLinesChanged(e: viewEvents.ViewLinesChangedEvent): boolean;
    onLinesDeleted(e: viewEvents.ViewLinesDeletedEvent): boolean;
    onLinesInserted(e: viewEvents.ViewLinesInsertedEvent): boolean;
    onScrollChanged(e: viewEvents.ViewScrollChangedEvent): boolean;
    onThemeChanged(e: viewEvents.ViewThemeChangedEvent): boolean;
    onTokensChanged(e: viewEvents.ViewTokensChangedEvent): boolean;
    onTokensColorsChanged(e: viewEvents.ViewTokensColorsChangedEvent): boolean;
    onZonesChanged(e: viewEvents.ViewZonesChangedEvent): boolean;
    prepareRender(ctx: RenderingContext): void;
    render(ctx: RestrictedRenderingContext): void;
    private _recreateLineSampling;
    getLineCount(): number;
    getRealLineCount(): number;
    getLineContent(lineNumber: number): string;
    getLineMaxColumn(lineNumber: number): number;
    getMinimapLinesRenderingData(startLineNumber: number, endLineNumber: number, needed: boolean[]): (ViewLineData | null)[];
    getSelections(): Selection[];
    getMinimapDecorationsInViewport(startLineNumber: number, endLineNumber: number): ViewModelDecoration[];
    getOptions(): TextModelResolvedOptions;
    revealLineNumber(lineNumber: number): void;
    setScrollTop(scrollTop: number): void;
}
export {};

import { ViewPart } from 'vs/editor/browser/view/viewPart';
import { RenderingContext, RestrictedRenderingContext } from 'vs/editor/browser/view/renderingContext';
import { ViewContext } from 'vs/editor/common/viewModel/viewContext';
import * as viewEvents from 'vs/editor/common/viewEvents';
export declare class DecorationsOverviewRuler extends ViewPart {
    private readonly _tokensColorTrackerListener;
    private readonly _domNode;
    private _settings;
    private _cursorPositions;
    constructor(context: ViewContext);
    dispose(): void;
    private _updateSettings;
    onConfigurationChanged(e: viewEvents.ViewConfigurationChangedEvent): boolean;
    onCursorStateChanged(e: viewEvents.ViewCursorStateChangedEvent): boolean;
    onDecorationsChanged(e: viewEvents.ViewDecorationsChangedEvent): boolean;
    onFlushed(e: viewEvents.ViewFlushedEvent): boolean;
    onScrollChanged(e: viewEvents.ViewScrollChangedEvent): boolean;
    onZonesChanged(e: viewEvents.ViewZonesChangedEvent): boolean;
    onThemeChanged(e: viewEvents.ViewThemeChangedEvent): boolean;
    getDomNode(): HTMLElement;
    prepareRender(ctx: RenderingContext): void;
    render(editorCtx: RestrictedRenderingContext): void;
    private _render;
}

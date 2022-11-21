import 'vs/css!./overlayWidgets';
import { FastDomNode } from 'vs/base/browser/fastDomNode';
import { IOverlayWidget, OverlayWidgetPositionPreference } from 'vs/editor/browser/editorBrowser';
import { ViewPart } from 'vs/editor/browser/view/viewPart';
import { RenderingContext, RestrictedRenderingContext } from 'vs/editor/browser/view/renderingContext';
import { ViewContext } from 'vs/editor/common/viewModel/viewContext';
import * as viewEvents from 'vs/editor/common/viewEvents';
export declare class ViewOverlayWidgets extends ViewPart {
    private _widgets;
    private readonly _domNode;
    private _verticalScrollbarWidth;
    private _minimapWidth;
    private _horizontalScrollbarHeight;
    private _editorHeight;
    private _editorWidth;
    constructor(context: ViewContext);
    dispose(): void;
    getDomNode(): FastDomNode<HTMLElement>;
    onConfigurationChanged(e: viewEvents.ViewConfigurationChangedEvent): boolean;
    addWidget(widget: IOverlayWidget): void;
    setWidgetPosition(widget: IOverlayWidget, preference: OverlayWidgetPositionPreference | null): boolean;
    removeWidget(widget: IOverlayWidget): void;
    private _renderWidget;
    prepareRender(ctx: RenderingContext): void;
    render(ctx: RestrictedRenderingContext): void;
}

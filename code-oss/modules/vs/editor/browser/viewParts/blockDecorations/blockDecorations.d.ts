import { FastDomNode } from 'vs/base/browser/fastDomNode';
import 'vs/css!./blockDecorations';
import { RenderingContext, RestrictedRenderingContext } from 'vs/editor/browser/view/renderingContext';
import { ViewPart } from 'vs/editor/browser/view/viewPart';
import * as viewEvents from 'vs/editor/common/viewEvents';
import { ViewContext } from 'vs/editor/common/viewModel/viewContext';
export declare class BlockDecorations extends ViewPart {
    domNode: FastDomNode<HTMLElement>;
    private readonly blocks;
    private contentWidth;
    constructor(context: ViewContext);
    private update;
    dispose(): void;
    onConfigurationChanged(e: viewEvents.ViewConfigurationChangedEvent): boolean;
    onScrollChanged(e: viewEvents.ViewScrollChangedEvent): boolean;
    onDecorationsChanged(e: viewEvents.ViewDecorationsChangedEvent): boolean;
    onZonesChanged(e: viewEvents.ViewZonesChangedEvent): boolean;
    prepareRender(ctx: RenderingContext): void;
    render(ctx: RestrictedRenderingContext): void;
}

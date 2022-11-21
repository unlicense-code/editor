import { RenderingContext } from 'vs/editor/browser/view/renderingContext';
import { ViewEventHandler } from 'vs/editor/common/viewEventHandler';
export declare abstract class DynamicViewOverlay extends ViewEventHandler {
    abstract prepareRender(ctx: RenderingContext): void;
    abstract render(startLineNumber: number, lineNumber: number): string;
}

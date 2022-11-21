import { IMouseEvent } from 'vs/base/browser/mouseEvent';
import { DisposableStore } from 'vs/base/common/lifecycle';
export interface IContentActionHandler {
    callback: (content: string, event: IMouseEvent) => void;
    readonly disposables: DisposableStore;
}
export interface FormattedTextRenderOptions {
    readonly className?: string;
    readonly inline?: boolean;
    readonly actionHandler?: IContentActionHandler;
    readonly renderCodeSegments?: boolean;
}
export declare function renderText(text: string, options?: FormattedTextRenderOptions): HTMLElement;
export declare function renderFormattedText(formattedText: string, options?: FormattedTextRenderOptions): HTMLElement;
export declare function createElement(options: FormattedTextRenderOptions): HTMLElement;

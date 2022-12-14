import { Disposable, IDisposable } from 'vs/base/common/lifecycle';
import 'vs/css!./contextview';
export declare const enum ContextViewDOMPosition {
    ABSOLUTE = 1,
    FIXED = 2,
    FIXED_SHADOW = 3
}
export interface IAnchor {
    x: number;
    y: number;
    width?: number;
    height?: number;
}
export declare const enum AnchorAlignment {
    LEFT = 0,
    RIGHT = 1
}
export declare const enum AnchorPosition {
    BELOW = 0,
    ABOVE = 1
}
export declare const enum AnchorAxisAlignment {
    VERTICAL = 0,
    HORIZONTAL = 1
}
export interface IDelegate {
    getAnchor(): HTMLElement | IAnchor;
    render(container: HTMLElement): IDisposable | null;
    focus?(): void;
    layout?(): void;
    anchorAlignment?: AnchorAlignment;
    anchorPosition?: AnchorPosition;
    anchorAxisAlignment?: AnchorAxisAlignment;
    canRelayout?: boolean;
    onDOMEvent?(e: Event, activeElement: HTMLElement): void;
    onHide?(data?: unknown): void;
}
export interface IContextViewProvider {
    showContextView(delegate: IDelegate, container?: HTMLElement): void;
    hideContextView(): void;
    layout(): void;
}
export interface IPosition {
    top: number;
    left: number;
}
export interface ISize {
    width: number;
    height: number;
}
export interface IView extends IPosition, ISize {
}
export declare const enum LayoutAnchorPosition {
    Before = 0,
    After = 1
}
export declare enum LayoutAnchorMode {
    AVOID = 0,
    ALIGN = 1
}
export interface ILayoutAnchor {
    offset: number;
    size: number;
    mode?: LayoutAnchorMode;
    position: LayoutAnchorPosition;
}
/**
 * Lays out a one dimensional view next to an anchor in a viewport.
 *
 * @returns The view offset within the viewport.
 */
export declare function layout(viewportSize: number, viewSize: number, anchor: ILayoutAnchor): number;
export declare class ContextView extends Disposable {
    private static readonly BUBBLE_UP_EVENTS;
    private static readonly BUBBLE_DOWN_EVENTS;
    private container;
    private view;
    private useFixedPosition;
    private useShadowDOM;
    private delegate;
    private toDisposeOnClean;
    private toDisposeOnSetContainer;
    private shadowRoot;
    private shadowRootHostElement;
    constructor(container: HTMLElement | null, domPosition: ContextViewDOMPosition);
    setContainer(container: HTMLElement | null, domPosition: ContextViewDOMPosition): void;
    show(delegate: IDelegate): void;
    getViewElement(): HTMLElement;
    layout(): void;
    private doLayout;
    hide(data?: unknown): void;
    private isVisible;
    private onDOMEvent;
    dispose(): void;
}

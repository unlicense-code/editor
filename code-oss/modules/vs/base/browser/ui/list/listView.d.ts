import { IDragAndDropData } from 'vs/base/browser/dnd';
import { Dimension } from 'vs/base/browser/dom';
import { IMouseWheelEvent } from 'vs/base/browser/mouseEvent';
import { Event } from 'vs/base/common/event';
import { IDisposable } from 'vs/base/common/lifecycle';
import { ScrollbarVisibility, ScrollEvent } from 'vs/base/common/scrollable';
import { ISpliceable } from 'vs/base/common/sequence';
import { IListDragAndDrop, IListGestureEvent, IListMouseEvent, IListRenderer, IListTouchEvent, IListVirtualDelegate } from 'vs/base/browser/ui/list/list';
import { IObservableValue } from 'vs/base/common/observableValue';
export interface IListViewDragAndDrop<T> extends IListDragAndDrop<T> {
    getDragElements(element: T): T[];
}
export interface IListViewAccessibilityProvider<T> {
    getSetSize?(element: T, index: number, listLength: number): number;
    getPosInSet?(element: T, index: number): number;
    getRole?(element: T): string | undefined;
    isChecked?(element: T): boolean | IObservableValue<boolean> | undefined;
}
export interface IListViewOptionsUpdate {
    readonly additionalScrollHeight?: number;
    readonly smoothScrolling?: boolean;
    readonly horizontalScrolling?: boolean;
    readonly mouseWheelScrollSensitivity?: number;
    readonly fastScrollSensitivity?: number;
}
export interface IListViewOptions<T> extends IListViewOptionsUpdate {
    readonly dnd?: IListViewDragAndDrop<T>;
    readonly useShadows?: boolean;
    readonly verticalScrollMode?: ScrollbarVisibility;
    readonly setRowLineHeight?: boolean;
    readonly setRowHeight?: boolean;
    readonly supportDynamicHeights?: boolean;
    readonly mouseSupport?: boolean;
    readonly accessibilityProvider?: IListViewAccessibilityProvider<T>;
    readonly transformOptimization?: boolean;
    readonly alwaysConsumeMouseWheel?: boolean;
    readonly initialSize?: Dimension;
}
export declare class ElementsDragAndDropData<T, TContext = void> implements IDragAndDropData {
    readonly elements: T[];
    private _context;
    get context(): TContext | undefined;
    set context(value: TContext | undefined);
    constructor(elements: T[]);
    update(): void;
    getData(): T[];
}
export declare class ExternalElementsDragAndDropData<T> implements IDragAndDropData {
    readonly elements: T[];
    constructor(elements: T[]);
    update(): void;
    getData(): T[];
}
export declare class NativeDragAndDropData implements IDragAndDropData {
    readonly types: any[];
    readonly files: any[];
    constructor();
    update(dataTransfer: DataTransfer): void;
    getData(): any;
}
/**
 * The {@link ListView} is a virtual scrolling engine.
 *
 * Given that it only renders elements within its viewport, it can hold large
 * collections of elements and stay very performant. The performance bottleneck
 * usually lies within the user's rendering code for each element.
 *
 * @remarks It is a low-level widget, not meant to be used directly. Refer to the
 * List widget instead.
 */
export declare class ListView<T> implements ISpliceable<T>, IDisposable {
    private virtualDelegate;
    private static InstanceCount;
    readonly domId: string;
    readonly domNode: HTMLElement;
    private items;
    private itemId;
    private rangeMap;
    private cache;
    private renderers;
    private lastRenderTop;
    private lastRenderHeight;
    private renderWidth;
    private rowsContainer;
    private scrollable;
    private scrollableElement;
    private _scrollHeight;
    private scrollableElementUpdateDisposable;
    private scrollableElementWidthDelayer;
    private splicing;
    private dragOverAnimationDisposable;
    private dragOverAnimationStopDisposable;
    private dragOverMouseY;
    private setRowLineHeight;
    private setRowHeight;
    private supportDynamicHeights;
    private additionalScrollHeight;
    private accessibilityProvider;
    private scrollWidth;
    private dnd;
    private canDrop;
    private currentDragData;
    private currentDragFeedback;
    private currentDragFeedbackDisposable;
    private onDragLeaveTimeout;
    private readonly disposables;
    private readonly _onDidChangeContentHeight;
    readonly onDidChangeContentHeight: Event<number>;
    get contentHeight(): number;
    get onDidScroll(): Event<ScrollEvent>;
    get onWillScroll(): Event<ScrollEvent>;
    get containerDomNode(): HTMLElement;
    get scrollableElementDomNode(): HTMLElement;
    private _horizontalScrolling;
    private get horizontalScrolling();
    private set horizontalScrolling(value);
    constructor(container: HTMLElement, virtualDelegate: IListVirtualDelegate<T>, renderers: IListRenderer<any, any>[], options?: IListViewOptions<T>);
    updateOptions(options: IListViewOptionsUpdate): void;
    delegateScrollFromMouseWheelEvent(browserEvent: IMouseWheelEvent): void;
    delegateVerticalScrollbarPointerDown(browserEvent: PointerEvent): void;
    updateElementHeight(index: number, size: number | undefined, anchorIndex: number | null): void;
    splice(start: number, deleteCount: number, elements?: T[]): T[];
    private _splice;
    private eventuallyUpdateScrollDimensions;
    private eventuallyUpdateScrollWidth;
    private updateScrollWidth;
    updateWidth(index: number): void;
    rerender(): void;
    get length(): number;
    get renderHeight(): number;
    get firstVisibleIndex(): number;
    get lastVisibleIndex(): number;
    element(index: number): T;
    indexOf(element: T): number;
    domElement(index: number): HTMLElement | null;
    elementHeight(index: number): number;
    elementTop(index: number): number;
    indexAt(position: number): number;
    indexAfter(position: number): number;
    layout(height?: number, width?: number): void;
    private render;
    private insertItemInDOM;
    private measureItemWidth;
    private updateItemInDOM;
    private removeItemFromDOM;
    getScrollTop(): number;
    setScrollTop(scrollTop: number, reuseAnimation?: boolean): void;
    getScrollLeft(): number;
    setScrollLeft(scrollLeft: number): void;
    get scrollTop(): number;
    set scrollTop(scrollTop: number);
    get scrollHeight(): number;
    get onMouseClick(): Event<IListMouseEvent<T>>;
    get onMouseDblClick(): Event<IListMouseEvent<T>>;
    get onMouseMiddleClick(): Event<IListMouseEvent<T>>;
    get onMouseUp(): Event<IListMouseEvent<T>>;
    get onMouseDown(): Event<IListMouseEvent<T>>;
    get onMouseOver(): Event<IListMouseEvent<T>>;
    get onMouseMove(): Event<IListMouseEvent<T>>;
    get onMouseOut(): Event<IListMouseEvent<T>>;
    get onContextMenu(): Event<IListMouseEvent<T> | IListGestureEvent<T>>;
    get onTouchStart(): Event<IListTouchEvent<T>>;
    get onTap(): Event<IListGestureEvent<T>>;
    private toMouseEvent;
    private toTouchEvent;
    private toGestureEvent;
    private toDragEvent;
    private onScroll;
    private onTouchChange;
    private onDragStart;
    private onDragOver;
    private onDragLeave;
    private onDrop;
    private onDragEnd;
    private clearDragOverFeedback;
    private setupDragAndDropScrollTopAnimation;
    private animateDragAndDropScrollTop;
    private teardownDragAndDropScrollTopAnimation;
    private getItemIndexFromEventTarget;
    private getRenderRange;
    /**
     * Given a stable rendered state, checks every rendered element whether it needs
     * to be probed for dynamic height. Adjusts scroll height and top if necessary.
     */
    private _rerender;
    private probeDynamicHeight;
    private getNextToLastElement;
    getElementDomId(index: number): string;
    dispose(): void;
}

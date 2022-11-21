import { IListOptions, IListOptionsUpdate, IListStyles } from 'vs/base/browser/ui/list/listWidget';
import { ITableColumn, ITableContextMenuEvent, ITableEvent, ITableGestureEvent, ITableMouseEvent, ITableRenderer, ITableTouchEvent, ITableVirtualDelegate } from 'vs/base/browser/ui/table/table';
import { Event } from 'vs/base/common/event';
import { DisposableStore, IDisposable } from 'vs/base/common/lifecycle';
import { ScrollEvent } from 'vs/base/common/scrollable';
import { ISpliceable } from 'vs/base/common/sequence';
import { IThemable } from 'vs/base/common/styler';
import 'vs/css!./table';
declare type TCell = any;
export interface ITableOptions<TRow> extends IListOptions<TRow> {
}
export interface ITableOptionsUpdate extends IListOptionsUpdate {
}
export interface ITableStyles extends IListStyles {
}
export declare class Table<TRow> implements ISpliceable<TRow>, IThemable, IDisposable {
    private virtualDelegate;
    private static InstanceCount;
    readonly domId: string;
    readonly domNode: HTMLElement;
    private splitview;
    private list;
    private styleElement;
    protected readonly disposables: DisposableStore;
    private cachedWidth;
    private cachedHeight;
    get onDidChangeFocus(): Event<ITableEvent<TRow>>;
    get onDidChangeSelection(): Event<ITableEvent<TRow>>;
    get onDidScroll(): Event<ScrollEvent>;
    get onMouseClick(): Event<ITableMouseEvent<TRow>>;
    get onMouseDblClick(): Event<ITableMouseEvent<TRow>>;
    get onMouseMiddleClick(): Event<ITableMouseEvent<TRow>>;
    get onPointer(): Event<ITableMouseEvent<TRow>>;
    get onMouseUp(): Event<ITableMouseEvent<TRow>>;
    get onMouseDown(): Event<ITableMouseEvent<TRow>>;
    get onMouseOver(): Event<ITableMouseEvent<TRow>>;
    get onMouseMove(): Event<ITableMouseEvent<TRow>>;
    get onMouseOut(): Event<ITableMouseEvent<TRow>>;
    get onTouchStart(): Event<ITableTouchEvent<TRow>>;
    get onTap(): Event<ITableGestureEvent<TRow>>;
    get onContextMenu(): Event<ITableContextMenuEvent<TRow>>;
    get onDidFocus(): Event<void>;
    get onDidBlur(): Event<void>;
    get scrollTop(): number;
    set scrollTop(scrollTop: number);
    get scrollLeft(): number;
    set scrollLeft(scrollLeft: number);
    get scrollHeight(): number;
    get renderHeight(): number;
    get onDidDispose(): Event<void>;
    constructor(user: string, container: HTMLElement, virtualDelegate: ITableVirtualDelegate<TRow>, columns: ITableColumn<TRow, TCell>[], renderers: ITableRenderer<TCell, unknown>[], _options?: ITableOptions<TRow>);
    updateOptions(options: ITableOptionsUpdate): void;
    splice(start: number, deleteCount: number, elements?: TRow[]): void;
    rerender(): void;
    row(index: number): TRow;
    indexOf(element: TRow): number;
    get length(): number;
    getHTMLElement(): HTMLElement;
    layout(height?: number, width?: number): void;
    triggerTypeNavigation(): void;
    style(styles: ITableStyles): void;
    domFocus(): void;
    setAnchor(index: number | undefined): void;
    getAnchor(): number | undefined;
    getSelectedElements(): TRow[];
    setSelection(indexes: number[], browserEvent?: UIEvent): void;
    getSelection(): number[];
    setFocus(indexes: number[], browserEvent?: UIEvent): void;
    focusNext(n?: number, loop?: boolean, browserEvent?: UIEvent): void;
    focusPrevious(n?: number, loop?: boolean, browserEvent?: UIEvent): void;
    focusNextPage(browserEvent?: UIEvent): Promise<void>;
    focusPreviousPage(browserEvent?: UIEvent): Promise<void>;
    focusFirst(browserEvent?: UIEvent): void;
    focusLast(browserEvent?: UIEvent): void;
    getFocus(): number[];
    getFocusedElements(): TRow[];
    getRelativeTop(index: number): number | null;
    reveal(index: number, relativeTop?: number): void;
    dispose(): void;
}
export {};

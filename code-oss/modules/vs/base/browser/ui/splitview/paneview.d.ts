import { Orientation } from 'vs/base/browser/ui/sash/sash';
import { Color } from 'vs/base/common/color';
import { Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { ScrollEvent } from 'vs/base/common/scrollable';
import 'vs/css!./paneview';
import { IView } from './splitview';
export interface IPaneOptions {
    minimumBodySize?: number;
    maximumBodySize?: number;
    expanded?: boolean;
    orientation?: Orientation;
    title: string;
    titleDescription?: string;
}
export interface IPaneStyles {
    dropBackground?: Color;
    headerForeground?: Color;
    headerBackground?: Color;
    headerBorder?: Color;
    leftBorder?: Color;
}
/**
 * A Pane is a structured SplitView view.
 *
 * WARNING: You must call `render()` after you construct it.
 * It can't be done automatically at the end of the ctor
 * because of the order of property initialization in TypeScript.
 * Subclasses wouldn't be able to set own properties
 * before the `render()` call, thus forbidding their use.
 */
export declare abstract class Pane extends Disposable implements IView {
    private static readonly HEADER_SIZE;
    readonly element: HTMLElement;
    private header;
    private body;
    protected _expanded: boolean;
    protected _orientation: Orientation;
    private expandedSize;
    private _headerVisible;
    private _bodyRendered;
    private _minimumBodySize;
    private _maximumBodySize;
    private _ariaHeaderLabel;
    private styles;
    private animationTimer;
    private readonly _onDidChange;
    readonly onDidChange: Event<number | undefined>;
    private readonly _onDidChangeExpansionState;
    readonly onDidChangeExpansionState: Event<boolean>;
    get ariaHeaderLabel(): string;
    set ariaHeaderLabel(newLabel: string);
    get draggableElement(): HTMLElement;
    get dropTargetElement(): HTMLElement;
    private _dropBackground;
    get dropBackground(): Color | undefined;
    get minimumBodySize(): number;
    set minimumBodySize(size: number);
    get maximumBodySize(): number;
    set maximumBodySize(size: number);
    private get headerSize();
    get minimumSize(): number;
    get maximumSize(): number;
    orthogonalSize: number;
    constructor(options: IPaneOptions);
    isExpanded(): boolean;
    setExpanded(expanded: boolean): boolean;
    get headerVisible(): boolean;
    set headerVisible(visible: boolean);
    get orientation(): Orientation;
    set orientation(orientation: Orientation);
    render(): void;
    layout(size: number): void;
    style(styles: IPaneStyles): void;
    protected updateHeader(): void;
    protected abstract renderHeader(container: HTMLElement): void;
    protected abstract renderBody(container: HTMLElement): void;
    protected abstract layoutBody(height: number, width: number): void;
}
export interface IPaneDndController {
    canDrag(pane: Pane): boolean;
    canDrop(pane: Pane, overPane: Pane): boolean;
}
export declare class DefaultPaneDndController implements IPaneDndController {
    canDrag(pane: Pane): boolean;
    canDrop(pane: Pane, overPane: Pane): boolean;
}
export interface IPaneViewOptions {
    dnd?: IPaneDndController;
    orientation?: Orientation;
}
export declare class PaneView extends Disposable {
    private dnd;
    private dndContext;
    readonly element: HTMLElement;
    private paneItems;
    private orthogonalSize;
    private size;
    private splitview;
    private animationTimer;
    private _onDidDrop;
    readonly onDidDrop: Event<{
        from: Pane;
        to: Pane;
    }>;
    orientation: Orientation;
    readonly onDidSashChange: Event<number>;
    readonly onDidSashReset: Event<number>;
    readonly onDidScroll: Event<ScrollEvent>;
    constructor(container: HTMLElement, options?: IPaneViewOptions);
    addPane(pane: Pane, size: number, index?: number): void;
    removePane(pane: Pane): void;
    movePane(from: Pane, to: Pane): void;
    resizePane(pane: Pane, size: number): void;
    getPaneSize(pane: Pane): number;
    layout(height: number, width: number): void;
    flipOrientation(height: number, width: number): void;
    private setupAnimation;
    private getPaneHeaderElements;
    private focusPrevious;
    private focusNext;
    dispose(): void;
}

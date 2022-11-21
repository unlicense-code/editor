import { IAction } from 'vs/base/common/actions';
import { IDisposable } from 'vs/base/common/lifecycle';
import { IBadge } from 'vs/workbench/services/activity/common/activity';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ActionsOrientation } from 'vs/base/browser/ui/actionbar/actionbar';
import { ActivityAction, ICompositeBar, ICompositeBarColors, IActivityHoverOptions } from 'vs/workbench/browser/parts/compositeBarActions';
import { Dimension } from 'vs/base/browser/dom';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { Widget } from 'vs/base/browser/ui/widget';
import { IColorTheme } from 'vs/platform/theme/common/themeService';
import { ViewContainerLocation, IViewDescriptorService } from 'vs/workbench/common/views';
import { IPaneComposite } from 'vs/workbench/common/panecomposite';
import { IComposite } from 'vs/workbench/common/composite';
import { CompositeDragAndDropData, ICompositeDragAndDrop, Before2D } from 'vs/workbench/browser/dnd';
import { GestureEvent } from 'vs/base/browser/touch';
export interface ICompositeBarItem {
    readonly id: string;
    name?: string;
    pinned: boolean;
    order?: number;
    visible: boolean;
}
export declare class CompositeDragAndDrop implements ICompositeDragAndDrop {
    private viewDescriptorService;
    private targetContainerLocation;
    private openComposite;
    private moveComposite;
    private getItems;
    constructor(viewDescriptorService: IViewDescriptorService, targetContainerLocation: ViewContainerLocation, openComposite: (id: string, focus?: boolean) => Promise<IPaneComposite | null>, moveComposite: (from: string, to: string, before?: Before2D) => void, getItems: () => ICompositeBarItem[]);
    drop(data: CompositeDragAndDropData, targetCompositeId: string | undefined, originalEvent: DragEvent, before?: Before2D): void;
    onDragEnter(data: CompositeDragAndDropData, targetCompositeId: string | undefined, originalEvent: DragEvent): boolean;
    onDragOver(data: CompositeDragAndDropData, targetCompositeId: string | undefined, originalEvent: DragEvent): boolean;
    private getTargetIndex;
    private canDrop;
}
export interface ICompositeBarOptions {
    readonly icon: boolean;
    readonly orientation: ActionsOrientation;
    readonly colors: (theme: IColorTheme) => ICompositeBarColors;
    readonly compositeSize: number;
    readonly overflowActionSize: number;
    readonly dndHandler: ICompositeDragAndDrop;
    readonly activityHoverOptions: IActivityHoverOptions;
    readonly preventLoopNavigation?: boolean;
    readonly getActivityAction: (compositeId: string) => ActivityAction;
    readonly getCompositePinnedAction: (compositeId: string) => IAction;
    readonly getOnCompositeClickAction: (compositeId: string) => IAction;
    readonly fillExtraContextMenuActions: (actions: IAction[], e?: MouseEvent | GestureEvent) => void;
    readonly getContextMenuActionsForComposite: (compositeId: string) => IAction[];
    readonly openComposite: (compositeId: string, preserveFocus?: boolean) => Promise<IComposite | null>;
    readonly getDefaultCompositeId: () => string | undefined;
    readonly hidePart: () => void;
}
export declare class CompositeBar extends Widget implements ICompositeBar {
    private readonly options;
    private readonly instantiationService;
    private readonly contextMenuService;
    private readonly _onDidChange;
    readonly onDidChange: import("vs/base/common/event").Event<void>;
    private dimension;
    private compositeSwitcherBar;
    private compositeOverflowAction;
    private compositeOverflowActionViewItem;
    private readonly model;
    private readonly visibleComposites;
    private readonly compositeSizeInBar;
    constructor(items: ICompositeBarItem[], options: ICompositeBarOptions, instantiationService: IInstantiationService, contextMenuService: IContextMenuService);
    getCompositeBarItems(): ICompositeBarItem[];
    setCompositeBarItems(items: ICompositeBarItem[]): void;
    getPinnedComposites(): ICompositeBarItem[];
    getVisibleComposites(): ICompositeBarItem[];
    create(parent: HTMLElement): HTMLElement;
    private insertAtFront;
    private updateFromDragging;
    focus(index?: number): void;
    recomputeSizes(): void;
    layout(dimension: Dimension): void;
    addComposite({ id, name, order, requestedIndex }: {
        id: string;
        name: string;
        order?: number;
        requestedIndex?: number;
    }): void;
    removeComposite(id: string): void;
    hideComposite(id: string): void;
    activateComposite(id: string): void;
    deactivateComposite(id: string): void;
    showActivity(compositeId: string, badge: IBadge, clazz?: string, priority?: number): IDisposable;
    pin(compositeId: string, open?: boolean): Promise<void>;
    unpin(compositeId: string): void;
    private resetActiveComposite;
    isPinned(compositeId: string): boolean;
    move(compositeId: string, toCompositeId: string, before?: boolean): void;
    getAction(compositeId: string): ActivityAction;
    private computeSizes;
    private updateCompositeSwitcher;
    private getOverflowingComposites;
    private showContextMenu;
    getContextMenuActions(e?: MouseEvent | GestureEvent): IAction[];
}

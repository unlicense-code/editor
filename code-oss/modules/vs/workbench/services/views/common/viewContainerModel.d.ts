import { ViewContainer, IViewDescriptor, IViewContainerModel, IAddedViewDescriptorRef, IViewDescriptorRef, IAddedViewDescriptorState } from 'vs/workbench/common/views';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { Disposable } from 'vs/base/common/lifecycle';
import { Event } from 'vs/base/common/event';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { URI } from 'vs/base/common/uri';
import { ThemeIcon } from 'vs/platform/theme/common/themeService';
import { ILoggerService } from 'vs/platform/log/common/log';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
export declare function getViewsStateStorageId(viewContainerStorageId: string): string;
export declare class ViewContainerModel extends Disposable implements IViewContainerModel {
    readonly viewContainer: ViewContainer;
    private readonly contextKeyService;
    private readonly contextKeys;
    private viewDescriptorItems;
    private viewDescriptorsState;
    private _title;
    get title(): string;
    private _icon;
    get icon(): URI | ThemeIcon | undefined;
    private _keybindingId;
    get keybindingId(): string | undefined;
    private _onDidChangeContainerInfo;
    readonly onDidChangeContainerInfo: Event<{
        title?: boolean | undefined;
        icon?: boolean | undefined;
        keybindingId?: boolean | undefined;
    }>;
    get allViewDescriptors(): ReadonlyArray<IViewDescriptor>;
    private _onDidChangeAllViewDescriptors;
    readonly onDidChangeAllViewDescriptors: Event<{
        added: ReadonlyArray<IViewDescriptor>;
        removed: ReadonlyArray<IViewDescriptor>;
    }>;
    get activeViewDescriptors(): ReadonlyArray<IViewDescriptor>;
    private _onDidChangeActiveViewDescriptors;
    readonly onDidChangeActiveViewDescriptors: Event<{
        added: ReadonlyArray<IViewDescriptor>;
        removed: ReadonlyArray<IViewDescriptor>;
    }>;
    get visibleViewDescriptors(): ReadonlyArray<IViewDescriptor>;
    private _onDidAddVisibleViewDescriptors;
    readonly onDidAddVisibleViewDescriptors: Event<IAddedViewDescriptorRef[]>;
    private _onDidRemoveVisibleViewDescriptors;
    readonly onDidRemoveVisibleViewDescriptors: Event<IViewDescriptorRef[]>;
    private _onDidMoveVisibleViewDescriptors;
    readonly onDidMoveVisibleViewDescriptors: Event<{
        from: IViewDescriptorRef;
        to: IViewDescriptorRef;
    }>;
    private readonly logger;
    constructor(viewContainer: ViewContainer, instantiationService: IInstantiationService, contextKeyService: IContextKeyService, loggerService: ILoggerService, workbenchEnvironmentService: IWorkbenchEnvironmentService);
    private updateContainerInfo;
    private isEqualIcon;
    isVisible(id: string): boolean;
    setVisible(id: string, visible: boolean): void;
    private updateVisibility;
    private updateViewDescriptorItemVisibility;
    isCollapsed(id: string): boolean;
    setCollapsed(id: string, collapsed: boolean): void;
    getSize(id: string): number | undefined;
    setSizes(newSizes: readonly {
        id: string;
        size: number;
    }[]): void;
    move(from: string, to: string): void;
    add(addedViewDescriptorStates: IAddedViewDescriptorState[]): void;
    remove(viewDescriptors: IViewDescriptor[]): void;
    private onDidChangeContext;
    private broadCastAddedVisibleViewDescriptors;
    private broadCastRemovedVisibleViewDescriptors;
    private isViewDescriptorVisible;
    private isViewDescriptorVisibleWhenActive;
    private find;
    private findAndIgnoreIfNotFound;
    private compareViewDescriptors;
    private getViewOrder;
    private getGroupOrderResult;
}

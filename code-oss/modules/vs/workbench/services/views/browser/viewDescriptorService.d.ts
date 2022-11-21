import { ViewContainerLocation, IViewDescriptorService, ViewContainer, IViewDescriptor, ViewVisibilityState } from 'vs/workbench/common/views';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { Disposable } from 'vs/base/common/lifecycle';
import { Event } from 'vs/base/common/event';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ViewContainerModel } from 'vs/workbench/services/views/common/viewContainerModel';
export declare class ViewDescriptorService extends Disposable implements IViewDescriptorService {
    private readonly instantiationService;
    private readonly contextKeyService;
    private readonly storageService;
    private readonly extensionService;
    private readonly telemetryService;
    readonly _serviceBrand: undefined;
    private static readonly VIEWS_CUSTOMIZATIONS;
    private static readonly COMMON_CONTAINER_ID_PREFIX;
    private readonly _onDidChangeContainer;
    readonly onDidChangeContainer: Event<{
        views: IViewDescriptor[];
        from: ViewContainer;
        to: ViewContainer;
    }>;
    private readonly _onDidChangeLocation;
    readonly onDidChangeLocation: Event<{
        views: IViewDescriptor[];
        from: ViewContainerLocation;
        to: ViewContainerLocation;
    }>;
    private readonly _onDidChangeContainerLocation;
    readonly onDidChangeContainerLocation: Event<{
        viewContainer: ViewContainer;
        from: ViewContainerLocation;
        to: ViewContainerLocation;
    }>;
    private readonly viewContainerModels;
    private readonly viewsVisibilityActionDisposables;
    private readonly activeViewContextKeys;
    private readonly movableViewContextKeys;
    private readonly defaultViewLocationContextKeys;
    private readonly defaultViewContainerLocationContextKeys;
    private readonly viewsRegistry;
    private readonly viewContainersRegistry;
    private readonly viewContainersCustomLocations;
    private readonly viewDescriptorsCustomLocations;
    private readonly _onDidChangeViewContainers;
    readonly onDidChangeViewContainers: Event<{
        added: ReadonlyArray<{
            container: ViewContainer;
            location: ViewContainerLocation;
        }>;
        removed: ReadonlyArray<{
            container: ViewContainer;
            location: ViewContainerLocation;
        }>;
    }>;
    get viewContainers(): ReadonlyArray<ViewContainer>;
    constructor(instantiationService: IInstantiationService, contextKeyService: IContextKeyService, storageService: IStorageService, extensionService: IExtensionService, telemetryService: ITelemetryService);
    private migrateToViewsCustomizationsStorage;
    private registerGroupedViews;
    private deregisterGroupedViews;
    private moveOrphanViewsToDefaultLocation;
    onDidRegisterExtensions(): void;
    private onDidRegisterViews;
    private isGeneratedContainerId;
    private onDidDeregisterViews;
    private regroupViews;
    getViewDescriptorById(viewId: string): IViewDescriptor | null;
    getViewLocationById(viewId: string): ViewContainerLocation | null;
    getViewContainerByViewId(viewId: string): ViewContainer | null;
    getViewContainerLocation(viewContainer: ViewContainer): ViewContainerLocation;
    getDefaultViewContainerLocation(viewContainer: ViewContainer): ViewContainerLocation;
    getDefaultContainerById(viewId: string): ViewContainer | null;
    getViewContainerModel(container: ViewContainer): ViewContainerModel;
    getViewContainerById(id: string): ViewContainer | null;
    getViewContainersByLocation(location: ViewContainerLocation): ViewContainer[];
    getDefaultViewContainer(location: ViewContainerLocation): ViewContainer | undefined;
    moveViewContainerToLocation(viewContainer: ViewContainer, location: ViewContainerLocation, requestedIndex?: number): void;
    moveViewToLocation(view: IViewDescriptor, location: ViewContainerLocation): void;
    moveViewsToContainer(views: IViewDescriptor[], viewContainer: ViewContainer, visibilityState?: ViewVisibilityState): void;
    reset(): void;
    isViewContainerRemovedPermanently(viewContainerId: string): boolean;
    private onDidChangeDefaultContainer;
    private reportMovedViews;
    private moveViewsWithoutSaving;
    private moveViewContainerToLocationWithoutSaving;
    private cleanUpGeneratedViewContainer;
    private registerGeneratedViewContainer;
    private onDidStorageChange;
    private onDidViewCustomizationsStorageChange;
    private generateContainerId;
    private saveViewCustomizations;
    private _viewCustomizations;
    private get viewCustomizations();
    private set viewCustomizations(value);
    private getStoredViewCustomizationsValue;
    private setStoredViewCustomizationsValue;
    private getViewsByContainer;
    private onDidRegisterViewContainer;
    private getOrRegisterViewContainerModel;
    private onDidDeregisterViewContainer;
    private onDidChangeActiveViews;
    private onDidChangeVisibleViews;
    private registerViewsVisibilityActions;
    private registerResetViewContainerAction;
    private addViews;
    private removeViews;
    private getOrCreateActiveViewContextKey;
    private getOrCreateVisibleViewContextKey;
    private getOrCreateMovableViewContextKey;
    private getOrCreateDefaultViewLocationContextKey;
    private getOrCreateDefaultViewContainerLocationContextKey;
}
import { Composite, CompositeDescriptor, CompositeRegistry } from 'vs/workbench/browser/composite';
import { BrandedService, IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { URI } from 'vs/base/common/uri';
import { Dimension } from 'vs/base/browser/dom';
import { IActionViewItem } from 'vs/base/browser/ui/actionbar/actionbar';
import { IAction } from 'vs/base/common/actions';
import { MenuId } from 'vs/platform/actions/common/actions';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { ViewPaneContainer } from 'vs/workbench/browser/parts/views/viewPaneContainer';
import { IPaneComposite } from 'vs/workbench/common/panecomposite';
import { IView } from 'vs/workbench/common/views';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
export declare abstract class PaneComposite extends Composite implements IPaneComposite {
    protected storageService: IStorageService;
    protected instantiationService: IInstantiationService;
    protected contextMenuService: IContextMenuService;
    protected extensionService: IExtensionService;
    protected contextService: IWorkspaceContextService;
    private viewPaneContainer?;
    constructor(id: string, telemetryService: ITelemetryService, storageService: IStorageService, instantiationService: IInstantiationService, themeService: IThemeService, contextMenuService: IContextMenuService, extensionService: IExtensionService, contextService: IWorkspaceContextService);
    create(parent: HTMLElement): void;
    setVisible(visible: boolean): void;
    layout(dimension: Dimension): void;
    getOptimalWidth(): number;
    openView<T extends IView>(id: string, focus?: boolean): T | undefined;
    getViewPaneContainer(): ViewPaneContainer | undefined;
    getActionsContext(): unknown;
    getContextMenuActions(): readonly IAction[];
    getMenuIds(): MenuId[];
    getActions(): readonly IAction[];
    getSecondaryActions(): readonly IAction[];
    getActionViewItem(action: IAction): IActionViewItem | undefined;
    getTitle(): string;
    saveState(): void;
    focus(): void;
    protected abstract createViewPaneContainer(parent: HTMLElement): ViewPaneContainer;
}
/**
 * A Pane Composite descriptor is a lightweight descriptor of a Pane Composite in the workbench.
 */
export declare class PaneCompositeDescriptor extends CompositeDescriptor<PaneComposite> {
    readonly iconUrl?: URI | undefined;
    static create<Services extends BrandedService[]>(ctor: {
        new (...services: Services): PaneComposite;
    }, id: string, name: string, cssClass?: string, order?: number, requestedIndex?: number, iconUrl?: URI): PaneCompositeDescriptor;
    private constructor();
}
export declare const Extensions: {
    Viewlets: string;
    Panels: string;
    Auxiliary: string;
};
export declare class PaneCompositeRegistry extends CompositeRegistry<PaneComposite> {
    /**
     * Registers a viewlet to the platform.
     */
    registerPaneComposite(descriptor: PaneCompositeDescriptor): void;
    /**
     * Deregisters a viewlet to the platform.
     */
    deregisterPaneComposite(id: string): void;
    /**
     * Returns the viewlet descriptor for the given id or null if none.
     */
    getPaneComposite(id: string): PaneCompositeDescriptor;
    /**
     * Returns an array of registered viewlets known to the platform.
     */
    getPaneComposites(): PaneCompositeDescriptor[];
}

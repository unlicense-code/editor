import { Event } from 'vs/base/common/event';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IProgressIndicator } from 'vs/platform/progress/common/progress';
import { PaneCompositeDescriptor } from 'vs/workbench/browser/panecomposite';
import { IPaneComposite } from 'vs/workbench/common/panecomposite';
import { ViewContainerLocation } from 'vs/workbench/common/views';
import { IBadge } from 'vs/workbench/services/activity/common/activity';
import { IPaneCompositePartService } from 'vs/workbench/services/panecomposite/browser/panecomposite';
import { Disposable, IDisposable } from 'vs/base/common/lifecycle';
import { IView } from 'vs/base/browser/ui/grid/grid';
export interface IPaneCompositePart extends IView {
    readonly onDidPaneCompositeOpen: Event<IPaneComposite>;
    readonly onDidPaneCompositeClose: Event<IPaneComposite>;
    /**
     * Opens a viewlet with the given identifier and pass keyboard focus to it if specified.
     */
    openPaneComposite(id: string | undefined, focus?: boolean): Promise<IPaneComposite | undefined>;
    /**
     * Returns the current active viewlet if any.
     */
    getActivePaneComposite(): IPaneComposite | undefined;
    /**
     * Returns the viewlet by id.
     */
    getPaneComposite(id: string): PaneCompositeDescriptor | undefined;
    /**
     * Returns all enabled viewlets
     */
    getPaneComposites(): PaneCompositeDescriptor[];
    /**
     * Returns the progress indicator for the side bar.
     */
    getProgressIndicator(id: string): IProgressIndicator | undefined;
    /**
     * Hide the active viewlet.
     */
    hideActivePaneComposite(): void;
    /**
     * Return the last active viewlet id.
     */
    getLastActivePaneCompositeId(): string;
}
export interface IPaneCompositeSelectorPart {
    /**
     * Returns id of pinned view containers following the visual order.
     */
    getPinnedPaneCompositeIds(): string[];
    /**
     * Returns id of visible view containers following the visual order.
     */
    getVisiblePaneCompositeIds(): string[];
    /**
     * Show an activity in a viewlet.
     */
    showActivity(id: string, badge: IBadge, clazz?: string, priority?: number): IDisposable;
}
export declare class PaneCompositeParts extends Disposable implements IPaneCompositePartService {
    readonly _serviceBrand: undefined;
    readonly onDidPaneCompositeOpen: Event<{
        composite: IPaneComposite;
        viewContainerLocation: ViewContainerLocation;
    }>;
    readonly onDidPaneCompositeClose: Event<{
        composite: IPaneComposite;
        viewContainerLocation: ViewContainerLocation;
    }>;
    private readonly paneCompositeParts;
    private readonly paneCompositeSelectorParts;
    constructor(instantiationService: IInstantiationService);
    openPaneComposite(id: string | undefined, viewContainerLocation: ViewContainerLocation, focus?: boolean): Promise<IPaneComposite | undefined>;
    getActivePaneComposite(viewContainerLocation: ViewContainerLocation): IPaneComposite | undefined;
    getPaneComposite(id: string, viewContainerLocation: ViewContainerLocation): PaneCompositeDescriptor | undefined;
    getPaneComposites(viewContainerLocation: ViewContainerLocation): PaneCompositeDescriptor[];
    getPinnedPaneCompositeIds(viewContainerLocation: ViewContainerLocation): string[];
    getVisiblePaneCompositeIds(viewContainerLocation: ViewContainerLocation): string[];
    getProgressIndicator(id: string, viewContainerLocation: ViewContainerLocation): IProgressIndicator | undefined;
    hideActivePaneComposite(viewContainerLocation: ViewContainerLocation): void;
    getLastActivePaneCompositeId(viewContainerLocation: ViewContainerLocation): string;
    showActivity(id: string, viewContainerLocation: ViewContainerLocation, badge: IBadge, clazz?: string, priority?: number): IDisposable;
    private getPartByLocation;
    private getSelectorPartByLocation;
}

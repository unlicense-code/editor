import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { IViewDescriptor, IViewDescriptorService, IAddedViewDescriptorRef } from 'vs/workbench/common/views';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { ViewPaneContainer } from 'vs/workbench/browser/parts/views/viewPaneContainer';
import { ViewPane, IViewPaneOptions } from 'vs/workbench/browser/parts/views/viewPane';
import { Event } from 'vs/base/common/event';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IWorkbenchLayoutService } from 'vs/workbench/services/layout/browser/layoutService';
import { ExtensionIdentifier } from 'vs/platform/extensions/common/extensions';
export interface IViewletViewOptions extends IViewPaneOptions {
    readonly fromExtensionId?: ExtensionIdentifier;
}
export declare abstract class FilterViewPaneContainer extends ViewPaneContainer {
    private constantViewDescriptors;
    private allViews;
    private filterValue;
    constructor(viewletId: string, onDidChangeFilterValue: Event<string[]>, configurationService: IConfigurationService, layoutService: IWorkbenchLayoutService, telemetryService: ITelemetryService, storageService: IStorageService, instantiationService: IInstantiationService, themeService: IThemeService, contextMenuService: IContextMenuService, extensionService: IExtensionService, contextService: IWorkspaceContextService, viewDescriptorService: IViewDescriptorService);
    private updateAllViews;
    protected addConstantViewDescriptors(constantViewDescriptors: IViewDescriptor[]): void;
    protected abstract getFilterOn(viewDescriptor: IViewDescriptor): string | undefined;
    protected abstract setFilter(viewDescriptor: IViewDescriptor): void;
    private onFilterChanged;
    private getViewsForTarget;
    private getViewsNotForTarget;
    protected onDidAddViewDescriptors(added: IAddedViewDescriptorRef[]): ViewPane[];
    abstract getTitle(): string;
}

import 'vs/css!./media/explorerviewlet';
import { IViewletViewOptions } from 'vs/workbench/browser/parts/views/viewsViewlet';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { ExplorerView } from 'vs/workbench/contrib/files/browser/views/explorerView';
import { OpenEditorsView } from 'vs/workbench/contrib/files/browser/views/openEditorsView';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { IViewDescriptor, ViewContainer, IViewDescriptorService } from 'vs/workbench/common/views';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { Disposable } from 'vs/base/common/lifecycle';
import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
import { IWorkbenchLayoutService } from 'vs/workbench/services/layout/browser/layoutService';
import { ViewPaneContainer } from 'vs/workbench/browser/parts/views/viewPaneContainer';
import { ViewPane } from 'vs/workbench/browser/parts/views/viewPane';
import { IProgressService } from 'vs/platform/progress/common/progress';
export declare class ExplorerViewletViewsContribution extends Disposable implements IWorkbenchContribution {
    private readonly workspaceContextService;
    private readonly configurationService;
    private openEditorsVisibleContextKey;
    constructor(workspaceContextService: IWorkspaceContextService, configurationService: IConfigurationService, contextKeyService: IContextKeyService, progressService: IProgressService);
    private registerViews;
    private createOpenEditorsViewDescriptor;
    private createEmptyViewDescriptor;
    private createExplorerViewDescriptor;
    private onConfigurationUpdated;
    private updateOpenEditorsVisibility;
}
export declare class ExplorerViewPaneContainer extends ViewPaneContainer {
    private viewletVisibleContextKey;
    constructor(layoutService: IWorkbenchLayoutService, telemetryService: ITelemetryService, contextService: IWorkspaceContextService, storageService: IStorageService, configurationService: IConfigurationService, instantiationService: IInstantiationService, contextKeyService: IContextKeyService, themeService: IThemeService, contextMenuService: IContextMenuService, extensionService: IExtensionService, viewDescriptorService: IViewDescriptorService);
    create(parent: HTMLElement): void;
    protected createView(viewDescriptor: IViewDescriptor, options: IViewletViewOptions): ViewPane;
    getExplorerView(): ExplorerView;
    getOpenEditorsView(): OpenEditorsView;
    setVisible(visible: boolean): void;
    focus(): void;
}
/**
 * Explorer viewlet container.
 */
export declare const VIEW_CONTAINER: ViewContainer;

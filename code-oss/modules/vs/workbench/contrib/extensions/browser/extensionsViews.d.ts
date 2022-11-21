import { Event } from 'vs/base/common/event';
import { IPagedModel } from 'vs/base/common/paging';
import { IQueryOptions as IGalleryQueryOptions, SortBy as GallerySortBy } from 'vs/platform/extensionManagement/common/extensionManagement';
import { IExtensionManagementServer, IExtensionManagementServerService, IWorkbenchExtensionManagementService, IWorkbenchExtensionEnablementService } from 'vs/workbench/services/extensionManagement/common/extensionManagement';
import { IExtensionRecommendationsService } from 'vs/workbench/services/extensionRecommendations/common/extensionRecommendations';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IExtension, IExtensionsWorkbenchService, IWorkspaceRecommendedExtensionsView } from 'vs/workbench/contrib/extensions/common/extensions';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { IViewletViewOptions } from 'vs/workbench/browser/parts/views/viewsViewlet';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { ViewPane } from 'vs/workbench/browser/parts/views/viewPane';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { IExperimentService } from 'vs/workbench/contrib/experiments/common/experimentService';
import { CancellationToken } from 'vs/base/common/cancellation';
import { IProductService } from 'vs/platform/product/common/productService';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IViewDescriptorService } from 'vs/workbench/common/views';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { IPreferencesService } from 'vs/workbench/services/preferences/common/preferences';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IExtensionManifestPropertiesService } from 'vs/workbench/services/extensions/common/extensionManifestPropertiesService';
import { IWorkspaceTrustManagementService } from 'vs/platform/workspace/common/workspaceTrust';
import { IWorkbenchLayoutService } from 'vs/workbench/services/layout/browser/layoutService';
import { ILogService } from 'vs/platform/log/common/log';
export interface ExtensionsListViewOptions {
    server?: IExtensionManagementServer;
    flexibleHeight?: boolean;
    onDidChangeTitle?: Event<string>;
    hideBadge?: boolean;
}
declare const enum LocalSortBy {
    UpdateDate = "UpdateDate"
}
declare type SortBy = LocalSortBy | GallerySortBy;
declare type IQueryOptions = Omit<IGalleryQueryOptions, 'sortBy'> & {
    sortBy?: SortBy;
};
export declare class ExtensionsListView extends ViewPane {
    protected readonly options: ExtensionsListViewOptions;
    protected notificationService: INotificationService;
    private readonly extensionService;
    protected extensionsWorkbenchService: IExtensionsWorkbenchService;
    protected extensionRecommendationsService: IExtensionRecommendationsService;
    protected contextService: IWorkspaceContextService;
    private readonly experimentService;
    protected readonly extensionManagementServerService: IExtensionManagementServerService;
    private readonly extensionManifestPropertiesService;
    protected readonly extensionManagementService: IWorkbenchExtensionManagementService;
    protected readonly workspaceService: IWorkspaceContextService;
    protected readonly productService: IProductService;
    private readonly preferencesService;
    private readonly storageService;
    private readonly workspaceTrustManagementService;
    private readonly extensionEnablementService;
    private readonly layoutService;
    private readonly logService;
    private static RECENT_UPDATE_DURATION;
    private bodyTemplate;
    private badge;
    private list;
    private queryRequest;
    private queryResult;
    private readonly contextMenuActionRunner;
    constructor(options: ExtensionsListViewOptions, viewletViewOptions: IViewletViewOptions, notificationService: INotificationService, keybindingService: IKeybindingService, contextMenuService: IContextMenuService, instantiationService: IInstantiationService, themeService: IThemeService, extensionService: IExtensionService, extensionsWorkbenchService: IExtensionsWorkbenchService, extensionRecommendationsService: IExtensionRecommendationsService, telemetryService: ITelemetryService, configurationService: IConfigurationService, contextService: IWorkspaceContextService, experimentService: IExperimentService, extensionManagementServerService: IExtensionManagementServerService, extensionManifestPropertiesService: IExtensionManifestPropertiesService, extensionManagementService: IWorkbenchExtensionManagementService, workspaceService: IWorkspaceContextService, productService: IProductService, contextKeyService: IContextKeyService, viewDescriptorService: IViewDescriptorService, openerService: IOpenerService, preferencesService: IPreferencesService, storageService: IStorageService, workspaceTrustManagementService: IWorkspaceTrustManagementService, extensionEnablementService: IWorkbenchExtensionEnablementService, layoutService: IWorkbenchLayoutService, logService: ILogService);
    protected registerActions(): void;
    protected renderHeader(container: HTMLElement): void;
    renderBody(container: HTMLElement): void;
    protected layoutBody(height: number, width: number): void;
    show(query: string, refresh?: boolean): Promise<IPagedModel<IExtension>>;
    count(): number;
    protected showEmptyModel(): Promise<IPagedModel<IExtension>>;
    private onContextMenu;
    private query;
    private queryByIds;
    private queryLocal;
    private filterLocal;
    private filterBuiltinExtensions;
    private parseCategories;
    private filterInstalledExtensions;
    private filterOutdatedExtensions;
    private filterDisabledExtensions;
    private filterEnabledExtensions;
    private filterWorkspaceUnsupportedExtensions;
    private filterDeprecatedExtensions;
    private filterRecentlyUpdatedExtensions;
    private mergeAddedExtensions;
    private queryGallery;
    resetSearchExperiments(): void;
    private static searchExperiments;
    private getSearchExperiments;
    private sortExtensions;
    private getCuratedModel;
    private isRecommendationsQuery;
    private queryRecommendations;
    protected getInstallableRecommendations(recommendations: string[], options: IQueryOptions, token: CancellationToken): Promise<IExtension[]>;
    protected getWorkspaceRecommendations(): Promise<string[]>;
    private getWorkspaceRecommendationsModel;
    private getKeymapRecommendationsModel;
    private getLanguageRecommendationsModel;
    private getExeRecommendationsModel;
    private getOtherRecommendationsModel;
    private getOtherRecommendations;
    private getAllRecommendationsModel;
    private searchRecommendations;
    private setModel;
    private updateBody;
    private updateSize;
    private updateModel;
    private openExtension;
    private onError;
    private getPagedModel;
    dispose(): void;
    static isLocalExtensionsQuery(query: string, sortBy?: string): boolean;
    static isSearchBuiltInExtensionsQuery(query: string): boolean;
    static isBuiltInExtensionsQuery(query: string): boolean;
    static isBuiltInGroupExtensionsQuery(query: string): boolean;
    static isSearchWorkspaceUnsupportedExtensionsQuery(query: string): boolean;
    static isInstalledExtensionsQuery(query: string): boolean;
    static isOutdatedExtensionsQuery(query: string): boolean;
    static isEnabledExtensionsQuery(query: string): boolean;
    static isDisabledExtensionsQuery(query: string): boolean;
    static isSearchDeprecatedExtensionsQuery(query: string): boolean;
    static isRecommendedExtensionsQuery(query: string): boolean;
    static isSearchRecommendedExtensionsQuery(query: string): boolean;
    static isWorkspaceRecommendedExtensionsQuery(query: string): boolean;
    static isExeRecommendedExtensionsQuery(query: string): boolean;
    static isKeymapsRecommendedExtensionsQuery(query: string): boolean;
    static isLanguageRecommendedExtensionsQuery(query: string): boolean;
    static isSortInstalledExtensionsQuery(query: string, sortBy?: string): boolean;
    static isSearchPopularQuery(query: string): boolean;
    static isSearchRecentlyPublishedQuery(query: string): boolean;
    static isSearchRecentlyUpdatedQuery(query: string): boolean;
    static isSearchExtensionUpdatesQuery(query: string): boolean;
    static isSortUpdateDateQuery(query: string): boolean;
    focus(): void;
}
export declare class DefaultPopularExtensionsView extends ExtensionsListView {
    show(): Promise<IPagedModel<IExtension>>;
}
export declare class ServerInstalledExtensionsView extends ExtensionsListView {
    show(query: string): Promise<IPagedModel<IExtension>>;
}
export declare class EnabledExtensionsView extends ExtensionsListView {
    show(query: string): Promise<IPagedModel<IExtension>>;
}
export declare class DisabledExtensionsView extends ExtensionsListView {
    show(query: string): Promise<IPagedModel<IExtension>>;
}
export declare class OutdatedExtensionsView extends ExtensionsListView {
    show(query: string): Promise<IPagedModel<IExtension>>;
}
export declare class RecentlyUpdatedExtensionsView extends ExtensionsListView {
    show(query: string): Promise<IPagedModel<IExtension>>;
}
export declare class BuiltInFeatureExtensionsView extends ExtensionsListView {
    show(query: string): Promise<IPagedModel<IExtension>>;
}
export declare class BuiltInThemesExtensionsView extends ExtensionsListView {
    show(query: string): Promise<IPagedModel<IExtension>>;
}
export declare class BuiltInProgrammingLanguageExtensionsView extends ExtensionsListView {
    show(query: string): Promise<IPagedModel<IExtension>>;
}
export declare class UntrustedWorkspaceUnsupportedExtensionsView extends ExtensionsListView {
    show(query: string): Promise<IPagedModel<IExtension>>;
}
export declare class UntrustedWorkspacePartiallySupportedExtensionsView extends ExtensionsListView {
    show(query: string): Promise<IPagedModel<IExtension>>;
}
export declare class VirtualWorkspaceUnsupportedExtensionsView extends ExtensionsListView {
    show(query: string): Promise<IPagedModel<IExtension>>;
}
export declare class VirtualWorkspacePartiallySupportedExtensionsView extends ExtensionsListView {
    show(query: string): Promise<IPagedModel<IExtension>>;
}
export declare class DeprecatedExtensionsView extends ExtensionsListView {
    show(query: string): Promise<IPagedModel<IExtension>>;
}
export declare class SearchMarketplaceExtensionsView extends ExtensionsListView {
    private readonly reportSearchFinishedDelayer;
    private searchWaitPromise;
    show(query: string): Promise<IPagedModel<IExtension>>;
    private reportSearchFinished;
}
export declare class DefaultRecommendedExtensionsView extends ExtensionsListView {
    private readonly recommendedExtensionsQuery;
    renderBody(container: HTMLElement): void;
    show(query: string): Promise<IPagedModel<IExtension>>;
}
export declare class RecommendedExtensionsView extends ExtensionsListView {
    private readonly recommendedExtensionsQuery;
    renderBody(container: HTMLElement): void;
    show(query: string): Promise<IPagedModel<IExtension>>;
}
export declare class WorkspaceRecommendedExtensionsView extends ExtensionsListView implements IWorkspaceRecommendedExtensionsView {
    private readonly recommendedExtensionsQuery;
    renderBody(container: HTMLElement): void;
    show(query: string): Promise<IPagedModel<IExtension>>;
    private getInstallableWorkspaceRecommendations;
    installWorkspaceRecommendations(): Promise<void>;
}
export {};

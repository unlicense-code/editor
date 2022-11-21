import { IExtensionGalleryService } from 'vs/platform/extensionManagement/common/extensionManagement';
import { ExtensionRecommendations, ExtensionRecommendation } from 'vs/workbench/contrib/extensions/browser/extensionRecommendations';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { ILogService } from 'vs/platform/log/common/log';
import { IWorkspaceExtensionsConfigService } from 'vs/workbench/services/extensionRecommendations/common/workspaceExtensionsConfig';
export declare class WorkspaceRecommendations extends ExtensionRecommendations {
    private readonly workspaceExtensionsConfigService;
    private readonly galleryService;
    private readonly logService;
    private readonly notificationService;
    private _recommendations;
    get recommendations(): ReadonlyArray<ExtensionRecommendation>;
    private _onDidChangeRecommendations;
    readonly onDidChangeRecommendations: import("vs/base/common/event").Event<void>;
    private _ignoredRecommendations;
    get ignoredRecommendations(): ReadonlyArray<string>;
    constructor(workspaceExtensionsConfigService: IWorkspaceExtensionsConfigService, galleryService: IExtensionGalleryService, logService: ILogService, notificationService: INotificationService);
    protected doActivate(): Promise<void>;
    /**
     * Parse all extensions.json files, fetch workspace recommendations, filter out invalid and unwanted ones
     */
    private fetch;
    private validateExtensions;
    private onDidChangeExtensionsConfigs;
}

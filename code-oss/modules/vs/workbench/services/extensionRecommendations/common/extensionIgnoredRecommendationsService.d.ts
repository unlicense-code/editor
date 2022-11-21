import { Disposable } from 'vs/base/common/lifecycle';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IExtensionIgnoredRecommendationsService, IgnoredRecommendationChangeNotification } from 'vs/workbench/services/extensionRecommendations/common/extensionRecommendations';
import { IWorkspaceExtensionsConfigService } from 'vs/workbench/services/extensionRecommendations/common/workspaceExtensionsConfig';
export declare class ExtensionIgnoredRecommendationsService extends Disposable implements IExtensionIgnoredRecommendationsService {
    private readonly workspaceExtensionsConfigService;
    private readonly storageService;
    readonly _serviceBrand: undefined;
    private _onDidChangeIgnoredRecommendations;
    readonly onDidChangeIgnoredRecommendations: import("vs/base/common/event").Event<void>;
    private _globalIgnoredRecommendations;
    get globalIgnoredRecommendations(): string[];
    private _onDidChangeGlobalIgnoredRecommendation;
    readonly onDidChangeGlobalIgnoredRecommendation: import("vs/base/common/event").Event<IgnoredRecommendationChangeNotification>;
    private ignoredWorkspaceRecommendations;
    get ignoredRecommendations(): string[];
    constructor(workspaceExtensionsConfigService: IWorkspaceExtensionsConfigService, storageService: IStorageService);
    private initIgnoredWorkspaceRecommendations;
    toggleGlobalIgnoredRecommendation(extensionId: string, shouldIgnore: boolean): void;
    private getCachedIgnoredRecommendations;
    private onDidStorageChange;
    private storeCachedIgnoredRecommendations;
    private _ignoredRecommendationsValue;
    private get ignoredRecommendationsValue();
    private set ignoredRecommendationsValue(value);
    private getStoredIgnoredRecommendationsValue;
    private setStoredIgnoredRecommendationsValue;
}

import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IExtensionRecommendationNotificationService, RecommendationsNotificationResult, RecommendationSource } from 'vs/platform/extensionRecommendations/common/extensionRecommendations';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IUserDataSyncEnablementService } from 'vs/platform/userDataSync/common/userDataSync';
import { IExtensionsWorkbenchService } from 'vs/workbench/contrib/extensions/common/extensions';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { IWorkbenchExtensionManagementService, IWorkbenchExtensionEnablementService } from 'vs/workbench/services/extensionManagement/common/extensionManagement';
import { IExtensionIgnoredRecommendationsService } from 'vs/workbench/services/extensionRecommendations/common/extensionRecommendations';
export declare class ExtensionRecommendationNotificationService implements IExtensionRecommendationNotificationService {
    private readonly configurationService;
    private readonly storageService;
    private readonly notificationService;
    private readonly telemetryService;
    private readonly instantiationService;
    private readonly extensionsWorkbenchService;
    private readonly extensionManagementService;
    private readonly extensionEnablementService;
    private readonly extensionIgnoredRecommendationsService;
    private readonly userDataSyncEnablementService;
    private readonly workbenchEnvironmentService;
    readonly _serviceBrand: undefined;
    get ignoredRecommendations(): string[];
    private recommendedExtensions;
    private recommendationSources;
    private hideVisibleNotificationPromise;
    private visibleNotification;
    private pendingNotificaitons;
    constructor(configurationService: IConfigurationService, storageService: IStorageService, notificationService: INotificationService, telemetryService: ITelemetryService, instantiationService: IInstantiationService, extensionsWorkbenchService: IExtensionsWorkbenchService, extensionManagementService: IWorkbenchExtensionManagementService, extensionEnablementService: IWorkbenchExtensionEnablementService, extensionIgnoredRecommendationsService: IExtensionIgnoredRecommendationsService, userDataSyncEnablementService: IUserDataSyncEnablementService, workbenchEnvironmentService: IWorkbenchEnvironmentService);
    hasToIgnoreRecommendationNotifications(): boolean;
    promptImportantExtensionsInstallNotification(extensionIds: string[], message: string, searchValue: string, source: RecommendationSource): Promise<RecommendationsNotificationResult>;
    promptWorkspaceRecommendations(recommendations: string[]): Promise<void>;
    private promptRecommendationsNotification;
    private showRecommendationsNotification;
    private waitUntilRecommendationsAreInstalled;
    /**
     * Show recommendations in Queue
     * At any time only one recommendation is shown
     * If a new recommendation comes in
     * 		=> If no recommendation is visible, show it immediately
     *		=> Otherwise, add to the pending queue
     * 			=> If it is not exe based and has higher or same priority as current, hide the current notification after showing it for 3s.
     * 			=> Otherwise wait until the current notification is hidden.
     */
    private doShowRecommendationsNotification;
    private showNextNotification;
    /**
     * Return the recent high priroity pending notification
     */
    private getNextPendingNotificationIndex;
    private hideVisibleNotification;
    private unsetVisibileNotification;
    private getInstallableExtensions;
    private runAction;
    private addToImportantRecommendationsIgnore;
    private setIgnoreRecommendationsConfig;
}

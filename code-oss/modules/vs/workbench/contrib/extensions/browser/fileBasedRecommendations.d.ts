import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { ExtensionRecommendations, ExtensionRecommendation } from 'vs/workbench/contrib/extensions/browser/extensionRecommendations';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { IExtensionManagementServerService } from 'vs/workbench/services/extensionManagement/common/extensionManagement';
import { IExtensionIgnoredRecommendationsService } from 'vs/workbench/services/extensionRecommendations/common/extensionRecommendations';
import { IExtensionsWorkbenchService } from 'vs/workbench/contrib/extensions/common/extensions';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IProductService } from 'vs/platform/product/common/productService';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { IModelService } from 'vs/editor/common/services/model';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { IExtensionRecommendationNotificationService } from 'vs/platform/extensionRecommendations/common/extensionRecommendations';
import { IWorkbenchAssignmentService } from 'vs/workbench/services/assignment/common/assignmentService';
import { IPaneCompositePartService } from 'vs/workbench/services/panecomposite/browser/panecomposite';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
export declare class FileBasedRecommendations extends ExtensionRecommendations {
    private readonly extensionsWorkbenchService;
    private readonly extensionService;
    private readonly paneCompositeService;
    private readonly modelService;
    private readonly languageService;
    private readonly notificationService;
    private readonly telemetryService;
    private readonly storageService;
    private readonly extensionRecommendationNotificationService;
    private readonly extensionIgnoredRecommendationsService;
    private readonly tasExperimentService;
    private readonly workspaceContextService;
    private readonly extensionManagementServerService;
    private readonly extensionTips;
    private readonly importantExtensionTips;
    private readonly fileBasedRecommendationsByPattern;
    private readonly fileBasedRecommendationsByLanguage;
    private readonly fileBasedRecommendations;
    private readonly processedFileExtensions;
    private readonly processedLanguages;
    get recommendations(): ReadonlyArray<ExtensionRecommendation>;
    get importantRecommendations(): ReadonlyArray<ExtensionRecommendation>;
    get otherRecommendations(): ReadonlyArray<ExtensionRecommendation>;
    constructor(extensionsWorkbenchService: IExtensionsWorkbenchService, extensionService: IExtensionService, paneCompositeService: IPaneCompositePartService, modelService: IModelService, languageService: ILanguageService, productService: IProductService, notificationService: INotificationService, telemetryService: ITelemetryService, storageService: IStorageService, extensionRecommendationNotificationService: IExtensionRecommendationNotificationService, extensionIgnoredRecommendationsService: IExtensionIgnoredRecommendationsService, tasExperimentService: IWorkbenchAssignmentService, workspaceContextService: IWorkspaceContextService, extensionManagementServerService: IExtensionManagementServerService);
    protected doActivate(): Promise<void>;
    private onModelAdded;
    /**
     * Prompt the user to either install the recommended extension for the file type in the current editor model
     * or prompt to search the marketplace if it has extensions that can support the file type
     */
    private promptRecommendationsForModel;
    private promptRecommendations;
    private promptRecommendedExtensionForFileType;
    private getPromptedRecommendations;
    private addToPromptedRecommendations;
    private getPromptedFileExtensions;
    private addToPromptedFileExtensions;
    private promptRecommendedExtensionForFileExtension;
    private filterIgnoredOrNotAllowed;
    private filterInstalled;
    private getCachedRecommendations;
    private storeCachedRecommendations;
}

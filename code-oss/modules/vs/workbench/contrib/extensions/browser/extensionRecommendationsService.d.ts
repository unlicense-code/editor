import { Disposable } from 'vs/base/common/lifecycle';
import { IExtensionManagementService, IExtensionGalleryService } from 'vs/platform/extensionManagement/common/extensionManagement';
import { IExtensionRecommendationsService, ExtensionRecommendationReason, IExtensionIgnoredRecommendationsService } from 'vs/workbench/services/extensionRecommendations/common/extensionRecommendations';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { Event } from 'vs/base/common/event';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { ILifecycleService } from 'vs/workbench/services/lifecycle/common/lifecycle';
import { IExtensionRecommendationNotificationService } from 'vs/platform/extensionRecommendations/common/extensionRecommendations';
import { IExtensionsWorkbenchService } from 'vs/workbench/contrib/extensions/common/extensions';
export declare class ExtensionRecommendationsService extends Disposable implements IExtensionRecommendationsService {
    private readonly lifecycleService;
    private readonly galleryService;
    private readonly telemetryService;
    private readonly environmentService;
    private readonly extensionManagementService;
    private readonly extensionRecommendationsManagementService;
    private readonly extensionRecommendationNotificationService;
    private readonly extensionsWorkbenchService;
    readonly _serviceBrand: undefined;
    private readonly fileBasedRecommendations;
    private readonly workspaceRecommendations;
    private readonly experimentalRecommendations;
    private readonly configBasedRecommendations;
    private readonly exeBasedRecommendations;
    private readonly dynamicWorkspaceRecommendations;
    private readonly keymapRecommendations;
    private readonly webRecommendations;
    private readonly languageRecommendations;
    readonly activationPromise: Promise<void>;
    private sessionSeed;
    private _onDidChangeRecommendations;
    readonly onDidChangeRecommendations: Event<void>;
    constructor(instantiationService: IInstantiationService, lifecycleService: ILifecycleService, galleryService: IExtensionGalleryService, telemetryService: ITelemetryService, environmentService: IEnvironmentService, extensionManagementService: IExtensionManagementService, extensionRecommendationsManagementService: IExtensionIgnoredRecommendationsService, extensionRecommendationNotificationService: IExtensionRecommendationNotificationService, extensionsWorkbenchService: IExtensionsWorkbenchService);
    private activate;
    private isEnabled;
    private activateProactiveRecommendations;
    getAllRecommendationsWithReason(): {
        [id: string]: {
            reasonId: ExtensionRecommendationReason;
            reasonText: string;
        };
    };
    getConfigBasedRecommendations(): Promise<{
        important: string[];
        others: string[];
    }>;
    getOtherRecommendations(): Promise<string[]>;
    getImportantRecommendations(): Promise<string[]>;
    getKeymapRecommendations(): string[];
    getLanguageRecommendations(): string[];
    getWorkspaceRecommendations(): Promise<string[]>;
    getExeBasedRecommendations(exe?: string): Promise<{
        important: string[];
        others: string[];
    }>;
    getFileBasedRecommendations(): string[];
    private onDidInstallExtensions;
    private toExtensionRecommendations;
    private isExtensionAllowedToBeRecommended;
    protected get workbenchRecommendationDelay(): number;
    private promptWorkspaceRecommendations;
}

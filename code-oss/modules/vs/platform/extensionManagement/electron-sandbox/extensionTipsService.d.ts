import { INativeEnvironmentService } from 'vs/platform/environment/common/environment';
import { IExecutableBasedExtensionTip, IExtensionManagementService } from 'vs/platform/extensionManagement/common/extensionManagement';
import { ExtensionTipsService as BaseExtensionTipsService } from 'vs/platform/extensionManagement/common/extensionTipsService';
import { IExtensionRecommendationNotificationService } from 'vs/platform/extensionRecommendations/common/extensionRecommendations';
import { IFileService } from 'vs/platform/files/common/files';
import { ILogService } from 'vs/platform/log/common/log';
import { INativeHostService } from 'vs/platform/native/electron-sandbox/native';
import { IProductService } from 'vs/platform/product/common/productService';
import { IRequestService } from 'vs/platform/request/common/request';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
export declare class ExtensionTipsService extends BaseExtensionTipsService {
    private readonly environmentService;
    private readonly telemetryService;
    private readonly extensionManagementService;
    private readonly storageService;
    private readonly nativeHostService;
    private readonly extensionRecommendationNotificationService;
    private readonly highImportanceExecutableTips;
    private readonly mediumImportanceExecutableTips;
    private readonly allOtherExecutableTips;
    private highImportanceTipsByExe;
    private mediumImportanceTipsByExe;
    constructor(environmentService: INativeEnvironmentService, telemetryService: ITelemetryService, extensionManagementService: IExtensionManagementService, storageService: IStorageService, nativeHostService: INativeHostService, extensionRecommendationNotificationService: IExtensionRecommendationNotificationService, fileService: IFileService, productService: IProductService, requestService: IRequestService, logService: ILogService);
    getImportantExecutableBasedTips(): Promise<IExecutableBasedExtensionTip[]>;
    getOtherExecutableBasedTips(): Promise<IExecutableBasedExtensionTip[]>;
    private collectTips;
    private groupImportantTipsByExe;
    /**
     * High importance tips are prompted once per restart session
     */
    private promptHighImportanceExeBasedTip;
    /**
     * Medium importance tips are prompted once per 7 days
     */
    private promptMediumImportanceExeBasedTip;
    private promptExeRecommendations;
    private getLastPromptedMediumExeTime;
    private updateLastPromptedMediumExeTime;
    private getPromptedExecutableTips;
    private addToRecommendedExecutables;
    private groupByInstalled;
    private getValidExecutableBasedExtensionTips;
}

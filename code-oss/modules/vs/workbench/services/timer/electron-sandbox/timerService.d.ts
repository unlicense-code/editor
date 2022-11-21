import { INativeHostService } from 'vs/platform/native/electron-sandbox/native';
import { INativeWorkbenchEnvironmentService } from 'vs/workbench/services/environment/electron-sandbox/environmentService';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { IUpdateService } from 'vs/platform/update/common/update';
import { ILifecycleService } from 'vs/workbench/services/lifecycle/common/lifecycle';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IAccessibilityService } from 'vs/platform/accessibility/common/accessibility';
import { IStartupMetrics, AbstractTimerService, Writeable } from 'vs/workbench/services/timer/browser/timerService';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IWorkbenchLayoutService } from 'vs/workbench/services/layout/browser/layoutService';
import { IProductService } from 'vs/platform/product/common/productService';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IPaneCompositePartService } from 'vs/workbench/services/panecomposite/browser/panecomposite';
export declare class TimerService extends AbstractTimerService {
    private readonly _nativeHostService;
    private readonly _environmentService;
    private readonly _productService;
    private readonly _storageService;
    constructor(_nativeHostService: INativeHostService, _environmentService: INativeWorkbenchEnvironmentService, lifecycleService: ILifecycleService, contextService: IWorkspaceContextService, extensionService: IExtensionService, updateService: IUpdateService, paneCompositeService: IPaneCompositePartService, editorService: IEditorService, accessibilityService: IAccessibilityService, telemetryService: ITelemetryService, layoutService: IWorkbenchLayoutService, _productService: IProductService, _storageService: IStorageService);
    protected _isInitialStartup(): boolean;
    protected _didUseCachedData(): boolean;
    protected _getWindowCount(): Promise<number>;
    protected _extendStartupInfo(info: Writeable<IStartupMetrics>): Promise<void>;
}
export declare function didUseCachedData(productService: IProductService, storageService: IStorageService, environmentService: INativeWorkbenchEnvironmentService): boolean;

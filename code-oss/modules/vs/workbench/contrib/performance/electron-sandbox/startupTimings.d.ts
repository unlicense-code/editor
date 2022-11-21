import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
import { INativeWorkbenchEnvironmentService } from 'vs/workbench/services/environment/electron-sandbox/environmentService';
import { ILifecycleService } from 'vs/workbench/services/lifecycle/common/lifecycle';
import { IProductService } from 'vs/platform/product/common/productService';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IUpdateService } from 'vs/platform/update/common/update';
import { INativeHostService } from 'vs/platform/native/electron-sandbox/native';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { ITimerService } from 'vs/workbench/services/timer/browser/timerService';
import { IFileService } from 'vs/platform/files/common/files';
import { IWorkspaceTrustManagementService } from 'vs/platform/workspace/common/workspaceTrust';
import { IPaneCompositePartService } from 'vs/workbench/services/panecomposite/browser/panecomposite';
export declare class StartupTimings implements IWorkbenchContribution {
    private readonly _fileService;
    private readonly _timerService;
    private readonly _nativeHostService;
    private readonly _editorService;
    private readonly _paneCompositeService;
    private readonly _telemetryService;
    private readonly _lifecycleService;
    private readonly _updateService;
    private readonly _environmentService;
    private readonly _productService;
    private readonly _workspaceTrustService;
    constructor(_fileService: IFileService, _timerService: ITimerService, _nativeHostService: INativeHostService, _editorService: IEditorService, _paneCompositeService: IPaneCompositePartService, _telemetryService: ITelemetryService, _lifecycleService: ILifecycleService, _updateService: IUpdateService, _environmentService: INativeWorkbenchEnvironmentService, _productService: IProductService, _workspaceTrustService: IWorkspaceTrustManagementService);
    private _report;
    private _appendStartupTimes;
    private _isStandardStartup;
}

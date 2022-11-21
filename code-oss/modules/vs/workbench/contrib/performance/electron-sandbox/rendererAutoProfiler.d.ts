import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IFileService } from 'vs/platform/files/common/files';
import { ILogService } from 'vs/platform/log/common/log';
import { INativeHostService } from 'vs/platform/native/electron-sandbox/native';
import { IProfileAnalysisWorkerService } from 'vs/platform/profiling/electron-sandbox/profileAnalysisWorkerService';
import { INativeWorkbenchEnvironmentService } from 'vs/workbench/services/environment/electron-sandbox/environmentService';
import { ITimerService } from 'vs/workbench/services/timer/browser/timerService';
export declare class RendererProfiling {
    private readonly _environmentService;
    private readonly _fileService;
    private readonly _logService;
    private _observer?;
    constructor(_environmentService: INativeWorkbenchEnvironmentService, _fileService: IFileService, _logService: ILogService, nativeHostService: INativeHostService, timerService: ITimerService, configService: IConfigurationService, profileAnalysisService: IProfileAnalysisWorkerService);
    dispose(): void;
    private _store;
}

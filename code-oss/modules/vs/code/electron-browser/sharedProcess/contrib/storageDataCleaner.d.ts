import { Disposable } from 'vs/base/common/lifecycle';
import { INativeEnvironmentService } from 'vs/platform/environment/common/environment';
import { IMainProcessService } from 'vs/platform/ipc/electron-sandbox/services';
import { ILogService } from 'vs/platform/log/common/log';
import { INativeHostService } from 'vs/platform/native/electron-sandbox/native';
export declare class UnusedWorkspaceStorageDataCleaner extends Disposable {
    private readonly environmentService;
    private readonly logService;
    private readonly nativeHostService;
    private readonly mainProcessService;
    constructor(environmentService: INativeEnvironmentService, logService: ILogService, nativeHostService: INativeHostService, mainProcessService: IMainProcessService);
    private cleanUpStorage;
}

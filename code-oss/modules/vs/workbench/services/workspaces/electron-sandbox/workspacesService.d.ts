import { IWorkspacesService } from 'vs/platform/workspaces/common/workspaces';
import { IMainProcessService } from 'vs/platform/ipc/electron-sandbox/services';
import { INativeHostService } from 'vs/platform/native/electron-sandbox/native';
export declare class NativeWorkspacesService implements IWorkspacesService {
    readonly _serviceBrand: undefined;
    constructor(mainProcessService: IMainProcessService, nativeHostService: INativeHostService);
}

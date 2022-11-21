import { IMainProcessService } from 'vs/platform/ipc/electron-sandbox/services';
import { INativeHostService } from 'vs/platform/native/electron-sandbox/native';
export declare class NativeHostService implements INativeHostService {
    readonly windowId: number;
    readonly _serviceBrand: undefined;
    constructor(windowId: number, mainProcessService: IMainProcessService);
}

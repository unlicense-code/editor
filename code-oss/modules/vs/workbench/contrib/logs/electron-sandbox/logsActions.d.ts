import { Action } from 'vs/base/common/actions';
import { INativeHostService } from 'vs/platform/native/electron-sandbox/native';
import { INativeWorkbenchEnvironmentService } from 'vs/workbench/services/environment/electron-sandbox/environmentService';
import { IFileService } from 'vs/platform/files/common/files';
export declare class OpenLogsFolderAction extends Action {
    private readonly environmentService;
    private readonly nativeHostService;
    static readonly ID = "workbench.action.openLogsFolder";
    static readonly TITLE: {
        value: string;
        original: string;
    };
    constructor(id: string, label: string, environmentService: INativeWorkbenchEnvironmentService, nativeHostService: INativeHostService);
    run(): Promise<void>;
}
export declare class OpenExtensionLogsFolderAction extends Action {
    private readonly environmentSerice;
    private readonly fileService;
    private readonly nativeHostService;
    static readonly ID = "workbench.action.openExtensionLogsFolder";
    static readonly TITLE: {
        value: string;
        original: string;
    };
    constructor(id: string, label: string, environmentSerice: INativeWorkbenchEnvironmentService, fileService: IFileService, nativeHostService: INativeHostService);
    run(): Promise<void>;
}

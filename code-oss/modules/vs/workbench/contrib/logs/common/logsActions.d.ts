import { Action } from 'vs/base/common/actions';
import { ILogService } from 'vs/platform/log/common/log';
import { IQuickInputService } from 'vs/platform/quickinput/common/quickInput';
import { IFileService } from 'vs/platform/files/common/files';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IOutputService } from 'vs/workbench/services/output/common/output';
import { ILogLevelService } from 'vs/workbench/contrib/logs/common/logLevelService';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
export declare class SetLogLevelAction extends Action {
    private readonly quickInputService;
    private readonly logService;
    private readonly logLevelService;
    private readonly outputService;
    private readonly environmentService;
    static readonly ID = "workbench.action.setLogLevel";
    static readonly TITLE: {
        value: string;
        original: string;
    };
    constructor(id: string, label: string, quickInputService: IQuickInputService, logService: ILogService, logLevelService: ILogLevelService, outputService: IOutputService, environmentService: IEnvironmentService);
    run(): Promise<void>;
    private selectLogLevelOrChannel;
    private setLogLevelForChannel;
    private getLogLevelEntries;
    private getLabel;
    private getDescription;
    private getDefaultLogLevel;
}
export declare class OpenWindowSessionLogFileAction extends Action {
    private readonly environmentService;
    private readonly fileService;
    private readonly quickInputService;
    private readonly editorService;
    static readonly ID = "workbench.action.openSessionLogFile";
    static readonly TITLE: {
        value: string;
        original: string;
    };
    constructor(id: string, label: string, environmentService: IWorkbenchEnvironmentService, fileService: IFileService, quickInputService: IQuickInputService, editorService: IEditorService);
    run(): Promise<void>;
    private getSessions;
    private getLogFiles;
}

import { IProcessEnvironment } from 'vs/base/common/platform';
import { IDiagnosticsService } from 'vs/platform/diagnostics/common/diagnostics';
import { IDiagnosticsMainService } from 'vs/platform/diagnostics/electron-main/diagnosticsMainService';
import { IDialogMainService } from 'vs/platform/dialogs/electron-main/dialogMainService';
import { IEnvironmentMainService } from 'vs/platform/environment/electron-main/environmentMainService';
import { ICommonIssueService, IssueReporterData, ProcessExplorerData } from 'vs/platform/issue/common/issue';
import { ILogService } from 'vs/platform/log/common/log';
import { INativeHostMainService } from 'vs/platform/native/electron-main/nativeHostMainService';
import { IProductService } from 'vs/platform/product/common/productService';
import { IProtocolMainService } from 'vs/platform/protocol/electron-main/protocol';
export declare const IIssueMainService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IIssueMainService>;
export interface IIssueMainService extends ICommonIssueService {
    stopTracing(): Promise<void>;
}
export declare class IssueMainService implements IIssueMainService {
    private userEnv;
    private readonly environmentMainService;
    private readonly logService;
    private readonly diagnosticsService;
    private readonly diagnosticsMainService;
    private readonly dialogMainService;
    private readonly nativeHostMainService;
    private readonly protocolMainService;
    private readonly productService;
    readonly _serviceBrand: undefined;
    private static readonly DEFAULT_BACKGROUND_COLOR;
    private issueReporterWindow;
    private issueReporterParentWindow;
    private processExplorerWindow;
    private processExplorerParentWindow;
    constructor(userEnv: IProcessEnvironment, environmentMainService: IEnvironmentMainService, logService: ILogService, diagnosticsService: IDiagnosticsService, diagnosticsMainService: IDiagnosticsMainService, dialogMainService: IDialogMainService, nativeHostMainService: INativeHostMainService, protocolMainService: IProtocolMainService, productService: IProductService);
    private registerListeners;
    private safeSend;
    openReporter(data: IssueReporterData): Promise<void>;
    openProcessExplorer(data: ProcessExplorerData): Promise<void>;
    private focusWindow;
    private createBrowserWindow;
    getSystemStatus(): Promise<string>;
    private getWindowPosition;
    private getPerformanceInfo;
    stopTracing(): Promise<void>;
}

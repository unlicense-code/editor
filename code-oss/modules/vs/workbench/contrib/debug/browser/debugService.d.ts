import { Event } from 'vs/base/common/event';
import { URI as uri } from 'vs/base/common/uri';
import { ITextModel } from 'vs/editor/common/model';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IExtensionHostDebugService } from 'vs/platform/debug/common/extensionHostDebug';
import { IDialogService } from 'vs/platform/dialogs/common/dialogs';
import { IFileService } from 'vs/platform/files/common/files';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { IQuickInputService } from 'vs/platform/quickinput/common/quickInput';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { IWorkspaceTrustRequestService } from 'vs/platform/workspace/common/workspaceTrust';
import { IViewDescriptorService, IViewsService } from 'vs/workbench/common/views';
import { IAdapterManager, IBreakpoint, IBreakpointData, IConfig, IConfigurationManager, IDebugModel, IDebugService, IDebugSession, IDebugSessionOptions, IEnablement, IExceptionBreakpoint, ILaunch, IStackFrame, IThread, IViewModel, State } from 'vs/workbench/contrib/debug/common/debug';
import { IActivityService } from 'vs/workbench/services/activity/common/activity';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { IWorkbenchLayoutService } from 'vs/workbench/services/layout/browser/layoutService';
import { ILifecycleService } from 'vs/workbench/services/lifecycle/common/lifecycle';
import { IPaneCompositePartService } from 'vs/workbench/services/panecomposite/browser/panecomposite';
export declare class DebugService implements IDebugService {
    private readonly editorService;
    private readonly paneCompositeService;
    private readonly viewsService;
    private readonly viewDescriptorService;
    private readonly notificationService;
    private readonly dialogService;
    private readonly layoutService;
    private readonly contextService;
    private readonly contextKeyService;
    private readonly lifecycleService;
    private readonly instantiationService;
    private readonly extensionService;
    private readonly fileService;
    private readonly configurationService;
    private readonly extensionHostDebugService;
    private readonly activityService;
    private readonly commandService;
    private readonly quickInputService;
    private readonly workspaceTrustRequestService;
    private readonly uriIdentityService;
    readonly _serviceBrand: undefined;
    private readonly _onDidChangeState;
    private readonly _onDidNewSession;
    private readonly _onWillNewSession;
    private readonly _onDidEndSession;
    private debugStorage;
    private model;
    private viewModel;
    private telemetry;
    private taskRunner;
    private configurationManager;
    private adapterManager;
    private disposables;
    private debugType;
    private debugState;
    private inDebugMode;
    private debugUx;
    private breakpointsExist;
    private disassemblyViewFocus;
    private breakpointsToSendOnResourceSaved;
    private initializing;
    private _initializingOptions;
    private previousState;
    private sessionCancellationTokens;
    private activity;
    private chosenEnvironments;
    private haveDoneLazySetup;
    constructor(editorService: IEditorService, paneCompositeService: IPaneCompositePartService, viewsService: IViewsService, viewDescriptorService: IViewDescriptorService, notificationService: INotificationService, dialogService: IDialogService, layoutService: IWorkbenchLayoutService, contextService: IWorkspaceContextService, contextKeyService: IContextKeyService, lifecycleService: ILifecycleService, instantiationService: IInstantiationService, extensionService: IExtensionService, fileService: IFileService, configurationService: IConfigurationService, extensionHostDebugService: IExtensionHostDebugService, activityService: IActivityService, commandService: ICommandService, quickInputService: IQuickInputService, workspaceTrustRequestService: IWorkspaceTrustRequestService, uriIdentityService: IUriIdentityService);
    private initContextKeys;
    getModel(): IDebugModel;
    getViewModel(): IViewModel;
    getConfigurationManager(): IConfigurationManager;
    getAdapterManager(): IAdapterManager;
    sourceIsNotAvailable(uri: uri): void;
    dispose(): void;
    get state(): State;
    get initializingOptions(): IDebugSessionOptions | undefined;
    private startInitializingState;
    private endInitializingState;
    private cancelTokens;
    private onStateChange;
    get onDidChangeState(): Event<State>;
    get onDidNewSession(): Event<IDebugSession>;
    get onWillNewSession(): Event<IDebugSession>;
    get onDidEndSession(): Event<IDebugSession>;
    private lazySetup;
    /**
     * main entry point
     * properly manages compounds, checks for errors and handles the initializing state.
     */
    startDebugging(launch: ILaunch | undefined, configOrName?: IConfig | string, options?: IDebugSessionOptions, saveBeforeStart?: boolean): Promise<boolean>;
    /**
     * gets the debugger for the type, resolves configurations by providers, substitutes variables and runs prelaunch tasks
     */
    private createSession;
    /**
     * instantiates the new session, initializes the session, registers session listeners and reports telemetry
     */
    private doCreateSession;
    private launchOrAttachToSession;
    private registerSessionListeners;
    restartSession(session: IDebugSession, restartData?: any): Promise<any>;
    stopSession(session: IDebugSession | undefined, disconnect?: boolean, suspend?: boolean): Promise<any>;
    private substituteVariables;
    private showError;
    focusStackFrame(_stackFrame: IStackFrame | undefined, _thread?: IThread, _session?: IDebugSession, options?: {
        explicit?: boolean;
        preserveFocus?: boolean;
        sideBySide?: boolean;
        pinned?: boolean;
    }): Promise<void>;
    addWatchExpression(name?: string): void;
    renameWatchExpression(id: string, newName: string): void;
    moveWatchExpression(id: string, position: number): void;
    removeWatchExpressions(id?: string): void;
    canSetBreakpointsIn(model: ITextModel): boolean;
    enableOrDisableBreakpoints(enable: boolean, breakpoint?: IEnablement): Promise<void>;
    addBreakpoints(uri: uri, rawBreakpoints: IBreakpointData[], ariaAnnounce?: boolean): Promise<IBreakpoint[]>;
    updateBreakpoints(uri: uri, data: Map<string, DebugProtocol.Breakpoint>, sendOnResourceSaved: boolean): Promise<void>;
    removeBreakpoints(id?: string): Promise<void>;
    setBreakpointsActivated(activated: boolean): Promise<void>;
    addFunctionBreakpoint(name?: string, id?: string): void;
    updateFunctionBreakpoint(id: string, update: {
        name?: string;
        hitCondition?: string;
        condition?: string;
    }): Promise<void>;
    removeFunctionBreakpoints(id?: string): Promise<void>;
    addDataBreakpoint(label: string, dataId: string, canPersist: boolean, accessTypes: DebugProtocol.DataBreakpointAccessType[] | undefined, accessType: DebugProtocol.DataBreakpointAccessType): Promise<void>;
    removeDataBreakpoints(id?: string): Promise<void>;
    addInstructionBreakpoint(address: string, offset: number, condition?: string, hitCondition?: string): Promise<void>;
    removeInstructionBreakpoints(address?: string): Promise<void>;
    setExceptionBreakpoints(data: DebugProtocol.ExceptionBreakpointsFilter[]): void;
    setExceptionBreakpointCondition(exceptionBreakpoint: IExceptionBreakpoint, condition: string | undefined): Promise<void>;
    sendAllBreakpoints(session?: IDebugSession): Promise<any>;
    private sendBreakpoints;
    private sendFunctionBreakpoints;
    private sendDataBreakpoints;
    private sendInstructionBreakpoints;
    private sendExceptionBreakpoints;
    private onFileChanges;
    runTo(uri: uri, lineNumber: number, column?: number): Promise<void>;
    private addAndValidateBreakpoints;
}
export declare function getStackFrameThreadAndSessionToFocus(model: IDebugModel, stackFrame: IStackFrame | undefined, thread?: IThread, session?: IDebugSession, avoidSession?: IDebugSession): {
    stackFrame: IStackFrame | undefined;
    thread: IThread | undefined;
    session: IDebugSession | undefined;
};

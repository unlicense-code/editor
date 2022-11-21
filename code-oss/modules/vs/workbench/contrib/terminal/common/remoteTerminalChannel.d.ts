import { Event } from 'vs/base/common/event';
import { URI, UriComponents } from 'vs/base/common/uri';
import { IChannel } from 'vs/base/parts/ipc/common/ipc';
import { IWorkbenchConfigurationService } from 'vs/workbench/services/configuration/common/configuration';
import { ILogService } from 'vs/platform/log/common/log';
import { IRemoteAuthorityResolverService } from 'vs/platform/remote/common/remoteAuthorityResolver';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { IConfigurationResolverService } from 'vs/workbench/services/configurationResolver/common/configurationResolver';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { ILabelService } from 'vs/platform/label/common/label';
import { IEnvironmentVariableService, ISerializableEnvironmentVariableCollection } from 'vs/workbench/contrib/terminal/common/environmentVariable';
import { IProcessDataEvent, IRequestResolveVariablesEvent, IShellLaunchConfigDto, ITerminalLaunchError, ITerminalProfile, ITerminalsLayoutInfo, ITerminalsLayoutInfoById, TerminalIcon, IProcessProperty, ProcessPropertyType, IProcessPropertyMap, TitleEventSource, ISerializedTerminalState, IPtyHostController, ITerminalProcessOptions } from 'vs/platform/terminal/common/terminal';
import { IProcessDetails } from 'vs/platform/terminal/common/terminalProcess';
import { IProcessEnvironment, OperatingSystem } from 'vs/base/common/platform';
import { ICompleteTerminalConfiguration } from 'vs/workbench/contrib/terminal/common/terminal';
import { IPtyHostProcessReplayEvent } from 'vs/platform/terminal/common/capabilities/capabilities';
export declare const REMOTE_TERMINAL_CHANNEL_NAME = "remoteterminal";
export declare type ITerminalEnvironmentVariableCollections = [string, ISerializableEnvironmentVariableCollection][];
export interface IWorkspaceFolderData {
    uri: UriComponents;
    name: string;
    index: number;
}
export interface ICreateTerminalProcessArguments {
    configuration: ICompleteTerminalConfiguration;
    resolvedVariables: {
        [name: string]: string;
    };
    envVariableCollections: ITerminalEnvironmentVariableCollections;
    shellLaunchConfig: IShellLaunchConfigDto;
    workspaceId: string;
    workspaceName: string;
    workspaceFolders: IWorkspaceFolderData[];
    activeWorkspaceFolder: IWorkspaceFolderData | null;
    activeFileResource: UriComponents | undefined;
    shouldPersistTerminal: boolean;
    options: ITerminalProcessOptions;
    cols: number;
    rows: number;
    unicodeVersion: '6' | '11';
    resolverEnv: {
        [key: string]: string | null;
    } | undefined;
}
export interface ICreateTerminalProcessResult {
    persistentTerminalId: number;
    resolvedShellLaunchConfig: IShellLaunchConfigDto;
}
export declare class RemoteTerminalChannelClient implements IPtyHostController {
    private readonly _remoteAuthority;
    private readonly _channel;
    private readonly _configurationService;
    private readonly _workspaceContextService;
    private readonly _resolverService;
    private readonly _environmentVariableService;
    private readonly _remoteAuthorityResolverService;
    private readonly _logService;
    private readonly _editorService;
    private readonly _labelService;
    get onPtyHostExit(): Event<number>;
    get onPtyHostStart(): Event<void>;
    get onPtyHostUnresponsive(): Event<void>;
    get onPtyHostResponsive(): Event<void>;
    get onPtyHostRequestResolveVariables(): Event<IRequestResolveVariablesEvent>;
    get onProcessData(): Event<{
        id: number;
        event: IProcessDataEvent | string;
    }>;
    get onProcessExit(): Event<{
        id: number;
        event: number | undefined;
    }>;
    get onProcessReady(): Event<{
        id: number;
        event: {
            pid: number;
            cwd: string;
            requireWindowsMode?: boolean;
        };
    }>;
    get onProcessReplay(): Event<{
        id: number;
        event: IPtyHostProcessReplayEvent;
    }>;
    get onProcessOrphanQuestion(): Event<{
        id: number;
    }>;
    get onExecuteCommand(): Event<{
        reqId: number;
        persistentProcessId: number;
        commandId: string;
        commandArgs: any[];
    }>;
    get onDidRequestDetach(): Event<{
        requestId: number;
        workspaceId: string;
        instanceId: number;
    }>;
    get onDidChangeProperty(): Event<{
        id: number;
        property: IProcessProperty<any>;
    }>;
    constructor(_remoteAuthority: string, _channel: IChannel, _configurationService: IWorkbenchConfigurationService, _workspaceContextService: IWorkspaceContextService, _resolverService: IConfigurationResolverService, _environmentVariableService: IEnvironmentVariableService, _remoteAuthorityResolverService: IRemoteAuthorityResolverService, _logService: ILogService, _editorService: IEditorService, _labelService: ILabelService);
    restartPtyHost(): Promise<void>;
    createProcess(shellLaunchConfig: IShellLaunchConfigDto, configuration: ICompleteTerminalConfiguration, activeWorkspaceRootUri: URI | undefined, options: ITerminalProcessOptions, shouldPersistTerminal: boolean, cols: number, rows: number, unicodeVersion: '6' | '11'): Promise<ICreateTerminalProcessResult>;
    requestDetachInstance(workspaceId: string, instanceId: number): Promise<IProcessDetails | undefined>;
    acceptDetachInstanceReply(requestId: number, persistentProcessId: number): Promise<void>;
    attachToProcess(id: number): Promise<void>;
    detachFromProcess(id: number, forcePersist?: boolean): Promise<void>;
    listProcesses(): Promise<IProcessDetails[]>;
    reduceConnectionGraceTime(): Promise<void>;
    processBinary(id: number, data: string): Promise<void>;
    start(id: number): Promise<ITerminalLaunchError | void>;
    input(id: number, data: string): Promise<void>;
    acknowledgeDataEvent(id: number, charCount: number): Promise<void>;
    setUnicodeVersion(id: number, version: '6' | '11'): Promise<void>;
    shutdown(id: number, immediate: boolean): Promise<void>;
    resize(id: number, cols: number, rows: number): Promise<void>;
    getInitialCwd(id: number): Promise<string>;
    getCwd(id: number): Promise<string>;
    orphanQuestionReply(id: number): Promise<void>;
    sendCommandResult(reqId: number, isError: boolean, payload: any): Promise<void>;
    freePortKillProcess(port: string): Promise<{
        port: string;
        processId: string;
    }>;
    installAutoReply(match: string, reply: string): Promise<void>;
    uninstallAllAutoReplies(): Promise<void>;
    getDefaultSystemShell(osOverride?: OperatingSystem): Promise<string>;
    getProfiles(profiles: unknown, defaultProfile: unknown, includeDetectedProfiles?: boolean): Promise<ITerminalProfile[]>;
    acceptPtyHostResolvedVariables(requestId: number, resolved: string[]): Promise<void>;
    getEnvironment(): Promise<IProcessEnvironment>;
    getWslPath(original: string): Promise<string>;
    setTerminalLayoutInfo(layout?: ITerminalsLayoutInfoById): Promise<void>;
    updateTitle(id: number, title: string, titleSource: TitleEventSource): Promise<string>;
    updateIcon(id: number, userInitiated: boolean, icon: TerminalIcon, color?: string): Promise<string>;
    refreshProperty<T extends ProcessPropertyType>(id: number, property: T): Promise<IProcessPropertyMap[T]>;
    updateProperty<T extends ProcessPropertyType>(id: number, property: T, value: IProcessPropertyMap[T]): Promise<void>;
    getTerminalLayoutInfo(): Promise<ITerminalsLayoutInfo | undefined>;
    reviveTerminalProcesses(state: ISerializedTerminalState[], dateTimeFormatLocate: string): Promise<void>;
    getRevivedPtyNewId(id: number): Promise<number | undefined>;
    serializeTerminalState(ids: number[]): Promise<string>;
}

import { Disposable } from 'vs/base/common/lifecycle';
import { IProcessEnvironment, OperatingSystem } from 'vs/base/common/platform';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { INativeEnvironmentService } from 'vs/platform/environment/common/environment';
import { ILogService } from 'vs/platform/log/common/log';
import { IProcessDataEvent, IPtyService, IReconnectConstants, IRequestResolveVariablesEvent, IShellLaunchConfig, ITerminalLaunchError, ITerminalProfile, ITerminalsLayoutInfo, TerminalIcon, IProcessProperty, TitleEventSource, ProcessPropertyType, IProcessPropertyMap, ISerializedTerminalState, ITerminalProcessOptions } from 'vs/platform/terminal/common/terminal';
import { IGetTerminalLayoutInfoArgs, IProcessDetails, ISetTerminalLayoutInfoArgs } from 'vs/platform/terminal/common/terminalProcess';
import { IPtyHostProcessReplayEvent } from 'vs/platform/terminal/common/capabilities/capabilities';
/**
 * This service implements IPtyService by launching a pty host process, forwarding messages to and
 * from the pty host process and manages the connection.
 */
export declare class PtyHostService extends Disposable implements IPtyService {
    private readonly _reconnectConstants;
    private readonly _configurationService;
    private readonly _environmentService;
    private readonly _logService;
    readonly _serviceBrand: undefined;
    private _client;
    private _proxy;
    private readonly _shellEnv;
    private readonly _resolveVariablesRequestStore;
    private _restartCount;
    private _isResponsive;
    private _isDisposed;
    private _heartbeatFirstTimeout?;
    private _heartbeatSecondTimeout?;
    private readonly _onPtyHostExit;
    readonly onPtyHostExit: import("vs/base/common/event").Event<number>;
    private readonly _onPtyHostStart;
    readonly onPtyHostStart: import("vs/base/common/event").Event<void>;
    private readonly _onPtyHostUnresponsive;
    readonly onPtyHostUnresponsive: import("vs/base/common/event").Event<void>;
    private readonly _onPtyHostResponsive;
    readonly onPtyHostResponsive: import("vs/base/common/event").Event<void>;
    private readonly _onPtyHostRequestResolveVariables;
    readonly onPtyHostRequestResolveVariables: import("vs/base/common/event").Event<IRequestResolveVariablesEvent>;
    private readonly _onProcessData;
    readonly onProcessData: import("vs/base/common/event").Event<{
        id: number;
        event: IProcessDataEvent | string;
    }>;
    private readonly _onProcessReady;
    readonly onProcessReady: import("vs/base/common/event").Event<{
        id: number;
        event: {
            pid: number;
            cwd: string;
        };
    }>;
    private readonly _onProcessReplay;
    readonly onProcessReplay: import("vs/base/common/event").Event<{
        id: number;
        event: IPtyHostProcessReplayEvent;
    }>;
    private readonly _onProcessOrphanQuestion;
    readonly onProcessOrphanQuestion: import("vs/base/common/event").Event<{
        id: number;
    }>;
    private readonly _onDidRequestDetach;
    readonly onDidRequestDetach: import("vs/base/common/event").Event<{
        requestId: number;
        workspaceId: string;
        instanceId: number;
    }>;
    private readonly _onDidChangeProperty;
    readonly onDidChangeProperty: import("vs/base/common/event").Event<{
        id: number;
        property: IProcessProperty<any>;
    }>;
    private readonly _onProcessExit;
    readonly onProcessExit: import("vs/base/common/event").Event<{
        id: number;
        event: number | undefined;
    }>;
    constructor(_reconnectConstants: IReconnectConstants, _configurationService: IConfigurationService, _environmentService: INativeEnvironmentService, _logService: ILogService);
    initialize(): void;
    private get _ignoreProcessNames();
    private _refreshIgnoreProcessNames;
    private _resolveShellEnv;
    private _startPtyHost;
    dispose(): void;
    createProcess(shellLaunchConfig: IShellLaunchConfig, cwd: string, cols: number, rows: number, unicodeVersion: '6' | '11', env: IProcessEnvironment, executableEnv: IProcessEnvironment, options: ITerminalProcessOptions, shouldPersist: boolean, workspaceId: string, workspaceName: string): Promise<number>;
    updateTitle(id: number, title: string, titleSource: TitleEventSource): Promise<void>;
    updateIcon(id: number, userInitiated: boolean, icon: TerminalIcon, color?: string): Promise<void>;
    attachToProcess(id: number): Promise<void>;
    detachFromProcess(id: number, forcePersist?: boolean): Promise<void>;
    listProcesses(): Promise<IProcessDetails[]>;
    reduceConnectionGraceTime(): Promise<void>;
    start(id: number): Promise<ITerminalLaunchError | undefined>;
    shutdown(id: number, immediate: boolean): Promise<void>;
    input(id: number, data: string): Promise<void>;
    processBinary(id: number, data: string): Promise<void>;
    resize(id: number, cols: number, rows: number): Promise<void>;
    acknowledgeDataEvent(id: number, charCount: number): Promise<void>;
    setUnicodeVersion(id: number, version: '6' | '11'): Promise<void>;
    getInitialCwd(id: number): Promise<string>;
    getCwd(id: number): Promise<string>;
    getLatency(id: number): Promise<number>;
    orphanQuestionReply(id: number): Promise<void>;
    installAutoReply(match: string, reply: string): Promise<void>;
    uninstallAllAutoReplies(): Promise<void>;
    uninstallAutoReply(match: string): Promise<void>;
    getDefaultSystemShell(osOverride?: OperatingSystem): Promise<string>;
    getProfiles(workspaceId: string, profiles: unknown, defaultProfile: unknown, includeDetectedProfiles?: boolean): Promise<ITerminalProfile[]>;
    getEnvironment(): Promise<IProcessEnvironment>;
    getWslPath(original: string): Promise<string>;
    getRevivedPtyNewId(id: number): Promise<number | undefined>;
    setTerminalLayoutInfo(args: ISetTerminalLayoutInfoArgs): Promise<void>;
    getTerminalLayoutInfo(args: IGetTerminalLayoutInfoArgs): Promise<ITerminalsLayoutInfo | undefined>;
    requestDetachInstance(workspaceId: string, instanceId: number): Promise<IProcessDetails | undefined>;
    acceptDetachInstanceReply(requestId: number, persistentProcessId: number): Promise<void>;
    freePortKillProcess(port: string): Promise<{
        port: string;
        processId: string;
    }>;
    serializeTerminalState(ids: number[]): Promise<string>;
    reviveTerminalProcesses(state: ISerializedTerminalState[], dateTimeFormatLocate: string): Promise<void>;
    refreshProperty<T extends ProcessPropertyType>(id: number, property: T): Promise<IProcessPropertyMap[T]>;
    updateProperty<T extends ProcessPropertyType>(id: number, property: T, value: IProcessPropertyMap[T]): Promise<void>;
    restartPtyHost(): Promise<void>;
    private _disposePtyHost;
    private _handleHeartbeat;
    private _handleHeartbeatFirstTimeout;
    private _handleHeartbeatSecondTimeout;
    private _handleUnresponsiveCreateProcess;
    private _clearHeartbeatTimeouts;
    private _resolveVariables;
    acceptPtyHostResolvedVariables(requestId: number, resolved: string[]): Promise<void>;
}

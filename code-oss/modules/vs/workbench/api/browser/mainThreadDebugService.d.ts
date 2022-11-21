import { UriComponents } from 'vs/base/common/uri';
import { IDebugService, IConfig, IDebugAdapter, IDebugSession, IDebugAdapterFactory, DebugConfigurationProviderTriggerKind } from 'vs/workbench/contrib/debug/common/debug';
import { MainThreadDebugServiceShape, DebugSessionUUID, ISourceMultiBreakpointDto, IFunctionBreakpointDto, IDebugSessionDto, IDataBreakpointDto, IStartDebuggingOptions, IDebugConfiguration } from 'vs/workbench/api/common/extHost.protocol';
import { IExtHostContext } from 'vs/workbench/services/extensions/common/extHostCustomers';
import { IWorkspaceFolder } from 'vs/platform/workspace/common/workspace';
export declare class MainThreadDebugService implements MainThreadDebugServiceShape, IDebugAdapterFactory {
    private readonly debugService;
    private readonly _proxy;
    private readonly _toDispose;
    private _breakpointEventsActive;
    private readonly _debugAdapters;
    private _debugAdaptersHandleCounter;
    private readonly _debugConfigurationProviders;
    private readonly _debugAdapterDescriptorFactories;
    private readonly _sessions;
    constructor(extHostContext: IExtHostContext, debugService: IDebugService);
    dispose(): void;
    createDebugAdapter(session: IDebugSession): IDebugAdapter;
    substituteVariables(folder: IWorkspaceFolder | undefined, config: IConfig): Promise<IConfig>;
    runInTerminal(args: DebugProtocol.RunInTerminalRequestArguments, sessionId: string): Promise<number | undefined>;
    $registerDebugTypes(debugTypes: string[]): void;
    $startBreakpointEvents(): void;
    $registerBreakpoints(DTOs: Array<ISourceMultiBreakpointDto | IFunctionBreakpointDto | IDataBreakpointDto>): Promise<void>;
    $unregisterBreakpoints(breakpointIds: string[], functionBreakpointIds: string[], dataBreakpointIds: string[]): Promise<void>;
    $registerDebugConfigurationProvider(debugType: string, providerTriggerKind: DebugConfigurationProviderTriggerKind, hasProvide: boolean, hasResolve: boolean, hasResolve2: boolean, handle: number): Promise<void>;
    $unregisterDebugConfigurationProvider(handle: number): void;
    $registerDebugAdapterDescriptorFactory(debugType: string, handle: number): Promise<void>;
    $unregisterDebugAdapterDescriptorFactory(handle: number): void;
    private getSession;
    $startDebugging(folder: UriComponents | undefined, nameOrConfig: string | IDebugConfiguration, options: IStartDebuggingOptions): Promise<boolean>;
    $setDebugSessionName(sessionId: DebugSessionUUID, name: string): void;
    $customDebugAdapterRequest(sessionId: DebugSessionUUID, request: string, args: any): Promise<any>;
    $getDebugProtocolBreakpoint(sessionId: DebugSessionUUID, breakpoinId: string): Promise<DebugProtocol.Breakpoint | undefined>;
    $stopDebugging(sessionId: DebugSessionUUID | undefined): Promise<void>;
    $appendDebugConsole(value: string): void;
    $acceptDAMessage(handle: number, message: DebugProtocol.ProtocolMessage): void;
    $acceptDAError(handle: number, name: string, message: string, stack: string): void;
    $acceptDAExit(handle: number, code: number, signal: string): void;
    private getDebugAdapter;
    $sessionCached(sessionID: string): void;
    getSessionDto(session: undefined): undefined;
    getSessionDto(session: IDebugSession): IDebugSessionDto;
    getSessionDto(session: IDebugSession | undefined): IDebugSessionDto | undefined;
    private convertToDto;
}
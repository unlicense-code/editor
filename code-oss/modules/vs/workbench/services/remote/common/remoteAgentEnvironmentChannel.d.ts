import * as platform from 'vs/base/common/platform';
import * as performance from 'vs/base/common/performance';
import { URI, UriComponents } from 'vs/base/common/uri';
import { IChannel } from 'vs/base/parts/ipc/common/ipc';
import { IExtensionDescription, ExtensionIdentifier } from 'vs/platform/extensions/common/extensions';
import { IRemoteAgentEnvironment } from 'vs/platform/remote/common/remoteAgentEnvironment';
import { IDiagnosticInfoOptions, IDiagnosticInfo } from 'vs/platform/diagnostics/common/diagnostics';
import { ITelemetryData, TelemetryLevel } from 'vs/platform/telemetry/common/telemetry';
import { IExtensionHostExitInfo } from 'vs/workbench/services/remote/common/remoteAgentService';
export interface IGetEnvironmentDataArguments {
    remoteAuthority: string;
}
export interface IGetExtensionHostExitInfoArguments {
    remoteAuthority: string;
    reconnectionToken: string;
}
export interface IScanExtensionsArguments {
    language: string;
    remoteAuthority: string;
    extensionDevelopmentPath: UriComponents[] | undefined;
    skipExtensions: ExtensionIdentifier[];
}
export interface IScanSingleExtensionArguments {
    language: string;
    remoteAuthority: string;
    isBuiltin: boolean;
    extensionLocation: UriComponents;
}
export interface IRemoteAgentEnvironmentDTO {
    pid: number;
    connectionToken: string;
    appRoot: UriComponents;
    settingsPath: UriComponents;
    logsPath: UriComponents;
    extensionsPath: UriComponents;
    extensionHostLogsPath: UriComponents;
    globalStorageHome: UriComponents;
    workspaceStorageHome: UriComponents;
    localHistoryHome: UriComponents;
    userHome: UriComponents;
    os: platform.OperatingSystem;
    arch: string;
    marks: performance.PerformanceMark[];
    useHostProxy: boolean;
}
export declare class RemoteExtensionEnvironmentChannelClient {
    static getEnvironmentData(channel: IChannel, remoteAuthority: string): Promise<IRemoteAgentEnvironment>;
    static getExtensionHostExitInfo(channel: IChannel, remoteAuthority: string, reconnectionToken: string): Promise<IExtensionHostExitInfo | null>;
    static whenExtensionsReady(channel: IChannel): Promise<void>;
    static scanExtensions(channel: IChannel, remoteAuthority: string, extensionDevelopmentPath: URI[] | undefined, skipExtensions: ExtensionIdentifier[]): Promise<IExtensionDescription[]>;
    static scanSingleExtension(channel: IChannel, remoteAuthority: string, isBuiltin: boolean, extensionLocation: URI): Promise<IExtensionDescription | null>;
    static getDiagnosticInfo(channel: IChannel, options: IDiagnosticInfoOptions): Promise<IDiagnosticInfo>;
    static updateTelemetryLevel(channel: IChannel, telemetryLevel: TelemetryLevel): Promise<void>;
    static logTelemetry(channel: IChannel, eventName: string, data: ITelemetryData): Promise<void>;
    static flushTelemetry(channel: IChannel): Promise<void>;
    static ping(channel: IChannel): Promise<void>;
}

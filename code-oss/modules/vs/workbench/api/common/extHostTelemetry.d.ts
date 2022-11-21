import type * as vscode from 'vscode';
import { Event } from 'vs/base/common/event';
import { ExtHostTelemetryShape } from 'vs/workbench/api/common/extHost.protocol';
import { TelemetryLevel } from 'vs/platform/telemetry/common/telemetry';
import { ILogger, ILoggerService } from 'vs/platform/log/common/log';
import { IExtHostInitDataService } from 'vs/workbench/api/common/extHostInitDataService';
import { ExtensionIdentifier, IExtensionDescription } from 'vs/platform/extensions/common/extensions';
export declare class ExtHostTelemetry implements ExtHostTelemetryShape {
    private readonly initData;
    private readonly _onDidChangeTelemetryEnabled;
    readonly onDidChangeTelemetryEnabled: Event<boolean>;
    private readonly _onDidChangeTelemetryConfiguration;
    readonly onDidChangeTelemetryConfiguration: Event<vscode.TelemetryConfiguration>;
    private _productConfig;
    private _level;
    private _oldTelemetryEnablement;
    private _inLoggingOnlyMode;
    private readonly _outputLogger;
    private readonly _telemetryLoggers;
    constructor(initData: IExtHostInitDataService, loggerService: ILoggerService);
    getTelemetryConfiguration(): boolean;
    getTelemetryDetails(): vscode.TelemetryConfiguration;
    instantiateLogger(extension: IExtensionDescription, appender: vscode.TelemetryAppender): vscode.TelemetryLogger;
    $initializeTelemetryLevel(level: TelemetryLevel, loggingOnlyMode: boolean, productConfig?: {
        usage: boolean;
        error: boolean;
    }): void;
    getBuiltInCommonProperties(extension: IExtensionDescription): Record<string, string | boolean | number | undefined>;
    $onDidChangeTelemetryLevel(level: TelemetryLevel): void;
    onExtensionError(extension: ExtensionIdentifier, error: Error): boolean;
}
export declare class ExtHostTelemetryLogger {
    private readonly _extension;
    private readonly _logger;
    private readonly _inLoggingOnlyMode;
    private readonly _commonProperties;
    private _appender;
    private readonly _onDidChangeEnableStates;
    private _telemetryEnablements;
    private _apiObject;
    constructor(appender: vscode.TelemetryAppender, _extension: IExtensionDescription, _logger: ILogger, _inLoggingOnlyMode: boolean, _commonProperties: Record<string, any>, telemetryEnablements: {
        isUsageEnabled: boolean;
        isErrorsEnabled: boolean;
    });
    updateTelemetryEnablements(isUsageEnabled: boolean, isErrorsEnabled: boolean): void;
    mixInCommonPropsAndCleanData(data: Record<string, any>): Record<string, any>;
    private logEvent;
    logUsage(eventName: string, data?: Record<string, any>): void;
    logError(eventNameOrException: Error | string, data?: Record<string, any>): void;
    get apiTelemetryLogger(): vscode.TelemetryLogger;
    dispose(): void;
}
export declare function isNewAppInstall(firstSessionDate: string): boolean;
export declare const IExtHostTelemetry: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IExtHostTelemetry>;
export interface IExtHostTelemetry extends ExtHostTelemetry, ExtHostTelemetryShape {
}

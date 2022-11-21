import { ILoggerService, LogLevel } from 'vs/platform/log/common/log';
import { Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { IOutputService } from 'vs/workbench/services/output/common/output';
export declare const ILogLevelService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<ILogLevelService>;
export interface ILogLevelService {
    readonly _serviceBrand: undefined;
    readonly onDidChangeLogLevel: Event<{
        readonly id: string;
        logLevel: LogLevel;
    }>;
    setLogLevel(id: string, logLevel: LogLevel): void;
    getLogLevel(id: string): LogLevel | undefined;
}
export declare class LogLevelService extends Disposable implements ILogLevelService {
    protected readonly outputService: IOutputService;
    private readonly loggerService;
    readonly _serviceBrand: undefined;
    private readonly _onDidChangeLogLevel;
    readonly onDidChangeLogLevel: Event<{
        readonly id: string;
        logLevel: LogLevel;
    }>;
    private readonly logLevels;
    constructor(outputService: IOutputService, loggerService: ILoggerService);
    getLogLevel(id: string): LogLevel | undefined;
    setLogLevel(id: string, logLevel: LogLevel): boolean;
}

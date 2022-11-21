import { Event } from 'vs/base/common/event';
import { Disposable, IDisposable } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
export declare const ILogService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<ILogService>;
export declare const ILoggerService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<ILoggerService>;
export declare enum LogLevel {
    Off = 0,
    Trace = 1,
    Debug = 2,
    Info = 3,
    Warning = 4,
    Error = 5
}
export declare const DEFAULT_LOG_LEVEL: LogLevel;
export interface ILogger extends IDisposable {
    onDidChangeLogLevel: Event<LogLevel>;
    getLevel(): LogLevel;
    setLevel(level: LogLevel): void;
    trace(message: string, ...args: any[]): void;
    debug(message: string, ...args: any[]): void;
    info(message: string, ...args: any[]): void;
    warn(message: string, ...args: any[]): void;
    error(message: string | Error, ...args: any[]): void;
    /**
     * An operation to flush the contents. Can be synchronous.
     */
    flush(): void;
}
export declare function log(logger: ILogger, level: LogLevel, message: string): void;
export declare function format(args: any): string;
export interface ILogService extends ILogger {
    readonly _serviceBrand: undefined;
}
export interface ILoggerOptions {
    /**
     * Name of the logger.
     */
    name?: string;
    /**
     * Do not create rotating files if max size exceeds.
     */
    donotRotate?: boolean;
    /**
     * Do not use formatters.
     */
    donotUseFormatters?: boolean;
    /**
     * If set, logger logs the message always.
     */
    always?: boolean;
}
export interface ILoggerService {
    readonly _serviceBrand: undefined;
    /**
     * Creates a logger, or gets one if it already exists.
     */
    createLogger(resource: URI, options?: ILoggerOptions, logLevel?: LogLevel): ILogger;
    /**
     * Gets an existing logger, if any.
     */
    getLogger(resource: URI): ILogger | undefined;
    /**
     * Set log level for a logger.
     */
    setLevel(resource: URI, level: LogLevel | undefined): void;
    /**
     * Get log level for a logger.
     */
    getLogLevel(resource: URI): LogLevel | undefined;
}
export declare abstract class AbstractLogger extends Disposable {
    private level;
    private readonly _onDidChangeLogLevel;
    readonly onDidChangeLogLevel: Event<LogLevel>;
    setLevel(level: LogLevel): void;
    getLevel(): LogLevel;
}
export declare abstract class AbstractMessageLogger extends AbstractLogger implements ILogger {
    private readonly logAlways?;
    protected abstract log(level: LogLevel, message: string): void;
    constructor(logAlways?: boolean | undefined);
    private checkLogLevel;
    trace(message: string, ...args: any[]): void;
    debug(message: string, ...args: any[]): void;
    info(message: string, ...args: any[]): void;
    warn(message: string, ...args: any[]): void;
    error(message: string | Error, ...args: any[]): void;
    flush(): void;
}
export declare class ConsoleMainLogger extends AbstractLogger implements ILogger {
    private useColors;
    constructor(logLevel?: LogLevel);
    trace(message: string, ...args: any[]): void;
    debug(message: string, ...args: any[]): void;
    info(message: string, ...args: any[]): void;
    warn(message: string | Error, ...args: any[]): void;
    error(message: string, ...args: any[]): void;
    dispose(): void;
    flush(): void;
}
export declare class ConsoleLogger extends AbstractLogger implements ILogger {
    constructor(logLevel?: LogLevel);
    trace(message: string, ...args: any[]): void;
    debug(message: string, ...args: any[]): void;
    info(message: string, ...args: any[]): void;
    warn(message: string | Error, ...args: any[]): void;
    error(message: string, ...args: any[]): void;
    dispose(): void;
    flush(): void;
}
export declare class AdapterLogger extends AbstractLogger implements ILogger {
    private readonly adapter;
    constructor(adapter: {
        log: (logLevel: LogLevel, args: any[]) => void;
    }, logLevel?: LogLevel);
    trace(message: string, ...args: any[]): void;
    debug(message: string, ...args: any[]): void;
    info(message: string, ...args: any[]): void;
    warn(message: string | Error, ...args: any[]): void;
    error(message: string | Error, ...args: any[]): void;
    private extractMessage;
    dispose(): void;
    flush(): void;
}
export declare class MultiplexLogService extends AbstractLogger implements ILogService {
    private readonly logServices;
    readonly _serviceBrand: undefined;
    constructor(logServices: ReadonlyArray<ILogger>);
    setLevel(level: LogLevel): void;
    trace(message: string, ...args: any[]): void;
    debug(message: string, ...args: any[]): void;
    info(message: string, ...args: any[]): void;
    warn(message: string, ...args: any[]): void;
    error(message: string | Error, ...args: any[]): void;
    flush(): void;
    dispose(): void;
}
export declare class LogService extends Disposable implements ILogService {
    private logger;
    readonly _serviceBrand: undefined;
    constructor(logger: ILogger);
    get onDidChangeLogLevel(): Event<LogLevel>;
    setLevel(level: LogLevel): void;
    getLevel(): LogLevel;
    trace(message: string, ...args: any[]): void;
    debug(message: string, ...args: any[]): void;
    info(message: string, ...args: any[]): void;
    warn(message: string, ...args: any[]): void;
    error(message: string | Error, ...args: any[]): void;
    flush(): void;
}
export declare abstract class AbstractLoggerService extends Disposable implements ILoggerService {
    private logLevel;
    readonly _serviceBrand: undefined;
    private readonly loggerItems;
    constructor(logLevel: LogLevel, onDidChangeLogLevel: Event<LogLevel>);
    getLoggers(): ILogger[];
    getLogger(resource: URI): ILogger | undefined;
    createLogger(resource: URI, options?: ILoggerOptions, logLevel?: LogLevel): ILogger;
    setLevel(logLevel: LogLevel): void;
    setLevel(resource: URI, logLevel: LogLevel): void;
    getLogLevel(resource: URI): LogLevel | undefined;
    dispose(): void;
    protected abstract doCreateLogger(resource: URI, logLevel: LogLevel, options?: ILoggerOptions): ILogger;
}
export declare class NullLogger implements ILogger {
    readonly onDidChangeLogLevel: Event<LogLevel>;
    setLevel(level: LogLevel): void;
    getLevel(): LogLevel;
    trace(message: string, ...args: any[]): void;
    debug(message: string, ...args: any[]): void;
    info(message: string, ...args: any[]): void;
    warn(message: string, ...args: any[]): void;
    error(message: string | Error, ...args: any[]): void;
    critical(message: string | Error, ...args: any[]): void;
    dispose(): void;
    flush(): void;
}
export declare class NullLogService extends NullLogger implements ILogService {
    readonly _serviceBrand: undefined;
}
export declare class NullLoggerService extends AbstractLoggerService {
    constructor();
    protected doCreateLogger(resource: URI, logLevel: LogLevel, options?: ILoggerOptions | undefined): ILogger;
}
export declare function getLogLevel(environmentService: IEnvironmentService): LogLevel;
export declare function LogLevelToString(logLevel: LogLevel): string;
export declare function parseLogLevel(logLevel: string): LogLevel | undefined;

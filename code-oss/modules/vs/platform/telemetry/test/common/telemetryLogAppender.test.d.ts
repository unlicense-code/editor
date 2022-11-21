import { Event } from 'vs/base/common/event';
import { AbstractLogger, ILogger, ILoggerService, LogLevel } from 'vs/platform/log/common/log';
declare class TestTelemetryLogger extends AbstractLogger implements ILogger {
    logs: string[];
    constructor(logLevel?: LogLevel);
    trace(message: string, ...args: any[]): void;
    debug(message: string, ...args: any[]): void;
    info(message: string, ...args: any[]): void;
    warn(message: string | Error, ...args: any[]): void;
    error(message: string, ...args: any[]): void;
    dispose(): void;
    flush(): void;
}
export declare class TestTelemetryLoggerService implements ILoggerService {
    private readonly logLevel;
    _serviceBrand: undefined;
    logger?: TestTelemetryLogger;
    constructor(logLevel: LogLevel);
    getLogger(): TestTelemetryLogger | undefined;
    createLogger(): TestTelemetryLogger;
    onDidChangeLogLevel: Event<any>;
    setLevel(): void;
    getLogLevel(): undefined;
    getDefaultLogLevel(): LogLevel;
}
export {};

import { Event } from 'vs/base/common/event';
import { URI } from 'vs/base/common/uri';
import { IChannel, IServerChannel } from 'vs/base/parts/ipc/common/ipc';
import { AbstractLoggerService, ILogger, ILoggerOptions, ILoggerService, ILogService, LogLevel, LogService } from 'vs/platform/log/common/log';
export declare class LogLevelChannel implements IServerChannel {
    private readonly logService;
    private readonly loggerService;
    onDidChangeLogLevel: Event<LogLevel>;
    constructor(logService: ILogService, loggerService: ILoggerService);
    listen(_: unknown, event: string): Event<any>;
    call(_: unknown, command: string, arg?: any): Promise<any>;
}
export declare class LogLevelChannelClient {
    private channel;
    constructor(channel: IChannel);
    get onDidChangeLogLevel(): Event<LogLevel>;
    setLevel(level: LogLevel, resource?: URI): void;
    static setLevel(channel: IChannel, level: LogLevel, resource?: URI): Promise<void>;
}
export declare class LoggerChannel implements IServerChannel {
    private readonly loggerService;
    private readonly loggers;
    constructor(loggerService: ILoggerService);
    listen(_: unknown, event: string): Event<any>;
    call(_: unknown, command: string, arg?: any): Promise<any>;
    private createLogger;
    private consoleLog;
    private log;
}
export declare class LoggerChannelClient extends AbstractLoggerService implements ILoggerService {
    private readonly channel;
    constructor(logLevel: LogLevel, onDidChangeLogLevel: Event<LogLevel>, channel: IChannel);
    createConsoleMainLogger(): ILogger;
    protected doCreateLogger(file: URI, logLevel: LogLevel, options?: ILoggerOptions): ILogger;
}
export declare class FollowerLogService extends LogService implements ILogService {
    private parent;
    constructor(parent: LogLevelChannelClient, logService: ILogService);
    setLevel(level: LogLevel): void;
}

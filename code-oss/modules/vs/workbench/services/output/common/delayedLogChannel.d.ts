import { ILoggerService, ILogService, LogLevel } from 'vs/platform/log/common/log';
import { URI } from 'vs/base/common/uri';
import { IFileService } from 'vs/platform/files/common/files';
export declare class DelayedLogChannel {
    private readonly id;
    private readonly name;
    private readonly file;
    private readonly fileService;
    private readonly logService;
    private readonly logger;
    constructor(id: string, name: string, file: URI, loggerService: ILoggerService, fileService: IFileService, logService: ILogService);
    private registerLogChannelPromise;
    log(level: LogLevel, message: string): void;
}

import { Disposable } from 'vs/base/common/lifecycle';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { ILoggerService } from 'vs/platform/log/common/log';
import { ITelemetryAppender } from 'vs/platform/telemetry/common/telemetryUtils';
export declare class TelemetryLogAppender extends Disposable implements ITelemetryAppender {
    private readonly prefix;
    private readonly logger;
    constructor(loggerService: ILoggerService, environmentService: IEnvironmentService, prefix?: string);
    flush(): Promise<any>;
    log(eventName: string, data: any): void;
}

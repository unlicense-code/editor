import { Event } from 'vs/base/common/event';
import { IChannel, IServerChannel } from 'vs/base/parts/ipc/common/ipc';
import { ITelemetryAppender } from 'vs/platform/telemetry/common/telemetryUtils';
export interface ITelemetryLog {
    eventName: string;
    data?: any;
}
export declare class TelemetryAppenderChannel implements IServerChannel {
    private appenders;
    constructor(appenders: ITelemetryAppender[]);
    listen<T>(_: unknown, event: string): Event<T>;
    call(_: unknown, command: string, { eventName, data }: ITelemetryLog): Promise<any>;
}
export declare class TelemetryAppenderClient implements ITelemetryAppender {
    private channel;
    constructor(channel: IChannel);
    log(eventName: string, data?: any): any;
    flush(): Promise<void>;
}

import { Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { IServerChannel } from 'vs/base/parts/ipc/common/ipc';
import { ITelemetryAppender } from 'vs/platform/telemetry/common/telemetryUtils';
import { IServerTelemetryService } from 'vs/platform/telemetry/common/serverTelemetryService';
export declare class ServerTelemetryChannel extends Disposable implements IServerChannel {
    private readonly telemetryService;
    private readonly telemetryAppender;
    constructor(telemetryService: IServerTelemetryService, telemetryAppender: ITelemetryAppender | null);
    call(_: any, command: string, arg?: any): Promise<any>;
    listen(_: any, event: string, arg: any): Event<any>;
    /**
     * Disposing the channel also disables the telemetryService as there is
     * no longer a way to control it
     */
    dispose(): void;
}

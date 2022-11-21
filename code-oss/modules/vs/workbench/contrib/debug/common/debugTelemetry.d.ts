import { IDebugModel, IDebugSession, AdapterEndEvent } from 'vs/workbench/contrib/debug/common/debug';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { Debugger } from 'vs/workbench/contrib/debug/common/debugger';
export declare class DebugTelemetry {
    private readonly model;
    private readonly telemetryService;
    constructor(model: IDebugModel, telemetryService: ITelemetryService);
    logDebugSessionStart(dbgr: Debugger, launchJsonExists: boolean): Promise<void>;
    logDebugSessionStop(session: IDebugSession, adapterExitEvent: AdapterEndEvent): Promise<any>;
}

import { Disposable } from 'vs/base/common/lifecycle';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
export declare class InputLatencyContrib extends Disposable implements IWorkbenchContribution {
    private readonly _editorService;
    private readonly _telemetryService;
    private readonly _listener;
    private readonly _scheduler;
    constructor(_editorService: IEditorService, _telemetryService: ITelemetryService);
    private _setupListener;
    private _logSamples;
}

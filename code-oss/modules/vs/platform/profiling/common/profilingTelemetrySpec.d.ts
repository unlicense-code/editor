import { ILogService } from 'vs/platform/log/common/log';
import { BottomUpSample } from 'vs/platform/profiling/common/profilingModel';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
export interface SampleData {
    perfBaseline: number;
    sample: BottomUpSample;
    source: string;
}
export declare function reportSample(data: SampleData, telemetryService: ITelemetryService, logService: ILogService): void;

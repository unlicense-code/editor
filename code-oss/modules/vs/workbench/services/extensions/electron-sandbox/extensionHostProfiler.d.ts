import { IExtensionService, ProfileSession } from 'vs/workbench/services/extensions/common/extensions';
import { IV8InspectProfilingService } from 'vs/platform/profiling/common/profiling';
export declare class ExtensionHostProfiler {
    private readonly _port;
    private readonly _extensionService;
    private readonly _profilingService;
    constructor(_port: number, _extensionService: IExtensionService, _profilingService: IV8InspectProfilingService);
    start(): Promise<ProfileSession>;
    private _distill;
}

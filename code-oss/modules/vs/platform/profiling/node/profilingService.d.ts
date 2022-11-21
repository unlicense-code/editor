import { IV8InspectProfilingService, IV8Profile } from 'vs/platform/profiling/common/profiling';
export declare class InspectProfilingService implements IV8InspectProfilingService {
    _serviceBrand: undefined;
    private readonly _sessions;
    startProfiling(options: {
        port: number;
    }): Promise<string>;
    stopProfiling(sessionId: string): Promise<IV8Profile>;
}

import { AbstractOneDataSystemAppender, IAppInsightsCore } from 'vs/platform/telemetry/common/1dsAppender';
export declare class OneDataSystemWebAppender extends AbstractOneDataSystemAppender {
    constructor(isInternalTelemetry: boolean, eventPrefix: string, defaultData: {
        [key: string]: any;
    } | null, iKeyOrClientFactory: string | (() => IAppInsightsCore));
}

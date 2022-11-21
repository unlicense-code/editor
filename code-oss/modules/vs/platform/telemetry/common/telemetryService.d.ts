import { MutableObservableValue } from 'vs/base/common/observableValue';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IProductService } from 'vs/platform/product/common/productService';
import { ClassifiedEvent, IGDPRProperty, OmitMetadata, StrictPropertyCheck } from 'vs/platform/telemetry/common/gdprTypings';
import { ITelemetryData, ITelemetryInfo, ITelemetryService, TelemetryLevel } from 'vs/platform/telemetry/common/telemetry';
import { ITelemetryAppender } from 'vs/platform/telemetry/common/telemetryUtils';
export interface ITelemetryServiceConfig {
    appenders: ITelemetryAppender[];
    sendErrorTelemetry?: boolean;
    commonProperties?: Promise<{
        [name: string]: any;
    }>;
    piiPaths?: string[];
}
export declare class TelemetryService implements ITelemetryService {
    private _configurationService;
    private _productService;
    static readonly IDLE_START_EVENT_NAME = "UserIdleStart";
    static readonly IDLE_STOP_EVENT_NAME = "UserIdleStop";
    readonly _serviceBrand: undefined;
    private _appenders;
    private _commonProperties;
    private _experimentProperties;
    private _piiPaths;
    private _sendErrorTelemetry;
    readonly telemetryLevel: MutableObservableValue<TelemetryLevel>;
    private readonly _disposables;
    private _cleanupPatterns;
    constructor(config: ITelemetryServiceConfig, _configurationService: IConfigurationService, _productService: IProductService);
    setExperimentProperty(name: string, value: string): void;
    private _updateTelemetryLevel;
    get sendErrorTelemetry(): boolean;
    getTelemetryInfo(): Promise<ITelemetryInfo>;
    dispose(): void;
    private _log;
    publicLog(eventName: string, data?: ITelemetryData): Promise<any>;
    publicLog2<E extends ClassifiedEvent<OmitMetadata<T>> = never, T extends IGDPRProperty = never>(eventName: string, data?: StrictPropertyCheck<T, E>): Promise<any>;
    publicLogError(errorEventName: string, data?: ITelemetryData): Promise<any>;
    publicLogError2<E extends ClassifiedEvent<OmitMetadata<T>> = never, T extends IGDPRProperty = never>(eventName: string, data?: StrictPropertyCheck<T, E>): Promise<any>;
}

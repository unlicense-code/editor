import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IProductService } from 'vs/platform/product/common/productService';
import { ClassifiedEvent, IGDPRProperty, OmitMetadata, StrictPropertyCheck } from 'vs/platform/telemetry/common/gdprTypings';
import { ITelemetryData, ITelemetryService, TelemetryLevel } from 'vs/platform/telemetry/common/telemetry';
import { ITelemetryServiceConfig, TelemetryService } from 'vs/platform/telemetry/common/telemetryService';
export interface IServerTelemetryService extends ITelemetryService {
    updateInjectedTelemetryLevel(telemetryLevel: TelemetryLevel): Promise<void>;
}
export declare class ServerTelemetryService extends TelemetryService implements IServerTelemetryService {
    private _injectedTelemetryLevel;
    constructor(config: ITelemetryServiceConfig, injectedTelemetryLevel: TelemetryLevel, _configurationService: IConfigurationService, _productService: IProductService);
    publicLog(eventName: string, data?: ITelemetryData): Promise<void>;
    publicLog2<E extends ClassifiedEvent<OmitMetadata<T>> = never, T extends IGDPRProperty = never>(eventName: string, data?: StrictPropertyCheck<T, E>): Promise<void>;
    publicLogError(errorEventName: string, data?: ITelemetryData): Promise<void>;
    publicLogError2<E extends ClassifiedEvent<OmitMetadata<T>> = never, T extends IGDPRProperty = never>(eventName: string, data?: StrictPropertyCheck<T, E>): Promise<void>;
    updateInjectedTelemetryLevel(telemetryLevel: TelemetryLevel): Promise<void>;
}
export declare const ServerNullTelemetryService: {
    updateInjectedTelemetryLevel(): Promise<void>;
    readonly _serviceBrand: undefined;
    readonly sendErrorTelemetry: false;
    publicLog(eventName: string, data?: ITelemetryData | undefined): Promise<undefined>;
    publicLog2<E extends ClassifiedEvent<OmitMetadata<T>> = never, T extends IGDPRProperty = never>(eventName: string, data?: import("vs/platform/telemetry/common/gdprTypings").StrictPropertyChecker<E, ClassifiedEvent<OmitMetadata<T>>, import("vs/platform/telemetry/common/gdprTypings").StrictPropertyCheckError> | undefined): Promise<undefined>;
    publicLogError(eventName: string, data?: ITelemetryData | undefined): Promise<undefined>;
    publicLogError2<E_1 extends ClassifiedEvent<OmitMetadata<T_1>> = never, T_1 extends IGDPRProperty = never>(eventName: string, data?: import("vs/platform/telemetry/common/gdprTypings").StrictPropertyChecker<E_1, ClassifiedEvent<OmitMetadata<T_1>>, import("vs/platform/telemetry/common/gdprTypings").StrictPropertyCheckError> | undefined): Promise<undefined>;
    setExperimentProperty(): void;
    telemetryLevel: import("../../../base/common/observableValue").IObservableValue<TelemetryLevel>;
    getTelemetryInfo(): Promise<import("vs/platform/telemetry/common/telemetry").ITelemetryInfo>;
};
export declare const IServerTelemetryService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IServerTelemetryService>;

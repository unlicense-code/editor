import { Disposable } from 'vs/base/common/lifecycle';
import { IObservableValue } from 'vs/base/common/observableValue';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { ILoggerService } from 'vs/platform/log/common/log';
import { IProductService } from 'vs/platform/product/common/productService';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { ClassifiedEvent, IGDPRProperty, OmitMetadata, StrictPropertyCheck } from 'vs/platform/telemetry/common/gdprTypings';
import { ITelemetryData, ITelemetryInfo, ITelemetryService, TelemetryLevel } from 'vs/platform/telemetry/common/telemetry';
import { IBrowserWorkbenchEnvironmentService } from 'vs/workbench/services/environment/browser/environmentService';
import { IRemoteAgentService } from 'vs/workbench/services/remote/common/remoteAgentService';
export declare class TelemetryService extends Disposable implements ITelemetryService {
    readonly _serviceBrand: undefined;
    private impl;
    readonly sendErrorTelemetry = true;
    constructor(environmentService: IBrowserWorkbenchEnvironmentService, loggerService: ILoggerService, configurationService: IConfigurationService, storageService: IStorageService, productService: IProductService, remoteAgentService: IRemoteAgentService);
    /**
     * Initializes the telemetry service to be a full fledged service.
     * This is only done once and only when telemetry is enabled as this will also ping the endpoint to
     * ensure its not adblocked and we can send telemetry
     */
    private initializeService;
    setExperimentProperty(name: string, value: string): void;
    get telemetryLevel(): IObservableValue<TelemetryLevel>;
    publicLog(eventName: string, data?: ITelemetryData): Promise<void>;
    publicLog2<E extends ClassifiedEvent<OmitMetadata<T>> = never, T extends IGDPRProperty = never>(eventName: string, data?: StrictPropertyCheck<T, E>): Promise<void>;
    publicLogError(errorEventName: string, data?: ITelemetryData): Promise<void>;
    publicLogError2<E extends ClassifiedEvent<OmitMetadata<T>> = never, T extends IGDPRProperty = never>(eventName: string, data?: StrictPropertyCheck<T, E>): Promise<void>;
    getTelemetryInfo(): Promise<ITelemetryInfo>;
}

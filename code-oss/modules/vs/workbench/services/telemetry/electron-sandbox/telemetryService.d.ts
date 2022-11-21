import { ITelemetryService, ITelemetryInfo, ITelemetryData, TelemetryLevel } from 'vs/platform/telemetry/common/telemetry';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { Disposable } from 'vs/base/common/lifecycle';
import { INativeWorkbenchEnvironmentService } from 'vs/workbench/services/environment/electron-sandbox/environmentService';
import { IProductService } from 'vs/platform/product/common/productService';
import { ISharedProcessService } from 'vs/platform/ipc/electron-sandbox/services';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { ClassifiedEvent, StrictPropertyCheck, OmitMetadata, IGDPRProperty } from 'vs/platform/telemetry/common/gdprTypings';
import { IFileService } from 'vs/platform/files/common/files';
import { IObservableValue } from 'vs/base/common/observableValue';
export declare class TelemetryService extends Disposable implements ITelemetryService {
    readonly _serviceBrand: undefined;
    private impl;
    readonly sendErrorTelemetry: boolean;
    constructor(environmentService: INativeWorkbenchEnvironmentService, productService: IProductService, sharedProcessService: ISharedProcessService, storageService: IStorageService, configurationService: IConfigurationService, fileService: IFileService);
    setExperimentProperty(name: string, value: string): void;
    get telemetryLevel(): IObservableValue<TelemetryLevel>;
    publicLog(eventName: string, data?: ITelemetryData): Promise<void>;
    publicLog2<E extends ClassifiedEvent<OmitMetadata<T>> = never, T extends IGDPRProperty = never>(eventName: string, data?: StrictPropertyCheck<T, E>): Promise<void>;
    publicLogError(errorEventName: string, data?: ITelemetryData): Promise<void>;
    publicLogError2<E extends ClassifiedEvent<OmitMetadata<T>> = never, T extends IGDPRProperty = never>(eventName: string, data?: StrictPropertyCheck<T, E>): Promise<void>;
    getTelemetryInfo(): Promise<ITelemetryInfo>;
}

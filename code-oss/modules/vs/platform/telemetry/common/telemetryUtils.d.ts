import { IDisposable } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { IProductService } from 'vs/platform/product/common/productService';
import { ClassifiedEvent, IGDPRProperty, OmitMetadata, StrictPropertyCheck } from 'vs/platform/telemetry/common/gdprTypings';
import { ICustomEndpointTelemetryService, ITelemetryData, ITelemetryEndpoint, ITelemetryInfo, ITelemetryService, TelemetryLevel } from 'vs/platform/telemetry/common/telemetry';
/**
 * A special class used to denoate a telemetry value which should not be clean.
 * This is because that value is "Trusted" not to contain identifiable information such as paths
 */
export declare class TrustedTelemetryValue {
    readonly value: any;
    constructor(value: any);
}
export declare class NullTelemetryServiceShape implements ITelemetryService {
    readonly _serviceBrand: undefined;
    readonly sendErrorTelemetry = false;
    publicLog(eventName: string, data?: ITelemetryData): Promise<undefined>;
    publicLog2<E extends ClassifiedEvent<OmitMetadata<T>> = never, T extends IGDPRProperty = never>(eventName: string, data?: StrictPropertyCheck<T, E>): Promise<undefined>;
    publicLogError(eventName: string, data?: ITelemetryData): Promise<undefined>;
    publicLogError2<E extends ClassifiedEvent<OmitMetadata<T>> = never, T extends IGDPRProperty = never>(eventName: string, data?: StrictPropertyCheck<T, E>): Promise<undefined>;
    setExperimentProperty(): void;
    telemetryLevel: import("vs/base/common/observableValue").IObservableValue<TelemetryLevel>;
    getTelemetryInfo(): Promise<ITelemetryInfo>;
}
export declare const NullTelemetryService: NullTelemetryServiceShape;
export declare class NullEndpointTelemetryService implements ICustomEndpointTelemetryService {
    _serviceBrand: undefined;
    publicLog(_endpoint: ITelemetryEndpoint, _eventName: string, _data?: ITelemetryData): Promise<void>;
    publicLogError(_endpoint: ITelemetryEndpoint, _errorEventName: string, _data?: ITelemetryData): Promise<void>;
}
export interface ITelemetryAppender {
    log(eventName: string, data: any): void;
    flush(): Promise<any>;
}
export declare const NullAppender: ITelemetryAppender;
export interface URIDescriptor {
    mimeType?: string;
    scheme?: string;
    ext?: string;
    path?: string;
}
export declare function configurationTelemetry(telemetryService: ITelemetryService, configurationService: IConfigurationService): IDisposable;
/**
 * Determines whether or not we support logging telemetry.
 * This checks if the product is capable of collecting telemetry but not whether or not it can send it
 * For checking the user setting and what telemetry you can send please check `getTelemetryLevel`.
 * This returns true if `--disable-telemetry` wasn't used, the product.json allows for telemetry, and we're not testing an extension
 * If false telemetry is disabled throughout the product
 * @param productService
 * @param environmentService
 * @returns false - telemetry is completely disabled, true - telemetry is logged locally, but may not be sent
 */
export declare function supportsTelemetry(productService: IProductService, environmentService: IEnvironmentService): boolean;
/**
 * Checks to see if we're in logging only mode to debug telemetry.
 * This is if telemetry is enabled and we're in OSS, but no telemetry key is provided so it's not being sent just logged.
 * @param productService
 * @param environmentService
 * @returns True if telemetry is actually disabled and we're only logging for debug purposes
 */
export declare function isLoggingOnly(productService: IProductService, environmentService: IEnvironmentService): boolean;
/**
 * Determines how telemetry is handled based on the user's configuration.
 *
 * @param configurationService
 * @returns OFF, ERROR, ON
 */
export declare function getTelemetryLevel(configurationService: IConfigurationService): TelemetryLevel;
export interface Properties {
    [key: string]: string;
}
export interface Measurements {
    [key: string]: number;
}
export declare function validateTelemetryData(data?: any): {
    properties: Properties;
    measurements: Measurements;
};
export declare function cleanRemoteAuthority(remoteAuthority?: string): string;
/**
 * Whether or not this is an internal user
 * @param productService The product service
 * @param configService The config servivce
 * @returns true if internal, false otherwise
 */
export declare function isInternalTelemetry(productService: IProductService, configService: IConfigurationService): boolean;
interface IPathEnvironment {
    appRoot: string;
    extensionsPath: string;
    userDataPath: string;
    userHome: URI;
    tmpDir: URI;
}
export declare function getPiiPathsFromEnvironment(paths: IPathEnvironment): string[];
/**
 * Does a best possible effort to clean a data object from any possible PII.
 * @param data The data object to clean
 * @param paths Any additional patterns that should be removed from the data set
 * @returns A new object with the PII removed
 */
export declare function cleanData(data: Record<string, any>, cleanUpPatterns: RegExp[]): Record<string, any>;
export {};

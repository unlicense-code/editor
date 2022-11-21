import { Disposable } from 'vs/base/common/lifecycle';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { IProductService } from 'vs/platform/product/common/productService';
import { ClassifiedEvent, IGDPRProperty, OmitMetadata, StrictPropertyCheck } from 'vs/platform/telemetry/common/gdprTypings';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IExtHostContext } from 'vs/workbench/services/extensions/common/extHostCustomers';
import { MainThreadTelemetryShape } from '../common/extHost.protocol';
export declare class MainThreadTelemetry extends Disposable implements MainThreadTelemetryShape {
    private readonly _telemetryService;
    private readonly _environmentService;
    private readonly _productService;
    private readonly _proxy;
    private static readonly _name;
    constructor(extHostContext: IExtHostContext, _telemetryService: ITelemetryService, _environmentService: IEnvironmentService, _productService: IProductService);
    private get telemetryLevel();
    $publicLog(eventName: string, data?: any): void;
    $publicLog2<E extends ClassifiedEvent<OmitMetadata<T>> = never, T extends IGDPRProperty = never>(eventName: string, data?: StrictPropertyCheck<T, E>): void;
}

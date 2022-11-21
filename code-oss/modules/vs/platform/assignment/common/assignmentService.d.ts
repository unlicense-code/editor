import type { IExperimentationTelemetry, ExperimentationService as TASClient, IKeyValueStorage } from 'tas-client-umd';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IProductService } from 'vs/platform/product/common/productService';
import { IAssignmentService } from 'vs/platform/assignment/common/assignment';
export declare abstract class BaseAssignmentService implements IAssignmentService {
    private readonly getMachineId;
    protected readonly configurationService: IConfigurationService;
    protected readonly productService: IProductService;
    protected telemetry: IExperimentationTelemetry;
    private keyValueStorage?;
    _serviceBrand: undefined;
    protected tasClient: Promise<TASClient> | undefined;
    private networkInitialized;
    private overrideInitDelay;
    protected get experimentsEnabled(): boolean;
    constructor(getMachineId: () => Promise<string>, configurationService: IConfigurationService, productService: IProductService, telemetry: IExperimentationTelemetry, keyValueStorage?: IKeyValueStorage | undefined);
    getTreatment<T extends string | number | boolean>(name: string): Promise<T | undefined>;
    private setupTASClient;
}
export declare class AssignmentService extends BaseAssignmentService {
    constructor(machineId: string, configurationService: IConfigurationService, productService: IProductService);
}

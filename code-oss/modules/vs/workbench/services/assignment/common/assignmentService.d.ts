import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IProductService } from 'vs/platform/product/common/productService';
import { IAssignmentService } from 'vs/platform/assignment/common/assignment';
import { BaseAssignmentService } from 'vs/platform/assignment/common/assignmentService';
export declare const IWorkbenchAssignmentService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IWorkbenchAssignmentService>;
export interface IWorkbenchAssignmentService extends IAssignmentService {
    getCurrentExperiments(): Promise<string[] | undefined>;
}
export declare class WorkbenchAssignmentService extends BaseAssignmentService {
    private telemetryService;
    constructor(telemetryService: ITelemetryService, storageService: IStorageService, configurationService: IConfigurationService, productService: IProductService);
    protected get experimentsEnabled(): boolean;
    getTreatment<T extends string | number | boolean>(name: string): Promise<T | undefined>;
    getCurrentExperiments(): Promise<string[] | undefined>;
}

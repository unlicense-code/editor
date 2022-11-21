import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { INativeWorkbenchEnvironmentService } from 'vs/workbench/services/environment/electron-sandbox/environmentService';
export declare class ExtensionPoints implements IWorkbenchContribution {
    constructor(instantiationService: IInstantiationService, environmentService: INativeWorkbenchEnvironmentService);
}

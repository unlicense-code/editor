import { ServicesAccessor, BrandedService } from 'vs/platform/instantiation/common/instantiation';
import { LifecyclePhase } from 'vs/workbench/services/lifecycle/common/lifecycle';
/**
 * A workbench contribution that will be loaded when the workbench starts and disposed when the workbench shuts down.
 */
export interface IWorkbenchContribution {
}
export declare namespace Extensions {
    const Workbench = "workbench.contributions.kind";
}
declare type IWorkbenchContributionSignature<Service extends BrandedService[]> = new (...services: Service) => IWorkbenchContribution;
export interface IWorkbenchContributionsRegistry {
    /**
     * Registers a workbench contribution to the platform that will be loaded when the workbench starts and disposed when
     * the workbench shuts down.
     *
     * @param phase the lifecycle phase when to instantiate the contribution.
     */
    registerWorkbenchContribution<Services extends BrandedService[]>(contribution: IWorkbenchContributionSignature<Services>, phase: LifecyclePhase): void;
    /**
     * Starts the registry by providing the required services.
     */
    start(accessor: ServicesAccessor): void;
}
export {};

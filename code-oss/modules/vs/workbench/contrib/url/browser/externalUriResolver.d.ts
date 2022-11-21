import { Disposable } from 'vs/base/common/lifecycle';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
import { IBrowserWorkbenchEnvironmentService } from 'vs/workbench/services/environment/browser/environmentService';
export declare class ExternalUriResolverContribution extends Disposable implements IWorkbenchContribution {
    constructor(_openerService: IOpenerService, _workbenchEnvironmentService: IBrowserWorkbenchEnvironmentService);
}

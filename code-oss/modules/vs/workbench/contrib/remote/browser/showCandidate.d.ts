import { Disposable } from 'vs/base/common/lifecycle';
import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
import { IBrowserWorkbenchEnvironmentService } from 'vs/workbench/services/environment/browser/environmentService';
import { IRemoteExplorerService } from 'vs/workbench/services/remote/common/remoteExplorerService';
export declare class ShowCandidateContribution extends Disposable implements IWorkbenchContribution {
    constructor(remoteExplorerService: IRemoteExplorerService, environmentService: IBrowserWorkbenchEnvironmentService);
}

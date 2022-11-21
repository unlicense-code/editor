import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
import { ILabelService } from 'vs/platform/label/common/label';
import { IRemoteAgentService } from 'vs/workbench/services/remote/common/remoteAgentService';
export declare class LabelContribution implements IWorkbenchContribution {
    private readonly labelService;
    private readonly remoteAgentService;
    constructor(labelService: ILabelService, remoteAgentService: IRemoteAgentService);
    private registerFormatters;
}

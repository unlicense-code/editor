import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
export declare class ListContext implements IWorkbenchContribution {
    constructor(contextKeyService: IContextKeyService);
}

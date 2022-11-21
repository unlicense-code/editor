import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
import { ITerminalService } from 'vs/workbench/contrib/terminal/browser/terminal';
export declare class LocalTerminalBackendContribution implements IWorkbenchContribution {
    constructor(instantiationService: IInstantiationService, terminalService: ITerminalService);
}

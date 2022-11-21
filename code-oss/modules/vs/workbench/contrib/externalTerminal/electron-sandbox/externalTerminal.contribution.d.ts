import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
import { IExternalTerminalMainService } from 'vs/platform/externalTerminal/electron-sandbox/externalTerminalMainService';
export declare class ExternalTerminalContribution implements IWorkbenchContribution {
    private readonly _externalTerminalService;
    _serviceBrand: undefined;
    constructor(_externalTerminalService: IExternalTerminalMainService);
    private _updateConfiguration;
}

import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
import { Disposable } from 'vs/base/common/lifecycle';
export declare class ExternalTerminalContribution extends Disposable implements IWorkbenchContribution {
    private readonly _configurationService;
    private _openInTerminalMenuItem;
    constructor(_configurationService: IConfigurationService);
    private _refreshOpenInTerminalMenuItemTitle;
}

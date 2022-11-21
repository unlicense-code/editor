import { IEnvironmentVariableInfo, IMergedEnvironmentVariableCollection, IMergedEnvironmentVariableCollectionDiff } from 'vs/workbench/contrib/terminal/common/environmentVariable';
import { ITerminalService } from 'vs/workbench/contrib/terminal/browser/terminal';
import { ThemeIcon } from 'vs/platform/theme/common/themeService';
import { IHoverAction } from 'vs/workbench/services/hover/browser/hover';
export declare class EnvironmentVariableInfoStale implements IEnvironmentVariableInfo {
    private readonly _diff;
    private readonly _terminalId;
    private readonly _terminalService;
    readonly requiresAction = true;
    constructor(_diff: IMergedEnvironmentVariableCollectionDiff, _terminalId: number, _terminalService: ITerminalService);
    getInfo(): string;
    getIcon(): ThemeIcon;
    getActions(): IHoverAction[];
}
export declare class EnvironmentVariableInfoChangesActive implements IEnvironmentVariableInfo {
    private _collection;
    readonly requiresAction = false;
    constructor(_collection: IMergedEnvironmentVariableCollection);
    getInfo(): string;
    getIcon(): ThemeIcon;
}

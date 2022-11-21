import { ColorTheme } from './extHostTypes';
import { IExtHostRpcService } from 'vs/workbench/api/common/extHostRpcService';
import { ExtHostThemingShape } from 'vs/workbench/api/common/extHost.protocol';
import { Event } from 'vs/base/common/event';
export declare class ExtHostTheming implements ExtHostThemingShape {
    readonly _serviceBrand: undefined;
    private _actual;
    private _onDidChangeActiveColorTheme;
    constructor(_extHostRpc: IExtHostRpcService);
    get activeColorTheme(): ColorTheme;
    $onColorThemeChange(type: string): void;
    get onDidChangeActiveColorTheme(): Event<ColorTheme>;
}

import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IQuickInputService, IKeyMods, IQuickPickItem } from 'vs/platform/quickinput/common/quickInput';
import { IExtensionTerminalProfile, ITerminalProfile } from 'vs/platform/terminal/common/terminal';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { ITerminalProfileResolverService, ITerminalProfileService } from 'vs/workbench/contrib/terminal/common/terminal';
import { IQuickPickTerminalObject, ITerminalInstance } from 'vs/workbench/contrib/terminal/browser/terminal';
import { IPickerQuickAccessItem } from 'vs/platform/quickinput/browser/pickerQuickAccess';
declare type DefaultProfileName = string;
export declare class TerminalProfileQuickpick {
    private readonly _terminalProfileService;
    private readonly _terminalProfileResolverService;
    private readonly _configurationService;
    private readonly _quickInputService;
    private readonly _themeService;
    constructor(_terminalProfileService: ITerminalProfileService, _terminalProfileResolverService: ITerminalProfileResolverService, _configurationService: IConfigurationService, _quickInputService: IQuickInputService, _themeService: IThemeService);
    showAndGetResult(type: 'setDefault' | 'createInstance'): Promise<IQuickPickTerminalObject | DefaultProfileName | undefined>;
    private _createAndShow;
    private _createProfileQuickPickItem;
    private _sortProfileQuickPickItems;
}
export interface IProfileQuickPickItem extends IQuickPickItem {
    profile: ITerminalProfile | IExtensionTerminalProfile;
    profileName: string;
    keyMods?: IKeyMods | undefined;
}
export interface ITerminalQuickPickItem extends IPickerQuickAccessItem {
    terminal: ITerminalInstance;
}
export {};

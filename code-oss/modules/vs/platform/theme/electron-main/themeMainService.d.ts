import { Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IStateMainService } from 'vs/platform/state/electron-main/state';
import { IPartsSplash } from 'vs/platform/theme/common/themeService';
import { IColorScheme } from 'vs/platform/window/common/window';
export declare const IThemeMainService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IThemeMainService>;
export interface IThemeMainService {
    readonly _serviceBrand: undefined;
    readonly onDidChangeColorScheme: Event<IColorScheme>;
    getBackgroundColor(): string;
    saveWindowSplash(windowId: number | undefined, splash: IPartsSplash): void;
    getWindowSplash(): IPartsSplash | undefined;
    getColorScheme(): IColorScheme;
}
export declare class ThemeMainService extends Disposable implements IThemeMainService {
    private stateMainService;
    private configurationService;
    readonly _serviceBrand: undefined;
    private readonly _onDidChangeColorScheme;
    readonly onDidChangeColorScheme: Event<IColorScheme>;
    constructor(stateMainService: IStateMainService, configurationService: IConfigurationService);
    getColorScheme(): IColorScheme;
    getBackgroundColor(): string;
    saveWindowSplash(windowId: number | undefined, splash: IPartsSplash): void;
    private updateBackgroundColor;
    getWindowSplash(): IPartsSplash | undefined;
}

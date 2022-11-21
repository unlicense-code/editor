import { Event } from 'vs/base/common/event';
import { IconContribution } from 'vs/platform/theme/common/iconRegistry';
import { IProductIconTheme, IThemeService } from 'vs/platform/theme/common/themeService';
export interface IIconsStyleSheet {
    getCSS(): string;
    readonly onDidChange: Event<void>;
}
export declare function getIconsStyleSheet(themeService: IThemeService | undefined): IIconsStyleSheet;
export declare class UnthemedProductIconTheme implements IProductIconTheme {
    getIcon(contribution: IconContribution): import("vs/platform/theme/common/iconRegistry").IconDefinition | undefined;
}

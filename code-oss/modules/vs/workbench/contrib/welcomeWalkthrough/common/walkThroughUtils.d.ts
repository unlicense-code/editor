import { IColorTheme } from 'vs/platform/theme/common/themeService';
import { ColorDefaults, ColorValue } from 'vs/platform/theme/common/colorRegistry';
export declare function getExtraColor(theme: IColorTheme, colorId: string, defaults: ColorDefaults & {
    extra_dark: string;
}): ColorValue | null;

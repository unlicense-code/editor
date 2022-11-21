import { IColorTheme } from 'vs/platform/theme/common/themeService';
import { ColorIdentifier } from 'vs/platform/theme/common/colorRegistry';
import { Color } from 'vs/base/common/color';
import { ColorScheme } from 'vs/platform/theme/common/theme';
export declare class EditorTheme {
    private _theme;
    get type(): ColorScheme;
    get value(): IColorTheme;
    constructor(theme: IColorTheme);
    update(theme: IColorTheme): void;
    getColor(color: ColorIdentifier): Color | undefined;
}

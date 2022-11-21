import { Toggle } from 'vs/base/browser/ui/toggle/toggle';
import { Color } from 'vs/base/common/color';
export interface IFindInputToggleOpts {
    readonly appendTitle: string;
    readonly isChecked: boolean;
    readonly inputActiveOptionBorder?: Color;
    readonly inputActiveOptionForeground?: Color;
    readonly inputActiveOptionBackground?: Color;
}
export declare class CaseSensitiveToggle extends Toggle {
    constructor(opts: IFindInputToggleOpts);
}
export declare class WholeWordsToggle extends Toggle {
    constructor(opts: IFindInputToggleOpts);
}
export declare class RegexToggle extends Toggle {
    constructor(opts: IFindInputToggleOpts);
}

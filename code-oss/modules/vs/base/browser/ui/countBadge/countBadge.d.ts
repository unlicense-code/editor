import { Color } from 'vs/base/common/color';
import { IThemable } from 'vs/base/common/styler';
import 'vs/css!./countBadge';
export interface ICountBadgeOptions extends ICountBadgetyles {
    count?: number;
    countFormat?: string;
    titleFormat?: string;
}
export interface ICountBadgetyles {
    badgeBackground?: Color;
    badgeForeground?: Color;
    badgeBorder?: Color;
}
export declare class CountBadge implements IThemable {
    private element;
    private count;
    private countFormat;
    private titleFormat;
    private badgeBackground;
    private badgeForeground;
    private badgeBorder;
    private options;
    constructor(container: HTMLElement, options?: ICountBadgeOptions);
    setCount(count: number): void;
    setCountFormat(countFormat: string): void;
    setTitleFormat(titleFormat: string): void;
    private render;
    style(styles: ICountBadgetyles): void;
    private applyStyles;
}

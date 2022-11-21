import { Color } from 'vs/base/common/color';
export declare type styleFn = (colors: {
    [name: string]: Color | undefined;
}) => void;
export interface IThemable {
    style: styleFn;
}

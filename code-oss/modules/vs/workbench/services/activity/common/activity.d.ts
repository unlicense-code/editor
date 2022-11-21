import { IDisposable } from 'vs/base/common/lifecycle';
import { ThemeIcon } from 'vs/platform/theme/common/themeService';
export interface IActivity {
    readonly badge: IBadge;
    readonly clazz?: string;
    readonly priority?: number;
}
export declare const IActivityService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IActivityService>;
export interface IActivityService {
    readonly _serviceBrand: undefined;
    /**
     * Show activity for the given view container
     */
    showViewContainerActivity(viewContainerId: string, badge: IActivity): IDisposable;
    /**
     * Show activity for the given view
     */
    showViewActivity(viewId: string, badge: IActivity): IDisposable;
    /**
     * Show accounts activity
     */
    showAccountsActivity(activity: IActivity): IDisposable;
    /**
     * Show global activity
     */
    showGlobalActivity(activity: IActivity): IDisposable;
}
export interface IBadge {
    getDescription(): string;
}
declare class BaseBadge implements IBadge {
    readonly descriptorFn: (arg: any) => string;
    constructor(descriptorFn: (arg: any) => string);
    getDescription(): string;
}
export declare class NumberBadge extends BaseBadge {
    readonly number: number;
    constructor(number: number, descriptorFn: (num: number) => string);
    getDescription(): string;
}
export declare class TextBadge extends BaseBadge {
    readonly text: string;
    constructor(text: string, descriptorFn: () => string);
}
export declare class IconBadge extends BaseBadge {
    readonly icon: ThemeIcon;
    constructor(icon: ThemeIcon, descriptorFn: () => string);
}
export declare class ProgressBadge extends BaseBadge {
}
export {};

import { MarkdownString } from 'vs/base/common/htmlContent';
import { URI } from 'vs/base/common/uri';
import { ILinkDescriptor } from 'vs/platform/opener/browser/link';
import { ThemeIcon } from 'vs/platform/theme/common/themeService';
export interface IBannerItem {
    readonly id: string;
    readonly icon: ThemeIcon | URI | undefined;
    readonly message: string | MarkdownString;
    readonly actions?: ILinkDescriptor[];
    readonly ariaLabel?: string;
    readonly onClose?: () => void;
}
export declare const IBannerService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IBannerService>;
export interface IBannerService {
    readonly _serviceBrand: undefined;
    focus(): void;
    focusNextAction(): void;
    focusPreviousAction(): void;
    hide(id: string): void;
    show(item: IBannerItem): void;
}

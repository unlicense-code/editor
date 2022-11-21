import { IHoverDelegate } from 'vs/base/browser/ui/iconLabel/iconHoverDelegate';
import { CancellationToken } from 'vs/base/common/cancellation';
import { IMarkdownString } from 'vs/base/common/htmlContent';
import { IDisposable } from 'vs/base/common/lifecycle';
export interface ITooltipMarkdownString {
    markdown: IMarkdownString | string | undefined | ((token: CancellationToken) => Promise<IMarkdownString | string | undefined>);
    markdownNotSupportedFallback: string | undefined;
}
export declare function setupNativeHover(htmlElement: HTMLElement, tooltip: string | ITooltipMarkdownString | undefined): void;
declare type IHoverContent = string | ITooltipMarkdownString | HTMLElement | undefined;
/**
 * Copied from src\vs\workbench\services\hover\browser\hover.ts
 * @deprecated Use IHoverService
 */
interface IHoverAction {
    label: string;
    commandId: string;
    iconClass?: string;
    run(target: HTMLElement): void;
}
export interface IUpdatableHoverOptions {
    actions?: IHoverAction[];
    linkHandler?(url: string): void;
}
export interface ICustomHover extends IDisposable {
    /**
     * Allows to programmatically open the hover.
     */
    show(focus?: boolean): void;
    /**
     * Allows to programmatically hide the hover.
     */
    hide(): void;
    /**
     * Updates the contents of the hover.
     */
    update(tooltip: IHoverContent, options?: IUpdatableHoverOptions): void;
}
export declare function setupCustomHover(hoverDelegate: IHoverDelegate, htmlElement: HTMLElement, content: IHoverContent, options?: IUpdatableHoverOptions): ICustomHover;
export {};

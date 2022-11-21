import { HoverPosition } from 'vs/base/browser/ui/hover/hoverWidget';
import { IUpdatableHoverOptions } from 'vs/base/browser/ui/iconLabel/iconLabelHover';
import { IMarkdownString } from 'vs/base/common/htmlContent';
import { IDisposable } from 'vs/base/common/lifecycle';
export interface IHoverDelegateTarget extends IDisposable {
    readonly targetElements: readonly HTMLElement[];
    x?: number;
}
export interface IHoverDelegateOptions extends IUpdatableHoverOptions {
    content: IMarkdownString | string | HTMLElement;
    target: IHoverDelegateTarget | HTMLElement;
    hoverPosition?: HoverPosition;
    showPointer?: boolean;
    skipFadeInAnimation?: boolean;
}
export interface IHoverDelegate {
    showHover(options: IHoverDelegateOptions, focus?: boolean): IHoverWidget | undefined;
    onDidHideHover?: () => void;
    delay: number;
    placement?: 'mouse' | 'element';
}
export interface IHoverWidget extends IDisposable {
    readonly isDisposed: boolean;
}

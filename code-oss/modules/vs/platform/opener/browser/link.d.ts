import { Disposable } from 'vs/base/common/lifecycle';
import { IOpenerService } from 'vs/platform/opener/common/opener';
export interface ILinkDescriptor {
    readonly label: string | HTMLElement;
    readonly href: string;
    readonly title?: string;
    readonly tabIndex?: number;
}
export interface ILinkOptions {
    readonly opener?: (href: string) => void;
    readonly textLinkForeground?: string;
}
export declare class Link extends Disposable {
    private _link;
    private el;
    private _enabled;
    get enabled(): boolean;
    set enabled(enabled: boolean);
    set link(link: ILinkDescriptor);
    constructor(container: HTMLElement, _link: ILinkDescriptor, options: ILinkOptions | undefined, openerService: IOpenerService);
}

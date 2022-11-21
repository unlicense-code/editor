import { Widget } from 'vs/base/browser/ui/widget';
import { Codicon } from 'vs/base/common/codicons';
/**
 * The arrow image size.
 */
export declare const ARROW_IMG_SIZE = 11;
export interface ScrollbarArrowOptions {
    onActivate: () => void;
    className: string;
    icon: Codicon;
    bgWidth: number;
    bgHeight: number;
    top?: number;
    left?: number;
    bottom?: number;
    right?: number;
}
export declare class ScrollbarArrow extends Widget {
    private _onActivate;
    bgDomNode: HTMLElement;
    domNode: HTMLElement;
    private _pointerdownRepeatTimer;
    private _pointerdownScheduleRepeatTimer;
    private _pointerMoveMonitor;
    constructor(opts: ScrollbarArrowOptions);
    private _arrowPointerDown;
}

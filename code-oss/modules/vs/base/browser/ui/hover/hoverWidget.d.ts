import { DomScrollableElement } from 'vs/base/browser/ui/scrollbar/scrollableElement';
import { Disposable } from 'vs/base/common/lifecycle';
import 'vs/css!./hover';
export declare const enum HoverPosition {
    LEFT = 0,
    RIGHT = 1,
    BELOW = 2,
    ABOVE = 3
}
export declare class HoverWidget extends Disposable {
    readonly containerDomNode: HTMLElement;
    readonly contentsDomNode: HTMLElement;
    readonly scrollbar: DomScrollableElement;
    constructor();
    onContentsChanged(): void;
}
export declare class HoverAction extends Disposable {
    static render(parent: HTMLElement, actionOptions: {
        label: string;
        iconClass?: string;
        run: (target: HTMLElement) => void;
        commandId: string;
    }, keybindingLabel: string | null): HoverAction;
    private readonly actionContainer;
    private readonly action;
    private constructor();
    setEnabled(enabled: boolean): void;
}

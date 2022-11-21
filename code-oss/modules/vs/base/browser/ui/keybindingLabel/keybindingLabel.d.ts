import { ResolvedKeybinding } from 'vs/base/common/keybindings';
import { OperatingSystem } from 'vs/base/common/platform';
import 'vs/css!./keybindingLabel';
export interface PartMatches {
    ctrlKey?: boolean;
    shiftKey?: boolean;
    altKey?: boolean;
    metaKey?: boolean;
    keyCode?: boolean;
}
export interface Matches {
    firstPart: PartMatches;
    chordPart: PartMatches;
}
export interface KeybindingLabelOptions extends IKeybindingLabelStyles {
    renderUnboundKeybindings?: boolean;
}
export declare type CSSValueString = string;
export interface IKeybindingLabelStyles {
    keybindingLabelBackground?: CSSValueString;
    keybindingLabelForeground?: CSSValueString;
    keybindingLabelBorder?: CSSValueString;
    keybindingLabelBottomBorder?: CSSValueString;
    keybindingLabelShadow?: CSSValueString;
}
export declare class KeybindingLabel {
    private os;
    private domNode;
    private options;
    private readonly keyElements;
    private keybinding;
    private matches;
    private didEverRender;
    private labelBackground;
    private labelBorder;
    private labelBottomBorder;
    private labelShadow;
    constructor(container: HTMLElement, os: OperatingSystem, options?: KeybindingLabelOptions);
    get element(): HTMLElement;
    set(keybinding: ResolvedKeybinding | undefined, matches?: Matches): void;
    private render;
    private clear;
    private renderPart;
    private renderKey;
    private renderUnbound;
    private createKeyElement;
    private static areSame;
}

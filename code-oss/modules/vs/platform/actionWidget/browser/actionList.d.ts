import { Codicon } from 'vs/base/common/codicons';
import { Disposable } from 'vs/base/common/lifecycle';
import 'vs/css!./actionWidget';
import { IActionItem, IActionKeybindingResolver } from 'vs/platform/actionWidget/common/actionWidget';
import { IContextViewService } from 'vs/platform/contextview/browser/contextView';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
export declare const acceptSelectedActionCommand = "acceptSelectedCodeAction";
export declare const previewSelectedActionCommand = "previewSelectedCodeAction";
export interface IRenderDelegate {
    onHide(didCancel?: boolean): void;
    onSelect(action: IActionItem, preview?: boolean): Promise<any>;
}
export interface IListMenuItem<T extends IActionItem> {
    item?: T;
    kind: ActionListItemKind;
    group?: {
        kind?: any;
        icon?: {
            codicon: Codicon;
            color?: string;
        };
        title: string;
    };
    disabled?: boolean;
    label?: string;
}
export declare const enum ActionListItemKind {
    Action = "action",
    Header = "header"
}
export declare class ActionList<T extends IActionItem> extends Disposable {
    private readonly _delegate;
    private readonly _contextViewService;
    private readonly _keybindingService;
    readonly domNode: HTMLElement;
    private readonly _list;
    private readonly _actionLineHeight;
    private readonly _headerLineHeight;
    private readonly _allMenuItems;
    private focusCondition;
    constructor(user: string, items: readonly T[], showHeaders: boolean, _delegate: IRenderDelegate, resolver: IActionKeybindingResolver | undefined, toMenuItems: (inputActions: readonly T[], showHeaders: boolean) => IListMenuItem<T>[], _contextViewService: IContextViewService, _keybindingService: IKeybindingService);
    hide(didCancel?: boolean): void;
    layout(minWidth: number): number;
    focusPrevious(): void;
    focusNext(): void;
    acceptSelected(preview?: boolean): void;
    private onListSelection;
    private onListHover;
    private onListClick;
}

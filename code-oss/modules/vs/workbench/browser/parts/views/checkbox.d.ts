import { Toggle } from 'vs/base/browser/ui/toggle/toggle';
import { Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { ITreeItem } from 'vs/workbench/common/views';
export declare class CheckboxStateHandler extends Disposable {
    private readonly _onDidChangeCheckboxState;
    readonly onDidChangeCheckboxState: Event<ITreeItem[]>;
    setCheckboxState(node: ITreeItem): void;
}
export declare class TreeItemCheckbox extends Disposable {
    private checkboxStateHandler;
    private themeService;
    toggle: Toggle | undefined;
    private checkboxContainer;
    isDisposed: boolean;
    static readonly checkboxClass = "custom-view-tree-node-item-checkbox";
    private readonly _onDidChangeState;
    readonly onDidChangeState: Event<boolean>;
    constructor(container: HTMLElement, checkboxStateHandler: CheckboxStateHandler, themeService: IThemeService);
    render(node: ITreeItem): void;
    private createCheckbox;
    private registerListener;
    private setCheckbox;
    private createCheckboxTitle;
    private removeCheckbox;
}

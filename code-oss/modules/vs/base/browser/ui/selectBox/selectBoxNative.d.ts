import { ISelectBoxDelegate, ISelectBoxOptions, ISelectBoxStyles, ISelectData, ISelectOptionItem } from 'vs/base/browser/ui/selectBox/selectBox';
import { Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
export declare class SelectBoxNative extends Disposable implements ISelectBoxDelegate {
    private selectElement;
    private selectBoxOptions;
    private options;
    private selected;
    private readonly _onDidSelect;
    private styles;
    constructor(options: ISelectOptionItem[], selected: number, styles: ISelectBoxStyles, selectBoxOptions?: ISelectBoxOptions);
    private registerListeners;
    get onDidSelect(): Event<ISelectData>;
    setOptions(options: ISelectOptionItem[], selected?: number): void;
    select(index: number): void;
    setAriaLabel(label: string): void;
    focus(): void;
    blur(): void;
    setFocusable(focusable: boolean): void;
    render(container: HTMLElement): void;
    style(styles: ISelectBoxStyles): void;
    applyStyles(): void;
    private createOption;
}

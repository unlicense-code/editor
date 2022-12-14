import { StandardKeyboardEvent } from 'vs/base/browser/keyboardEvent';
import { IListStyles } from 'vs/base/browser/ui/list/listWidget';
import { Event } from 'vs/base/common/event';
import { IMatch } from 'vs/base/common/filters';
import { IParsedLabelWithIcons } from 'vs/base/common/iconLabels';
import { IQuickInputOptions } from 'vs/base/parts/quickinput/browser/quickInput';
import { QuickPickItem, IQuickPickItem, IQuickPickItemButtonEvent, IQuickPickSeparatorButtonEvent } from 'vs/base/parts/quickinput/common/quickInput';
import 'vs/css!./media/quickInput';
export declare enum QuickInputListFocus {
    First = 1,
    Second = 2,
    Last = 3,
    Next = 4,
    Previous = 5,
    NextPage = 6,
    PreviousPage = 7
}
export declare class QuickInputList {
    private parent;
    readonly id: string;
    private container;
    private list;
    private inputElements;
    private elements;
    private elementsToIndexes;
    matchOnDescription: boolean;
    matchOnDetail: boolean;
    matchOnLabel: boolean;
    matchOnLabelMode: 'fuzzy' | 'contiguous';
    matchOnMeta: boolean;
    sortByLabel: boolean;
    private readonly _onChangedAllVisibleChecked;
    onChangedAllVisibleChecked: Event<boolean>;
    private readonly _onChangedCheckedCount;
    onChangedCheckedCount: Event<number>;
    private readonly _onChangedVisibleCount;
    onChangedVisibleCount: Event<number>;
    private readonly _onChangedCheckedElements;
    onChangedCheckedElements: Event<IQuickPickItem[]>;
    private readonly _onButtonTriggered;
    onButtonTriggered: Event<IQuickPickItemButtonEvent<IQuickPickItem>>;
    private readonly _onSeparatorButtonTriggered;
    onSeparatorButtonTriggered: Event<IQuickPickSeparatorButtonEvent>;
    private readonly _onKeyDown;
    onKeyDown: Event<StandardKeyboardEvent>;
    private readonly _onLeave;
    onLeave: Event<void>;
    private _fireCheckedEvents;
    private elementDisposables;
    private disposables;
    constructor(parent: HTMLElement, id: string, options: IQuickInputOptions);
    get onDidChangeFocus(): Event<(IQuickPickItem | undefined)[]>;
    get onDidChangeSelection(): Event<{
        items: (IQuickPickItem | undefined)[];
        event: UIEvent | undefined;
    }>;
    get scrollTop(): number;
    set scrollTop(scrollTop: number);
    getAllVisibleChecked(): boolean;
    private allVisibleChecked;
    getCheckedCount(): number;
    getVisibleCount(): number;
    setAllVisibleChecked(checked: boolean): void;
    setElements(inputElements: Array<QuickPickItem>): void;
    getElementsCount(): number;
    getFocusedElements(): (IQuickPickItem | undefined)[];
    setFocusedElements(items: IQuickPickItem[]): void;
    getActiveDescendant(): string | null;
    getSelectedElements(): (IQuickPickItem | undefined)[];
    setSelectedElements(items: IQuickPickItem[]): void;
    getCheckedElements(): IQuickPickItem[];
    setCheckedElements(items: IQuickPickItem[]): void;
    set enabled(value: boolean);
    focus(what: QuickInputListFocus): void;
    clearFocus(): void;
    domFocus(): void;
    layout(maxHeight?: number): void;
    filter(query: string): boolean;
    toggleCheckbox(): void;
    display(display: boolean): void;
    isDisplayed(): boolean;
    dispose(): void;
    private fireCheckedEvents;
    private fireButtonTriggered;
    private fireSeparatorButtonTriggered;
    style(styles: IListStyles): void;
}
export declare function matchesContiguousIconAware(query: string, target: IParsedLabelWithIcons): IMatch[] | null;

import { SelectBox } from 'vs/base/browser/ui/selectBox/selectBox';
import { IAction } from 'vs/base/common/actions';
import { Emitter, Event } from 'vs/base/common/event';
import { Disposable, DisposableStore } from 'vs/base/common/lifecycle';
import 'vs/css!./media/settingsWidgets';
import { IContextViewService } from 'vs/platform/contextview/browser/contextView';
import { IThemeService } from 'vs/platform/theme/common/themeService';
declare type EditKey = 'none' | 'create' | number;
declare type RowElementGroup = {
    rowElement: HTMLElement;
    keyElement: HTMLElement;
    valueElement?: HTMLElement;
};
declare type IListViewItem<TDataItem extends object> = TDataItem & {
    editing?: boolean;
    selected?: boolean;
};
export declare class ListSettingListModel<TDataItem extends object> {
    protected _dataItems: TDataItem[];
    private _editKey;
    private _selectedIdx;
    private _newDataItem;
    get items(): IListViewItem<TDataItem>[];
    constructor(newItem: TDataItem);
    setEditKey(key: EditKey): void;
    setValue(listData: TDataItem[]): void;
    select(idx: number | null): void;
    getSelected(): number | null;
    selectNext(): void;
    selectPrevious(): void;
}
export interface ISettingListChangeEvent<TDataItem extends object> {
    originalItem: TDataItem;
    item?: TDataItem;
    targetIndex?: number;
    sourceIndex?: number;
}
export declare abstract class AbstractListSettingWidget<TDataItem extends object> extends Disposable {
    private container;
    protected readonly themeService: IThemeService;
    protected readonly contextViewService: IContextViewService;
    private listElement;
    private rowElements;
    protected readonly _onDidChangeList: Emitter<ISettingListChangeEvent<TDataItem>>;
    protected readonly model: ListSettingListModel<TDataItem>;
    protected readonly listDisposables: DisposableStore;
    readonly onDidChangeList: Event<ISettingListChangeEvent<TDataItem>>;
    get domNode(): HTMLElement;
    get items(): TDataItem[];
    get inReadMode(): boolean;
    constructor(container: HTMLElement, themeService: IThemeService, contextViewService: IContextViewService);
    setValue(listData: TDataItem[]): void;
    protected abstract getEmptyItem(): TDataItem;
    protected abstract getContainerClasses(): string[];
    protected abstract getActionsForItem(item: TDataItem, idx: number): IAction[];
    protected abstract renderItem(item: TDataItem, idx: number): RowElementGroup;
    protected abstract renderEdit(item: TDataItem, idx: number): HTMLElement;
    protected abstract isItemNew(item: TDataItem): boolean;
    protected abstract addTooltipsToRow(rowElement: RowElementGroup, item: TDataItem): void;
    protected abstract getLocalizedStrings(): {
        deleteActionTooltip: string;
        editActionTooltip: string;
        addButtonLabel: string;
    };
    protected renderHeader(): HTMLElement | undefined;
    protected isAddButtonVisible(): boolean;
    protected renderList(): void;
    protected createBasicSelectBox(value: IObjectEnumData): SelectBox;
    protected editSetting(idx: number): void;
    cancelEdit(): void;
    protected handleItemChange(originalItem: TDataItem, changedItem: TDataItem, idx: number): void;
    protected renderDataOrEditItem(item: IListViewItem<TDataItem>, idx: number, listFocused: boolean): HTMLElement;
    private renderDataItem;
    private renderAddButton;
    private onListClick;
    private onListDoubleClick;
    private getClickedItemIndex;
    private selectRow;
    private selectNextRow;
    private selectPreviousRow;
}
interface IListSetValueOptions {
    showAddButton: boolean;
    keySuggester?: IObjectKeySuggester;
}
export interface IListDataItem {
    value: ObjectKey;
    sibling?: string;
}
export declare class ListSettingWidget extends AbstractListSettingWidget<IListDataItem> {
    private keyValueSuggester;
    private showAddButton;
    setValue(listData: IListDataItem[], options?: IListSetValueOptions): void;
    protected getEmptyItem(): IListDataItem;
    protected isAddButtonVisible(): boolean;
    protected getContainerClasses(): string[];
    protected getActionsForItem(item: IListDataItem, idx: number): IAction[];
    private dragDetails;
    private getDragImage;
    protected renderItem(item: IListDataItem, idx: number): RowElementGroup;
    protected addDragAndDrop(rowElement: HTMLElement, item: IListDataItem, idx: number): void;
    protected renderEdit(item: IListDataItem, idx: number): HTMLElement;
    protected isItemNew(item: IListDataItem): boolean;
    protected addTooltipsToRow(rowElementGroup: RowElementGroup, { value, sibling }: IListDataItem): void;
    protected getLocalizedStrings(): {
        deleteActionTooltip: string;
        editActionTooltip: string;
        addButtonLabel: string;
        inputPlaceholder: string;
        siblingInputPlaceholder: string;
    };
    private renderInputBox;
    private renderDropdown;
}
export declare class ExcludeSettingWidget extends ListSettingWidget {
    protected getContainerClasses(): string[];
    protected addDragAndDrop(rowElement: HTMLElement, item: IListDataItem, idx: number): void;
    protected addTooltipsToRow(rowElementGroup: RowElementGroup, { value, sibling }: IListDataItem): void;
    protected getLocalizedStrings(): {
        deleteActionTooltip: string;
        editActionTooltip: string;
        addButtonLabel: string;
        inputPlaceholder: string;
        siblingInputPlaceholder: string;
    };
}
interface IObjectStringData {
    type: 'string';
    data: string;
}
export interface IObjectEnumOption {
    value: string;
    description?: string;
}
interface IObjectEnumData {
    type: 'enum';
    data: string;
    options: IObjectEnumOption[];
}
interface IObjectBoolData {
    type: 'boolean';
    data: boolean;
}
declare type ObjectKey = IObjectStringData | IObjectEnumData;
export declare type ObjectValue = IObjectStringData | IObjectEnumData | IObjectBoolData;
export interface IObjectDataItem {
    key: ObjectKey;
    value: ObjectValue;
    keyDescription?: string;
    removable: boolean;
}
export interface IObjectValueSuggester {
    (key: string): ObjectValue | undefined;
}
export interface IObjectKeySuggester {
    (existingKeys: string[], idx?: number): IObjectEnumData | undefined;
}
interface IObjectSetValueOptions {
    settingKey: string;
    showAddButton: boolean;
    keySuggester: IObjectKeySuggester;
    valueSuggester: IObjectValueSuggester;
}
export declare class ObjectSettingDropdownWidget extends AbstractListSettingWidget<IObjectDataItem> {
    private currentSettingKey;
    private showAddButton;
    private keySuggester;
    private valueSuggester;
    setValue(listData: IObjectDataItem[], options?: IObjectSetValueOptions): void;
    isItemNew(item: IObjectDataItem): boolean;
    protected isAddButtonVisible(): boolean;
    protected getEmptyItem(): IObjectDataItem;
    protected getContainerClasses(): string[];
    protected getActionsForItem(item: IObjectDataItem, idx: number): IAction[];
    protected renderHeader(): HTMLElement;
    protected renderItem(item: IObjectDataItem, idx: number): RowElementGroup;
    protected renderEdit(item: IObjectDataItem, idx: number): HTMLElement;
    private renderEditWidget;
    private renderStringEditWidget;
    private renderEnumEditWidget;
    private shouldUseSuggestion;
    protected addTooltipsToRow(rowElementGroup: RowElementGroup, item: IObjectDataItem): void;
    private getEnumDescription;
    protected getLocalizedStrings(): {
        deleteActionTooltip: string;
        resetActionTooltip: string;
        editActionTooltip: string;
        addButtonLabel: string;
        keyHeaderText: string;
        valueHeaderText: string;
    };
}
interface IBoolObjectSetValueOptions {
    settingKey: string;
}
export declare class ObjectSettingCheckboxWidget extends AbstractListSettingWidget<IObjectDataItem> {
    private currentSettingKey;
    setValue(listData: IObjectDataItem[], options?: IBoolObjectSetValueOptions): void;
    isItemNew(item: IObjectDataItem): boolean;
    protected getEmptyItem(): IObjectDataItem;
    protected getContainerClasses(): string[];
    protected getActionsForItem(item: IObjectDataItem, idx: number): IAction[];
    protected isAddButtonVisible(): boolean;
    protected renderHeader(): undefined;
    protected renderDataOrEditItem(item: IListViewItem<IObjectDataItem>, idx: number, listFocused: boolean): HTMLElement;
    protected renderItem(item: IObjectDataItem, idx: number): RowElementGroup;
    protected renderEdit(item: IObjectDataItem, idx: number): HTMLElement;
    private renderEditWidget;
    protected addTooltipsToRow(rowElementGroup: RowElementGroup, item: IObjectDataItem): void;
    protected getLocalizedStrings(): {
        deleteActionTooltip: string;
        resetActionTooltip: string;
        editActionTooltip: string;
        addButtonLabel: string;
        keyHeaderText: string;
        valueHeaderText: string;
    };
}
export {};

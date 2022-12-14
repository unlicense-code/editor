import { Event } from 'vs/base/common/event';
import { IMatch } from 'vs/base/common/filters';
import { IItemAccessor } from 'vs/base/common/fuzzyScorer';
import { ResolvedKeybinding } from 'vs/base/common/keybindings';
import { IDisposable } from 'vs/base/common/lifecycle';
import Severity from 'vs/base/common/severity';
import { URI } from 'vs/base/common/uri';
export interface IQuickPickItemHighlights {
    label?: IMatch[];
    description?: IMatch[];
    detail?: IMatch[];
}
export declare type QuickPickItem = IQuickPickSeparator | IQuickPickItem;
export interface IQuickPickItem {
    type?: 'item';
    id?: string;
    label: string;
    meta?: string;
    ariaLabel?: string;
    description?: string;
    detail?: string;
    /**
     * Allows to show a keybinding next to the item to indicate
     * how the item can be triggered outside of the picker using
     * keyboard shortcut.
     */
    keybinding?: ResolvedKeybinding;
    iconClasses?: readonly string[];
    italic?: boolean;
    strikethrough?: boolean;
    highlights?: IQuickPickItemHighlights;
    buttons?: readonly IQuickInputButton[];
    picked?: boolean;
    alwaysShow?: boolean;
}
export interface IQuickPickSeparator {
    type: 'separator';
    id?: string;
    label?: string;
    ariaLabel?: string;
    buttons?: readonly IQuickInputButton[];
}
export interface IKeyMods {
    readonly ctrlCmd: boolean;
    readonly alt: boolean;
}
export declare const NO_KEY_MODS: IKeyMods;
export interface IQuickNavigateConfiguration {
    keybindings: readonly ResolvedKeybinding[];
}
export interface IPickOptions<T extends IQuickPickItem> {
    /**
     * an optional string to show as the title of the quick input
     */
    title?: string;
    /**
     * an optional string to show as placeholder in the input box to guide the user what she picks on
     */
    placeHolder?: string;
    /**
     * an optional flag to include the description when filtering the picks
     */
    matchOnDescription?: boolean;
    /**
     * an optional flag to include the detail when filtering the picks
     */
    matchOnDetail?: boolean;
    /**
     * an optional flag to filter the picks based on label. Defaults to true.
     */
    matchOnLabel?: boolean;
    /**
     * an option flag to control whether focus is always automatically brought to a list item. Defaults to true.
     */
    autoFocusOnList?: boolean;
    /**
     * an optional flag to not close the picker on focus lost
     */
    ignoreFocusLost?: boolean;
    /**
     * an optional flag to make this picker multi-select
     */
    canPickMany?: boolean;
    /**
     * enables quick navigate in the picker to open an element without typing
     */
    quickNavigate?: IQuickNavigateConfiguration;
    /**
     * Hides the input box from the picker UI. This is typically used
     * in combination with quick-navigation where no search UI should
     * be presented.
     */
    hideInput?: boolean;
    /**
     * a context key to set when this picker is active
     */
    contextKey?: string;
    /**
     * an optional property for the item to focus initially.
     */
    activeItem?: Promise<T> | T;
    onKeyMods?: (keyMods: IKeyMods) => void;
    onDidFocus?: (entry: T) => void;
    onDidTriggerItemButton?: (context: IQuickPickItemButtonContext<T>) => void;
    onDidTriggerSeparatorButton?: (context: IQuickPickSeparatorButtonEvent) => void;
}
export interface IInputOptions {
    /**
     * an optional string to show as the title of the quick input
     */
    title?: string;
    /**
     * the value to prefill in the input box
     */
    value?: string;
    /**
     * the selection of value, default to the whole prefilled value
     */
    valueSelection?: readonly [number, number];
    /**
     * the text to display underneath the input box
     */
    prompt?: string;
    /**
     * an optional string to show as placeholder in the input box to guide the user what to type
     */
    placeHolder?: string;
    /**
     * Controls if a password input is shown. Password input hides the typed text.
     */
    password?: boolean;
    /**
     * an optional flag to not close the input on focus lost
     */
    ignoreFocusLost?: boolean;
    /**
     * an optional function that is used to validate user input.
     */
    validateInput?: (input: string) => Promise<string | null | undefined | {
        content: string;
        severity: Severity;
    }>;
}
export declare enum QuickInputHideReason {
    /**
     * Focus moved away from the quick input.
     */
    Blur = 1,
    /**
     * An explicit user gesture, e.g. pressing Escape key.
     */
    Gesture = 2,
    /**
     * Anything else.
     */
    Other = 3
}
export interface IQuickInputHideEvent {
    reason: QuickInputHideReason;
}
export interface IQuickInput extends IDisposable {
    readonly onDidHide: Event<IQuickInputHideEvent>;
    readonly onDispose: Event<void>;
    title: string | undefined;
    description: string | undefined;
    step: number | undefined;
    totalSteps: number | undefined;
    enabled: boolean;
    contextKey: string | undefined;
    busy: boolean;
    ignoreFocusOut: boolean;
    show(): void;
    hide(): void;
}
export interface IQuickPickWillAcceptEvent {
    /**
     * Allows to disable the default accept handling
     * of the picker. If `veto` is called, the picker
     * will not trigger the `onDidAccept` event.
     */
    veto(): void;
}
export interface IQuickPickDidAcceptEvent {
    /**
     * Signals if the picker item is to be accepted
     * in the background while keeping the picker open.
     */
    inBackground: boolean;
}
export declare enum ItemActivation {
    NONE = 0,
    FIRST = 1,
    SECOND = 2,
    LAST = 3
}
export interface IQuickPick<T extends IQuickPickItem> extends IQuickInput {
    value: string;
    /**
     * A method that allows to massage the value used
     * for filtering, e.g, to remove certain parts.
     */
    filterValue: (value: string) => string;
    ariaLabel: string | undefined;
    placeholder: string | undefined;
    readonly onDidChangeValue: Event<string>;
    readonly onWillAccept: Event<IQuickPickWillAcceptEvent>;
    readonly onDidAccept: Event<IQuickPickDidAcceptEvent>;
    /**
     * If enabled, will fire the `onDidAccept` event when
     * pressing the arrow-right key with the idea of accepting
     * the selected item without closing the picker.
     */
    canAcceptInBackground: boolean;
    ok: boolean | 'default';
    readonly onDidCustom: Event<void>;
    customButton: boolean;
    customLabel: string | undefined;
    customHover: string | undefined;
    buttons: ReadonlyArray<IQuickInputButton>;
    readonly onDidTriggerButton: Event<IQuickInputButton>;
    readonly onDidTriggerItemButton: Event<IQuickPickItemButtonEvent<T>>;
    readonly onDidTriggerSeparatorButton: Event<IQuickPickSeparatorButtonEvent>;
    items: ReadonlyArray<T | IQuickPickSeparator>;
    scrollTop: number;
    canSelectMany: boolean;
    matchOnDescription: boolean;
    matchOnDetail: boolean;
    matchOnLabel: boolean;
    /**
     * The mode to filter label with. Fuzzy will use fuzzy searching and
     * contiguous will make filter entries that do not contain the exact string
     * (including whitespace). This defaults to `'fuzzy'`.
     */
    matchOnLabelMode: 'fuzzy' | 'contiguous';
    sortByLabel: boolean;
    autoFocusOnList: boolean;
    keepScrollPosition: boolean;
    quickNavigate: IQuickNavigateConfiguration | undefined;
    activeItems: ReadonlyArray<T>;
    readonly onDidChangeActive: Event<T[]>;
    /**
     * Allows to control which entry should be activated by default.
     */
    itemActivation: ItemActivation;
    selectedItems: ReadonlyArray<T>;
    readonly onDidChangeSelection: Event<T[]>;
    readonly keyMods: IKeyMods;
    valueSelection: Readonly<[number, number]> | undefined;
    validationMessage: string | undefined;
    inputHasFocus(): boolean;
    focusOnInput(): void;
    /**
     * Hides the input box from the picker UI. This is typically used
     * in combination with quick-navigation where no search UI should
     * be presented.
     */
    hideInput: boolean;
    hideCheckAll: boolean;
    /**
     * A set of `Toggle` objects to add to the input box.
     */
    toggles: IQuickInputToggle[] | undefined;
}
export interface IQuickInputToggle {
    onChange: Event<boolean>;
}
export interface IInputBox extends IQuickInput {
    /**
     * Value shown in the input box.
     */
    value: string;
    /**
     * Provide start and end values to be selected in the input box.
     */
    valueSelection: Readonly<[number, number]> | undefined;
    /**
     * Value shown as example for input.
     */
    placeholder: string | undefined;
    /**
     * Determines if the input value should be hidden while typing.
     */
    password: boolean;
    /**
     * Event called when the input value changes.
     */
    readonly onDidChangeValue: Event<string>;
    /**
     * Event called when the user submits the input.
     */
    readonly onDidAccept: Event<void>;
    /**
     * Buttons to show in addition to user input submission.
     */
    buttons: ReadonlyArray<IQuickInputButton>;
    /**
     * Event called when a button is selected.
     */
    readonly onDidTriggerButton: Event<IQuickInputButton>;
    /**
     * Text show below the input box.
     */
    prompt: string | undefined;
    /**
     * An optional validation message indicating a problem with the current input value.
     * Returning undefined clears the validation message.
     */
    validationMessage: string | undefined;
    /**
     * Severity of the input validation message.
     */
    severity: Severity;
}
export interface IQuickInputButton {
    /** iconPath or iconClass required */
    iconPath?: {
        dark: URI;
        light?: URI;
    };
    /** iconPath or iconClass required */
    iconClass?: string;
    tooltip?: string;
    /**
     * Whether to always show the button. By default buttons
     * are only visible when hovering over them with the mouse
     */
    alwaysVisible?: boolean;
}
export interface IQuickPickItemButtonEvent<T extends IQuickPickItem> {
    button: IQuickInputButton;
    item: T;
}
export interface IQuickPickSeparatorButtonEvent {
    button: IQuickInputButton;
    separator: IQuickPickSeparator;
}
export interface IQuickPickItemButtonContext<T extends IQuickPickItem> extends IQuickPickItemButtonEvent<T> {
    removeItem(): void;
}
export declare type QuickPickInput<T = IQuickPickItem> = T | IQuickPickSeparator;
export declare type IQuickPickItemWithResource = IQuickPickItem & {
    resource?: URI;
};
export declare class QuickPickItemScorerAccessor implements IItemAccessor<IQuickPickItemWithResource> {
    private options?;
    constructor(options?: {
        skipDescription?: boolean | undefined;
        skipPath?: boolean | undefined;
    } | undefined);
    getItemLabel(entry: IQuickPickItemWithResource): string;
    getItemDescription(entry: IQuickPickItemWithResource): string | undefined;
    getItemPath(entry: IQuickPickItemWithResource): string | undefined;
}
export declare const quickPickItemScorerAccessor: QuickPickItemScorerAccessor;

import 'vs/css!./suggestEnabledInput';
import { Dimension } from 'vs/base/browser/dom';
import { Widget } from 'vs/base/browser/ui/widget';
import { Color } from 'vs/base/common/color';
import { Event } from 'vs/base/common/event';
import { IDisposable } from 'vs/base/common/lifecycle';
import { CodeEditorWidget } from 'vs/editor/browser/widget/codeEditorWidget';
import * as languages from 'vs/editor/common/languages';
import { IModelService } from 'vs/editor/common/services/model';
import { IContextKey, IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ColorIdentifier } from 'vs/platform/theme/common/colorRegistry';
import { IStyleOverrides } from 'vs/platform/theme/common/styler';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { IThemable } from 'vs/base/common/styler';
import { HistoryNavigator } from 'vs/base/common/history';
import { IHistoryNavigationWidget } from 'vs/base/browser/history';
import { ILanguageFeaturesService } from 'vs/editor/common/services/languageFeatures';
export interface SuggestResultsProvider {
    /**
     * Provider function for suggestion results.
     *
     * @param query the full text of the input.
     */
    provideResults: (query: string) => (Partial<languages.CompletionItem> & ({
        label: string;
    }) | string)[];
    /**
     * Trigger characters for this input. Suggestions will appear when one of these is typed,
     * or upon `ctrl+space` triggering at a word boundary.
     *
     * Defaults to the empty array.
     */
    triggerCharacters?: string[];
    /**
     * Defines the sorting function used when showing results.
     *
     * Defaults to the identity function.
     */
    sortKey?: (result: string) => string;
}
interface SuggestEnabledInputOptions {
    /**
     * The text to show when no input is present.
     *
     * Defaults to the empty string.
     */
    placeholderText?: string;
    value?: string;
    /**
     * Context key tracking the focus state of this element
     */
    focusContextKey?: IContextKey<boolean>;
}
export interface ISuggestEnabledInputStyleOverrides extends IStyleOverrides {
    inputBackground?: ColorIdentifier;
    inputForeground?: ColorIdentifier;
    inputBorder?: ColorIdentifier;
    inputPlaceholderForeground?: ColorIdentifier;
}
declare type ISuggestEnabledInputStyles = {
    [P in keyof ISuggestEnabledInputStyleOverrides]: Color | undefined;
};
export declare function attachSuggestEnabledInputBoxStyler(widget: IThemable, themeService: IThemeService, style?: ISuggestEnabledInputStyleOverrides): IDisposable;
export declare class SuggestEnabledInput extends Widget implements IThemable {
    private readonly _onShouldFocusResults;
    readonly onShouldFocusResults: Event<void>;
    private readonly _onEnter;
    readonly onEnter: Event<void>;
    private readonly _onInputDidChange;
    readonly onInputDidChange: Event<string | undefined>;
    private readonly _onDidFocus;
    readonly onDidFocus: Event<void>;
    private readonly _onDidBlur;
    readonly onDidBlur: Event<void>;
    readonly inputWidget: CodeEditorWidget;
    private readonly inputModel;
    protected stylingContainer: HTMLDivElement;
    readonly element: HTMLElement;
    private placeholderText;
    constructor(id: string, parent: HTMLElement, suggestionProvider: SuggestResultsProvider, ariaLabel: string, resourceHandle: string, options: SuggestEnabledInputOptions, defaultInstantiationService: IInstantiationService, modelService: IModelService, contextKeyService: IContextKeyService, languageFeaturesService: ILanguageFeaturesService);
    protected getScopedContextKeyService(_contextKeyService: IContextKeyService): IContextKeyService | undefined;
    updateAriaLabel(label: string): void;
    setValue(val: string): void;
    getValue(): string;
    style(colors: ISuggestEnabledInputStyles): void;
    focus(selectAll?: boolean): void;
    onHide(): void;
    layout(dimension: Dimension): void;
    private selectAll;
}
export interface ISuggestEnabledHistoryOptions {
    id: string;
    ariaLabel: string;
    parent: HTMLElement;
    suggestionProvider: SuggestResultsProvider;
    resourceHandle: string;
    suggestOptions: SuggestEnabledInputOptions;
    history: string[];
}
export declare class SuggestEnabledInputWithHistory extends SuggestEnabledInput implements IHistoryNavigationWidget {
    protected readonly history: HistoryNavigator<string>;
    constructor({ id, parent, ariaLabel, suggestionProvider, resourceHandle, suggestOptions, history }: ISuggestEnabledHistoryOptions, instantiationService: IInstantiationService, modelService: IModelService, contextKeyService: IContextKeyService, languageFeaturesService: ILanguageFeaturesService);
    addToHistory(): void;
    getHistory(): string[];
    showNextValue(): void;
    showPreviousValue(): void;
    clearHistory(): void;
    private getCurrentValue;
    private getPreviousValue;
    private getNextValue;
}
export declare class ContextScopedSuggestEnabledInputWithHistory extends SuggestEnabledInputWithHistory {
    private historyContext;
    constructor(options: ISuggestEnabledHistoryOptions, instantiationService: IInstantiationService, modelService: IModelService, contextKeyService: IContextKeyService, languageFeaturesService: ILanguageFeaturesService);
    protected getScopedContextKeyService(contextKeyService: IContextKeyService): IContextKeyService;
}
export {};

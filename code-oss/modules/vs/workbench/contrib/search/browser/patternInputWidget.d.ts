import * as dom from 'vs/base/browser/dom';
import { IContextViewProvider } from 'vs/base/browser/ui/contextview/contextview';
import { HistoryInputBox, IInputBoxStyles } from 'vs/base/browser/ui/inputbox/inputBox';
import { Widget } from 'vs/base/browser/ui/widget';
import { Event as CommonEvent } from 'vs/base/common/event';
import type { IThemable } from 'vs/base/common/styler';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { IThemeService } from 'vs/platform/theme/common/themeService';
export interface IOptions {
    placeholder?: string;
    showPlaceholderOnFocus?: boolean;
    tooltip?: string;
    width?: number;
    ariaLabel?: string;
    history?: string[];
}
export declare class PatternInputWidget extends Widget implements IThemable {
    private contextViewProvider;
    protected themeService: IThemeService;
    private readonly contextKeyService;
    protected readonly configurationService: IConfigurationService;
    private readonly keybindingService;
    static OPTION_CHANGE: string;
    inputFocusTracker: dom.IFocusTracker;
    private width;
    private domNode;
    protected inputBox: HistoryInputBox;
    private _onSubmit;
    onSubmit: CommonEvent<boolean>;
    private _onCancel;
    onCancel: CommonEvent<void>;
    constructor(parent: HTMLElement, contextViewProvider: IContextViewProvider, options: IOptions | undefined, themeService: IThemeService, contextKeyService: IContextKeyService, configurationService: IConfigurationService, keybindingService: IKeybindingService);
    dispose(): void;
    setWidth(newWidth: number): void;
    getValue(): string;
    setValue(value: string): void;
    select(): void;
    focus(): void;
    inputHasFocus(): boolean;
    private setInputWidth;
    protected getSubcontrolsWidth(): number;
    getHistory(): string[];
    clearHistory(): void;
    clear(): void;
    onSearchSubmit(): void;
    showNextTerm(): void;
    showPreviousTerm(): void;
    style(styles: IInputBoxStyles): void;
    private render;
    protected renderSubcontrols(_controlsDiv: HTMLDivElement): void;
    private onInputKeyUp;
}
export declare class IncludePatternInputWidget extends PatternInputWidget {
    private _onChangeSearchInEditorsBoxEmitter;
    onChangeSearchInEditorsBox: CommonEvent<void>;
    constructor(parent: HTMLElement, contextViewProvider: IContextViewProvider, options: IOptions | undefined, themeService: IThemeService, contextKeyService: IContextKeyService, configurationService: IConfigurationService, keybindingService: IKeybindingService);
    private useSearchInEditorsBox;
    dispose(): void;
    onlySearchInOpenEditors(): boolean;
    setOnlySearchInOpenEditors(value: boolean): void;
    protected getSubcontrolsWidth(): number;
    protected renderSubcontrols(controlsDiv: HTMLDivElement): void;
}
export declare class ExcludePatternInputWidget extends PatternInputWidget {
    private _onChangeIgnoreBoxEmitter;
    onChangeIgnoreBox: CommonEvent<void>;
    constructor(parent: HTMLElement, contextViewProvider: IContextViewProvider, options: IOptions | undefined, themeService: IThemeService, contextKeyService: IContextKeyService, configurationService: IConfigurationService, keybindingService: IKeybindingService);
    private useExcludesAndIgnoreFilesBox;
    dispose(): void;
    useExcludesAndIgnoreFiles(): boolean;
    setUseExcludesAndIgnoreFiles(value: boolean): void;
    protected getSubcontrolsWidth(): number;
    protected renderSubcontrols(controlsDiv: HTMLDivElement): void;
}

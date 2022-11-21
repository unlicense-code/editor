import 'vs/css!./simpleFindWidget';
import * as dom from 'vs/base/browser/dom';
import { Widget } from 'vs/base/browser/ui/widget';
import { FindReplaceState } from 'vs/editor/contrib/find/browser/findState';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IContextViewService } from 'vs/platform/contextview/browser/contextView';
import { IColorTheme } from 'vs/platform/theme/common/themeService';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
interface IFindOptions {
    showCommonFindToggles?: boolean;
    checkImeCompletionState?: boolean;
    showResultCount?: boolean;
    appendCaseSensitiveLabel?: string;
    appendRegexLabel?: string;
    appendWholeWordsLabel?: string;
    type?: 'Terminal' | 'Webview';
}
export declare abstract class SimpleFindWidget extends Widget {
    private readonly _keybindingService;
    private readonly _findInput;
    private readonly _domNode;
    private readonly _innerDomNode;
    private readonly _focusTracker;
    private readonly _findInputFocusTracker;
    private readonly _updateHistoryDelayer;
    private readonly prevBtn;
    private readonly nextBtn;
    private _matchesCount;
    private _isVisible;
    private _foundMatch;
    private _width;
    constructor(state: FindReplaceState<{
        update: () => {};
    }> | undefined, options: IFindOptions, contextViewService: IContextViewService, contextKeyService: IContextKeyService, _keybindingService: IKeybindingService);
    protected abstract _onInputChanged(): boolean;
    protected abstract find(previous: boolean): void;
    protected abstract findFirst(): void;
    protected abstract _onFocusTrackerFocus(): void;
    protected abstract _onFocusTrackerBlur(): void;
    protected abstract _onFindInputFocusTrackerFocus(): void;
    protected abstract _onFindInputFocusTrackerBlur(): void;
    protected abstract _getResultCount(): Promise<{
        resultIndex: number;
        resultCount: number;
    } | undefined>;
    protected get inputValue(): string;
    get focusTracker(): dom.IFocusTracker;
    updateTheme(theme: IColorTheme): void;
    private _getKeybinding;
    dispose(): void;
    isVisible(): boolean;
    getDomNode(): HTMLElement;
    reveal(initialInput?: string, animated?: boolean): void;
    show(initialInput?: string): void;
    hide(animated?: boolean): void;
    layout(width?: number): void;
    protected _delayedUpdateHistory(): void;
    protected _updateHistory(): void;
    protected _getRegexValue(): boolean;
    protected _getWholeWordValue(): boolean;
    protected _getCaseSensitiveValue(): boolean;
    protected updateButtons(foundMatch: boolean): void;
    protected focusFindBox(): void;
    updateResultCount(): Promise<void>;
    private _announceSearchResults;
}
export {};

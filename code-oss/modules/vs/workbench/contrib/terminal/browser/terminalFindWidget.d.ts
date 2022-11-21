import { SimpleFindWidget } from 'vs/workbench/contrib/codeEditor/browser/find/simpleFindWidget';
import { IContextViewService } from 'vs/platform/contextview/browser/contextView';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { FindReplaceState } from 'vs/editor/contrib/find/browser/findState';
import { ITerminalInstance } from 'vs/workbench/contrib/terminal/browser/terminal';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
export declare class TerminalFindWidget extends SimpleFindWidget {
    readonly findState: FindReplaceState;
    private _instance;
    private readonly _contextKeyService;
    private readonly _themeService;
    private readonly _configurationService;
    private _findInputFocused;
    private _findWidgetFocused;
    private _findWidgetVisible;
    constructor(findState: FindReplaceState, _instance: ITerminalInstance, _contextViewService: IContextViewService, keybindingService: IKeybindingService, _contextKeyService: IContextKeyService, _themeService: IThemeService, _configurationService: IConfigurationService);
    find(previous: boolean, update?: boolean): void;
    reveal(): void;
    show(): void;
    hide(): void;
    protected _getResultCount(): Promise<{
        resultIndex: number;
        resultCount: number;
    } | undefined>;
    protected _onInputChanged(): boolean;
    protected _onFocusTrackerFocus(): void;
    protected _onFocusTrackerBlur(): void;
    protected _onFindInputFocusTrackerFocus(): void;
    protected _onFindInputFocusTrackerBlur(): void;
    findFirst(): void;
    private _findNextWithEvent;
    private _findPreviousWithEvent;
}

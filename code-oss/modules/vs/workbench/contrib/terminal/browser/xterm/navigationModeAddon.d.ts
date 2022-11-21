import { IContextKey } from 'vs/platform/contextkey/common/contextkey';
import type { Terminal, ITerminalAddon } from 'xterm';
import { INavigationMode } from 'vs/workbench/contrib/terminal/common/terminal';
export declare class NavigationModeAddon implements INavigationMode, ITerminalAddon {
    private _navigationModeContextKey;
    private _navigationModeActiveContextKey;
    private _terminal;
    constructor(_navigationModeContextKey: IContextKey<boolean>, _navigationModeActiveContextKey: IContextKey<boolean>);
    activate(terminal: Terminal): void;
    dispose(): void;
    exitNavigationMode(): void;
    focusPreviousPage(): void;
    focusNextPage(): void;
    focusPreviousLine(): void;
    focusNextLine(): void;
    private _focusLine;
    private _focusRow;
}

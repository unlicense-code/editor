import { Disposable, IDisposable } from 'vs/base/common/lifecycle';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { ITerminalCommand } from 'vs/workbench/contrib/terminal/common/terminal';
import { IHoverService } from 'vs/workbench/services/hover/browser/hover';
export declare const enum DecorationSelector {
    CommandDecoration = "terminal-command-decoration",
    Hide = "hide",
    ErrorColor = "error",
    DefaultColor = "default-color",
    Default = "default",
    Codicon = "codicon",
    XtermDecoration = "xterm-decoration",
    OverviewRuler = ".xterm-decoration-overview-ruler",
    QuickFix = "quick-fix",
    LightBulb = "codicon-light-bulb"
}
export declare class TerminalDecorationHoverManager extends Disposable {
    private readonly _hoverService;
    private _hoverDelayer;
    private _contextMenuVisible;
    constructor(_hoverService: IHoverService, configurationService: IConfigurationService, contextMenuService: IContextMenuService);
    hideHover(): void;
    createHover(element: HTMLElement, command: ITerminalCommand | undefined, hoverMessage?: string): IDisposable;
}
export declare function updateLayout(configurationService: IConfigurationService, element?: HTMLElement): void;

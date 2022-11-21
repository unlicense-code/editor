import { IAction } from 'vs/base/common/actions';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { IDebugService, IDebugSession } from 'vs/workbench/contrib/debug/common/debug';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { IContextViewService } from 'vs/platform/contextview/browser/contextView';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { BaseActionViewItem, SelectActionViewItem } from 'vs/base/browser/ui/actionbar/actionViewItems';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
export declare class StartDebugActionViewItem extends BaseActionViewItem {
    private context;
    private readonly debugService;
    private readonly themeService;
    private readonly configurationService;
    private readonly commandService;
    private readonly contextService;
    private readonly keybindingService;
    private static readonly SEPARATOR;
    private container;
    private start;
    private selectBox;
    private debugOptions;
    private toDispose;
    private selected;
    private providers;
    constructor(context: unknown, action: IAction, debugService: IDebugService, themeService: IThemeService, configurationService: IConfigurationService, commandService: ICommandService, contextService: IWorkspaceContextService, contextViewService: IContextViewService, keybindingService: IKeybindingService);
    private registerListeners;
    render(container: HTMLElement): void;
    setActionContext(context: any): void;
    isEnabled(): boolean;
    focus(fromRight?: boolean): void;
    blur(): void;
    setFocusable(focusable: boolean): void;
    dispose(): void;
    private updateOptions;
}
export declare class FocusSessionActionViewItem extends SelectActionViewItem {
    protected readonly debugService: IDebugService;
    private readonly configurationService;
    constructor(action: IAction, session: IDebugSession | undefined, debugService: IDebugService, themeService: IThemeService, contextViewService: IContextViewService, configurationService: IConfigurationService);
    protected getActionContext(_: string, index: number): any;
    private update;
    private getSelectedSession;
    protected getSessions(): ReadonlyArray<IDebugSession>;
    protected mapFocusedSessionToSelected(focusedSession: IDebugSession): IDebugSession;
}

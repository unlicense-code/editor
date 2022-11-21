import { IMenuService } from 'vs/platform/actions/common/actions';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { ViewPane } from 'vs/workbench/browser/parts/views/viewPane';
import { IViewletViewOptions } from 'vs/workbench/browser/parts/views/viewsViewlet';
import { IViewDescriptorService } from 'vs/workbench/common/views';
import { IDebugService, IDebugSession, IStackFrame, IThread } from 'vs/workbench/contrib/debug/common/debug';
import { ThreadAndSessionIds } from 'vs/workbench/contrib/debug/common/debugModel';
declare type CallStackItem = IStackFrame | IThread | IDebugSession | string | ThreadAndSessionIds | IStackFrame[];
export declare function getContext(element: CallStackItem | null): any;
export declare function getContextForContributedActions(element: CallStackItem | null): string | number;
export declare function getSpecificSourceName(stackFrame: IStackFrame): string;
export declare class CallStackView extends ViewPane {
    private options;
    private readonly debugService;
    private readonly menuService;
    private stateMessage;
    private stateMessageLabel;
    private onCallStackChangeScheduler;
    private needsRefresh;
    private ignoreSelectionChangedEvent;
    private ignoreFocusStackFrameEvent;
    private dataSource;
    private tree;
    private autoExpandedSessions;
    private selectionNeedsUpdate;
    constructor(options: IViewletViewOptions, contextMenuService: IContextMenuService, debugService: IDebugService, keybindingService: IKeybindingService, instantiationService: IInstantiationService, viewDescriptorService: IViewDescriptorService, configurationService: IConfigurationService, contextKeyService: IContextKeyService, openerService: IOpenerService, themeService: IThemeService, telemetryService: ITelemetryService, menuService: IMenuService);
    protected renderHeaderTitle(container: HTMLElement): void;
    renderBody(container: HTMLElement): void;
    layoutBody(height: number, width: number): void;
    focus(): void;
    collapseAll(): void;
    private updateTreeSelection;
    private onContextMenu;
}
export {};
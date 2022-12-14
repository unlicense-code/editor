import { ActionBar } from 'vs/base/browser/ui/actionbar/actionbar';
import { IHighlight } from 'vs/base/browser/ui/highlightedlabel/highlightedLabel';
import { IMenuService } from 'vs/platform/actions/common/actions';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IContextMenuService, IContextViewService } from 'vs/platform/contextview/browser/contextView';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { ViewPane } from 'vs/workbench/browser/parts/views/viewPane';
import { IViewletViewOptions } from 'vs/workbench/browser/parts/views/viewsViewlet';
import { IViewDescriptorService } from 'vs/workbench/common/views';
import { AbstractExpressionsRenderer, IExpressionTemplateData, IInputBoxOptions } from 'vs/workbench/contrib/debug/browser/baseDebugView';
import { LinkDetector } from 'vs/workbench/contrib/debug/browser/linkDetector';
import { IDebugService, IExpression } from 'vs/workbench/contrib/debug/common/debug';
export declare class VariablesView extends ViewPane {
    private readonly debugService;
    private readonly menuService;
    private updateTreeScheduler;
    private needsRefresh;
    private tree;
    private savedViewState;
    private autoExpandedScopes;
    constructor(options: IViewletViewOptions, contextMenuService: IContextMenuService, debugService: IDebugService, keybindingService: IKeybindingService, configurationService: IConfigurationService, instantiationService: IInstantiationService, viewDescriptorService: IViewDescriptorService, contextKeyService: IContextKeyService, openerService: IOpenerService, themeService: IThemeService, telemetryService: ITelemetryService, menuService: IMenuService);
    renderBody(container: HTMLElement): void;
    layoutBody(width: number, height: number): void;
    focus(): void;
    collapseAll(): void;
    private onMouseDblClick;
    private onContextMenu;
}
export declare class VariablesRenderer extends AbstractExpressionsRenderer {
    private readonly linkDetector;
    private readonly menuService;
    private readonly contextKeyService;
    static readonly ID = "variable";
    constructor(linkDetector: LinkDetector, menuService: IMenuService, contextKeyService: IContextKeyService, debugService: IDebugService, contextViewService: IContextViewService, themeService: IThemeService);
    get templateId(): string;
    protected renderExpression(expression: IExpression, data: IExpressionTemplateData, highlights: IHighlight[]): void;
    protected getInputBoxOptions(expression: IExpression): IInputBoxOptions;
    protected renderActionBar(actionBar: ActionBar, expression: IExpression): void;
}
export declare const SET_VARIABLE_ID = "debug.setVariable";
export declare const COPY_VALUE_ID = "workbench.debug.viewlet.action.copyValue";
export declare const VIEW_MEMORY_ID = "workbench.debug.viewlet.action.viewMemory";
export declare const BREAK_WHEN_VALUE_CHANGES_ID = "debug.breakWhenValueChanges";
export declare const BREAK_WHEN_VALUE_IS_ACCESSED_ID = "debug.breakWhenValueIsAccessed";
export declare const BREAK_WHEN_VALUE_IS_READ_ID = "debug.breakWhenValueIsRead";
export declare const COPY_EVALUATE_PATH_ID = "debug.copyEvaluatePath";
export declare const ADD_TO_WATCH_ID = "debug.addToWatchExpressions";

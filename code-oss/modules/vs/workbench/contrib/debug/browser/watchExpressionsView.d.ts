import { IViewletViewOptions } from 'vs/workbench/browser/parts/views/viewsViewlet';
import { IDebugService } from 'vs/workbench/contrib/debug/common/debug';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { ViewPane } from 'vs/workbench/browser/parts/views/viewPane';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IViewDescriptorService } from 'vs/workbench/common/views';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IMenuService } from 'vs/platform/actions/common/actions';
export declare class WatchExpressionsView extends ViewPane {
    private readonly debugService;
    private watchExpressionsUpdatedScheduler;
    private needsRefresh;
    private tree;
    private watchExpressionsExist;
    private watchItemType;
    private variableReadonly;
    private menu;
    constructor(options: IViewletViewOptions, contextMenuService: IContextMenuService, debugService: IDebugService, keybindingService: IKeybindingService, instantiationService: IInstantiationService, viewDescriptorService: IViewDescriptorService, configurationService: IConfigurationService, contextKeyService: IContextKeyService, openerService: IOpenerService, themeService: IThemeService, telemetryService: ITelemetryService, menuService: IMenuService);
    renderBody(container: HTMLElement): void;
    layoutBody(height: number, width: number): void;
    focus(): void;
    collapseAll(): void;
    private onMouseDblClick;
    private onContextMenu;
}
export declare const ADD_WATCH_ID = "workbench.debug.viewlet.action.addWatchExpression";
export declare const ADD_WATCH_LABEL: string;
export declare const REMOVE_WATCH_EXPRESSIONS_COMMAND_ID = "workbench.debug.viewlet.action.removeAllWatchExpressions";
export declare const REMOVE_WATCH_EXPRESSIONS_LABEL: string;

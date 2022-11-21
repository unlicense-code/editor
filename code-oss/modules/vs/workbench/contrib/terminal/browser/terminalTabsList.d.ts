import { IListService, WorkbenchList } from 'vs/platform/list/browser/listService';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { ITerminalGroupService, ITerminalInstance, ITerminalService } from 'vs/workbench/contrib/terminal/browser/terminal';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IDecorationsService } from 'vs/workbench/services/decorations/common/decorations';
import { ILifecycleService } from 'vs/workbench/services/lifecycle/common/lifecycle';
export declare const enum TerminalTabsListSizes {
    TabHeight = 22,
    NarrowViewWidth = 46,
    WideViewMinimumWidth = 80,
    DefaultWidth = 120,
    MidpointViewWidth = 63,
    ActionbarMinimumWidth = 105,
    MaximumWidth = 500
}
export declare class TerminalTabList extends WorkbenchList<ITerminalInstance> {
    private readonly _configurationService;
    private readonly _terminalService;
    private readonly _terminalGroupService;
    private readonly _themeService;
    private _decorationsProvider;
    private _terminalTabsSingleSelectedContextKey;
    private _isSplitContextKey;
    constructor(container: HTMLElement, contextKeyService: IContextKeyService, listService: IListService, themeService: IThemeService, _configurationService: IConfigurationService, _terminalService: ITerminalService, _terminalGroupService: ITerminalGroupService, instantiationService: IInstantiationService, decorationsService: IDecorationsService, _themeService: IThemeService, lifecycleService: ILifecycleService);
    private _getFocusMode;
    refresh(cancelEditing?: boolean): void;
    private _updateContextKey;
}

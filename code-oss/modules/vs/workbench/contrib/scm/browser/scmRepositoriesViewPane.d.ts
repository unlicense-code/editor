import 'vs/css!./media/scm';
import { ViewPane, IViewPaneOptions } from 'vs/workbench/browser/parts/views/viewPane';
import { ISCMViewService } from 'vs/workbench/contrib/scm/common/scm';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IViewDescriptorService } from 'vs/workbench/common/views';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
export declare class SCMRepositoriesViewPane extends ViewPane {
    protected scmViewService: ISCMViewService;
    private list;
    constructor(options: IViewPaneOptions, scmViewService: ISCMViewService, keybindingService: IKeybindingService, contextMenuService: IContextMenuService, instantiationService: IInstantiationService, viewDescriptorService: IViewDescriptorService, contextKeyService: IContextKeyService, configurationService: IConfigurationService, openerService: IOpenerService, themeService: IThemeService, telemetryService: ITelemetryService);
    protected renderBody(container: HTMLElement): void;
    private onDidChangeRepositories;
    focus(): void;
    protected layoutBody(height: number, width: number): void;
    private updateBodySize;
    private onListContextMenu;
    private onListSelectionChange;
    private updateListSelection;
}

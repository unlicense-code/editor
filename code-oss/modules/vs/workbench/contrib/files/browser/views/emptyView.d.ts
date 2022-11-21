import { IViewletViewOptions } from 'vs/workbench/browser/parts/views/viewsViewlet';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { ViewPane } from 'vs/workbench/browser/parts/views/viewPane';
import { ILabelService } from 'vs/platform/label/common/label';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IViewDescriptorService } from 'vs/workbench/common/views';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
export declare class EmptyView extends ViewPane {
    private readonly contextService;
    private labelService;
    static readonly ID: string;
    static readonly NAME: string;
    constructor(options: IViewletViewOptions, themeService: IThemeService, viewDescriptorService: IViewDescriptorService, instantiationService: IInstantiationService, keybindingService: IKeybindingService, contextMenuService: IContextMenuService, contextService: IWorkspaceContextService, configurationService: IConfigurationService, labelService: ILabelService, contextKeyService: IContextKeyService, openerService: IOpenerService, telemetryService: ITelemetryService);
    shouldShowWelcome(): boolean;
    protected renderBody(container: HTMLElement): void;
    private refreshTitle;
}

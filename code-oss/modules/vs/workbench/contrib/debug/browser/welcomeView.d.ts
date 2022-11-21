import { IViewletViewOptions } from 'vs/workbench/browser/parts/views/viewsViewlet';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IDebugService } from 'vs/workbench/contrib/debug/common/debug';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { ViewPane } from 'vs/workbench/browser/parts/views/viewPane';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IViewDescriptorService } from 'vs/workbench/common/views';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
export declare class WelcomeView extends ViewPane {
    private readonly debugService;
    private readonly editorService;
    static readonly ID = "workbench.debug.welcome";
    static readonly LABEL: string;
    private debugStartLanguageContext;
    private debuggerInterestedContext;
    constructor(options: IViewletViewOptions, themeService: IThemeService, keybindingService: IKeybindingService, contextMenuService: IContextMenuService, configurationService: IConfigurationService, contextKeyService: IContextKeyService, debugService: IDebugService, editorService: IEditorService, instantiationService: IInstantiationService, viewDescriptorService: IViewDescriptorService, openerService: IOpenerService, storageSevice: IStorageService, telemetryService: ITelemetryService);
    shouldShowWelcome(): boolean;
}

import 'vs/css!./media/auxiliaryBarPart';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { BasePanelPart } from 'vs/workbench/browser/parts/panel/panelPart';
import { IViewDescriptorService } from 'vs/workbench/common/views';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { IWorkbenchLayoutService } from 'vs/workbench/services/layout/browser/layoutService';
import { IActivityHoverOptions } from 'vs/workbench/browser/parts/compositeBarActions';
import { IAction } from 'vs/base/common/actions';
import { LayoutPriority } from 'vs/base/browser/ui/splitview/splitview';
import { ICommandService } from 'vs/platform/commands/common/commands';
export declare class AuxiliaryBarPart extends BasePanelPart {
    private commandService;
    static readonly activePanelSettingsKey = "workbench.auxiliarybar.activepanelid";
    static readonly pinnedPanelsKey = "workbench.auxiliarybar.pinnedPanels";
    static readonly placeholdeViewContainersKey = "workbench.auxiliarybar.placeholderPanels";
    readonly minimumWidth: number;
    readonly maximumWidth: number;
    readonly minimumHeight: number;
    readonly maximumHeight: number;
    readonly priority: LayoutPriority;
    constructor(notificationService: INotificationService, storageService: IStorageService, telemetryService: ITelemetryService, contextMenuService: IContextMenuService, layoutService: IWorkbenchLayoutService, keybindingService: IKeybindingService, instantiationService: IInstantiationService, themeService: IThemeService, viewDescriptorService: IViewDescriptorService, contextKeyService: IContextKeyService, extensionService: IExtensionService, commandService: ICommandService);
    updateStyles(): void;
    protected getActivityHoverOptions(): IActivityHoverOptions;
    protected fillExtraContextMenuActions(actions: IAction[]): void;
    toJSON(): object;
}

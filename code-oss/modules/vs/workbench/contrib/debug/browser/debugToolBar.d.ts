import { IActionViewItem } from 'vs/base/browser/ui/actionbar/actionbar';
import { DisposableStore } from 'vs/base/common/lifecycle';
import 'vs/css!./media/debugToolBar';
import { ServicesAccessor } from 'vs/editor/browser/editorExtensions';
import { IMenuService, MenuItemAction } from 'vs/platform/actions/common/actions';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IThemeService, Themable } from 'vs/platform/theme/common/themeService';
import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
import { IDebugService } from 'vs/workbench/contrib/debug/common/debug';
import { IWorkbenchLayoutService } from 'vs/workbench/services/layout/browser/layoutService';
export declare class DebugToolBar extends Themable implements IWorkbenchContribution {
    private readonly notificationService;
    private readonly telemetryService;
    private readonly debugService;
    private readonly layoutService;
    private readonly storageService;
    private readonly configurationService;
    private readonly instantiationService;
    private $el;
    private dragArea;
    private actionBar;
    private activeActions;
    private updateScheduler;
    private debugToolBarMenu;
    private yCoordinate;
    private isVisible;
    private isBuilt;
    private readonly stopActionViewItemDisposables;
    constructor(notificationService: INotificationService, telemetryService: ITelemetryService, debugService: IDebugService, layoutService: IWorkbenchLayoutService, storageService: IStorageService, configurationService: IConfigurationService, themeService: IThemeService, instantiationService: IInstantiationService, menuService: IMenuService, contextKeyService: IContextKeyService);
    private registerListeners;
    private storePosition;
    protected updateStyles(): void;
    private setYCoordinate;
    private setCoordinates;
    private show;
    private hide;
    dispose(): void;
}
export declare function createDisconnectMenuItemAction(action: MenuItemAction, disposables: DisposableStore, accessor: ServicesAccessor): IActionViewItem | undefined;

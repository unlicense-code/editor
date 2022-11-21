import 'vs/css!./media/activityaction';
import { IAction } from 'vs/base/common/actions';
import { DisposableStore } from 'vs/base/common/lifecycle';
import { IMenuService, MenuId, IMenu } from 'vs/platform/actions/common/actions';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IColorTheme, IThemeService } from 'vs/platform/theme/common/themeService';
import { ActivityAction, ActivityActionViewItem, IActivityActionViewItemOptions, IActivityHoverOptions, ICompositeBar, ICompositeBarColors, ToggleCompositePinnedAction } from 'vs/workbench/browser/parts/compositeBarActions';
import { IActivity } from 'vs/workbench/common/activity';
import { IWorkbenchLayoutService } from 'vs/workbench/services/layout/browser/layoutService';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IAuthenticationService } from 'vs/workbench/services/authentication/common/authentication';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IProductService } from 'vs/platform/product/common/productService';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IHoverService } from 'vs/workbench/services/hover/browser/hover';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { IPaneCompositePart } from 'vs/workbench/browser/parts/paneCompositePart';
import { ICredentialsService } from 'vs/platform/credentials/common/credentials';
import { IUserDataProfileService } from 'vs/workbench/services/userDataProfile/common/userDataProfile';
export declare class ViewContainerActivityAction extends ActivityAction {
    private readonly paneCompositePart;
    private readonly layoutService;
    private readonly telemetryService;
    private readonly configurationService;
    private static readonly preventDoubleClickDelay;
    private lastRun;
    constructor(activity: IActivity, paneCompositePart: IPaneCompositePart, layoutService: IWorkbenchLayoutService, telemetryService: ITelemetryService, configurationService: IConfigurationService);
    updateActivity(activity: IActivity): void;
    run(event: {
        preserveFocus: boolean;
    }): Promise<void>;
    private logAction;
}
declare abstract class AbstractGlobalActivityActionViewItem extends ActivityActionViewItem {
    private contextMenuActionsProvider;
    protected readonly menuService: IMenuService;
    protected readonly contextMenuService: IContextMenuService;
    protected readonly contextKeyService: IContextKeyService;
    protected readonly environmentService: IWorkbenchEnvironmentService;
    constructor(action: ActivityAction, contextMenuActionsProvider: () => IAction[], options: IActivityActionViewItemOptions, themeService: IThemeService, hoverService: IHoverService, menuService: IMenuService, contextMenuService: IContextMenuService, contextKeyService: IContextKeyService, configurationService: IConfigurationService, environmentService: IWorkbenchEnvironmentService, keybindingService: IKeybindingService);
    render(container: HTMLElement): void;
    protected resolveContextMenuActions(disposables: DisposableStore): Promise<IAction[]>;
    protected abstract run(): Promise<void>;
}
declare class MenuActivityActionViewItem extends AbstractGlobalActivityActionViewItem {
    private readonly menuId;
    constructor(menuId: MenuId, action: ActivityAction, contextMenuActionsProvider: () => IAction[], icon: boolean, colors: (theme: IColorTheme) => ICompositeBarColors, hoverOptions: IActivityHoverOptions, themeService: IThemeService, hoverService: IHoverService, menuService: IMenuService, contextMenuService: IContextMenuService, contextKeyService: IContextKeyService, configurationService: IConfigurationService, environmentService: IWorkbenchEnvironmentService, keybindingService: IKeybindingService);
    protected run(): Promise<void>;
    protected resolveMainMenuActions(menu: IMenu, _disposable: DisposableStore): Promise<IAction[]>;
}
export declare class AccountsActivityActionViewItem extends MenuActivityActionViewItem {
    private readonly authenticationService;
    private readonly productService;
    private readonly storageService;
    private readonly credentialsService;
    static readonly ACCOUNTS_VISIBILITY_PREFERENCE_KEY = "workbench.activity.showAccounts";
    constructor(action: ActivityAction, contextMenuActionsProvider: () => IAction[], colors: (theme: IColorTheme) => ICompositeBarColors, activityHoverOptions: IActivityHoverOptions, themeService: IThemeService, hoverService: IHoverService, contextMenuService: IContextMenuService, menuService: IMenuService, contextKeyService: IContextKeyService, authenticationService: IAuthenticationService, environmentService: IWorkbenchEnvironmentService, productService: IProductService, configurationService: IConfigurationService, storageService: IStorageService, keybindingService: IKeybindingService, credentialsService: ICredentialsService);
    protected resolveMainMenuActions(accountsMenu: IMenu, disposables: DisposableStore): Promise<IAction[]>;
    protected resolveContextMenuActions(disposables: DisposableStore): Promise<IAction[]>;
}
export interface IProfileActivity extends IActivity {
    readonly icon: boolean;
}
export declare class ProfilesActivityActionViewItem extends MenuActivityActionViewItem {
    private readonly userDataProfileService;
    private readonly storageService;
    static readonly PROFILES_VISIBILITY_PREFERENCE_KEY = "workbench.activity.showProfiles";
    constructor(action: ActivityAction, contextMenuActionsProvider: () => IAction[], colors: (theme: IColorTheme) => ICompositeBarColors, hoverOptions: IActivityHoverOptions, userDataProfileService: IUserDataProfileService, storageService: IStorageService, themeService: IThemeService, hoverService: IHoverService, menuService: IMenuService, contextMenuService: IContextMenuService, contextKeyService: IContextKeyService, configurationService: IConfigurationService, environmentService: IWorkbenchEnvironmentService, keybindingService: IKeybindingService);
    render(container: HTMLElement): void;
    protected resolveContextMenuActions(disposables: DisposableStore): Promise<IAction[]>;
    protected computeTitle(): string;
}
export declare class GlobalActivityActionViewItem extends MenuActivityActionViewItem {
    constructor(action: ActivityAction, contextMenuActionsProvider: () => IAction[], colors: (theme: IColorTheme) => ICompositeBarColors, activityHoverOptions: IActivityHoverOptions, themeService: IThemeService, hoverService: IHoverService, menuService: IMenuService, contextMenuService: IContextMenuService, contextKeyService: IContextKeyService, configurationService: IConfigurationService, environmentService: IWorkbenchEnvironmentService, keybindingService: IKeybindingService);
}
export declare class PlaceHolderViewContainerActivityAction extends ViewContainerActivityAction {
}
export declare class PlaceHolderToggleCompositePinnedAction extends ToggleCompositePinnedAction {
    constructor(id: string, compositeBar: ICompositeBar);
    setActivity(activity: IActivity): void;
}
export {};

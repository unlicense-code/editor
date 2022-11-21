import 'vs/css!./media/extensionActions';
import { IAction, Action } from 'vs/base/common/actions';
import { Event } from 'vs/base/common/event';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { IExtension, IExtensionsWorkbenchService, IExtensionContainer } from 'vs/workbench/contrib/extensions/common/extensions';
import { IExtensionGalleryService, InstallOptions, InstallOperation } from 'vs/platform/extensionManagement/common/extensionManagement';
import { IWorkbenchExtensionEnablementService, IExtensionManagementServerService, IExtensionManagementServer, IWorkbenchExtensionManagementService } from 'vs/workbench/services/extensionManagement/common/extensionManagement';
import { IExtensionIgnoredRecommendationsService } from 'vs/workbench/services/extensionRecommendations/common/extensionRecommendations';
import { IExtensionManifest } from 'vs/platform/extensions/common/extensions';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IFileService } from 'vs/platform/files/common/files';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { IHostService } from 'vs/workbench/services/host/browser/host';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { URI } from 'vs/base/common/uri';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { ThemeIcon } from 'vs/platform/theme/common/themeService';
import { IJSONEditingService } from 'vs/workbench/services/configuration/common/jsonEditing';
import { ITextModelService } from 'vs/editor/common/services/resolverService';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IQuickInputService } from 'vs/platform/quickinput/common/quickInput';
import { IWorkbenchThemeService } from 'vs/workbench/services/themes/common/workbenchThemeService';
import { ILabelService } from 'vs/platform/label/common/label';
import { ITextFileService } from 'vs/workbench/services/textfile/common/textfiles';
import { IProductService } from 'vs/platform/product/common/productService';
import { IDialogService } from 'vs/platform/dialogs/common/dialogs';
import { IProgressService } from 'vs/platform/progress/common/progress';
import { IActionViewItemOptions, ActionViewItem } from 'vs/base/browser/ui/actionbar/actionViewItems';
import { IUserDataSyncEnablementService } from 'vs/platform/userDataSync/common/userDataSync';
import { ActionWithDropdownActionViewItem, IActionWithDropdownActionViewItemOptions } from 'vs/base/browser/ui/dropdown/dropdownActionViewItem';
import { IContextMenuProvider } from 'vs/base/browser/contextmenu';
import { ILogService } from 'vs/platform/log/common/log';
import { IExtensionManifestPropertiesService } from 'vs/workbench/services/extensions/common/extensionManifestPropertiesService';
import { IWorkspaceTrustEnablementService, IWorkspaceTrustManagementService } from 'vs/platform/workspace/common/workspaceTrust';
import { IMarkdownString } from 'vs/base/common/htmlContent';
import { IPaneCompositePartService } from 'vs/workbench/services/panecomposite/browser/panecomposite';
import { IPreferencesService } from 'vs/workbench/services/preferences/common/preferences';
import { ILanguagePackService } from 'vs/platform/languagePacks/common/languagePacks';
import { ILocaleService } from 'vs/workbench/contrib/localization/common/locale';
export declare class PromptExtensionInstallFailureAction extends Action {
    private readonly extension;
    private readonly version;
    private readonly installOperation;
    private readonly installOptions;
    private readonly error;
    private readonly productService;
    private readonly openerService;
    private readonly notificationService;
    private readonly dialogService;
    private readonly commandService;
    private readonly logService;
    private readonly extensionManagementServerService;
    private readonly instantiationService;
    constructor(extension: IExtension, version: string, installOperation: InstallOperation, installOptions: InstallOptions | undefined, error: Error, productService: IProductService, openerService: IOpenerService, notificationService: INotificationService, dialogService: IDialogService, commandService: ICommandService, logService: ILogService, extensionManagementServerService: IExtensionManagementServerService, instantiationService: IInstantiationService);
    run(): Promise<void>;
}
export declare abstract class ExtensionAction extends Action implements IExtensionContainer {
    static readonly EXTENSION_ACTION_CLASS = "extension-action";
    static readonly TEXT_ACTION_CLASS: string;
    static readonly LABEL_ACTION_CLASS: string;
    static readonly ICON_ACTION_CLASS: string;
    private _extension;
    get extension(): IExtension | null;
    set extension(extension: IExtension | null);
    abstract update(): void;
}
export declare class ActionWithDropDownAction extends ExtensionAction {
    private readonly actionsGroups;
    private action;
    private _menuActions;
    get menuActions(): IAction[];
    get extension(): IExtension | null;
    set extension(extension: IExtension | null);
    protected readonly extensionActions: ExtensionAction[];
    constructor(id: string, label: string, actionsGroups: ExtensionAction[][]);
    update(donotUpdateActions?: boolean): void;
    run(): Promise<void>;
    protected getLabel(action: ExtensionAction): string;
}
export declare abstract class AbstractInstallAction extends ExtensionAction {
    private readonly installPreReleaseVersion;
    private readonly extensionsWorkbenchService;
    private readonly instantiationService;
    private readonly runtimeExtensionService;
    private readonly workbenchThemeService;
    private readonly labelService;
    private readonly dialogService;
    private readonly preferencesService;
    static readonly Class: string;
    protected _manifest: IExtensionManifest | null;
    set manifest(manifest: IExtensionManifest | null);
    private readonly updateThrottler;
    constructor(id: string, installPreReleaseVersion: boolean, cssClass: string, extensionsWorkbenchService: IExtensionsWorkbenchService, instantiationService: IInstantiationService, runtimeExtensionService: IExtensionService, workbenchThemeService: IWorkbenchThemeService, labelService: ILabelService, dialogService: IDialogService, preferencesService: IPreferencesService);
    update(): void;
    protected computeAndUpdateEnablement(): Promise<void>;
    run(): Promise<any>;
    private getThemeAction;
    private install;
    private getRunningExtension;
    protected updateLabel(): void;
    getLabel(primary?: boolean): string;
    protected getInstallOptions(): InstallOptions;
}
export declare class InstallAction extends AbstractInstallAction {
    private readonly extensionManagementServerService;
    private readonly workbenchExtensioManagementService;
    protected readonly userDataSyncEnablementService: IUserDataSyncEnablementService;
    constructor(installPreReleaseVersion: boolean, extensionsWorkbenchService: IExtensionsWorkbenchService, instantiationService: IInstantiationService, runtimeExtensionService: IExtensionService, workbenchThemeService: IWorkbenchThemeService, labelService: ILabelService, dialogService: IDialogService, preferencesService: IPreferencesService, extensionManagementServerService: IExtensionManagementServerService, workbenchExtensioManagementService: IWorkbenchExtensionManagementService, userDataSyncEnablementService: IUserDataSyncEnablementService);
    getLabel(primary?: boolean): string;
    protected getInstallOptions(): InstallOptions;
}
export declare class InstallAndSyncAction extends AbstractInstallAction {
    private readonly userDataSyncEnablementService;
    constructor(installPreReleaseVersion: boolean, extensionsWorkbenchService: IExtensionsWorkbenchService, instantiationService: IInstantiationService, runtimeExtensionService: IExtensionService, workbenchThemeService: IWorkbenchThemeService, labelService: ILabelService, dialogService: IDialogService, preferencesService: IPreferencesService, productService: IProductService, userDataSyncEnablementService: IUserDataSyncEnablementService);
    protected computeAndUpdateEnablement(): Promise<void>;
    protected getInstallOptions(): InstallOptions;
}
export declare class InstallDropdownAction extends ActionWithDropDownAction {
    set manifest(manifest: IExtensionManifest | null);
    constructor(instantiationService: IInstantiationService, extensionsWorkbenchService: IExtensionsWorkbenchService);
    protected getLabel(action: AbstractInstallAction): string;
}
export declare class InstallingLabelAction extends ExtensionAction {
    private static readonly LABEL;
    private static readonly CLASS;
    constructor();
    update(): void;
}
export declare abstract class InstallInOtherServerAction extends ExtensionAction {
    private readonly server;
    private readonly canInstallAnyWhere;
    private readonly fileService;
    private readonly logService;
    private readonly extensionsWorkbenchService;
    protected readonly extensionManagementServerService: IExtensionManagementServerService;
    private readonly extensionManifestPropertiesService;
    private readonly extensionGalleryService;
    protected static readonly INSTALL_LABEL: string;
    protected static readonly INSTALLING_LABEL: string;
    private static readonly Class;
    private static readonly InstallingClass;
    updateWhenCounterExtensionChanges: boolean;
    constructor(id: string, server: IExtensionManagementServer | null, canInstallAnyWhere: boolean, fileService: IFileService, logService: ILogService, extensionsWorkbenchService: IExtensionsWorkbenchService, extensionManagementServerService: IExtensionManagementServerService, extensionManifestPropertiesService: IExtensionManifestPropertiesService, extensionGalleryService: IExtensionGalleryService);
    update(): void;
    protected canInstall(): boolean;
    run(): Promise<void>;
    protected abstract getInstallLabel(): string;
}
export declare class RemoteInstallAction extends InstallInOtherServerAction {
    constructor(canInstallAnyWhere: boolean, fileService: IFileService, logService: ILogService, extensionsWorkbenchService: IExtensionsWorkbenchService, extensionManagementServerService: IExtensionManagementServerService, extensionManifestPropertiesService: IExtensionManifestPropertiesService, extensionGalleryService: IExtensionGalleryService);
    protected getInstallLabel(): string;
}
export declare class LocalInstallAction extends InstallInOtherServerAction {
    constructor(fileService: IFileService, logService: ILogService, extensionsWorkbenchService: IExtensionsWorkbenchService, extensionManagementServerService: IExtensionManagementServerService, extensionManifestPropertiesService: IExtensionManifestPropertiesService, extensionGalleryService: IExtensionGalleryService);
    protected getInstallLabel(): string;
}
export declare class WebInstallAction extends InstallInOtherServerAction {
    constructor(fileService: IFileService, logService: ILogService, extensionsWorkbenchService: IExtensionsWorkbenchService, extensionManagementServerService: IExtensionManagementServerService, extensionManifestPropertiesService: IExtensionManifestPropertiesService, extensionGalleryService: IExtensionGalleryService);
    protected getInstallLabel(): string;
}
export declare class UninstallAction extends ExtensionAction {
    private extensionsWorkbenchService;
    static readonly UninstallLabel: string;
    private static readonly UninstallingLabel;
    private static readonly UninstallClass;
    private static readonly UnInstallingClass;
    constructor(extensionsWorkbenchService: IExtensionsWorkbenchService);
    update(): void;
    run(): Promise<any>;
}
declare abstract class AbstractUpdateAction extends ExtensionAction {
    protected readonly extensionsWorkbenchService: IExtensionsWorkbenchService;
    private static readonly EnabledClass;
    private static readonly DisabledClass;
    private readonly updateThrottler;
    constructor(id: string, label: string | undefined, extensionsWorkbenchService: IExtensionsWorkbenchService);
    update(): void;
    private computeAndUpdateEnablement;
}
export declare class UpdateAction extends AbstractUpdateAction {
    private readonly verbose;
    readonly extensionsWorkbenchService: IExtensionsWorkbenchService;
    protected readonly instantiationService: IInstantiationService;
    constructor(verbose: boolean, extensionsWorkbenchService: IExtensionsWorkbenchService, instantiationService: IInstantiationService);
    update(): void;
    run(): Promise<any>;
    private install;
}
export declare class SkipUpdateAction extends AbstractUpdateAction {
    readonly extensionsWorkbenchService: IExtensionsWorkbenchService;
    constructor(extensionsWorkbenchService: IExtensionsWorkbenchService);
    update(): void;
    run(): Promise<any>;
}
export declare class MigrateDeprecatedExtensionAction extends ExtensionAction {
    private readonly small;
    private extensionsWorkbenchService;
    private static readonly EnabledClass;
    private static readonly DisabledClass;
    constructor(small: boolean, extensionsWorkbenchService: IExtensionsWorkbenchService);
    update(): void;
    run(): Promise<any>;
}
export declare class ExtensionActionWithDropdownActionViewItem extends ActionWithDropdownActionViewItem {
    constructor(action: ActionWithDropDownAction, options: IActionViewItemOptions & IActionWithDropdownActionViewItemOptions, contextMenuProvider: IContextMenuProvider);
    render(container: HTMLElement): void;
    updateClass(): void;
}
export declare abstract class ExtensionDropDownAction extends ExtensionAction {
    protected instantiationService: IInstantiationService;
    constructor(id: string, label: string, cssClass: string, enabled: boolean, instantiationService: IInstantiationService);
    private _actionViewItem;
    createActionViewItem(): DropDownMenuActionViewItem;
    run({ actionGroups, disposeActionsOnHide }: {
        actionGroups: IAction[][];
        disposeActionsOnHide: boolean;
    }): Promise<any>;
}
export declare class DropDownMenuActionViewItem extends ActionViewItem {
    private readonly contextMenuService;
    constructor(action: ExtensionDropDownAction, contextMenuService: IContextMenuService);
    showMenu(menuActionGroups: IAction[][], disposeActionsOnHide: boolean): void;
    private getActions;
}
export declare function getContextMenuActions(extension: IExtension | undefined | null, contextKeyService: IContextKeyService, instantiationService: IInstantiationService): Promise<IAction[][]>;
export declare class ManageExtensionAction extends ExtensionDropDownAction {
    private readonly extensionService;
    private readonly contextKeyService;
    static readonly ID = "extensions.manage";
    private static readonly Class;
    private static readonly HideManageExtensionClass;
    constructor(instantiationService: IInstantiationService, extensionService: IExtensionService, contextKeyService: IContextKeyService);
    getActionGroups(): Promise<IAction[][]>;
    run(): Promise<any>;
    update(): void;
}
export declare class ExtensionEditorManageExtensionAction extends ExtensionDropDownAction {
    private readonly contextKeyService;
    constructor(contextKeyService: IContextKeyService, instantiationService: IInstantiationService);
    update(): void;
    run(): Promise<any>;
}
export declare class MenuItemExtensionAction extends ExtensionAction {
    private readonly action;
    private readonly extensionsWorkbenchService;
    constructor(action: IAction, extensionsWorkbenchService: IExtensionsWorkbenchService);
    update(): void;
    run(): Promise<void>;
}
export declare class SwitchToPreReleaseVersionAction extends ExtensionAction {
    private readonly commandService;
    static readonly ID = "workbench.extensions.action.switchToPreReleaseVersion";
    static readonly TITLE: {
        value: string;
        original: string;
    };
    constructor(icon: boolean, commandService: ICommandService);
    update(): void;
    run(): Promise<any>;
}
export declare class SwitchToReleasedVersionAction extends ExtensionAction {
    private readonly commandService;
    static readonly ID = "workbench.extensions.action.switchToReleaseVersion";
    static readonly TITLE: {
        value: string;
        original: string;
    };
    constructor(icon: boolean, commandService: ICommandService);
    update(): void;
    run(): Promise<any>;
}
export declare class InstallAnotherVersionAction extends ExtensionAction {
    private readonly extensionsWorkbenchService;
    private readonly extensionGalleryService;
    private readonly quickInputService;
    private readonly instantiationService;
    private readonly dialogService;
    static readonly ID = "workbench.extensions.action.install.anotherVersion";
    static readonly LABEL: string;
    constructor(extensionsWorkbenchService: IExtensionsWorkbenchService, extensionGalleryService: IExtensionGalleryService, quickInputService: IQuickInputService, instantiationService: IInstantiationService, dialogService: IDialogService);
    update(): void;
    run(): Promise<any>;
}
export declare class EnableForWorkspaceAction extends ExtensionAction {
    private readonly extensionsWorkbenchService;
    private readonly extensionEnablementService;
    static readonly ID = "extensions.enableForWorkspace";
    static readonly LABEL: string;
    constructor(extensionsWorkbenchService: IExtensionsWorkbenchService, extensionEnablementService: IWorkbenchExtensionEnablementService);
    update(): void;
    run(): Promise<any>;
}
export declare class EnableGloballyAction extends ExtensionAction {
    private readonly extensionsWorkbenchService;
    private readonly extensionEnablementService;
    static readonly ID = "extensions.enableGlobally";
    static readonly LABEL: string;
    constructor(extensionsWorkbenchService: IExtensionsWorkbenchService, extensionEnablementService: IWorkbenchExtensionEnablementService);
    update(): void;
    run(): Promise<any>;
}
export declare class DisableForWorkspaceAction extends ExtensionAction {
    private readonly workspaceContextService;
    private readonly extensionsWorkbenchService;
    private readonly extensionEnablementService;
    private readonly extensionService;
    static readonly ID = "extensions.disableForWorkspace";
    static readonly LABEL: string;
    constructor(workspaceContextService: IWorkspaceContextService, extensionsWorkbenchService: IExtensionsWorkbenchService, extensionEnablementService: IWorkbenchExtensionEnablementService, extensionService: IExtensionService);
    update(): void;
    run(): Promise<any>;
}
export declare class DisableGloballyAction extends ExtensionAction {
    private readonly extensionsWorkbenchService;
    private readonly extensionEnablementService;
    private readonly extensionService;
    static readonly ID = "extensions.disableGlobally";
    static readonly LABEL: string;
    constructor(extensionsWorkbenchService: IExtensionsWorkbenchService, extensionEnablementService: IWorkbenchExtensionEnablementService, extensionService: IExtensionService);
    update(): void;
    run(): Promise<any>;
}
export declare class EnableDropDownAction extends ActionWithDropDownAction {
    constructor(instantiationService: IInstantiationService);
}
export declare class DisableDropDownAction extends ActionWithDropDownAction {
    constructor(instantiationService: IInstantiationService);
}
export declare class ReloadAction extends ExtensionAction {
    private readonly hostService;
    private readonly extensionService;
    private static readonly EnabledClass;
    private static readonly DisabledClass;
    updateWhenCounterExtensionChanges: boolean;
    constructor(hostService: IHostService, extensionService: IExtensionService);
    update(): void;
    run(): Promise<any>;
}
export declare class SetColorThemeAction extends ExtensionAction {
    private readonly workbenchThemeService;
    private readonly quickInputService;
    private readonly extensionEnablementService;
    static readonly ID = "workbench.extensions.action.setColorTheme";
    static readonly TITLE: {
        value: string;
        original: string;
    };
    private static readonly EnabledClass;
    private static readonly DisabledClass;
    constructor(extensionService: IExtensionService, workbenchThemeService: IWorkbenchThemeService, quickInputService: IQuickInputService, extensionEnablementService: IWorkbenchExtensionEnablementService);
    update(): void;
    private computeEnablement;
    run({ showCurrentTheme, ignoreFocusLost }?: {
        showCurrentTheme: boolean;
        ignoreFocusLost: boolean;
    }): Promise<any>;
}
export declare class SetFileIconThemeAction extends ExtensionAction {
    private readonly workbenchThemeService;
    private readonly quickInputService;
    private readonly extensionEnablementService;
    static readonly ID = "workbench.extensions.action.setFileIconTheme";
    static readonly TITLE: {
        value: string;
        original: string;
    };
    private static readonly EnabledClass;
    private static readonly DisabledClass;
    constructor(extensionService: IExtensionService, workbenchThemeService: IWorkbenchThemeService, quickInputService: IQuickInputService, extensionEnablementService: IWorkbenchExtensionEnablementService);
    update(): void;
    private computeEnablement;
    run({ showCurrentTheme, ignoreFocusLost }?: {
        showCurrentTheme: boolean;
        ignoreFocusLost: boolean;
    }): Promise<any>;
}
export declare class SetProductIconThemeAction extends ExtensionAction {
    private readonly workbenchThemeService;
    private readonly quickInputService;
    private readonly extensionEnablementService;
    static readonly ID = "workbench.extensions.action.setProductIconTheme";
    static readonly TITLE: {
        value: string;
        original: string;
    };
    private static readonly EnabledClass;
    private static readonly DisabledClass;
    constructor(extensionService: IExtensionService, workbenchThemeService: IWorkbenchThemeService, quickInputService: IQuickInputService, extensionEnablementService: IWorkbenchExtensionEnablementService);
    update(): void;
    private computeEnablement;
    run({ showCurrentTheme, ignoreFocusLost }?: {
        showCurrentTheme: boolean;
        ignoreFocusLost: boolean;
    }): Promise<any>;
}
export declare class SetLanguageAction extends ExtensionAction {
    private readonly extensionsWorkbenchService;
    private readonly languagePackService;
    static readonly ID = "workbench.extensions.action.setDisplayLanguage";
    static readonly TITLE: {
        value: string;
        original: string;
    };
    private static readonly EnabledClass;
    private static readonly DisabledClass;
    constructor(extensionsWorkbenchService: IExtensionsWorkbenchService, languagePackService: ILanguagePackService);
    update(): void;
    run(): Promise<any>;
}
export declare class ClearLanguageAction extends ExtensionAction {
    private readonly extensionsWorkbenchService;
    private readonly languagePackService;
    private readonly localeService;
    static readonly ID = "workbench.extensions.action.clearLanguage";
    static readonly TITLE: {
        value: string;
        original: string;
    };
    private static readonly EnabledClass;
    private static readonly DisabledClass;
    constructor(extensionsWorkbenchService: IExtensionsWorkbenchService, languagePackService: ILanguagePackService, localeService: ILocaleService);
    update(): void;
    run(): Promise<any>;
}
export declare class ShowRecommendedExtensionAction extends Action {
    private readonly paneCompositeService;
    private readonly extensionWorkbenchService;
    static readonly ID = "workbench.extensions.action.showRecommendedExtension";
    static readonly LABEL: string;
    private extensionId;
    constructor(extensionId: string, paneCompositeService: IPaneCompositePartService, extensionWorkbenchService: IExtensionsWorkbenchService);
    run(): Promise<any>;
}
export declare class InstallRecommendedExtensionAction extends Action {
    private readonly paneCompositeService;
    private readonly instantiationService;
    private readonly extensionWorkbenchService;
    static readonly ID = "workbench.extensions.action.installRecommendedExtension";
    static readonly LABEL: string;
    private extensionId;
    constructor(extensionId: string, paneCompositeService: IPaneCompositePartService, instantiationService: IInstantiationService, extensionWorkbenchService: IExtensionsWorkbenchService);
    run(): Promise<any>;
}
export declare class IgnoreExtensionRecommendationAction extends Action {
    private readonly extension;
    private readonly extensionRecommendationsManagementService;
    static readonly ID = "extensions.ignore";
    private static readonly Class;
    constructor(extension: IExtension, extensionRecommendationsManagementService: IExtensionIgnoredRecommendationsService);
    run(): Promise<any>;
}
export declare class UndoIgnoreExtensionRecommendationAction extends Action {
    private readonly extension;
    private readonly extensionRecommendationsManagementService;
    static readonly ID = "extensions.ignore";
    private static readonly Class;
    constructor(extension: IExtension, extensionRecommendationsManagementService: IExtensionIgnoredRecommendationsService);
    run(): Promise<any>;
}
export declare class SearchExtensionsAction extends Action {
    private readonly searchValue;
    private readonly paneCompositeService;
    constructor(searchValue: string, paneCompositeService: IPaneCompositePartService);
    run(): Promise<void>;
}
export declare abstract class AbstractConfigureRecommendedExtensionsAction extends Action {
    protected contextService: IWorkspaceContextService;
    private readonly fileService;
    private readonly textFileService;
    protected editorService: IEditorService;
    private readonly jsonEditingService;
    private readonly textModelResolverService;
    constructor(id: string, label: string, contextService: IWorkspaceContextService, fileService: IFileService, textFileService: ITextFileService, editorService: IEditorService, jsonEditingService: IJSONEditingService, textModelResolverService: ITextModelService);
    protected openExtensionsFile(extensionsFileResource: URI): Promise<any>;
    protected openWorkspaceConfigurationFile(workspaceConfigurationFile: URI): Promise<any>;
    private getOrUpdateWorkspaceConfigurationFile;
    private getSelectionPosition;
    private getOrCreateExtensionsFile;
}
export declare class ConfigureWorkspaceRecommendedExtensionsAction extends AbstractConfigureRecommendedExtensionsAction {
    static readonly ID = "workbench.extensions.action.configureWorkspaceRecommendedExtensions";
    static readonly LABEL: string;
    constructor(id: string, label: string, fileService: IFileService, textFileService: ITextFileService, contextService: IWorkspaceContextService, editorService: IEditorService, jsonEditingService: IJSONEditingService, textModelResolverService: ITextModelService);
    private update;
    run(): Promise<void>;
}
export declare class ConfigureWorkspaceFolderRecommendedExtensionsAction extends AbstractConfigureRecommendedExtensionsAction {
    private readonly commandService;
    static readonly ID = "workbench.extensions.action.configureWorkspaceFolderRecommendedExtensions";
    static readonly LABEL: string;
    constructor(id: string, label: string, fileService: IFileService, textFileService: ITextFileService, contextService: IWorkspaceContextService, editorService: IEditorService, jsonEditingService: IJSONEditingService, textModelResolverService: ITextModelService, commandService: ICommandService);
    run(): Promise<any>;
}
export declare class ExtensionStatusLabelAction extends Action implements IExtensionContainer {
    private readonly extensionService;
    private readonly extensionManagementServerService;
    private readonly extensionEnablementService;
    private static readonly ENABLED_CLASS;
    private static readonly DISABLED_CLASS;
    private initialStatus;
    private status;
    private enablementState;
    private _extension;
    get extension(): IExtension | null;
    set extension(extension: IExtension | null);
    constructor(extensionService: IExtensionService, extensionManagementServerService: IExtensionManagementServerService, extensionEnablementService: IWorkbenchExtensionEnablementService);
    update(): void;
    private computeLabel;
    run(): Promise<any>;
}
export declare class ToggleSyncExtensionAction extends ExtensionDropDownAction {
    private readonly configurationService;
    private readonly extensionsWorkbenchService;
    private readonly userDataSyncEnablementService;
    private static readonly IGNORED_SYNC_CLASS;
    private static readonly SYNC_CLASS;
    constructor(configurationService: IConfigurationService, extensionsWorkbenchService: IExtensionsWorkbenchService, userDataSyncEnablementService: IUserDataSyncEnablementService, instantiationService: IInstantiationService);
    update(): void;
    run(): Promise<any>;
}
export declare type ExtensionStatus = {
    readonly message: IMarkdownString;
    readonly icon?: ThemeIcon;
};
export declare class ExtensionStatusAction extends ExtensionAction {
    private readonly extensionManagementServerService;
    private readonly labelService;
    private readonly commandService;
    private readonly workspaceTrustEnablementService;
    private readonly workspaceTrustService;
    private readonly extensionsWorkbenchService;
    private readonly extensionService;
    private readonly extensionManifestPropertiesService;
    private readonly contextService;
    private readonly productService;
    private readonly workbenchExtensionEnablementService;
    private static readonly CLASS;
    updateWhenCounterExtensionChanges: boolean;
    private _status;
    get status(): ExtensionStatus | undefined;
    private readonly _onDidChangeStatus;
    readonly onDidChangeStatus: Event<void>;
    private readonly updateThrottler;
    constructor(extensionManagementServerService: IExtensionManagementServerService, labelService: ILabelService, commandService: ICommandService, workspaceTrustEnablementService: IWorkspaceTrustEnablementService, workspaceTrustService: IWorkspaceTrustManagementService, extensionsWorkbenchService: IExtensionsWorkbenchService, extensionService: IExtensionService, extensionManifestPropertiesService: IExtensionManifestPropertiesService, contextService: IWorkspaceContextService, productService: IProductService, workbenchExtensionEnablementService: IWorkbenchExtensionEnablementService);
    update(): void;
    private computeAndUpdateStatus;
    private updateStatus;
    run(): Promise<any>;
}
export declare class ReinstallAction extends Action {
    private readonly extensionsWorkbenchService;
    private readonly extensionManagementServerService;
    private readonly quickInputService;
    private readonly notificationService;
    private readonly hostService;
    private readonly instantiationService;
    private readonly extensionService;
    static readonly ID = "workbench.extensions.action.reinstall";
    static readonly LABEL: string;
    constructor(id: string | undefined, label: string | undefined, extensionsWorkbenchService: IExtensionsWorkbenchService, extensionManagementServerService: IExtensionManagementServerService, quickInputService: IQuickInputService, notificationService: INotificationService, hostService: IHostService, instantiationService: IInstantiationService, extensionService: IExtensionService);
    get enabled(): boolean;
    run(): Promise<any>;
    private getEntries;
    private reinstallExtension;
}
export declare class InstallSpecificVersionOfExtensionAction extends Action {
    private readonly extensionsWorkbenchService;
    private readonly quickInputService;
    private readonly instantiationService;
    private readonly extensionEnablementService;
    static readonly ID = "workbench.extensions.action.install.specificVersion";
    static readonly LABEL: string;
    constructor(id: string | undefined, label: string | undefined, extensionsWorkbenchService: IExtensionsWorkbenchService, quickInputService: IQuickInputService, instantiationService: IInstantiationService, extensionEnablementService: IWorkbenchExtensionEnablementService);
    get enabled(): boolean;
    run(): Promise<any>;
    private isEnabled;
    private getExtensionEntries;
}
export declare abstract class AbstractInstallExtensionsInServerAction extends Action {
    protected readonly extensionsWorkbenchService: IExtensionsWorkbenchService;
    private readonly quickInputService;
    private readonly notificationService;
    private readonly progressService;
    private extensions;
    constructor(id: string, extensionsWorkbenchService: IExtensionsWorkbenchService, quickInputService: IQuickInputService, notificationService: INotificationService, progressService: IProgressService);
    private updateExtensions;
    private update;
    run(): Promise<void>;
    private queryExtensionsToInstall;
    private selectAndInstallExtensions;
    private onDidAccept;
    protected abstract getQuickPickTitle(): string;
    protected abstract getExtensionsToInstall(local: IExtension[]): IExtension[];
    protected abstract installExtensions(extensions: IExtension[]): Promise<void>;
}
export declare class InstallLocalExtensionsInRemoteAction extends AbstractInstallExtensionsInServerAction {
    private readonly extensionManagementServerService;
    private readonly extensionGalleryService;
    private readonly instantiationService;
    private readonly fileService;
    private readonly logService;
    constructor(extensionsWorkbenchService: IExtensionsWorkbenchService, quickInputService: IQuickInputService, progressService: IProgressService, notificationService: INotificationService, extensionManagementServerService: IExtensionManagementServerService, extensionGalleryService: IExtensionGalleryService, instantiationService: IInstantiationService, fileService: IFileService, logService: ILogService);
    get label(): string;
    protected getQuickPickTitle(): string;
    protected getExtensionsToInstall(local: IExtension[]): IExtension[];
    protected installExtensions(localExtensionsToInstall: IExtension[]): Promise<void>;
}
export declare class InstallRemoteExtensionsInLocalAction extends AbstractInstallExtensionsInServerAction {
    private readonly extensionManagementServerService;
    private readonly extensionGalleryService;
    private readonly fileService;
    private readonly logService;
    constructor(id: string, extensionsWorkbenchService: IExtensionsWorkbenchService, quickInputService: IQuickInputService, progressService: IProgressService, notificationService: INotificationService, extensionManagementServerService: IExtensionManagementServerService, extensionGalleryService: IExtensionGalleryService, fileService: IFileService, logService: ILogService);
    get label(): string;
    protected getQuickPickTitle(): string;
    protected getExtensionsToInstall(local: IExtension[]): IExtension[];
    protected installExtensions(extensions: IExtension[]): Promise<void>;
}
export declare const extensionButtonProminentBackground: string;
export {};

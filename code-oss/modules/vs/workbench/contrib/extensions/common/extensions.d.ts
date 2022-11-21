import { Event } from 'vs/base/common/event';
import { IPager } from 'vs/base/common/paging';
import { IQueryOptions, ILocalExtension, IGalleryExtension, IExtensionIdentifier, InstallOptions, InstallVSIXOptions, IExtensionInfo, IExtensionQueryOptions, IDeprecationInfo } from 'vs/platform/extensionManagement/common/extensionManagement';
import { EnablementState, IExtensionManagementServer } from 'vs/workbench/services/extensionManagement/common/extensionManagement';
import { CancellationToken } from 'vs/base/common/cancellation';
import { Disposable, IDisposable } from 'vs/base/common/lifecycle';
import { IExtensionManifest, ExtensionType } from 'vs/platform/extensions/common/extensions';
import { URI } from 'vs/base/common/uri';
import { IView, IViewPaneContainer } from 'vs/workbench/common/views';
import { RawContextKey } from 'vs/platform/contextkey/common/contextkey';
import { IExtensionsStatus } from 'vs/workbench/services/extensions/common/extensions';
import { IExtensionEditorOptions } from 'vs/workbench/contrib/extensions/common/extensionsInput';
import { ProgressLocation } from 'vs/platform/progress/common/progress';
export declare const VIEWLET_ID = "workbench.view.extensions";
export interface IExtensionsViewPaneContainer extends IViewPaneContainer {
    readonly searchValue: string | undefined;
    search(text: string): void;
    refresh(): Promise<void>;
}
export interface IWorkspaceRecommendedExtensionsView extends IView {
    installWorkspaceRecommendations(): Promise<void>;
}
export declare const enum ExtensionState {
    Installing = 0,
    Installed = 1,
    Uninstalling = 2,
    Uninstalled = 3
}
export interface IExtension {
    readonly type: ExtensionType;
    readonly isBuiltin: boolean;
    readonly state: ExtensionState;
    readonly name: string;
    readonly displayName: string;
    readonly identifier: IExtensionIdentifier;
    readonly publisher: string;
    readonly publisherDisplayName: string;
    readonly publisherUrl?: URI;
    readonly publisherDomain?: {
        link: string;
        verified: boolean;
    };
    readonly publisherSponsorLink?: URI;
    readonly version: string;
    readonly latestVersion: string;
    readonly hasPreReleaseVersion: boolean;
    readonly hasReleaseVersion: boolean;
    readonly description: string;
    readonly url?: string;
    readonly repository?: string;
    readonly iconUrl: string;
    readonly iconUrlFallback: string;
    readonly licenseUrl?: string;
    readonly installCount?: number;
    readonly rating?: number;
    readonly ratingCount?: number;
    readonly outdated: boolean;
    readonly outdatedTargetPlatform: boolean;
    readonly reloadRequiredStatus?: string;
    readonly enablementState: EnablementState;
    readonly tags: readonly string[];
    readonly categories: readonly string[];
    readonly dependencies: string[];
    readonly extensionPack: string[];
    readonly telemetryData: any;
    readonly preview: boolean;
    getManifest(token: CancellationToken): Promise<IExtensionManifest | null>;
    hasReadme(): boolean;
    getReadme(token: CancellationToken): Promise<string>;
    hasChangelog(): boolean;
    getChangelog(token: CancellationToken): Promise<string>;
    readonly server?: IExtensionManagementServer;
    readonly local?: ILocalExtension;
    gallery?: IGalleryExtension;
    readonly isMalicious: boolean;
    readonly deprecationInfo?: IDeprecationInfo;
}
export declare const SERVICE_ID = "extensionsWorkbenchService";
export declare const IExtensionsWorkbenchService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IExtensionsWorkbenchService>;
export interface IExtensionsWorkbenchService {
    readonly _serviceBrand: undefined;
    readonly onChange: Event<IExtension | undefined>;
    readonly onReset: Event<void>;
    readonly preferPreReleases: boolean;
    readonly local: IExtension[];
    readonly installed: IExtension[];
    readonly outdated: IExtension[];
    queryLocal(server?: IExtensionManagementServer): Promise<IExtension[]>;
    queryGallery(token: CancellationToken): Promise<IPager<IExtension>>;
    queryGallery(options: IQueryOptions, token: CancellationToken): Promise<IPager<IExtension>>;
    getExtensions(extensionInfos: IExtensionInfo[], token: CancellationToken): Promise<IExtension[]>;
    getExtensions(extensionInfos: IExtensionInfo[], options: IExtensionQueryOptions, token: CancellationToken): Promise<IExtension[]>;
    canInstall(extension: IExtension): Promise<boolean>;
    install(vsix: URI, installOptions?: InstallVSIXOptions): Promise<IExtension>;
    install(extension: IExtension, installOptions?: InstallOptions, progressLocation?: ProgressLocation): Promise<IExtension>;
    uninstall(extension: IExtension): Promise<void>;
    installVersion(extension: IExtension, version: string, installOptions?: InstallOptions): Promise<IExtension>;
    reinstall(extension: IExtension): Promise<IExtension>;
    canSetLanguage(extension: IExtension): boolean;
    setLanguage(extension: IExtension): Promise<void>;
    setEnablement(extensions: IExtension | IExtension[], enablementState: EnablementState): Promise<void>;
    setExtensionIgnoresUpdate(extension: IExtension, ignoreAutoUpate: boolean): void;
    isExtensionIgnoresUpdates(extension: IExtension): boolean;
    open(extension: IExtension, options?: IExtensionEditorOptions): Promise<void>;
    checkForUpdates(): Promise<void>;
    getExtensionStatus(extension: IExtension): IExtensionsStatus | undefined;
    isExtensionIgnoredToSync(extension: IExtension): boolean;
    toggleExtensionIgnoredToSync(extension: IExtension): Promise<void>;
}
export declare const enum ExtensionEditorTab {
    Readme = "readme",
    Contributions = "contributions",
    Changelog = "changelog",
    Dependencies = "dependencies",
    ExtensionPack = "extensionPack",
    RuntimeStatus = "runtimeStatus"
}
export declare const ConfigurationKey = "extensions";
export declare const AutoUpdateConfigurationKey = "extensions.autoUpdate";
export declare const AutoCheckUpdatesConfigurationKey = "extensions.autoCheckUpdates";
export declare const CloseExtensionDetailsOnViewChangeKey = "extensions.closeExtensionDetailsOnViewChange";
export interface IExtensionsConfiguration {
    autoUpdate: boolean;
    autoCheckUpdates: boolean;
    ignoreRecommendations: boolean;
    closeExtensionDetailsOnViewChange: boolean;
}
export interface IExtensionContainer extends IDisposable {
    extension: IExtension | null;
    updateWhenCounterExtensionChanges?: boolean;
    update(): void;
}
export declare class ExtensionContainers extends Disposable {
    private readonly containers;
    constructor(containers: IExtensionContainer[], extensionsWorkbenchService: IExtensionsWorkbenchService);
    set extension(extension: IExtension);
    private update;
}
export declare const WORKSPACE_RECOMMENDATIONS_VIEW_ID = "workbench.views.extensions.workspaceRecommendations";
export declare const OUTDATED_EXTENSIONS_VIEW_ID = "workbench.views.extensions.searchOutdated";
export declare const TOGGLE_IGNORE_EXTENSION_ACTION_ID = "workbench.extensions.action.toggleIgnoreExtension";
export declare const SELECT_INSTALL_VSIX_EXTENSION_COMMAND_ID = "workbench.extensions.action.installVSIX";
export declare const INSTALL_EXTENSION_FROM_VSIX_COMMAND_ID = "workbench.extensions.command.installFromVSIX";
export declare const LIST_WORKSPACE_UNSUPPORTED_EXTENSIONS_COMMAND_ID = "workbench.extensions.action.listWorkspaceUnsupportedExtensions";
export declare const HasOutdatedExtensionsContext: RawContextKey<boolean>;
export declare const CONTEXT_HAS_GALLERY: RawContextKey<boolean>;
export declare const THEME_ACTIONS_GROUP = "_theme_";
export declare const INSTALL_ACTIONS_GROUP = "0_install";

import 'vs/css!./media/extensionEditor';
import { Dimension } from 'vs/base/browser/dom';
import { EditorPane } from 'vs/workbench/browser/parts/editor/editorPane';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IExtensionRecommendationsService } from 'vs/workbench/services/extensionRecommendations/common/extensionRecommendations';
import { ExtensionsInput, IExtensionEditorOptions } from 'vs/workbench/contrib/extensions/common/extensionsInput';
import { IExtensionsWorkbenchService, ExtensionEditorTab } from 'vs/workbench/contrib/extensions/common/extensions';
import { IEditorOpenContext } from 'vs/workbench/common/editor';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { CancellationToken } from 'vs/base/common/cancellation';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { IWebviewService, IWebview } from 'vs/workbench/contrib/webview/browser/webview';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { IPaneCompositePartService } from 'vs/workbench/services/panecomposite/browser/panecomposite';
import { IExtensionGalleryService } from 'vs/platform/extensionManagement/common/extensionManagement';
export declare class ExtensionEditor extends EditorPane {
    private readonly instantiationService;
    private readonly paneCompositeService;
    private readonly extensionsWorkbenchService;
    private readonly extensionGalleryService;
    private readonly keybindingService;
    private readonly notificationService;
    private readonly openerService;
    private readonly extensionRecommendationsService;
    private readonly extensionService;
    private readonly webviewService;
    private readonly languageService;
    private readonly contextMenuService;
    private readonly contextKeyService;
    static readonly ID: string;
    private readonly _scopedContextKeyService;
    private template;
    private extensionReadme;
    private extensionChangelog;
    private extensionManifest;
    private initialScrollProgress;
    private currentIdentifier;
    private layoutParticipants;
    private readonly contentDisposables;
    private readonly transientDisposables;
    private activeElement;
    private dimension;
    private showPreReleaseVersionContextKey;
    constructor(telemetryService: ITelemetryService, instantiationService: IInstantiationService, paneCompositeService: IPaneCompositePartService, extensionsWorkbenchService: IExtensionsWorkbenchService, extensionGalleryService: IExtensionGalleryService, themeService: IThemeService, keybindingService: IKeybindingService, notificationService: INotificationService, openerService: IOpenerService, extensionRecommendationsService: IExtensionRecommendationsService, storageService: IStorageService, extensionService: IExtensionService, webviewService: IWebviewService, languageService: ILanguageService, contextMenuService: IContextMenuService, contextKeyService: IContextKeyService);
    get scopedContextKeyService(): IContextKeyService | undefined;
    createEditor(parent: HTMLElement): void;
    setInput(input: ExtensionsInput, options: IExtensionEditorOptions | undefined, context: IEditorOpenContext, token: CancellationToken): Promise<void>;
    setOptions(options: IExtensionEditorOptions | undefined): void;
    private updatePreReleaseVersionContext;
    openTab(tab: ExtensionEditorTab): Promise<void>;
    private getGalleryVersionToShow;
    private render;
    private renderNavbar;
    clearInput(): void;
    focus(): void;
    showFind(): void;
    runFindAction(previous: boolean): void;
    get activeWebview(): IWebview | undefined;
    private onNavbarChange;
    private open;
    private openMarkdown;
    private renderMarkdown;
    private renderBody;
    private openDetails;
    private shallRenderAsExensionPack;
    private openExtensionPackReadme;
    private renderAdditionalDetails;
    private renderCategories;
    private renderExtensionResources;
    private renderMoreInfo;
    private openChangelog;
    private openContributions;
    private openExtensionDependencies;
    private openExtensionPack;
    private openRuntimeStatus;
    private renderRuntimeStatus;
    private renderExtensionPack;
    private renderSettings;
    private renderDebuggers;
    private renderViewContainers;
    private renderViews;
    private renderLocalizations;
    private renderCustomEditors;
    private renderCodeActions;
    private renderAuthentication;
    private renderColorThemes;
    private renderIconThemes;
    private renderProductIconThemes;
    private renderColors;
    private renderJSONValidation;
    private renderCommands;
    private renderLanguages;
    private renderActivationEvents;
    private renderNotebooks;
    private renderNotebookRenderers;
    private resolveKeybinding;
    private loadContents;
    layout(dimension: Dimension): void;
    private onError;
}

import 'vs/workbench/contrib/welcomeGettingStarted/browser/gettingStartedColors';
import 'vs/css!./media/gettingStarted';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IEditorSerializer, IEditorOpenContext } from 'vs/workbench/common/editor';
import { Dimension } from 'vs/base/browser/dom';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { IProductService } from 'vs/platform/product/common/productService';
import { IWalkthroughsService } from 'vs/workbench/contrib/welcomeGettingStarted/browser/gettingStartedService';
import { IThemeService, ThemeIcon } from 'vs/platform/theme/common/themeService';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { EditorPane } from 'vs/workbench/browser/parts/editor/editorPane';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { CancellationToken } from 'vs/base/common/cancellation';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { ContextKeyExpression, IContextKeyService, RawContextKey } from 'vs/platform/contextkey/common/contextkey';
import { IWorkspacesService } from 'vs/platform/workspaces/common/workspaces';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { ILabelService } from 'vs/platform/label/common/label';
import { IHostService } from 'vs/workbench/services/host/browser/host';
import { GettingStartedInput } from 'vs/workbench/contrib/welcomeGettingStarted/browser/gettingStartedInput';
import { IEditorGroupsService } from 'vs/workbench/services/editor/common/editorGroupsService';
import { IQuickInputService } from 'vs/platform/quickinput/common/quickInput';
import { IWebviewService } from 'vs/workbench/contrib/webview/browser/webview';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { IFileService } from 'vs/platform/files/common/files';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { IEditorOptions } from 'vs/platform/editor/common/editor';
import { IAccessibilityService } from 'vs/platform/accessibility/common/accessibility';
export declare const allWalkthroughsHiddenContext: RawContextKey<boolean>;
export declare const inWelcomeContext: RawContextKey<boolean>;
export declare const embedderIdentifierContext: RawContextKey<string | undefined>;
export interface IWelcomePageStartEntry {
    id: string;
    title: string;
    description: string;
    command: string;
    order: number;
    icon: {
        type: 'icon';
        icon: ThemeIcon;
    };
    when: ContextKeyExpression;
}
export declare class GettingStartedPage extends EditorPane {
    private readonly commandService;
    private readonly productService;
    private readonly keybindingService;
    private readonly gettingStartedService;
    private readonly configurationService;
    private readonly languageService;
    private readonly fileService;
    private readonly openerService;
    private storageService;
    private readonly extensionService;
    private readonly instantiationService;
    private readonly notificationService;
    private readonly groupsService;
    private quickInputService;
    private readonly labelService;
    private readonly hostService;
    private readonly webviewService;
    private readonly workspaceContextService;
    private readonly accessibilityService;
    static readonly ID = "gettingStartedPage";
    private editorInput;
    private inProgressScroll;
    private dispatchListeners;
    private stepDisposables;
    private detailsPageDisposables;
    private gettingStartedCategories;
    private currentWalkthrough;
    private categoriesPageScrollbar;
    private detailsPageScrollbar;
    private detailsScrollbar;
    private buildSlideThrottle;
    private container;
    private contextService;
    private recentlyOpened;
    private hasScrolledToFirstCategory;
    private recentlyOpenedList?;
    private startList?;
    private gettingStartedList?;
    private stepsSlide;
    private categoriesSlide;
    private stepsContent;
    private stepMediaComponent;
    private layoutMarkdown;
    private detailsRenderer;
    private webviewID;
    private categoriesSlideDisposables;
    constructor(commandService: ICommandService, productService: IProductService, keybindingService: IKeybindingService, gettingStartedService: IWalkthroughsService, configurationService: IConfigurationService, telemetryService: ITelemetryService, languageService: ILanguageService, fileService: IFileService, openerService: IOpenerService, themeService: IThemeService, storageService: IStorageService, extensionService: IExtensionService, instantiationService: IInstantiationService, notificationService: INotificationService, groupsService: IEditorGroupsService, contextService: IContextKeyService, quickInputService: IQuickInputService, workspacesService: IWorkspacesService, labelService: ILabelService, hostService: IHostService, webviewService: IWebviewService, workspaceContextService: IWorkspaceContextService, accessibilityService: IAccessibilityService);
    private shouldAnimate;
    private getWalkthroughCompletionStats;
    setInput(newInput: GettingStartedInput, options: IEditorOptions | undefined, context: IEditorOpenContext, token: CancellationToken): Promise<void>;
    makeCategoryVisibleWhenAvailable(categoryID: string, stepId?: string): Promise<void>;
    private registerDispatchListeners;
    private runDispatchCommand;
    private hideCategory;
    private markAllStepsComplete;
    private toggleStepCompletion;
    private openWalkthroughSelector;
    private getHiddenCategories;
    private setHiddenCategories;
    private currentMediaComponent;
    private buildMediaComponent;
    selectStepLoose(id: string): Promise<void>;
    private selectStep;
    private updateMediaSourceForColorMode;
    createEditor(parent: HTMLElement): void;
    private buildCategoriesSlide;
    private buildRecentlyOpenedList;
    private buildStartList;
    private buildGettingStartedWalkthroughsList;
    layout(size: Dimension): void;
    private updateCategoryProgress;
    private scrollToCategory;
    private iconWidgetFor;
    private runStepCommand;
    private buildStepMarkdownDescription;
    clearInput(): void;
    private buildCategorySlide;
    private buildTelemetryFooter;
    private getKeybindingLabel;
    private scrollPrev;
    private runSkip;
    escape(): void;
    private setSlide;
    focus(): void;
}
export declare class GettingStartedInputSerializer implements IEditorSerializer {
    canSerialize(editorInput: GettingStartedInput): boolean;
    serialize(editorInput: GettingStartedInput): string;
    deserialize(instantiationService: IInstantiationService, serializedEditorInput: string): GettingStartedInput;
}

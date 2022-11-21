import 'vs/css!./media/scm';
import { Event } from 'vs/base/common/event';
import { IDisposable, DisposableStore } from 'vs/base/common/lifecycle';
import { ViewPane, IViewPaneOptions } from 'vs/workbench/browser/parts/views/viewPane';
import { ISCMResourceGroup, ISCMResource, ISCMRepository, ISCMInput, ISCMViewService, ISCMService, ISCMActionButton, ISCMActionButtonDescriptor } from 'vs/workbench/contrib/scm/common/scm';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IContextViewService, IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { IMenuService } from 'vs/platform/actions/common/actions';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { WorkbenchCompressibleObjectTree } from 'vs/platform/list/browser/listService';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { ITreeNode, ITreeSorter } from 'vs/base/browser/ui/tree/tree';
import { IResourceNode } from 'vs/base/common/resourceTree';
import { ICompressibleTreeRenderer, ICompressibleKeyboardNavigationLabelProvider } from 'vs/base/browser/ui/tree/objectTree';
import { FuzzyScore } from 'vs/base/common/filters';
import { IViewDescriptorService } from 'vs/workbench/common/views';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IModelService } from 'vs/editor/common/services/model';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IListAccessibilityProvider } from 'vs/base/browser/ui/list/listWidget';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { ILabelService } from 'vs/platform/label/common/label';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
import { Selection } from 'vs/editor/common/core/selection';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { INotificationService } from 'vs/platform/notification/common/notification';
declare type TreeElement = ISCMRepository | ISCMInput | ISCMActionButton | ISCMResourceGroup | IResourceNode<ISCMResource, ISCMResourceGroup> | ISCMResource;
interface ISCMLayout {
    height: number | undefined;
    width: number | undefined;
    readonly onDidChange: Event<void>;
}
interface InputTemplate {
    readonly inputWidget: SCMInputWidget;
    readonly elementDisposables: DisposableStore;
    readonly templateDisposable: IDisposable;
}
declare class InputRenderer implements ICompressibleTreeRenderer<ISCMInput, FuzzyScore, InputTemplate> {
    private outerLayout;
    private overflowWidgetsDomNode;
    private updateHeight;
    private instantiationService;
    static readonly DEFAULT_HEIGHT = 26;
    static readonly TEMPLATE_ID = "input";
    get templateId(): string;
    private inputWidgets;
    private contentHeights;
    private editorSelections;
    constructor(outerLayout: ISCMLayout, overflowWidgetsDomNode: HTMLElement, updateHeight: (input: ISCMInput, height: number) => void, instantiationService: IInstantiationService);
    renderTemplate(container: HTMLElement): InputTemplate;
    renderElement(node: ITreeNode<ISCMInput, FuzzyScore>, index: number, templateData: InputTemplate): void;
    renderCompressedElements(): void;
    disposeElement(group: ITreeNode<ISCMInput, FuzzyScore>, index: number, template: InputTemplate): void;
    disposeTemplate(templateData: InputTemplate): void;
    getHeight(input: ISCMInput): number;
    getRenderedInputWidget(input: ISCMInput): SCMInputWidget | undefined;
    getFocusedInput(): ISCMInput | undefined;
    clearValidation(): void;
}
export declare class SCMTreeSorter implements ITreeSorter<TreeElement> {
    private viewModelProvider;
    private get viewModel();
    constructor(viewModelProvider: () => ViewModel);
    compare(one: TreeElement, other: TreeElement): number;
}
export declare class SCMTreeKeyboardNavigationLabelProvider implements ICompressibleKeyboardNavigationLabelProvider<TreeElement> {
    private viewModelProvider;
    private readonly labelService;
    constructor(viewModelProvider: () => ViewModel, labelService: ILabelService);
    getKeyboardNavigationLabel(element: TreeElement): {
        toString(): string;
    } | {
        toString(): string;
    }[] | undefined;
    getCompressedNodeKeyboardNavigationLabel(elements: TreeElement[]): {
        toString(): string | undefined;
    } | undefined;
}
export declare class SCMAccessibilityProvider implements IListAccessibilityProvider<TreeElement> {
    private readonly labelService;
    private readonly workspaceContextService;
    constructor(labelService: ILabelService, workspaceContextService: IWorkspaceContextService);
    getWidgetAriaLabel(): string;
    getAriaLabel(element: TreeElement): string;
}
interface ITreeViewState {
    readonly collapsed: string[];
}
declare const enum ViewModelMode {
    List = "list",
    Tree = "tree"
}
declare const enum ViewModelSortKey {
    Path = "path",
    Name = "name",
    Status = "status"
}
declare class ViewModel {
    private tree;
    private inputRenderer;
    protected instantiationService: IInstantiationService;
    protected editorService: IEditorService;
    protected configurationService: IConfigurationService;
    private scmViewService;
    private storageService;
    private uriIdentityService;
    private readonly _onDidChangeMode;
    readonly onDidChangeMode: Event<ViewModelMode>;
    private readonly _onDidChangeSortKey;
    readonly onDidChangeSortKey: Event<ViewModelSortKey>;
    private visible;
    get mode(): ViewModelMode;
    set mode(mode: ViewModelMode);
    get sortKey(): ViewModelSortKey;
    set sortKey(sortKey: ViewModelSortKey);
    private _treeViewStateIsStale;
    get treeViewState(): ITreeViewState | undefined;
    private items;
    private visibilityDisposables;
    private scrollTop;
    private alwaysShowRepositories;
    private showActionButton;
    private firstVisible;
    private disposables;
    private modeContextKey;
    private sortKeyContextKey;
    private areAllRepositoriesCollapsedContextKey;
    private isAnyRepositoryCollapsibleContextKey;
    private scmProviderContextKey;
    private scmProviderRootUriContextKey;
    private scmProviderHasRootUriContextKey;
    private _mode;
    private _sortKey;
    private _treeViewState;
    constructor(tree: WorkbenchCompressibleObjectTree<TreeElement, FuzzyScore>, inputRenderer: InputRenderer, instantiationService: IInstantiationService, editorService: IEditorService, configurationService: IConfigurationService, scmViewService: ISCMViewService, storageService: IStorageService, uriIdentityService: IUriIdentityService, contextKeyService: IContextKeyService);
    private onDidChangeConfiguration;
    private _onDidChangeVisibleRepositories;
    private _onDidSpliceGroups;
    private createGroupItem;
    private _onDidSpliceGroup;
    setVisible(visible: boolean): void;
    private refresh;
    private render;
    private updateViewState;
    private onDidActiveEditorChange;
    focus(): void;
    private updateRepositoryCollapseAllContextKeys;
    collapseAllRepositories(): void;
    expandAllRepositories(): void;
    private getViewModelMode;
    private getViewModelSortKey;
    dispose(): void;
}
declare class SCMInputWidget {
    private modelService;
    private languageService;
    private keybindingService;
    private configurationService;
    private readonly instantiationService;
    private readonly scmViewService;
    private readonly contextViewService;
    private readonly openerService;
    private static readonly ValidationTimeouts;
    private readonly defaultInputFontFamily;
    private element;
    private editorContainer;
    private placeholderTextContainer;
    private inputEditor;
    private disposables;
    private model;
    private repositoryIdContextKey;
    private repositoryDisposables;
    private validation;
    private validationDisposable;
    private validationHasFocus;
    private _validationTimer;
    private lastLayoutWasTrash;
    private shouldFocusAfterLayout;
    readonly onDidChangeContentHeight: Event<void>;
    get input(): ISCMInput | undefined;
    set input(input: ISCMInput | undefined);
    get selections(): Selection[] | null;
    set selections(selections: Selection[] | null);
    private setValidation;
    constructor(container: HTMLElement, overflowWidgetsDomNode: HTMLElement, contextKeyService: IContextKeyService, modelService: IModelService, languageService: ILanguageService, keybindingService: IKeybindingService, configurationService: IConfigurationService, instantiationService: IInstantiationService, scmViewService: ISCMViewService, contextViewService: IContextViewService, openerService: IOpenerService);
    getContentHeight(): number;
    layout(): void;
    focus(): void;
    hasFocus(): boolean;
    private renderValidation;
    private getInputEditorFontFamily;
    private getInputEditorFontSize;
    private computeLineHeight;
    private setPlaceholderFontStyles;
    clearValidation(): void;
    dispose(): void;
}
export declare class SCMViewPane extends ViewPane {
    private scmService;
    private scmViewService;
    private commandService;
    private editorService;
    private menuService;
    private _onDidLayout;
    private layoutCache;
    private listContainer;
    private tree;
    private _viewModel;
    get viewModel(): ViewModel;
    private listLabels;
    private inputRenderer;
    private actionButtonRenderer;
    private readonly disposables;
    constructor(options: IViewPaneOptions, scmService: ISCMService, scmViewService: ISCMViewService, keybindingService: IKeybindingService, themeService: IThemeService, contextMenuService: IContextMenuService, commandService: ICommandService, editorService: IEditorService, instantiationService: IInstantiationService, viewDescriptorService: IViewDescriptorService, configurationService: IConfigurationService, contextKeyService: IContextKeyService, menuService: IMenuService, openerService: IOpenerService, telemetryService: ITelemetryService);
    protected renderBody(container: HTMLElement): void;
    private updateIndentStyles;
    private onDidChangeMode;
    layoutBody(height?: number | undefined, width?: number | undefined): void;
    focus(): void;
    private open;
    private onListContextMenu;
    private getSelectedResources;
    shouldShowWelcome(): boolean;
    getActionsContext(): unknown;
    dispose(): void;
}
export declare const scmProviderSeparatorBorderColor: string;
export declare class SCMActionButton implements IDisposable {
    private readonly container;
    private readonly contextMenuService;
    private readonly commandService;
    private readonly notificationService;
    private button;
    private readonly disposables;
    constructor(container: HTMLElement, contextMenuService: IContextMenuService, commandService: ICommandService, notificationService: INotificationService);
    dispose(): void;
    setButton(button: ISCMActionButtonDescriptor | undefined): void;
    focus(): void;
    private clear;
    private executeCommand;
}
export {};

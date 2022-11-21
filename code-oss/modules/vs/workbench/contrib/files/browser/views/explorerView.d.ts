import { URI } from 'vs/base/common/uri';
import { IWorkbenchLayoutService } from 'vs/workbench/services/layout/browser/layoutService';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IProgressService } from 'vs/platform/progress/common/progress';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IDecorationsService } from 'vs/workbench/services/decorations/common/decorations';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IViewPaneOptions, ViewPane } from 'vs/workbench/browser/parts/views/viewPane';
import { ILabelService } from 'vs/platform/label/common/label';
import { ICompressedNavigationController } from 'vs/workbench/contrib/files/browser/views/explorerViewer';
import { IWorkbenchThemeService } from 'vs/workbench/services/themes/common/workbenchThemeService';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { ExplorerItem } from 'vs/workbench/contrib/files/common/explorerModel';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IClipboardService } from 'vs/platform/clipboard/common/clipboardService';
import { IFileService } from 'vs/platform/files/common/files';
import { Color } from 'vs/base/common/color';
import { IViewDescriptorService } from 'vs/workbench/common/views';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
import { IExplorerService, IExplorerView } from 'vs/workbench/contrib/files/browser/files';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { IEditorResolverService } from 'vs/workbench/services/editor/common/editorResolverService';
interface IExplorerViewStyles {
    listDropBackground?: Color;
}
export declare function getContext(focus: ExplorerItem[], selection: ExplorerItem[], respectMultiSelection: boolean, compressedNavigationControllerProvider: {
    getCompressedNavigationController(stat: ExplorerItem): ICompressedNavigationController | undefined;
}): ExplorerItem[];
export interface IExplorerViewContainerDelegate {
    willOpenElement(event?: UIEvent): void;
    didOpenElement(event?: UIEvent): void;
}
export declare class ExplorerView extends ViewPane implements IExplorerView {
    private readonly delegate;
    private readonly contextService;
    private readonly progressService;
    private readonly editorService;
    private readonly editorResolverService;
    private readonly layoutService;
    private readonly decorationService;
    private readonly labelService;
    private readonly explorerService;
    private readonly storageService;
    private clipboardService;
    private readonly fileService;
    private readonly uriIdentityService;
    private readonly commandService;
    static readonly TREE_VIEW_STATE_STORAGE_KEY: string;
    private tree;
    private filter;
    private resourceContext;
    private folderContext;
    private readonlyContext;
    private availableEditorIdsContext;
    private rootContext;
    private resourceMoveableToTrash;
    private renderer;
    private styleElement;
    private treeContainer;
    private container;
    private compressedFocusContext;
    private compressedFocusFirstContext;
    private compressedFocusLastContext;
    private viewHasSomeCollapsibleRootItem;
    private horizontalScrolling;
    private dragHandler;
    private autoReveal;
    private decorationsProvider;
    constructor(options: IViewPaneOptions, delegate: IExplorerViewContainerDelegate, contextMenuService: IContextMenuService, viewDescriptorService: IViewDescriptorService, instantiationService: IInstantiationService, contextService: IWorkspaceContextService, progressService: IProgressService, editorService: IEditorService, editorResolverService: IEditorResolverService, layoutService: IWorkbenchLayoutService, keybindingService: IKeybindingService, contextKeyService: IContextKeyService, configurationService: IConfigurationService, decorationService: IDecorationsService, labelService: ILabelService, themeService: IWorkbenchThemeService, telemetryService: ITelemetryService, explorerService: IExplorerService, storageService: IStorageService, clipboardService: IClipboardService, fileService: IFileService, uriIdentityService: IUriIdentityService, commandService: ICommandService, openerService: IOpenerService);
    get name(): string;
    get title(): string;
    set title(_: string);
    private get fileCopiedContextKey();
    private get resourceCutContextKey();
    protected renderHeader(container: HTMLElement): void;
    protected layoutBody(height: number, width: number): void;
    renderBody(container: HTMLElement): void;
    focus(): void;
    hasFocus(): boolean;
    getContext(respectMultiSelection: boolean): ExplorerItem[];
    isItemVisible(item: ExplorerItem): boolean;
    isItemCollapsed(item: ExplorerItem): boolean;
    setEditable(stat: ExplorerItem, isEditing: boolean): Promise<void>;
    private selectActiveFile;
    private createTree;
    private onConfigurationUpdated;
    private setContextKeys;
    private onContextMenu;
    private onFocusChanged;
    /**
     * Refresh the contents of the explorer to get up to date data from the disk about the file structure.
     * If the item is passed we refresh only that level of the tree, otherwise we do a full refresh.
     */
    refresh(recursive: boolean, item?: ExplorerItem, cancelEditing?: boolean): Promise<void>;
    getOptimalWidth(): number;
    setTreeInput(): Promise<void>;
    selectResource(resource: URI | undefined, reveal?: boolean | "force" | "focusNoScroll", retry?: number): Promise<void>;
    itemsCopied(stats: ExplorerItem[], cut: boolean, previousCut: ExplorerItem[] | undefined): void;
    expandAll(): void;
    collapseAll(): void;
    previousCompressedStat(): void;
    nextCompressedStat(): void;
    firstCompressedStat(): void;
    lastCompressedStat(): void;
    private updateCompressedNavigationContextKeys;
    private updateAnyCollapsedContext;
    styleListDropBackground(styles: IExplorerViewStyles): void;
    dispose(): void;
}
export {};

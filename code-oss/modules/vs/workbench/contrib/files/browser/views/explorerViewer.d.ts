import { IListAccessibilityProvider } from 'vs/base/browser/ui/list/listWidget';
import { IListVirtualDelegate } from 'vs/base/browser/ui/list/list';
import { IProgressService } from 'vs/platform/progress/common/progress';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { IFileService } from 'vs/platform/files/common/files';
import { IWorkbenchLayoutService } from 'vs/workbench/services/layout/browser/layoutService';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { IDisposable, DisposableStore } from 'vs/base/common/lifecycle';
import { IResourceLabel, ResourceLabels } from 'vs/workbench/browser/labels';
import { ITreeNode, ITreeFilter, TreeVisibility, IAsyncDataSource, ITreeSorter, ITreeDragAndDrop, ITreeDragOverReaction } from 'vs/base/browser/ui/tree/tree';
import { IContextViewService } from 'vs/platform/contextview/browser/contextView';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { ExplorerItem } from 'vs/workbench/contrib/files/common/explorerModel';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IDragAndDropData } from 'vs/base/browser/dnd';
import { IDialogService } from 'vs/platform/dialogs/common/dialogs';
import { IWorkspaceEditingService } from 'vs/workbench/services/workspaces/common/workspaceEditing';
import { URI } from 'vs/base/common/uri';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { FuzzyScore } from 'vs/base/common/filters';
import { Emitter, Event } from 'vs/base/common/event';
import { ITreeCompressionDelegate } from 'vs/base/browser/ui/tree/asyncDataTree';
import { ICompressibleTreeRenderer } from 'vs/base/browser/ui/tree/objectTree';
import { ICompressedTreeNode } from 'vs/base/browser/ui/tree/compressedObjectTreeModel';
import { ILabelService } from 'vs/platform/label/common/label';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
import { IExplorerService } from 'vs/workbench/contrib/files/browser/files';
export declare class ExplorerDelegate implements IListVirtualDelegate<ExplorerItem> {
    static readonly ITEM_HEIGHT = 22;
    getHeight(element: ExplorerItem): number;
    getTemplateId(element: ExplorerItem): string;
}
export declare const explorerRootErrorEmitter: Emitter<URI>;
export declare class ExplorerDataSource implements IAsyncDataSource<ExplorerItem | ExplorerItem[], ExplorerItem> {
    private fileFilter;
    private readonly progressService;
    private readonly configService;
    private readonly notificationService;
    private readonly layoutService;
    private readonly fileService;
    private readonly explorerService;
    private readonly contextService;
    constructor(fileFilter: FilesFilter, progressService: IProgressService, configService: IConfigurationService, notificationService: INotificationService, layoutService: IWorkbenchLayoutService, fileService: IFileService, explorerService: IExplorerService, contextService: IWorkspaceContextService);
    hasChildren(element: ExplorerItem | ExplorerItem[]): boolean;
    getChildren(element: ExplorerItem | ExplorerItem[]): ExplorerItem[] | Promise<ExplorerItem[]>;
}
export interface ICompressedNavigationController {
    readonly current: ExplorerItem;
    readonly currentId: string;
    readonly items: ExplorerItem[];
    readonly labels: HTMLElement[];
    readonly index: number;
    readonly count: number;
    readonly onDidChange: Event<void>;
    previous(): void;
    next(): void;
    first(): void;
    last(): void;
    setIndex(index: number): void;
    updateCollapsed(collapsed: boolean): void;
}
export declare class CompressedNavigationController implements ICompressedNavigationController, IDisposable {
    private id;
    readonly items: ExplorerItem[];
    private depth;
    private collapsed;
    static ID: number;
    private _index;
    private _labels;
    private _updateLabelDisposable;
    get index(): number;
    get count(): number;
    get current(): ExplorerItem;
    get currentId(): string;
    get labels(): HTMLElement[];
    private _onDidChange;
    readonly onDidChange: Event<void>;
    constructor(id: string, items: ExplorerItem[], templateData: IFileTemplateData, depth: number, collapsed: boolean);
    private updateLabels;
    previous(): void;
    next(): void;
    first(): void;
    last(): void;
    setIndex(index: number): void;
    updateCollapsed(collapsed: boolean): void;
    dispose(): void;
}
export interface IFileTemplateData {
    readonly templateDisposables: DisposableStore;
    readonly elementDisposables: DisposableStore;
    readonly label: IResourceLabel;
    readonly container: HTMLElement;
    currentContext?: ExplorerItem;
}
export declare class FilesRenderer implements ICompressibleTreeRenderer<ExplorerItem, FuzzyScore, IFileTemplateData>, IListAccessibilityProvider<ExplorerItem>, IDisposable {
    private labels;
    private updateWidth;
    private readonly contextViewService;
    private readonly themeService;
    private readonly configurationService;
    private readonly explorerService;
    private readonly labelService;
    private readonly contextService;
    static readonly ID = "file";
    private config;
    private configListener;
    private compressedNavigationControllers;
    private _onDidChangeActiveDescendant;
    readonly onDidChangeActiveDescendant: Event<void>;
    constructor(container: HTMLElement, labels: ResourceLabels, updateWidth: (stat: ExplorerItem) => void, contextViewService: IContextViewService, themeService: IThemeService, configurationService: IConfigurationService, explorerService: IExplorerService, labelService: ILabelService, contextService: IWorkspaceContextService);
    getWidgetAriaLabel(): string;
    get templateId(): string;
    renderTemplate(container: HTMLElement): IFileTemplateData;
    renderElement(node: ITreeNode<ExplorerItem, FuzzyScore>, index: number, templateData: IFileTemplateData): void;
    renderCompressedElements(node: ITreeNode<ICompressedTreeNode<ExplorerItem>, FuzzyScore>, index: number, templateData: IFileTemplateData, height: number | undefined): void;
    private renderStat;
    private renderInputBox;
    disposeElement(element: ITreeNode<ExplorerItem, FuzzyScore>, index: number, templateData: IFileTemplateData): void;
    disposeCompressedElements(node: ITreeNode<ICompressedTreeNode<ExplorerItem>, FuzzyScore>, index: number, templateData: IFileTemplateData): void;
    disposeTemplate(templateData: IFileTemplateData): void;
    getCompressedNavigationController(stat: ExplorerItem): ICompressedNavigationController | undefined;
    getAriaLabel(element: ExplorerItem): string;
    getAriaLevel(element: ExplorerItem): number;
    getActiveDescendantId(stat: ExplorerItem): string | undefined;
    dispose(): void;
}
/**
 * Respects files.exclude setting in filtering out content from the explorer.
 * Makes sure that visible editors are always shown in the explorer even if they are filtered out by settings.
 */
export declare class FilesFilter implements ITreeFilter<ExplorerItem, FuzzyScore> {
    private readonly contextService;
    private readonly configurationService;
    private readonly explorerService;
    private readonly editorService;
    private readonly uriIdentityService;
    private readonly fileService;
    private hiddenExpressionPerRoot;
    private editorsAffectingFilter;
    private _onDidChange;
    private toDispose;
    private ignoreFileResourcesPerRoot;
    private ignoreTreesPerRoot;
    constructor(contextService: IWorkspaceContextService, configurationService: IConfigurationService, explorerService: IExplorerService, editorService: IEditorService, uriIdentityService: IUriIdentityService, fileService: IFileService);
    get onDidChange(): Event<void>;
    private updateConfiguration;
    /**
     * Given a .gitignore file resource, processes the resource and adds it to the ignore tree which hides explorer items
     * @param root The root folder of the workspace as a string. Used for lookup key for ignore tree and resource list
     * @param ignoreFileResource The resource of the .gitignore file
     * @param update Whether or not we're updating an existing ignore file. If true it deletes the old entry
     */
    private processIgnoreFile;
    filter(stat: ExplorerItem, parentVisibility: TreeVisibility): boolean;
    private isVisible;
    dispose(): void;
}
export declare class FileSorter implements ITreeSorter<ExplorerItem> {
    private readonly explorerService;
    private readonly contextService;
    constructor(explorerService: IExplorerService, contextService: IWorkspaceContextService);
    compare(statA: ExplorerItem, statB: ExplorerItem): number;
}
export declare class FileDragAndDrop implements ITreeDragAndDrop<ExplorerItem> {
    private isCollapsed;
    private explorerService;
    private editorService;
    private dialogService;
    private contextService;
    private fileService;
    private configurationService;
    private instantiationService;
    private workspaceEditingService;
    private readonly uriIdentityService;
    private static readonly CONFIRM_DND_SETTING_KEY;
    private compressedDragOverElement;
    private compressedDropTargetDisposable;
    private toDispose;
    private dropEnabled;
    constructor(isCollapsed: (item: ExplorerItem) => boolean, explorerService: IExplorerService, editorService: IEditorService, dialogService: IDialogService, contextService: IWorkspaceContextService, fileService: IFileService, configurationService: IConfigurationService, instantiationService: IInstantiationService, workspaceEditingService: IWorkspaceEditingService, uriIdentityService: IUriIdentityService);
    onDragOver(data: IDragAndDropData, target: ExplorerItem | undefined, targetIndex: number | undefined, originalEvent: DragEvent): boolean | ITreeDragOverReaction;
    private handleDragOver;
    getDragURI(element: ExplorerItem): string | null;
    getDragLabel(elements: ExplorerItem[], originalEvent: DragEvent): string | undefined;
    onDragStart(data: IDragAndDropData, originalEvent: DragEvent): void;
    drop(data: IDragAndDropData, target: ExplorerItem | undefined, targetIndex: number | undefined, originalEvent: DragEvent): Promise<void>;
    private handleExplorerDrop;
    private doHandleRootDrop;
    private doHandleExplorerDropOnCopy;
    private doHandleExplorerDropOnMove;
    private static getStatsFromDragAndDropData;
    private static getCompressedStatFromDragEvent;
    onDragEnd(): void;
}
export declare function isCompressedFolderName(target: HTMLElement | EventTarget | Element | null): boolean;
export declare class ExplorerCompressionDelegate implements ITreeCompressionDelegate<ExplorerItem> {
    isIncompressible(stat: ExplorerItem): boolean;
}

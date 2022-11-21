import { CountBadge } from 'vs/base/browser/ui/countBadge/countBadge';
import { IListVirtualDelegate } from 'vs/base/browser/ui/list/list';
import { IListAccessibilityProvider } from 'vs/base/browser/ui/list/listWidget';
import { ITreeNode } from 'vs/base/browser/ui/tree/tree';
import { Disposable, DisposableStore } from 'vs/base/common/lifecycle';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { ILabelService } from 'vs/platform/label/common/label';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { IResourceLabel, ResourceLabels } from 'vs/workbench/browser/labels';
import { SearchView } from 'vs/workbench/contrib/search/browser/searchView';
import { FileMatch, Match, RenderableMatch, SearchModel, FolderMatch } from 'vs/workbench/contrib/search/common/searchModel';
import { ICompressibleTreeRenderer } from 'vs/base/browser/ui/tree/objectTree';
import { ICompressedTreeNode } from 'vs/base/browser/ui/tree/compressedObjectTreeModel';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { MenuWorkbenchToolBar } from 'vs/platform/actions/browser/toolbar';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
interface IFolderMatchTemplate {
    label: IResourceLabel;
    badge: CountBadge;
    actions: MenuWorkbenchToolBar;
    disposables: DisposableStore;
    disposableActions: DisposableStore;
}
interface IFileMatchTemplate {
    el: HTMLElement;
    label: IResourceLabel;
    badge: CountBadge;
    actions: MenuWorkbenchToolBar;
    disposables: DisposableStore;
}
interface IMatchTemplate {
    parent: HTMLElement;
    before: HTMLElement;
    match: HTMLElement;
    replace: HTMLElement;
    after: HTMLElement;
    lineNumber: HTMLElement;
    actions: MenuWorkbenchToolBar;
    disposables: DisposableStore;
}
export declare class SearchDelegate implements IListVirtualDelegate<RenderableMatch> {
    static ITEM_HEIGHT: number;
    getHeight(element: RenderableMatch): number;
    getTemplateId(element: RenderableMatch): string;
}
export declare class FolderMatchRenderer extends Disposable implements ICompressibleTreeRenderer<FolderMatch, any, IFolderMatchTemplate> {
    private searchView;
    private labels;
    private readonly themeService;
    protected contextService: IWorkspaceContextService;
    private readonly labelService;
    private readonly instantiationService;
    private readonly contextKeyService;
    static readonly TEMPLATE_ID = "folderMatch";
    readonly templateId = "folderMatch";
    constructor(searchView: SearchView, labels: ResourceLabels, themeService: IThemeService, contextService: IWorkspaceContextService, labelService: ILabelService, instantiationService: IInstantiationService, contextKeyService: IContextKeyService);
    renderCompressedElements(node: ITreeNode<ICompressedTreeNode<FolderMatch>, any>, index: number, templateData: IFolderMatchTemplate, height: number | undefined): void;
    renderTemplate(container: HTMLElement): IFolderMatchTemplate;
    renderElement(node: ITreeNode<FolderMatch, any>, index: number, templateData: IFolderMatchTemplate): void;
    disposeElement(element: ITreeNode<RenderableMatch, any>, index: number, templateData: IFolderMatchTemplate): void;
    disposeCompressedElements(node: ITreeNode<ICompressedTreeNode<FolderMatch>, any>, index: number, templateData: IFolderMatchTemplate, height: number | undefined): void;
    disposeTemplate(templateData: IFolderMatchTemplate): void;
    private renderFolderDetails;
}
export declare class FileMatchRenderer extends Disposable implements ICompressibleTreeRenderer<FileMatch, any, IFileMatchTemplate> {
    private searchView;
    private labels;
    private readonly themeService;
    protected contextService: IWorkspaceContextService;
    private readonly configurationService;
    private readonly instantiationService;
    private readonly contextKeyService;
    static readonly TEMPLATE_ID = "fileMatch";
    readonly templateId = "fileMatch";
    constructor(searchView: SearchView, labels: ResourceLabels, themeService: IThemeService, contextService: IWorkspaceContextService, configurationService: IConfigurationService, instantiationService: IInstantiationService, contextKeyService: IContextKeyService);
    renderCompressedElements(node: ITreeNode<ICompressedTreeNode<FileMatch>, any>, index: number, templateData: IFileMatchTemplate, height: number | undefined): void;
    renderTemplate(container: HTMLElement): IFileMatchTemplate;
    renderElement(node: ITreeNode<FileMatch, any>, index: number, templateData: IFileMatchTemplate): void;
    disposeElement(element: ITreeNode<RenderableMatch, any>, index: number, templateData: IFileMatchTemplate): void;
    disposeTemplate(templateData: IFileMatchTemplate): void;
}
export declare class MatchRenderer extends Disposable implements ICompressibleTreeRenderer<Match, void, IMatchTemplate> {
    private searchModel;
    private searchView;
    protected contextService: IWorkspaceContextService;
    private readonly configurationService;
    private readonly instantiationService;
    private readonly contextKeyService;
    static readonly TEMPLATE_ID = "match";
    readonly templateId = "match";
    constructor(searchModel: SearchModel, searchView: SearchView, contextService: IWorkspaceContextService, configurationService: IConfigurationService, instantiationService: IInstantiationService, contextKeyService: IContextKeyService);
    renderCompressedElements(node: ITreeNode<ICompressedTreeNode<Match>, void>, index: number, templateData: IMatchTemplate, height: number | undefined): void;
    renderTemplate(container: HTMLElement): IMatchTemplate;
    renderElement(node: ITreeNode<Match, any>, index: number, templateData: IMatchTemplate): void;
    disposeTemplate(templateData: IMatchTemplate): void;
    private getMatchTitle;
}
export declare class SearchAccessibilityProvider implements IListAccessibilityProvider<RenderableMatch> {
    private searchModel;
    private readonly labelService;
    constructor(searchModel: SearchModel, labelService: ILabelService);
    getWidgetAriaLabel(): string;
    getAriaLabel(element: RenderableMatch): string | null;
}
export {};

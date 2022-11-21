import { IDisposable } from 'vs/base/common/lifecycle';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { IResourceLabel, ResourceLabels } from 'vs/workbench/browser/labels';
import { CommentNode, CommentsModel, ResourceWithCommentThreads } from 'vs/workbench/contrib/comments/common/commentModel';
import { IAsyncDataSource, ITreeFilter, ITreeNode, TreeFilterResult, TreeVisibility } from 'vs/base/browser/ui/tree/tree';
import { IListRenderer } from 'vs/base/browser/ui/list/list';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { WorkbenchAsyncDataTree, IListService, IWorkbenchAsyncDataTreeOptions } from 'vs/platform/list/browser/listService';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IColorMapping } from 'vs/platform/theme/common/styler';
import { TimestampWidget } from 'vs/workbench/contrib/comments/browser/timestamp';
import { IMatch } from 'vs/base/common/filters';
import { FilterOptions } from 'vs/workbench/contrib/comments/browser/commentsFilterOptions';
export declare const COMMENTS_VIEW_ID = "workbench.panel.comments";
export declare const COMMENTS_VIEW_STORAGE_ID = "Comments";
export declare const COMMENTS_VIEW_TITLE: string;
export declare class CommentsAsyncDataSource implements IAsyncDataSource<any, any> {
    hasChildren(element: any): boolean;
    getChildren(element: any): any[] | Promise<any[]>;
}
interface IResourceTemplateData {
    resourceLabel: IResourceLabel;
}
interface ICommentThreadTemplateData {
    threadMetadata: {
        icon: HTMLElement;
        userNames: HTMLSpanElement;
        timestamp: TimestampWidget;
        separator: HTMLElement;
        commentPreview: HTMLSpanElement;
        range: HTMLSpanElement;
    };
    repliesMetadata: {
        container: HTMLElement;
        icon: HTMLElement;
        count: HTMLSpanElement;
        lastReplyDetail: HTMLSpanElement;
        separator: HTMLElement;
        timestamp: TimestampWidget;
    };
    disposables: IDisposable[];
}
export declare class ResourceWithCommentsRenderer implements IListRenderer<ITreeNode<ResourceWithCommentThreads>, IResourceTemplateData> {
    private labels;
    templateId: string;
    constructor(labels: ResourceLabels);
    renderTemplate(container: HTMLElement): IResourceTemplateData;
    renderElement(node: ITreeNode<ResourceWithCommentThreads>, index: number, templateData: IResourceTemplateData, height: number | undefined): void;
    disposeTemplate(templateData: IResourceTemplateData): void;
}
export declare class CommentNodeRenderer implements IListRenderer<ITreeNode<CommentNode>, ICommentThreadTemplateData> {
    private readonly openerService;
    private readonly configurationService;
    private themeService;
    templateId: string;
    constructor(openerService: IOpenerService, configurationService: IConfigurationService, themeService: IThemeService);
    renderTemplate(container: HTMLElement): ICommentThreadTemplateData;
    private getCountString;
    private getRenderedComment;
    private getIcon;
    renderElement(node: ITreeNode<CommentNode>, index: number, templateData: ICommentThreadTemplateData, height: number | undefined): void;
    private getCommentThreadWidgetStateColor;
    disposeTemplate(templateData: ICommentThreadTemplateData): void;
}
export interface ICommentsListOptions extends IWorkbenchAsyncDataTreeOptions<any, any> {
    overrideStyles?: IColorMapping;
}
declare const enum FilterDataType {
    Resource = 0,
    Comment = 1
}
interface ResourceFilterData {
    type: FilterDataType.Resource;
    uriMatches: IMatch[];
}
interface CommentFilterData {
    type: FilterDataType.Comment;
    textMatches: IMatch[];
}
declare type FilterData = ResourceFilterData | CommentFilterData;
export declare class Filter implements ITreeFilter<ResourceWithCommentThreads | CommentNode, FilterData> {
    options: FilterOptions;
    constructor(options: FilterOptions);
    filter(element: ResourceWithCommentThreads | CommentNode, parentVisibility: TreeVisibility): TreeFilterResult<FilterData>;
    private filterResourceMarkers;
    private filterCommentNode;
}
export declare class CommentsList extends WorkbenchAsyncDataTree<CommentsModel | ResourceWithCommentThreads | CommentNode, any> {
    constructor(labels: ResourceLabels, container: HTMLElement, options: ICommentsListOptions, contextKeyService: IContextKeyService, listService: IListService, themeService: IThemeService, instantiationService: IInstantiationService, configurationService: IConfigurationService);
    filterComments(): void;
    getVisibleItemCount(): number;
}
export {};

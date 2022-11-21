import { CommentThreadChangedEvent, CommentInfo, Comment, CommentReaction, CommentingRanges, CommentThread, CommentOptions } from 'vs/editor/common/languages';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { URI, UriComponents } from 'vs/base/common/uri';
import { Range, IRange } from 'vs/editor/common/core/range';
import { CancellationToken } from 'vs/base/common/cancellation';
import { ICommentThreadChangedEvent } from 'vs/workbench/contrib/comments/common/commentModel';
import { CommentMenus } from 'vs/workbench/contrib/comments/browser/commentMenus';
import { ICellRange } from 'vs/workbench/contrib/notebook/common/notebookRange';
import { IWorkbenchLayoutService } from 'vs/workbench/services/layout/browser/layoutService';
export declare const ICommentService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<ICommentService>;
interface IResourceCommentThreadEvent {
    resource: URI;
    commentInfos: ICommentInfo[];
}
export interface ICommentInfo extends CommentInfo {
    owner: string;
    label?: string;
}
export interface INotebookCommentInfo {
    extensionId?: string;
    threads: CommentThread<ICellRange>[];
    owner: string;
    label?: string;
}
export interface IWorkspaceCommentThreadsEvent {
    ownerId: string;
    commentThreads: CommentThread[];
}
export interface INotebookCommentThreadChangedEvent extends CommentThreadChangedEvent<ICellRange> {
    owner: string;
}
export interface ICommentController {
    id: string;
    features: {
        reactionGroup?: CommentReaction[];
        reactionHandler?: boolean;
        options?: CommentOptions;
    };
    options?: CommentOptions;
    contextValue?: string;
    createCommentThreadTemplate(resource: UriComponents, range: IRange): void;
    updateCommentThreadTemplate(threadHandle: number, range: IRange): Promise<void>;
    deleteCommentThreadMain(commentThreadId: string): void;
    toggleReaction(uri: URI, thread: CommentThread, comment: Comment, reaction: CommentReaction, token: CancellationToken): Promise<void>;
    getDocumentComments(resource: URI, token: CancellationToken): Promise<ICommentInfo>;
    getNotebookComments(resource: URI, token: CancellationToken): Promise<INotebookCommentInfo>;
    getCommentingRanges(resource: URI, token: CancellationToken): Promise<IRange[]>;
}
export interface ICommentService {
    readonly _serviceBrand: undefined;
    readonly onDidSetResourceCommentInfos: Event<IResourceCommentThreadEvent>;
    readonly onDidSetAllCommentThreads: Event<IWorkspaceCommentThreadsEvent>;
    readonly onDidUpdateCommentThreads: Event<ICommentThreadChangedEvent>;
    readonly onDidUpdateNotebookCommentThreads: Event<INotebookCommentThreadChangedEvent>;
    readonly onDidChangeActiveCommentThread: Event<CommentThread | null>;
    readonly onDidChangeCurrentCommentThread: Event<CommentThread | undefined>;
    readonly onDidUpdateCommentingRanges: Event<{
        owner: string;
    }>;
    readonly onDidChangeActiveCommentingRange: Event<{
        range: Range;
        commentingRangesInfo: CommentingRanges;
    }>;
    readonly onDidSetDataProvider: Event<void>;
    readonly onDidDeleteDataProvider: Event<string>;
    readonly onDidChangeCommentingEnabled: Event<boolean>;
    readonly isCommentingEnabled: boolean;
    setDocumentComments(resource: URI, commentInfos: ICommentInfo[]): void;
    setWorkspaceComments(owner: string, commentsByResource: CommentThread<IRange | ICellRange>[]): void;
    removeWorkspaceComments(owner: string): void;
    registerCommentController(owner: string, commentControl: ICommentController): void;
    unregisterCommentController(owner: string): void;
    getCommentController(owner: string): ICommentController | undefined;
    createCommentThreadTemplate(owner: string, resource: URI, range: Range): void;
    updateCommentThreadTemplate(owner: string, threadHandle: number, range: Range): Promise<void>;
    getCommentMenus(owner: string): CommentMenus;
    updateComments(ownerId: string, event: CommentThreadChangedEvent<IRange>): void;
    updateNotebookComments(ownerId: string, event: CommentThreadChangedEvent<ICellRange>): void;
    disposeCommentThread(ownerId: string, threadId: string): void;
    getDocumentComments(resource: URI): Promise<(ICommentInfo | null)[]>;
    getNotebookComments(resource: URI): Promise<(INotebookCommentInfo | null)[]>;
    updateCommentingRanges(ownerId: string): void;
    getCommentingRanges(resource: URI): Promise<IRange[]>;
    hasReactionHandler(owner: string): boolean;
    toggleReaction(owner: string, resource: URI, thread: CommentThread<IRange | ICellRange>, comment: Comment, reaction: CommentReaction): Promise<void>;
    setActiveCommentThread(commentThread: CommentThread<IRange | ICellRange> | null): void;
    setCurrentCommentThread(commentThread: CommentThread<IRange | ICellRange> | undefined): void;
    enableCommenting(enable: boolean): void;
}
export declare class CommentService extends Disposable implements ICommentService {
    protected instantiationService: IInstantiationService;
    readonly _serviceBrand: undefined;
    private readonly _onDidSetDataProvider;
    readonly onDidSetDataProvider: Event<void>;
    private readonly _onDidDeleteDataProvider;
    readonly onDidDeleteDataProvider: Event<string>;
    private readonly _onDidSetResourceCommentInfos;
    readonly onDidSetResourceCommentInfos: Event<IResourceCommentThreadEvent>;
    private readonly _onDidSetAllCommentThreads;
    readonly onDidSetAllCommentThreads: Event<IWorkspaceCommentThreadsEvent>;
    private readonly _onDidUpdateCommentThreads;
    readonly onDidUpdateCommentThreads: Event<ICommentThreadChangedEvent>;
    private readonly _onDidUpdateNotebookCommentThreads;
    readonly onDidUpdateNotebookCommentThreads: Event<INotebookCommentThreadChangedEvent>;
    private readonly _onDidUpdateCommentingRanges;
    readonly onDidUpdateCommentingRanges: Event<{
        owner: string;
    }>;
    private readonly _onDidChangeActiveCommentThread;
    readonly onDidChangeActiveCommentThread: Event<CommentThread<IRange> | null>;
    private readonly _onDidChangeCurrentCommentThread;
    readonly onDidChangeCurrentCommentThread: Event<CommentThread<IRange> | undefined>;
    private readonly _onDidChangeCommentingEnabled;
    readonly onDidChangeCommentingEnabled: Event<boolean>;
    private readonly _onDidChangeActiveCommentingRange;
    readonly onDidChangeActiveCommentingRange: Event<{
        range: Range;
        commentingRangesInfo: CommentingRanges;
    }>;
    private _commentControls;
    private _commentMenus;
    private _isCommentingEnabled;
    constructor(instantiationService: IInstantiationService, layoutService: IWorkbenchLayoutService);
    get isCommentingEnabled(): boolean;
    enableCommenting(enable: boolean): void;
    /**
     * The current comment thread is the thread that has focus or is being hovered.
     * @param commentThread
     */
    setCurrentCommentThread(commentThread: CommentThread | undefined): void;
    /**
     * The active comment thread is the the thread that is currently being edited.
     * @param commentThread
     */
    setActiveCommentThread(commentThread: CommentThread | null): void;
    setDocumentComments(resource: URI, commentInfos: ICommentInfo[]): void;
    setWorkspaceComments(owner: string, commentsByResource: CommentThread[]): void;
    removeWorkspaceComments(owner: string): void;
    registerCommentController(owner: string, commentControl: ICommentController): void;
    unregisterCommentController(owner: string): void;
    getCommentController(owner: string): ICommentController | undefined;
    createCommentThreadTemplate(owner: string, resource: URI, range: Range): void;
    updateCommentThreadTemplate(owner: string, threadHandle: number, range: Range): Promise<void>;
    disposeCommentThread(owner: string, threadId: string): void;
    getCommentMenus(owner: string): CommentMenus;
    updateComments(ownerId: string, event: CommentThreadChangedEvent<IRange>): void;
    updateNotebookComments(ownerId: string, event: CommentThreadChangedEvent<ICellRange>): void;
    updateCommentingRanges(ownerId: string): void;
    toggleReaction(owner: string, resource: URI, thread: CommentThread, comment: Comment, reaction: CommentReaction): Promise<void>;
    hasReactionHandler(owner: string): boolean;
    getDocumentComments(resource: URI): Promise<(ICommentInfo | null)[]>;
    getNotebookComments(resource: URI): Promise<(INotebookCommentInfo | null)[]>;
    getCommentingRanges(resource: URI): Promise<IRange[]>;
}
export {};

import { CancellationToken } from 'vs/base/common/cancellation';
import { Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { URI, UriComponents } from 'vs/base/common/uri';
import { IRange } from 'vs/editor/common/core/range';
import * as languages from 'vs/editor/common/languages';
import { ExtensionIdentifier } from 'vs/platform/extensions/common/extensions';
import { IExtHostContext } from 'vs/workbench/services/extensions/common/extHostCustomers';
import { ICommentInfo, ICommentService, INotebookCommentInfo } from 'vs/workbench/contrib/comments/browser/commentService';
import { CommentProviderFeatures, ExtHostCommentsShape, MainThreadCommentsShape, CommentThreadChanges } from '../common/extHost.protocol';
import { IViewsService, IViewDescriptorService } from 'vs/workbench/common/views';
import { ICellRange } from 'vs/workbench/contrib/notebook/common/notebookRange';
export declare class MainThreadCommentThread<T> implements languages.CommentThread<T> {
    commentThreadHandle: number;
    controllerHandle: number;
    extensionId: string;
    threadId: string;
    resource: string;
    private _range;
    private _canReply;
    private _isTemplate;
    private _input?;
    get input(): languages.CommentInput | undefined;
    set input(value: languages.CommentInput | undefined);
    private readonly _onDidChangeInput;
    get onDidChangeInput(): Event<languages.CommentInput | undefined>;
    private _label;
    get label(): string | undefined;
    set label(label: string | undefined);
    private _contextValue;
    get contextValue(): string | undefined;
    set contextValue(context: string | undefined);
    private readonly _onDidChangeLabel;
    readonly onDidChangeLabel: Event<string | undefined>;
    private _comments;
    get comments(): languages.Comment[] | undefined;
    set comments(newComments: languages.Comment[] | undefined);
    private readonly _onDidChangeComments;
    get onDidChangeComments(): Event<readonly languages.Comment[] | undefined>;
    set range(range: T);
    get range(): T;
    private readonly _onDidChangeCanReply;
    get onDidChangeCanReply(): Event<boolean>;
    set canReply(state: boolean);
    get canReply(): boolean;
    private readonly _onDidChangeRange;
    onDidChangeRange: Event<T>;
    private _collapsibleState;
    get collapsibleState(): languages.CommentThreadCollapsibleState | undefined;
    set collapsibleState(newState: languages.CommentThreadCollapsibleState | undefined);
    private _initialCollapsibleState;
    get initialCollapsibleState(): languages.CommentThreadCollapsibleState | undefined;
    private set initialCollapsibleState(value);
    private readonly _onDidChangeCollapsibleState;
    onDidChangeCollapsibleState: Event<languages.CommentThreadCollapsibleState | undefined>;
    private readonly _onDidChangeInitialCollapsibleState;
    onDidChangeInitialCollapsibleState: Event<languages.CommentThreadCollapsibleState | undefined>;
    private _isDisposed;
    get isDisposed(): boolean;
    isDocumentCommentThread(): this is languages.CommentThread<IRange>;
    private _state;
    get state(): languages.CommentThreadState | undefined;
    set state(newState: languages.CommentThreadState | undefined);
    get isTemplate(): boolean;
    private readonly _onDidChangeState;
    onDidChangeState: Event<languages.CommentThreadState | undefined>;
    constructor(commentThreadHandle: number, controllerHandle: number, extensionId: string, threadId: string, resource: string, _range: T, _canReply: boolean, _isTemplate: boolean);
    batchUpdate(changes: CommentThreadChanges<T>): void;
    dispose(): void;
    toJSON(): any;
}
export declare class MainThreadCommentController {
    private readonly _proxy;
    private readonly _commentService;
    private readonly _handle;
    private readonly _uniqueId;
    private readonly _id;
    private readonly _label;
    private _features;
    get handle(): number;
    get id(): string;
    get contextValue(): string;
    get proxy(): ExtHostCommentsShape;
    get label(): string;
    private _reactions;
    get reactions(): languages.CommentReaction[] | undefined;
    set reactions(reactions: languages.CommentReaction[] | undefined);
    get options(): languages.CommentOptions | undefined;
    private readonly _threads;
    activeCommentThread?: MainThreadCommentThread<IRange | ICellRange>;
    get features(): CommentProviderFeatures;
    constructor(_proxy: ExtHostCommentsShape, _commentService: ICommentService, _handle: number, _uniqueId: string, _id: string, _label: string, _features: CommentProviderFeatures);
    updateFeatures(features: CommentProviderFeatures): void;
    createCommentThread(extensionId: string, commentThreadHandle: number, threadId: string, resource: UriComponents, range: IRange | ICellRange, isTemplate: boolean): languages.CommentThread<IRange | ICellRange>;
    updateCommentThread(commentThreadHandle: number, threadId: string, resource: UriComponents, changes: CommentThreadChanges): void;
    deleteCommentThread(commentThreadHandle: number): void;
    deleteCommentThreadMain(commentThreadId: string): void;
    updateInput(input: string): void;
    updateCommentingRanges(): void;
    private getKnownThread;
    getDocumentComments(resource: URI, token: CancellationToken): Promise<ICommentInfo>;
    getNotebookComments(resource: URI, token: CancellationToken): Promise<INotebookCommentInfo>;
    getCommentingRanges(resource: URI, token: CancellationToken): Promise<IRange[]>;
    toggleReaction(uri: URI, thread: languages.CommentThread, comment: languages.Comment, reaction: languages.CommentReaction, token: CancellationToken): Promise<void>;
    getAllComments(): MainThreadCommentThread<IRange | ICellRange>[];
    createCommentThreadTemplate(resource: UriComponents, range: IRange): void;
    updateCommentThreadTemplate(threadHandle: number, range: IRange): Promise<void>;
    toJSON(): any;
}
export declare class MainThreadComments extends Disposable implements MainThreadCommentsShape {
    private readonly _commentService;
    private readonly _viewsService;
    private readonly _viewDescriptorService;
    private readonly _proxy;
    private _handlers;
    private _commentControllers;
    private _activeCommentThread?;
    private readonly _activeCommentThreadDisposables;
    private _openViewListener;
    constructor(extHostContext: IExtHostContext, _commentService: ICommentService, _viewsService: IViewsService, _viewDescriptorService: IViewDescriptorService);
    $registerCommentController(handle: number, id: string, label: string): void;
    $unregisterCommentController(handle: number): void;
    $updateCommentControllerFeatures(handle: number, features: CommentProviderFeatures): void;
    $createCommentThread(handle: number, commentThreadHandle: number, threadId: string, resource: UriComponents, range: IRange | ICellRange, extensionId: ExtensionIdentifier, isTemplate: boolean): languages.CommentThread<IRange | ICellRange> | undefined;
    $updateCommentThread(handle: number, commentThreadHandle: number, threadId: string, resource: UriComponents, changes: CommentThreadChanges): void;
    $deleteCommentThread(handle: number, commentThreadHandle: number): void;
    $updateCommentingRanges(handle: number): void;
    private registerView;
    private setComments;
    private registerViewOpenedListener;
    /**
     * If the comments view has never been opened, the constructor for it has not yet run so it has
     * no listeners for comment threads being set or updated. Listen for the view opening for the
     * first time and send it comments then.
     */
    private registerViewListeners;
    private getHandler;
}

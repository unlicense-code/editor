import { URI } from 'vs/base/common/uri';
import { IRange } from 'vs/editor/common/core/range';
import { Comment, CommentThread, CommentThreadChangedEvent, CommentThreadState } from 'vs/editor/common/languages';
export interface ICommentThreadChangedEvent extends CommentThreadChangedEvent<IRange> {
    owner: string;
}
export declare class CommentNode {
    owner: string;
    threadId: string;
    range: IRange;
    comment: Comment;
    replies: CommentNode[];
    resource: URI;
    isRoot: boolean;
    threadState?: CommentThreadState;
    constructor(owner: string, threadId: string, resource: URI, comment: Comment, range: IRange, threadState: CommentThreadState | undefined);
    hasReply(): boolean;
}
export declare class ResourceWithCommentThreads {
    id: string;
    owner: string;
    commentThreads: CommentNode[];
    resource: URI;
    constructor(owner: string, resource: URI, commentThreads: CommentThread[]);
    static createCommentNode(owner: string, resource: URI, commentThread: CommentThread): CommentNode;
}
export declare class CommentsModel {
    resourceCommentThreads: ResourceWithCommentThreads[];
    commentThreadsMap: Map<string, ResourceWithCommentThreads[]>;
    constructor();
    private updateResourceCommentThreads;
    setCommentThreads(owner: string, commentThreads: CommentThread[]): void;
    updateCommentThreads(event: ICommentThreadChangedEvent): boolean;
    hasCommentThreads(): boolean;
    getMessage(): string;
    private groupByResource;
    private static _compareURIs;
}

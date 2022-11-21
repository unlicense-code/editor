import { Disposable } from 'vs/base/common/lifecycle';
import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
import { ICommentInfo, ICommentService } from 'vs/workbench/contrib/comments/browser/commentService';
export declare class CommentThreadRangeDecorator extends Disposable {
    private static description;
    private decorationOptions;
    private activeDecorationOptions;
    private decorationIds;
    private activeDecorationIds;
    private editor;
    private threadCollapseStateListeners;
    private currentThreadCollapseStateListener;
    constructor(commentService: ICommentService);
    private updateCurrent;
    update(editor: ICodeEditor | undefined, commentInfos: ICommentInfo[]): void;
    dispose(): void;
}

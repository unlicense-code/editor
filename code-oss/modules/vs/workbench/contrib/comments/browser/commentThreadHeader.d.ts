import { Disposable } from 'vs/base/common/lifecycle';
import * as languages from 'vs/editor/common/languages';
import { IRange } from 'vs/editor/common/core/range';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { CommentMenus } from 'vs/workbench/contrib/comments/browser/commentMenus';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
export declare class CommentThreadHeader<T = IRange> extends Disposable {
    private _delegate;
    private _commentMenus;
    private _commentThread;
    private _contextKeyService;
    private instantiationService;
    private _contextMenuService;
    private _headElement;
    private _headingLabel;
    private _actionbarWidget;
    private _collapseAction;
    constructor(container: HTMLElement, _delegate: {
        collapse: () => void;
    }, _commentMenus: CommentMenus, _commentThread: languages.CommentThread<T>, _contextKeyService: IContextKeyService, instantiationService: IInstantiationService, _contextMenuService: IContextMenuService);
    protected _fillHead(): void;
    private setActionBarActions;
    updateCommentThread(commentThread: languages.CommentThread<T>): void;
    createThreadLabel(): void;
    updateHeight(headHeight: number): void;
    private onContextMenu;
}

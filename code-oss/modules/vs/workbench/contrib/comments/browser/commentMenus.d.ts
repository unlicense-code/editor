import { IDisposable } from 'vs/base/common/lifecycle';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IMenuService, IMenu } from 'vs/platform/actions/common/actions';
import { Comment } from 'vs/editor/common/languages';
export declare class CommentMenus implements IDisposable {
    private readonly menuService;
    constructor(menuService: IMenuService);
    getCommentThreadTitleActions(contextKeyService: IContextKeyService): IMenu;
    getCommentThreadActions(contextKeyService: IContextKeyService): IMenu;
    getCommentTitleActions(comment: Comment, contextKeyService: IContextKeyService): IMenu;
    getCommentActions(comment: Comment, contextKeyService: IContextKeyService): IMenu;
    getCommentThreadTitleContextActions(contextKeyService: IContextKeyService): IMenu;
    private getMenu;
    dispose(): void;
}

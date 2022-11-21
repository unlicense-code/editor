import { Disposable } from 'vs/base/common/lifecycle';
import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
import { IRange } from 'vs/editor/common/core/range';
import * as languages from 'vs/editor/common/languages';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { ITextModel } from 'vs/editor/common/model';
import { IModelService } from 'vs/editor/common/services/model';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IContextKey, IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { CommentMenus } from 'vs/workbench/contrib/comments/browser/commentMenus';
import { ICommentService } from 'vs/workbench/contrib/comments/browser/commentService';
import { ICommentThreadWidget } from 'vs/workbench/contrib/comments/common/commentThreadWidget';
import { ICellRange } from 'vs/workbench/contrib/notebook/common/notebookRange';
export declare const COMMENTEDITOR_DECORATION_KEY = "commenteditordecoration";
export declare class CommentReply<T extends IRange | ICellRange> extends Disposable {
    readonly owner: string;
    private _commentThread;
    private _scopedInstatiationService;
    private _contextKeyService;
    private _commentMenus;
    private _commentOptions;
    private _pendingComment;
    private _parentThread;
    private _actionRunDelegate;
    private commentService;
    private languageService;
    private modelService;
    private themeService;
    commentEditor: ICodeEditor;
    form: HTMLElement;
    commentEditorIsEmpty: IContextKey<boolean>;
    private _error;
    private _formActions;
    private _commentThreadDisposables;
    private _commentFormActions;
    private _reviewThreadReplyButton;
    constructor(owner: string, container: HTMLElement, _commentThread: languages.CommentThread<T>, _scopedInstatiationService: IInstantiationService, _contextKeyService: IContextKeyService, _commentMenus: CommentMenus, _commentOptions: languages.CommentOptions | undefined, _pendingComment: string | null, _parentThread: ICommentThreadWidget, _actionRunDelegate: (() => void) | null, commentService: ICommentService, languageService: ILanguageService, modelService: IModelService, themeService: IThemeService, configurationService: IConfigurationService);
    updateCommentThread(commentThread: languages.CommentThread<IRange | ICellRange>): void;
    getPendingComment(): string | null;
    layout(widthInPixel: number): void;
    focusIfNeeded(): void;
    focusCommentEditor(): void;
    getCommentModel(): ITextModel;
    updateCanReply(): void;
    submitComment(): Promise<void>;
    setCommentEditorDecorations(): void;
    private createTextModelListener;
    /**
     * Command based actions.
     */
    private createCommentWidgetActions;
    private get isReplyExpanded();
    private expandReplyArea;
    private clearAndExpandReplyArea;
    private hideReplyArea;
    private createReplyButton;
}

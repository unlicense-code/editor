/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import * as dom from 'vs/base/browser/dom';
import { MOUSE_CURSOR_TEXT_CSS_CLASS_NAME } from 'vs/base/browser/ui/mouseCursor/mouseCursor';
import { Disposable } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
import { generateUuid } from 'vs/base/common/uuid';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { IModelService } from 'vs/editor/common/services/model';
import * as nls from 'vs/nls';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { editorForeground, resolveColorValue } from 'vs/platform/theme/common/colorRegistry';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { CommentFormActions } from 'vs/workbench/contrib/comments/browser/commentFormActions';
import { ICommentService } from 'vs/workbench/contrib/comments/browser/commentService';
import { CommentContextKeys } from 'vs/workbench/contrib/comments/common/commentContextKeys';
import { SimpleCommentEditor } from './simpleCommentEditor';
const COMMENT_SCHEME = 'comment';
let INMEM_MODEL_ID = 0;
export const COMMENTEDITOR_DECORATION_KEY = 'commenteditordecoration';
let CommentReply = class CommentReply extends Disposable {
    owner;
    _commentThread;
    _scopedInstatiationService;
    _contextKeyService;
    _commentMenus;
    _commentOptions;
    _pendingComment;
    _parentThread;
    _actionRunDelegate;
    commentService;
    languageService;
    modelService;
    themeService;
    commentEditor;
    form;
    commentEditorIsEmpty;
    _error;
    _formActions;
    _commentThreadDisposables = [];
    _commentFormActions;
    _reviewThreadReplyButton;
    constructor(owner, container, _commentThread, _scopedInstatiationService, _contextKeyService, _commentMenus, _commentOptions, _pendingComment, _parentThread, _actionRunDelegate, commentService, languageService, modelService, themeService, configurationService) {
        super();
        this.owner = owner;
        this._commentThread = _commentThread;
        this._scopedInstatiationService = _scopedInstatiationService;
        this._contextKeyService = _contextKeyService;
        this._commentMenus = _commentMenus;
        this._commentOptions = _commentOptions;
        this._pendingComment = _pendingComment;
        this._parentThread = _parentThread;
        this._actionRunDelegate = _actionRunDelegate;
        this.commentService = commentService;
        this.languageService = languageService;
        this.modelService = modelService;
        this.themeService = themeService;
        this.form = dom.append(container, dom.$('.comment-form'));
        this.commentEditor = this._register(this._scopedInstatiationService.createInstance(SimpleCommentEditor, this.form, SimpleCommentEditor.getEditorOptions(configurationService), this._parentThread));
        this.commentEditorIsEmpty = CommentContextKeys.commentIsEmpty.bindTo(this._contextKeyService);
        this.commentEditorIsEmpty.set(!this._pendingComment);
        const hasExistingComments = this._commentThread.comments && this._commentThread.comments.length > 0;
        const modeId = generateUuid() + '-' + (hasExistingComments ? this._commentThread.threadId : ++INMEM_MODEL_ID);
        const params = JSON.stringify({
            extensionId: this._commentThread.extensionId,
            commentThreadId: this._commentThread.threadId
        });
        let resource = URI.parse(`${COMMENT_SCHEME}://${this._commentThread.extensionId}/commentinput-${modeId}.md?${params}`); // TODO. Remove params once extensions adopt authority.
        const commentController = this.commentService.getCommentController(owner);
        if (commentController) {
            resource = resource.with({ authority: commentController.id });
        }
        const model = this.modelService.createModel(this._pendingComment || '', this.languageService.createByFilepathOrFirstLine(resource), resource, false);
        this._register(model);
        this.commentEditor.setModel(model);
        this._register((this.commentEditor.getModel().onDidChangeContent(() => {
            this.setCommentEditorDecorations();
            this.commentEditorIsEmpty?.set(!this.commentEditor.getValue());
        })));
        this.createTextModelListener(this.commentEditor, this.form);
        this.setCommentEditorDecorations();
        // Only add the additional step of clicking a reply button to expand the textarea when there are existing comments
        if (hasExistingComments) {
            this.createReplyButton(this.commentEditor, this.form);
        }
        else {
            if (this._commentThread.comments && this._commentThread.comments.length === 0) {
                this.expandReplyArea();
            }
        }
        this._error = dom.append(this.form, dom.$('.validation-error.hidden'));
        this._formActions = dom.append(this.form, dom.$('.form-actions'));
        this.createCommentWidgetActions(this._formActions, model);
    }
    updateCommentThread(commentThread) {
        const isReplying = this.commentEditor.hasTextFocus();
        if (!this._reviewThreadReplyButton) {
            this.createReplyButton(this.commentEditor, this.form);
        }
        if (this._commentThread.comments && this._commentThread.comments.length === 0) {
            this.expandReplyArea();
        }
        if (isReplying) {
            this.commentEditor.focus();
        }
    }
    getPendingComment() {
        const model = this.commentEditor.getModel();
        if (model && model.getValueLength() > 0) { // checking length is cheap
            return model.getValue();
        }
        return null;
    }
    layout(widthInPixel) {
        this.commentEditor.layout({ height: 5 * 18, width: widthInPixel - 54 /* margin 20px * 10 + scrollbar 14px*/ });
    }
    focusIfNeeded() {
        if (!this._commentThread.comments || !this._commentThread.comments.length) {
            this.commentEditor.focus();
        }
        else if (this.commentEditor.getModel().getValueLength() > 0) {
            this.expandReplyArea();
        }
    }
    focusCommentEditor() {
        this.commentEditor.focus();
    }
    getCommentModel() {
        return this.commentEditor.getModel();
    }
    updateCanReply() {
        if (!this._commentThread.canReply) {
            this.form.style.display = 'none';
        }
        else {
            this.form.style.display = 'block';
        }
    }
    async submitComment() {
        this._commentFormActions?.triggerDefaultAction();
    }
    setCommentEditorDecorations() {
        const model = this.commentEditor.getModel();
        if (model) {
            const valueLength = model.getValueLength();
            const hasExistingComments = this._commentThread.comments && this._commentThread.comments.length > 0;
            const placeholder = valueLength > 0
                ? ''
                : hasExistingComments
                    ? (this._commentOptions?.placeHolder || nls.localize('reply', "Reply..."))
                    : (this._commentOptions?.placeHolder || nls.localize('newComment', "Type a new comment"));
            const decorations = [{
                    range: {
                        startLineNumber: 0,
                        endLineNumber: 0,
                        startColumn: 0,
                        endColumn: 1
                    },
                    renderOptions: {
                        after: {
                            contentText: placeholder,
                            color: `${resolveColorValue(editorForeground, this.themeService.getColorTheme())?.transparent(0.4)}`
                        }
                    }
                }];
            this.commentEditor.setDecorationsByType('review-zone-widget', COMMENTEDITOR_DECORATION_KEY, decorations);
        }
    }
    createTextModelListener(commentEditor, commentForm) {
        this._commentThreadDisposables.push(commentEditor.onDidFocusEditorWidget(() => {
            this._commentThread.input = {
                uri: commentEditor.getModel().uri,
                value: commentEditor.getValue()
            };
            this.commentService.setActiveCommentThread(this._commentThread);
        }));
        this._commentThreadDisposables.push(commentEditor.getModel().onDidChangeContent(() => {
            const modelContent = commentEditor.getValue();
            if (this._commentThread.input && this._commentThread.input.uri === commentEditor.getModel().uri && this._commentThread.input.value !== modelContent) {
                const newInput = this._commentThread.input;
                newInput.value = modelContent;
                this._commentThread.input = newInput;
            }
            this.commentService.setActiveCommentThread(this._commentThread);
        }));
        this._commentThreadDisposables.push(this._commentThread.onDidChangeInput(input => {
            const thread = this._commentThread;
            const model = commentEditor.getModel();
            if (thread.input && model && (thread.input.uri !== model.uri)) {
                return;
            }
            if (!input) {
                return;
            }
            if (commentEditor.getValue() !== input.value) {
                commentEditor.setValue(input.value);
                if (input.value === '') {
                    this._pendingComment = '';
                    commentForm.classList.remove('expand');
                    commentEditor.getDomNode().style.outline = '';
                    this._error.textContent = '';
                    this._error.classList.add('hidden');
                }
            }
        }));
    }
    /**
     * Command based actions.
     */
    createCommentWidgetActions(container, model) {
        const menu = this._commentMenus.getCommentThreadActions(this._contextKeyService);
        this._register(menu);
        this._register(menu.onDidChange(() => {
            this._commentFormActions.setActions(menu);
        }));
        this._commentFormActions = new CommentFormActions(container, async (action) => {
            this._actionRunDelegate?.();
            action.run({
                thread: this._commentThread,
                text: this.commentEditor.getValue(),
                $mid: 8 /* MarshalledId.CommentThreadReply */
            });
            this.hideReplyArea();
        });
        this._register(this._commentFormActions);
        this._commentFormActions.setActions(menu);
    }
    get isReplyExpanded() {
        return this.form.classList.contains('expand');
    }
    expandReplyArea() {
        if (!this.isReplyExpanded) {
            this.form.classList.add('expand');
            this.commentEditor.focus();
            this.commentEditor.layout();
        }
    }
    clearAndExpandReplyArea() {
        if (!this.isReplyExpanded) {
            this.commentEditor.setValue('');
            this.expandReplyArea();
        }
    }
    hideReplyArea() {
        this.commentEditor.getDomNode().style.outline = '';
        this._pendingComment = '';
        this.form.classList.remove('expand');
        this._error.textContent = '';
        this._error.classList.add('hidden');
    }
    createReplyButton(commentEditor, commentForm) {
        this._reviewThreadReplyButton = dom.append(commentForm, dom.$(`button.review-thread-reply-button.${MOUSE_CURSOR_TEXT_CSS_CLASS_NAME}`));
        this._reviewThreadReplyButton.title = this._commentOptions?.prompt || nls.localize('reply', "Reply...");
        this._reviewThreadReplyButton.textContent = this._commentOptions?.prompt || nls.localize('reply', "Reply...");
        // bind click/escape actions for reviewThreadReplyButton and textArea
        this._register(dom.addDisposableListener(this._reviewThreadReplyButton, 'click', _ => this.clearAndExpandReplyArea()));
        this._register(dom.addDisposableListener(this._reviewThreadReplyButton, 'focus', _ => this.clearAndExpandReplyArea()));
        commentEditor.onDidBlurEditorWidget(() => {
            if (commentEditor.getModel().getValueLength() === 0 && commentForm.classList.contains('expand')) {
                commentForm.classList.remove('expand');
            }
        });
    }
};
CommentReply = __decorate([
    __param(10, ICommentService),
    __param(11, ILanguageService),
    __param(12, IModelService),
    __param(13, IThemeService),
    __param(14, IConfigurationService)
], CommentReply);
export { CommentReply };

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
import 'vs/css!./media/review';
import * as dom from 'vs/base/browser/dom';
import { Emitter } from 'vs/base/common/event';
import { Disposable, dispose } from 'vs/base/common/lifecycle';
import { CommentReply } from 'vs/workbench/contrib/comments/browser/commentReply';
import { ICommentService } from 'vs/workbench/contrib/comments/browser/commentService';
import { CommentThreadBody } from 'vs/workbench/contrib/comments/browser/commentThreadBody';
import { CommentThreadHeader } from 'vs/workbench/contrib/comments/browser/commentThreadHeader';
import { CommentContextKeys } from 'vs/workbench/contrib/comments/common/commentContextKeys';
import { contrastBorder, focusBorder, inputValidationErrorBackground, inputValidationErrorBorder, inputValidationErrorForeground, textBlockQuoteBackground, textBlockQuoteBorder, textLinkActiveForeground, textLinkForeground } from 'vs/platform/theme/common/colorRegistry';
import { PANEL_BORDER } from 'vs/workbench/common/theme';
import { commentThreadStateBackgroundColorVar, commentThreadStateColorVar } from 'vs/workbench/contrib/comments/browser/commentColors';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
export const COMMENTEDITOR_DECORATION_KEY = 'commenteditordecoration';
let CommentThreadWidget = class CommentThreadWidget extends Disposable {
    container;
    _owner;
    _parentResourceUri;
    _contextKeyService;
    _scopedInstatiationService;
    _commentThread;
    _pendingComment;
    _markdownOptions;
    _commentOptions;
    _containerDelegate;
    commentService;
    contextMenuService;
    _header;
    _body;
    _commentReply;
    _commentMenus;
    _commentThreadDisposables = [];
    _threadIsEmpty;
    _styleElement;
    _commentThreadContextValue;
    _onDidResize = new Emitter();
    onDidResize = this._onDidResize.event;
    get commentThread() {
        return this._commentThread;
    }
    constructor(container, _owner, _parentResourceUri, _contextKeyService, _scopedInstatiationService, _commentThread, _pendingComment, _markdownOptions, _commentOptions, _containerDelegate, commentService, contextMenuService) {
        super();
        this.container = container;
        this._owner = _owner;
        this._parentResourceUri = _parentResourceUri;
        this._contextKeyService = _contextKeyService;
        this._scopedInstatiationService = _scopedInstatiationService;
        this._commentThread = _commentThread;
        this._pendingComment = _pendingComment;
        this._markdownOptions = _markdownOptions;
        this._commentOptions = _commentOptions;
        this._containerDelegate = _containerDelegate;
        this.commentService = commentService;
        this.contextMenuService = contextMenuService;
        this._threadIsEmpty = CommentContextKeys.commentThreadIsEmpty.bindTo(this._contextKeyService);
        this._threadIsEmpty.set(!_commentThread.comments || !_commentThread.comments.length);
        this._commentMenus = this.commentService.getCommentMenus(this._owner);
        this._header = new CommentThreadHeader(container, {
            collapse: this.collapse.bind(this)
        }, this._commentMenus, this._commentThread, this._contextKeyService, this._scopedInstatiationService, contextMenuService);
        this._header.updateCommentThread(this._commentThread);
        const bodyElement = dom.$('.body');
        container.appendChild(bodyElement);
        this._body = this._scopedInstatiationService.createInstance(CommentThreadBody, this._owner, this._parentResourceUri, bodyElement, this._markdownOptions, this._commentThread, this._scopedInstatiationService, this);
        this._register(this._body);
        this._styleElement = dom.createStyleSheet(this.container);
        this._commentThreadContextValue = this._contextKeyService.createKey('commentThread', undefined);
        this._commentThreadContextValue.set(_commentThread.contextValue);
        const commentControllerKey = this._contextKeyService.createKey('commentController', undefined);
        const controller = this.commentService.getCommentController(this._owner);
        if (controller) {
            commentControllerKey.set(controller.contextValue);
        }
        this.currentThreadListeners();
    }
    updateCurrentThread(hasMouse, hasFocus) {
        if (hasMouse || hasFocus) {
            this.commentService.setCurrentCommentThread(this.commentThread);
        }
        else {
            this.commentService.setCurrentCommentThread(undefined);
        }
    }
    currentThreadListeners() {
        let hasMouse = false;
        let hasFocus = false;
        this._register(dom.addDisposableListener(this.container, dom.EventType.MOUSE_ENTER, (e) => {
            if (e.toElement === this.container) {
                hasMouse = true;
                this.updateCurrentThread(hasMouse, hasFocus);
            }
        }, true));
        this._register(dom.addDisposableListener(this.container, dom.EventType.MOUSE_LEAVE, (e) => {
            if (e.fromElement === this.container) {
                hasMouse = false;
                this.updateCurrentThread(hasMouse, hasFocus);
            }
        }, true));
        this._register(dom.addDisposableListener(this.container, dom.EventType.FOCUS_IN, () => {
            hasFocus = true;
            this.updateCurrentThread(hasMouse, hasFocus);
        }, true));
        this._register(dom.addDisposableListener(this.container, dom.EventType.FOCUS_OUT, () => {
            hasFocus = false;
            this.updateCurrentThread(hasMouse, hasFocus);
        }, true));
    }
    updateCommentThread(commentThread) {
        this._commentThread = commentThread;
        dispose(this._commentThreadDisposables);
        this._commentThreadDisposables = [];
        this._bindCommentThreadListeners();
        this._body.updateCommentThread(commentThread);
        this._threadIsEmpty.set(!this._body.length);
        this._header.updateCommentThread(commentThread);
        this._commentReply?.updateCommentThread(commentThread);
        if (this._commentThread.contextValue) {
            this._commentThreadContextValue.set(this._commentThread.contextValue);
        }
        else {
            this._commentThreadContextValue.reset();
        }
    }
    display(lineHeight) {
        const headHeight = Math.ceil(lineHeight * 1.2);
        this._header.updateHeight(headHeight);
        this._body.display();
        // create comment thread only when it supports reply
        if (this._commentThread.canReply) {
            this._createCommentForm();
        }
        this._register(this._body.onDidResize(dimension => {
            this._refresh(dimension);
        }));
        // If there are no existing comments, place focus on the text area. This must be done after show, which also moves focus.
        // if this._commentThread.comments is undefined, it doesn't finish initialization yet, so we don't focus the editor immediately.
        if (this._commentThread.canReply && this._commentReply) {
            this._commentReply.focusIfNeeded();
        }
        this._bindCommentThreadListeners();
    }
    _refresh(dimension) {
        this._body.layout();
        this._onDidResize.fire(dimension);
    }
    dispose() {
        super.dispose();
        this.updateCurrentThread(false, false);
    }
    _bindCommentThreadListeners() {
        this._commentThreadDisposables.push(this._commentThread.onDidChangeCanReply(() => {
            if (this._commentReply) {
                this._commentReply.updateCanReply();
            }
            else {
                if (this._commentThread.canReply) {
                    this._createCommentForm();
                }
            }
        }));
        this._commentThreadDisposables.push(this._commentThread.onDidChangeComments(async (_) => {
            await this.updateCommentThread(this._commentThread);
        }));
        this._commentThreadDisposables.push(this._commentThread.onDidChangeLabel(_ => {
            this._header.createThreadLabel();
        }));
    }
    _createCommentForm() {
        this._commentReply = this._scopedInstatiationService.createInstance(CommentReply, this._owner, this._body.container, this._commentThread, this._scopedInstatiationService, this._contextKeyService, this._commentMenus, this._commentOptions, this._pendingComment, this, this._containerDelegate.actionRunner);
        this._register(this._commentReply);
    }
    getCommentCoords(commentUniqueId) {
        return this._body.getCommentCoords(commentUniqueId);
    }
    getPendingComment() {
        if (this._commentReply) {
            return this._commentReply.getPendingComment();
        }
        return null;
    }
    getDimensions() {
        return this._body?.getDimensions();
    }
    layout(widthInPixel) {
        this._body.layout();
        if (widthInPixel !== undefined) {
            this._commentReply?.layout(widthInPixel);
        }
    }
    focusCommentEditor() {
        this._commentReply?.focusCommentEditor();
    }
    focus() {
        this._body.focus();
    }
    async submitComment() {
        const activeComment = this._body.activeComment;
        if (activeComment) {
            activeComment.submitComment();
        }
        else if ((this._commentReply?.getPendingComment()?.length ?? 0) > 0) {
            this._commentReply?.submitComment();
        }
    }
    collapse() {
        this._containerDelegate.collapse();
    }
    applyTheme(theme, fontInfo) {
        const content = [];
        content.push(`.monaco-editor .review-widget > .body { border-top: 1px solid var(${commentThreadStateColorVar}) }`);
        content.push(`.monaco-editor .review-widget > .head { background-color: var(${commentThreadStateBackgroundColorVar}) }`);
        const linkColor = theme.getColor(textLinkForeground);
        if (linkColor) {
            content.push(`.review-widget .body .comment-body a { color: ${linkColor} }`);
        }
        const linkActiveColor = theme.getColor(textLinkActiveForeground);
        if (linkActiveColor) {
            content.push(`.review-widget .body .comment-body a:hover, a:active { color: ${linkActiveColor} }`);
        }
        const focusColor = theme.getColor(focusBorder);
        if (focusColor) {
            content.push(`.review-widget .body .comment-body a:focus { outline: 1px solid ${focusColor}; }`);
            content.push(`.review-widget .body .monaco-editor.focused { outline: 1px solid ${focusColor}; }`);
        }
        const blockQuoteBackground = theme.getColor(textBlockQuoteBackground);
        if (blockQuoteBackground) {
            content.push(`.review-widget .body .review-comment blockquote { background: ${blockQuoteBackground}; }`);
        }
        const blockQuoteBOrder = theme.getColor(textBlockQuoteBorder);
        if (blockQuoteBOrder) {
            content.push(`.review-widget .body .review-comment blockquote { border-color: ${blockQuoteBOrder}; }`);
        }
        const border = theme.getColor(PANEL_BORDER);
        if (border) {
            content.push(`.review-widget .body .review-comment .review-comment-contents .comment-reactions .action-item a.action-label { border-color: ${border}; }`);
        }
        const hcBorder = theme.getColor(contrastBorder);
        if (hcBorder) {
            content.push(`.review-widget .body .comment-form .review-thread-reply-button { outline-color: ${hcBorder}; }`);
            content.push(`.review-widget .body .monaco-editor { outline: 1px solid ${hcBorder}; }`);
        }
        const errorBorder = theme.getColor(inputValidationErrorBorder);
        if (errorBorder) {
            content.push(`.review-widget .validation-error { border: 1px solid ${errorBorder}; }`);
        }
        const errorBackground = theme.getColor(inputValidationErrorBackground);
        if (errorBackground) {
            content.push(`.review-widget .validation-error { background: ${errorBackground}; }`);
        }
        const errorForeground = theme.getColor(inputValidationErrorForeground);
        if (errorForeground) {
            content.push(`.review-widget .body .comment-form .validation-error { color: ${errorForeground}; }`);
        }
        const fontFamilyVar = '--comment-thread-editor-font-family';
        const fontSizeVar = '--comment-thread-editor-font-size';
        const fontWeightVar = '--comment-thread-editor-font-weight';
        this.container?.style.setProperty(fontFamilyVar, fontInfo.fontFamily);
        this.container?.style.setProperty(fontSizeVar, `${fontInfo.fontSize}px`);
        this.container?.style.setProperty(fontWeightVar, fontInfo.fontWeight);
        content.push(`.review-widget .body code {
			font-family: var(${fontFamilyVar});
			font-weight: var(${fontWeightVar});
		}`);
        this._styleElement.textContent = content.join('\n');
        this._commentReply?.setCommentEditorDecorations();
    }
};
CommentThreadWidget = __decorate([
    __param(10, ICommentService),
    __param(11, IContextMenuService)
], CommentThreadWidget);
export { CommentThreadWidget };

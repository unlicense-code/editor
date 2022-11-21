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
import { createDecorator, IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { Emitter } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { CancellationToken } from 'vs/base/common/cancellation';
import { CommentMenus } from 'vs/workbench/contrib/comments/browser/commentMenus';
import { IWorkbenchLayoutService } from 'vs/workbench/services/layout/browser/layoutService';
export const ICommentService = createDecorator('commentService');
let CommentService = class CommentService extends Disposable {
    instantiationService;
    _onDidSetDataProvider = this._register(new Emitter());
    onDidSetDataProvider = this._onDidSetDataProvider.event;
    _onDidDeleteDataProvider = this._register(new Emitter());
    onDidDeleteDataProvider = this._onDidDeleteDataProvider.event;
    _onDidSetResourceCommentInfos = this._register(new Emitter());
    onDidSetResourceCommentInfos = this._onDidSetResourceCommentInfos.event;
    _onDidSetAllCommentThreads = this._register(new Emitter());
    onDidSetAllCommentThreads = this._onDidSetAllCommentThreads.event;
    _onDidUpdateCommentThreads = this._register(new Emitter());
    onDidUpdateCommentThreads = this._onDidUpdateCommentThreads.event;
    _onDidUpdateNotebookCommentThreads = this._register(new Emitter());
    onDidUpdateNotebookCommentThreads = this._onDidUpdateNotebookCommentThreads.event;
    _onDidUpdateCommentingRanges = this._register(new Emitter());
    onDidUpdateCommentingRanges = this._onDidUpdateCommentingRanges.event;
    _onDidChangeActiveCommentThread = this._register(new Emitter());
    onDidChangeActiveCommentThread = this._onDidChangeActiveCommentThread.event;
    _onDidChangeCurrentCommentThread = this._register(new Emitter());
    onDidChangeCurrentCommentThread = this._onDidChangeCurrentCommentThread.event;
    _onDidChangeCommentingEnabled = this._register(new Emitter());
    onDidChangeCommentingEnabled = this._onDidChangeCommentingEnabled.event;
    _onDidChangeActiveCommentingRange = this._register(new Emitter());
    onDidChangeActiveCommentingRange = this._onDidChangeActiveCommentingRange.event;
    _commentControls = new Map();
    _commentMenus = new Map();
    _isCommentingEnabled = true;
    constructor(instantiationService, layoutService) {
        super();
        this.instantiationService = instantiationService;
        this._register(layoutService.onDidChangeZenMode(e => {
            this.enableCommenting(!e);
        }));
    }
    get isCommentingEnabled() {
        return this._isCommentingEnabled;
    }
    enableCommenting(enable) {
        if (enable !== this._isCommentingEnabled) {
            this._isCommentingEnabled = enable;
            this._onDidChangeCommentingEnabled.fire(enable);
        }
    }
    /**
     * The current comment thread is the thread that has focus or is being hovered.
     * @param commentThread
     */
    setCurrentCommentThread(commentThread) {
        this._onDidChangeCurrentCommentThread.fire(commentThread);
    }
    /**
     * The active comment thread is the the thread that is currently being edited.
     * @param commentThread
     */
    setActiveCommentThread(commentThread) {
        this._onDidChangeActiveCommentThread.fire(commentThread);
    }
    setDocumentComments(resource, commentInfos) {
        this._onDidSetResourceCommentInfos.fire({ resource, commentInfos });
    }
    setWorkspaceComments(owner, commentsByResource) {
        this._onDidSetAllCommentThreads.fire({ ownerId: owner, commentThreads: commentsByResource });
    }
    removeWorkspaceComments(owner) {
        this._onDidSetAllCommentThreads.fire({ ownerId: owner, commentThreads: [] });
    }
    registerCommentController(owner, commentControl) {
        this._commentControls.set(owner, commentControl);
        this._onDidSetDataProvider.fire();
    }
    unregisterCommentController(owner) {
        this._commentControls.delete(owner);
        this._onDidDeleteDataProvider.fire(owner);
    }
    getCommentController(owner) {
        return this._commentControls.get(owner);
    }
    createCommentThreadTemplate(owner, resource, range) {
        const commentController = this._commentControls.get(owner);
        if (!commentController) {
            return;
        }
        commentController.createCommentThreadTemplate(resource, range);
    }
    async updateCommentThreadTemplate(owner, threadHandle, range) {
        const commentController = this._commentControls.get(owner);
        if (!commentController) {
            return;
        }
        await commentController.updateCommentThreadTemplate(threadHandle, range);
    }
    disposeCommentThread(owner, threadId) {
        const controller = this.getCommentController(owner);
        controller?.deleteCommentThreadMain(threadId);
    }
    getCommentMenus(owner) {
        if (this._commentMenus.get(owner)) {
            return this._commentMenus.get(owner);
        }
        const menu = this.instantiationService.createInstance(CommentMenus);
        this._commentMenus.set(owner, menu);
        return menu;
    }
    updateComments(ownerId, event) {
        const evt = Object.assign({}, event, { owner: ownerId });
        this._onDidUpdateCommentThreads.fire(evt);
    }
    updateNotebookComments(ownerId, event) {
        const evt = Object.assign({}, event, { owner: ownerId });
        this._onDidUpdateNotebookCommentThreads.fire(evt);
    }
    updateCommentingRanges(ownerId) {
        this._onDidUpdateCommentingRanges.fire({ owner: ownerId });
    }
    async toggleReaction(owner, resource, thread, comment, reaction) {
        const commentController = this._commentControls.get(owner);
        if (commentController) {
            return commentController.toggleReaction(resource, thread, comment, reaction, CancellationToken.None);
        }
        else {
            throw new Error('Not supported');
        }
    }
    hasReactionHandler(owner) {
        const commentProvider = this._commentControls.get(owner);
        if (commentProvider) {
            return !!commentProvider.features.reactionHandler;
        }
        return false;
    }
    async getDocumentComments(resource) {
        const commentControlResult = [];
        this._commentControls.forEach(control => {
            commentControlResult.push(control.getDocumentComments(resource, CancellationToken.None)
                .catch(_ => {
                return null;
            }));
        });
        return Promise.all(commentControlResult);
    }
    async getNotebookComments(resource) {
        const commentControlResult = [];
        this._commentControls.forEach(control => {
            commentControlResult.push(control.getNotebookComments(resource, CancellationToken.None)
                .catch(_ => {
                return null;
            }));
        });
        return Promise.all(commentControlResult);
    }
    async getCommentingRanges(resource) {
        const commentControlResult = [];
        this._commentControls.forEach(control => {
            commentControlResult.push(control.getCommentingRanges(resource, CancellationToken.None));
        });
        const ret = await Promise.all(commentControlResult);
        return ret.reduce((prev, curr) => { prev.push(...curr); return prev; }, []);
    }
};
CommentService = __decorate([
    __param(0, IInstantiationService),
    __param(1, IWorkbenchLayoutService)
], CommentService);
export { CommentService };

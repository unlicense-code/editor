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
import * as nls from 'vs/nls';
import * as dom from 'vs/base/browser/dom';
import * as languages from 'vs/editor/common/languages';
import { ActionBar } from 'vs/base/browser/ui/actionbar/actionbar';
import { Action, Separator, ActionRunner } from 'vs/base/common/actions';
import { Disposable } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
import { IModelService } from 'vs/editor/common/services/model';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ICommentService } from 'vs/workbench/contrib/comments/browser/commentService';
import { SimpleCommentEditor } from 'vs/workbench/contrib/comments/browser/simpleCommentEditor';
import { Selection } from 'vs/editor/common/core/selection';
import { Emitter } from 'vs/base/common/event';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { ToolBar } from 'vs/base/browser/ui/toolbar/toolbar';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { ToggleReactionsAction, ReactionAction, ReactionActionViewItem } from './reactionsAction';
import { MenuItemAction, SubmenuItemAction, MenuId } from 'vs/platform/actions/common/actions';
import { MenuEntryActionViewItem, SubmenuEntryActionViewItem } from 'vs/platform/actions/browser/menuEntryActionViewItem';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { CommentFormActions } from 'vs/workbench/contrib/comments/browser/commentFormActions';
import { MOUSE_CURSOR_TEXT_CSS_CLASS_NAME } from 'vs/base/browser/ui/mouseCursor/mouseCursor';
import { ActionViewItem } from 'vs/base/browser/ui/actionbar/actionViewItems';
import { DropdownMenuActionViewItem } from 'vs/base/browser/ui/dropdown/dropdownActionViewItem';
import { Codicon } from 'vs/base/common/codicons';
import { TimestampWidget } from 'vs/workbench/contrib/comments/browser/timestamp';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
let CommentNode = class CommentNode extends Disposable {
    commentThread;
    comment;
    owner;
    resource;
    parentThread;
    markdownRenderer;
    instantiationService;
    commentService;
    modelService;
    languageService;
    notificationService;
    contextMenuService;
    configurationService;
    _domNode;
    _body;
    _md;
    _plainText;
    _clearTimeout;
    _editAction = null;
    _commentEditContainer = null;
    _commentDetailsContainer;
    _actionsToolbarContainer;
    _reactionsActionBar;
    _reactionActionsContainer;
    _commentEditor = null;
    _commentEditorDisposables = [];
    _commentEditorModel = null;
    _isPendingLabel;
    _timestamp;
    _timestampWidget;
    _contextKeyService;
    _commentContextValue;
    _commentMenus;
    actionRunner;
    toolbar;
    _commentFormActions = null;
    _onDidClick = new Emitter();
    get domNode() {
        return this._domNode;
    }
    isEditing = false;
    constructor(commentThread, comment, owner, resource, parentThread, markdownRenderer, instantiationService, commentService, modelService, languageService, notificationService, contextMenuService, contextKeyService, configurationService) {
        super();
        this.commentThread = commentThread;
        this.comment = comment;
        this.owner = owner;
        this.resource = resource;
        this.parentThread = parentThread;
        this.markdownRenderer = markdownRenderer;
        this.instantiationService = instantiationService;
        this.commentService = commentService;
        this.modelService = modelService;
        this.languageService = languageService;
        this.notificationService = notificationService;
        this.contextMenuService = contextMenuService;
        this.configurationService = configurationService;
        this._domNode = dom.$('div.review-comment');
        this._contextKeyService = contextKeyService.createScoped(this._domNode);
        this._commentContextValue = this._contextKeyService.createKey('comment', comment.contextValue);
        this._commentMenus = this.commentService.getCommentMenus(this.owner);
        this._domNode.tabIndex = -1;
        const avatar = dom.append(this._domNode, dom.$('div.avatar-container'));
        if (comment.userIconPath) {
            const img = dom.append(avatar, dom.$('img.avatar'));
            img.src = comment.userIconPath.toString();
            img.onerror = _ => img.remove();
        }
        this._commentDetailsContainer = dom.append(this._domNode, dom.$('.review-comment-contents'));
        this.createHeader(this._commentDetailsContainer);
        this._body = dom.append(this._commentDetailsContainer, dom.$(`div.comment-body.${MOUSE_CURSOR_TEXT_CSS_CLASS_NAME}`));
        this.updateCommentBody(this.comment.body);
        if (this.comment.commentReactions && this.comment.commentReactions.length && this.comment.commentReactions.filter(reaction => !!reaction.count).length) {
            this.createReactionsContainer(this._commentDetailsContainer);
        }
        this._domNode.setAttribute('aria-label', `${comment.userName}, ${this.commentBodyValue}`);
        this._domNode.setAttribute('role', 'treeitem');
        this._clearTimeout = null;
        this._register(dom.addDisposableListener(this._domNode, dom.EventType.CLICK, () => this.isEditing || this._onDidClick.fire(this)));
        this._register(dom.addDisposableListener(this._domNode, dom.EventType.CONTEXT_MENU, e => {
            return this.onContextMenu(e);
        }));
    }
    updateCommentBody(body) {
        this._body.innerText = '';
        this._md = undefined;
        this._plainText = undefined;
        if (typeof body === 'string') {
            this._plainText = dom.append(this._body, dom.$('.comment-body-plainstring'));
            this._plainText.innerText = body;
        }
        else {
            this._md = this.markdownRenderer.render(body).element;
            this._body.appendChild(this._md);
        }
    }
    get onDidClick() {
        return this._onDidClick.event;
    }
    createTimestamp(container) {
        this._timestamp = dom.append(container, dom.$('span.timestamp-container'));
        this.updateTimestamp(this.comment.timestamp);
    }
    updateTimestamp(raw) {
        if (!this._timestamp) {
            return;
        }
        const timestamp = raw !== undefined ? new Date(raw) : undefined;
        if (!timestamp) {
            this._timestampWidget?.dispose();
        }
        else {
            if (!this._timestampWidget) {
                this._timestampWidget = new TimestampWidget(this.configurationService, this._timestamp, timestamp);
                this._register(this._timestampWidget);
            }
            else {
                this._timestampWidget.setTimestamp(timestamp);
            }
        }
    }
    createHeader(commentDetailsContainer) {
        const header = dom.append(commentDetailsContainer, dom.$(`div.comment-title.${MOUSE_CURSOR_TEXT_CSS_CLASS_NAME}`));
        const infoContainer = dom.append(header, dom.$('comment-header-info'));
        const author = dom.append(infoContainer, dom.$('strong.author'));
        author.innerText = this.comment.userName;
        this.createTimestamp(infoContainer);
        this._isPendingLabel = dom.append(infoContainer, dom.$('span.isPending'));
        if (this.comment.label) {
            this._isPendingLabel.innerText = this.comment.label;
        }
        else {
            this._isPendingLabel.innerText = '';
        }
        this._actionsToolbarContainer = dom.append(header, dom.$('.comment-actions.hidden'));
        this.createActionsToolbar();
    }
    getToolbarActions(menu) {
        const contributedActions = menu.getActions({ shouldForwardArgs: true });
        const primary = [];
        const secondary = [];
        const result = { primary, secondary };
        fillInActions(contributedActions, result, false, g => /^inline/.test(g));
        return result;
    }
    get commentNodeContext() {
        return {
            thread: this.commentThread,
            commentUniqueId: this.comment.uniqueIdInThread,
            $mid: 9 /* MarshalledId.CommentNode */
        };
    }
    createToolbar() {
        this.toolbar = new ToolBar(this._actionsToolbarContainer, this.contextMenuService, {
            actionViewItemProvider: action => {
                if (action.id === ToggleReactionsAction.ID) {
                    return new DropdownMenuActionViewItem(action, action.menuActions, this.contextMenuService, {
                        actionViewItemProvider: action => this.actionViewItemProvider(action),
                        actionRunner: this.actionRunner,
                        classNames: ['toolbar-toggle-pickReactions', ...Codicon.reactions.classNamesArray],
                        anchorAlignmentProvider: () => 1 /* AnchorAlignment.RIGHT */
                    });
                }
                return this.actionViewItemProvider(action);
            },
            orientation: 0 /* ActionsOrientation.HORIZONTAL */
        });
        this.toolbar.context = this.commentNodeContext;
        this.registerActionBarListeners(this._actionsToolbarContainer);
        this._register(this.toolbar);
    }
    createActionsToolbar() {
        const actions = [];
        const hasReactionHandler = this.commentService.hasReactionHandler(this.owner);
        if (hasReactionHandler) {
            const toggleReactionAction = this.createReactionPicker(this.comment.commentReactions || []);
            actions.push(toggleReactionAction);
        }
        const menu = this._commentMenus.getCommentTitleActions(this.comment, this._contextKeyService);
        this._register(menu);
        this._register(menu.onDidChange(e => {
            const { primary, secondary } = this.getToolbarActions(menu);
            if (!this.toolbar && (primary.length || secondary.length)) {
                this.createToolbar();
            }
            this.toolbar.setActions(primary, secondary);
        }));
        const { primary, secondary } = this.getToolbarActions(menu);
        actions.push(...primary);
        if (actions.length || secondary.length) {
            this.createToolbar();
            this.toolbar.setActions(actions, secondary);
        }
    }
    actionViewItemProvider(action) {
        let options = {};
        if (action.id === ToggleReactionsAction.ID) {
            options = { label: false, icon: true };
        }
        else {
            options = { label: false, icon: true };
        }
        if (action.id === ReactionAction.ID) {
            const item = new ReactionActionViewItem(action);
            return item;
        }
        else if (action instanceof MenuItemAction) {
            return this.instantiationService.createInstance(MenuEntryActionViewItem, action, undefined);
        }
        else if (action instanceof SubmenuItemAction) {
            return this.instantiationService.createInstance(SubmenuEntryActionViewItem, action, undefined);
        }
        else {
            const item = new ActionViewItem({}, action, options);
            return item;
        }
    }
    async submitComment() {
        if (this._commentEditor && this._commentFormActions) {
            this._commentFormActions.triggerDefaultAction();
        }
    }
    createReactionPicker(reactionGroup) {
        const toggleReactionAction = this._register(new ToggleReactionsAction(() => {
            toggleReactionActionViewItem?.show();
        }, nls.localize('commentToggleReaction', "Toggle Reaction")));
        let reactionMenuActions = [];
        if (reactionGroup && reactionGroup.length) {
            reactionMenuActions = reactionGroup.map((reaction) => {
                return new Action(`reaction.command.${reaction.label}`, `${reaction.label}`, '', true, async () => {
                    try {
                        await this.commentService.toggleReaction(this.owner, this.resource, this.commentThread, this.comment, reaction);
                    }
                    catch (e) {
                        const error = e.message
                            ? nls.localize('commentToggleReactionError', "Toggling the comment reaction failed: {0}.", e.message)
                            : nls.localize('commentToggleReactionDefaultError', "Toggling the comment reaction failed");
                        this.notificationService.error(error);
                    }
                });
            });
        }
        toggleReactionAction.menuActions = reactionMenuActions;
        const toggleReactionActionViewItem = new DropdownMenuActionViewItem(toggleReactionAction, toggleReactionAction.menuActions, this.contextMenuService, {
            actionViewItemProvider: action => {
                if (action.id === ToggleReactionsAction.ID) {
                    return toggleReactionActionViewItem;
                }
                return this.actionViewItemProvider(action);
            },
            actionRunner: this.actionRunner,
            classNames: 'toolbar-toggle-pickReactions',
            anchorAlignmentProvider: () => 1 /* AnchorAlignment.RIGHT */
        });
        return toggleReactionAction;
    }
    createReactionsContainer(commentDetailsContainer) {
        this._reactionActionsContainer = dom.append(commentDetailsContainer, dom.$('div.comment-reactions'));
        this._reactionsActionBar = new ActionBar(this._reactionActionsContainer, {
            actionViewItemProvider: action => {
                if (action.id === ToggleReactionsAction.ID) {
                    return new DropdownMenuActionViewItem(action, action.menuActions, this.contextMenuService, {
                        actionViewItemProvider: action => this.actionViewItemProvider(action),
                        actionRunner: this.actionRunner,
                        classNames: 'toolbar-toggle-pickReactions',
                        anchorAlignmentProvider: () => 1 /* AnchorAlignment.RIGHT */
                    });
                }
                return this.actionViewItemProvider(action);
            }
        });
        this._register(this._reactionsActionBar);
        const hasReactionHandler = this.commentService.hasReactionHandler(this.owner);
        this.comment.commentReactions.filter(reaction => !!reaction.count).map(reaction => {
            const action = new ReactionAction(`reaction.${reaction.label}`, `${reaction.label}`, reaction.hasReacted && (reaction.canEdit || hasReactionHandler) ? 'active' : '', (reaction.canEdit || hasReactionHandler), async () => {
                try {
                    await this.commentService.toggleReaction(this.owner, this.resource, this.commentThread, this.comment, reaction);
                }
                catch (e) {
                    let error;
                    if (reaction.hasReacted) {
                        error = e.message
                            ? nls.localize('commentDeleteReactionError', "Deleting the comment reaction failed: {0}.", e.message)
                            : nls.localize('commentDeleteReactionDefaultError', "Deleting the comment reaction failed");
                    }
                    else {
                        error = e.message
                            ? nls.localize('commentAddReactionError', "Deleting the comment reaction failed: {0}.", e.message)
                            : nls.localize('commentAddReactionDefaultError', "Deleting the comment reaction failed");
                    }
                    this.notificationService.error(error);
                }
            }, reaction.iconPath, reaction.count);
            this._reactionsActionBar?.push(action, { label: true, icon: true });
        });
        if (hasReactionHandler) {
            const toggleReactionAction = this.createReactionPicker(this.comment.commentReactions || []);
            this._reactionsActionBar.push(toggleReactionAction, { label: false, icon: true });
        }
    }
    get commentBodyValue() {
        return (typeof this.comment.body === 'string') ? this.comment.body : this.comment.body.value;
    }
    createCommentEditor(editContainer) {
        const container = dom.append(editContainer, dom.$('.edit-textarea'));
        this._commentEditor = this.instantiationService.createInstance(SimpleCommentEditor, container, SimpleCommentEditor.getEditorOptions(this.configurationService), this.parentThread);
        const resource = URI.parse(`comment:commentinput-${this.comment.uniqueIdInThread}-${Date.now()}.md`);
        this._commentEditorModel = this.modelService.createModel('', this.languageService.createByFilepathOrFirstLine(resource), resource, false);
        this._commentEditor.setModel(this._commentEditorModel);
        this._commentEditor.setValue(this.commentBodyValue);
        this._commentEditor.layout({ width: container.clientWidth - 14, height: 90 });
        this._commentEditor.focus();
        dom.scheduleAtNextAnimationFrame(() => {
            this._commentEditor.layout({ width: container.clientWidth - 14, height: 90 });
            this._commentEditor.focus();
        });
        const lastLine = this._commentEditorModel.getLineCount();
        const lastColumn = this._commentEditorModel.getLineContent(lastLine).length + 1;
        this._commentEditor.setSelection(new Selection(lastLine, lastColumn, lastLine, lastColumn));
        const commentThread = this.commentThread;
        commentThread.input = {
            uri: this._commentEditor.getModel().uri,
            value: this.commentBodyValue
        };
        this.commentService.setActiveCommentThread(commentThread);
        this._commentEditorDisposables.push(this._commentEditor.onDidFocusEditorWidget(() => {
            commentThread.input = {
                uri: this._commentEditor.getModel().uri,
                value: this.commentBodyValue
            };
            this.commentService.setActiveCommentThread(commentThread);
        }));
        this._commentEditorDisposables.push(this._commentEditor.onDidChangeModelContent(e => {
            if (commentThread.input && this._commentEditor && this._commentEditor.getModel().uri === commentThread.input.uri) {
                const newVal = this._commentEditor.getValue();
                if (newVal !== commentThread.input.value) {
                    const input = commentThread.input;
                    input.value = newVal;
                    commentThread.input = input;
                    this.commentService.setActiveCommentThread(commentThread);
                }
            }
        }));
        this._register(this._commentEditor);
        this._register(this._commentEditorModel);
    }
    removeCommentEditor() {
        this.isEditing = false;
        if (this._editAction) {
            this._editAction.enabled = true;
        }
        this._body.classList.remove('hidden');
        this._commentEditorModel?.dispose();
        this._commentEditorDisposables.forEach(dispose => dispose.dispose());
        this._commentEditorDisposables = [];
        if (this._commentEditor) {
            this._commentEditor.dispose();
            this._commentEditor = null;
        }
        this._commentEditContainer.remove();
    }
    layout() {
        this._commentEditor?.layout();
    }
    switchToEditMode() {
        if (this.isEditing) {
            return;
        }
        this.isEditing = true;
        this._body.classList.add('hidden');
        this._commentEditContainer = dom.append(this._commentDetailsContainer, dom.$('.edit-container'));
        this.createCommentEditor(this._commentEditContainer);
        const formActions = dom.append(this._commentEditContainer, dom.$('.form-actions'));
        const menus = this.commentService.getCommentMenus(this.owner);
        const menu = menus.getCommentActions(this.comment, this._contextKeyService);
        this._register(menu);
        this._register(menu.onDidChange(() => {
            this._commentFormActions?.setActions(menu);
        }));
        this._commentFormActions = new CommentFormActions(formActions, (action) => {
            const text = this._commentEditor.getValue();
            action.run({
                thread: this.commentThread,
                commentUniqueId: this.comment.uniqueIdInThread,
                text: text,
                $mid: 10 /* MarshalledId.CommentThreadNode */
            });
            this.removeCommentEditor();
        });
        this._register(this._commentFormActions);
        this._commentFormActions.setActions(menu);
    }
    setFocus(focused, visible = false) {
        if (focused) {
            this._domNode.focus();
            this._actionsToolbarContainer.classList.remove('hidden');
            this._actionsToolbarContainer.classList.add('tabfocused');
            this._domNode.tabIndex = 0;
            if (this.comment.mode === languages.CommentMode.Editing) {
                this._commentEditor?.focus();
            }
        }
        else {
            if (this._actionsToolbarContainer.classList.contains('tabfocused') && !this._actionsToolbarContainer.classList.contains('mouseover')) {
                this._actionsToolbarContainer.classList.add('hidden');
                this._domNode.tabIndex = -1;
            }
            this._actionsToolbarContainer.classList.remove('tabfocused');
        }
    }
    registerActionBarListeners(actionsContainer) {
        this._register(dom.addDisposableListener(this._domNode, 'mouseenter', () => {
            actionsContainer.classList.remove('hidden');
            actionsContainer.classList.add('mouseover');
        }));
        this._register(dom.addDisposableListener(this._domNode, 'mouseleave', () => {
            if (actionsContainer.classList.contains('mouseover') && !actionsContainer.classList.contains('tabfocused')) {
                actionsContainer.classList.add('hidden');
            }
            actionsContainer.classList.remove('mouseover');
        }));
    }
    update(newComment) {
        if (newComment.body !== this.comment.body) {
            this.updateCommentBody(newComment.body);
        }
        const isChangingMode = newComment.mode !== undefined && newComment.mode !== this.comment.mode;
        this.comment = newComment;
        if (isChangingMode) {
            if (newComment.mode === languages.CommentMode.Editing) {
                this.switchToEditMode();
            }
            else {
                this.removeCommentEditor();
            }
        }
        if (newComment.label) {
            this._isPendingLabel.innerText = newComment.label;
        }
        else {
            this._isPendingLabel.innerText = '';
        }
        // update comment reactions
        this._reactionActionsContainer?.remove();
        this._reactionsActionBar?.clear();
        if (this.comment.commentReactions && this.comment.commentReactions.some(reaction => !!reaction.count)) {
            this.createReactionsContainer(this._commentDetailsContainer);
        }
        if (this.comment.contextValue) {
            this._commentContextValue.set(this.comment.contextValue);
        }
        else {
            this._commentContextValue.reset();
        }
        if (this.comment.timestamp) {
            this.updateTimestamp(this.comment.timestamp);
        }
    }
    onContextMenu(e) {
        this.contextMenuService.showContextMenu({
            getAnchor: () => e,
            menuId: MenuId.CommentThreadCommentContext,
            menuActionOptions: { shouldForwardArgs: true },
            contextKeyService: this._contextKeyService,
            actionRunner: new ActionRunner(),
            getActionsContext: () => {
                return this.commentNodeContext;
            },
        });
    }
    focus() {
        this.domNode.focus();
        if (!this._clearTimeout) {
            this.domNode.classList.add('focus');
            this._clearTimeout = setTimeout(() => {
                this.domNode.classList.remove('focus');
            }, 3000);
        }
    }
};
CommentNode = __decorate([
    __param(6, IInstantiationService),
    __param(7, ICommentService),
    __param(8, IModelService),
    __param(9, ILanguageService),
    __param(10, INotificationService),
    __param(11, IContextMenuService),
    __param(12, IContextKeyService),
    __param(13, IConfigurationService)
], CommentNode);
export { CommentNode };
function fillInActions(groups, target, useAlternativeActions, isPrimaryGroup = group => group === 'navigation') {
    for (const tuple of groups) {
        let [group, actions] = tuple;
        if (useAlternativeActions) {
            actions = actions.map(a => (a instanceof MenuItemAction) && !!a.alt ? a.alt : a);
        }
        if (isPrimaryGroup(group)) {
            const to = Array.isArray(target) ? target : target.primary;
            to.unshift(...actions);
        }
        else {
            const to = Array.isArray(target) ? target : target.secondary;
            if (to.length > 0) {
                to.push(new Separator());
            }
            to.push(...actions);
        }
    }
}

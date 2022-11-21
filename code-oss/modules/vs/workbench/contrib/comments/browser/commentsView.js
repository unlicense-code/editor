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
import 'vs/css!./media/panel';
import * as nls from 'vs/nls';
import * as dom from 'vs/base/browser/dom';
import { basename } from 'vs/base/common/resources';
import { isCodeEditor, isDiffEditor } from 'vs/editor/browser/editorBrowser';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { CommentNode, CommentsModel, ResourceWithCommentThreads } from 'vs/workbench/contrib/comments/common/commentModel';
import { CommentController } from 'vs/workbench/contrib/comments/browser/commentsEditorContribution';
import { ICommentService } from 'vs/workbench/contrib/comments/browser/commentService';
import { IEditorService, ACTIVE_GROUP, SIDE_GROUP } from 'vs/workbench/services/editor/common/editorService';
import { CommandsRegistry } from 'vs/platform/commands/common/commands';
import { textLinkForeground, textLinkActiveForeground, focusBorder, textPreformatForeground } from 'vs/platform/theme/common/colorRegistry';
import { ResourceLabels } from 'vs/workbench/browser/labels';
import { CommentsList, COMMENTS_VIEW_ID, COMMENTS_VIEW_TITLE, Filter } from 'vs/workbench/contrib/comments/browser/commentsTreeViewer';
import { ViewAction, FilterViewPane } from 'vs/workbench/browser/parts/views/viewPane';
import { IViewDescriptorService, IViewsService } from 'vs/workbench/common/views';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { ContextKeyExpr, IContextKeyService, RawContextKey } from 'vs/platform/contextkey/common/contextkey';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
import { MenuId, registerAction2 } from 'vs/platform/actions/common/actions';
import { Codicon } from 'vs/base/common/codicons';
import { TextModel } from 'vs/editor/common/model/textModel';
import { CommentsViewFilterFocusContextKey } from 'vs/workbench/contrib/comments/browser/comments';
import { CommentsFilters } from 'vs/workbench/contrib/comments/browser/commentsViewActions';
import { Memento } from 'vs/workbench/common/memento';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { FilterOptions } from 'vs/workbench/contrib/comments/browser/commentsFilterOptions';
import { IActivityService, NumberBadge } from 'vs/workbench/services/activity/common/activity';
import { CommentThreadState } from 'vs/editor/common/languages';
import { MutableDisposable } from 'vs/base/common/lifecycle';
const CONTEXT_KEY_HAS_COMMENTS = new RawContextKey('commentsView.hasComments', false);
const VIEW_STORAGE_ID = 'commentsViewState';
let CommentsPanel = class CommentsPanel extends FilterViewPane {
    editorService;
    commentService;
    uriIdentityService;
    activityService;
    storageService;
    treeLabels;
    tree;
    treeContainer;
    messageBoxContainer;
    commentsModel;
    totalComments = 0;
    totalUnresolved = 0;
    hasCommentsContextKey;
    filter;
    filters;
    activity = this._register(new MutableDisposable());
    currentHeight = 0;
    currentWidth = 0;
    viewState;
    stateMemento;
    cachedFilterStats = undefined;
    onDidChangeVisibility = this.onDidChangeBodyVisibility;
    constructor(options, instantiationService, viewDescriptorService, editorService, configurationService, contextKeyService, contextMenuService, keybindingService, openerService, themeService, commentService, telemetryService, uriIdentityService, activityService, storageService) {
        const stateMemento = new Memento(VIEW_STORAGE_ID, storageService);
        const viewState = stateMemento.getMemento(1 /* StorageScope.WORKSPACE */, 0 /* StorageTarget.USER */);
        super({
            ...options,
            filterOptions: {
                placeholder: nls.localize('comments.filter.placeholder', "Filter (e.g. text, author)"),
                ariaLabel: nls.localize('comments.filter.ariaLabel', "Filter comments"),
                history: viewState['filterHistory'] || [],
                text: viewState['filter'] || '',
                focusContextKey: CommentsViewFilterFocusContextKey.key
            }
        }, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService);
        this.editorService = editorService;
        this.commentService = commentService;
        this.uriIdentityService = uriIdentityService;
        this.activityService = activityService;
        this.storageService = storageService;
        this.hasCommentsContextKey = CONTEXT_KEY_HAS_COMMENTS.bindTo(contextKeyService);
        this.stateMemento = stateMemento;
        this.viewState = viewState;
        this.filters = this._register(new CommentsFilters({
            showResolved: this.viewState['showResolved'] !== false,
            showUnresolved: this.viewState['showUnresolved'] !== false,
        }, this.contextKeyService));
        this.filter = new Filter(new FilterOptions(this.filterWidget.getFilterText(), this.filters.showResolved, this.filters.showUnresolved));
        this._register(this.filters.onDidChange((event) => {
            if (event.showResolved || event.showUnresolved) {
                this.updateFilter();
            }
        }));
        this._register(this.filterWidget.onDidChangeFilterText(() => this.updateFilter()));
    }
    updateBadge(unresolved) {
        if (unresolved === this.totalUnresolved) {
            return;
        }
        this.totalUnresolved = unresolved;
        const message = nls.localize('totalUnresolvedComments', '{0} Unresolved Comments', this.totalUnresolved);
        this.activity.value = this.activityService.showViewActivity(this.id, { badge: new NumberBadge(this.totalUnresolved, () => message) });
    }
    saveState() {
        this.viewState['filter'] = this.filterWidget.getFilterText();
        this.viewState['filterHistory'] = this.filterWidget.getHistory();
        this.viewState['showResolved'] = this.filters.showResolved;
        this.viewState['showUnresolved'] = this.filters.showUnresolved;
        this.stateMemento.saveMemento();
        super.saveState();
    }
    focusFilter() {
        this.filterWidget.focus();
    }
    clearFilterText() {
        this.filterWidget.setFilterText('');
    }
    getFilterStats() {
        if (!this.cachedFilterStats) {
            this.cachedFilterStats = {
                total: this.totalComments,
                filtered: this.tree?.getVisibleItemCount() ?? 0
            };
        }
        return this.cachedFilterStats;
    }
    updateFilter() {
        this.filter.options = new FilterOptions(this.filterWidget.getFilterText(), this.filters.showResolved, this.filters.showUnresolved);
        this.tree?.filterComments();
        this.cachedFilterStats = undefined;
        const { total, filtered } = this.getFilterStats();
        this.filterWidget.updateBadge(total === filtered || total === 0 ? undefined : nls.localize('showing filtered results', "Showing {0} of {1}", filtered, total));
        this.filterWidget.checkMoreFilters(!this.filters.showResolved || !this.filters.showUnresolved);
    }
    renderBody(container) {
        super.renderBody(container);
        container.classList.add('comments-panel');
        const domContainer = dom.append(container, dom.$('.comments-panel-container'));
        this.treeContainer = dom.append(domContainer, dom.$('.tree-container'));
        this.treeContainer.classList.add('file-icon-themable-tree', 'show-file-icons');
        this.commentsModel = new CommentsModel();
        this.cachedFilterStats = undefined;
        this.createTree();
        this.createMessageBox(domContainer);
        this._register(this.commentService.onDidSetAllCommentThreads(this.onAllCommentsChanged, this));
        this._register(this.commentService.onDidUpdateCommentThreads(this.onCommentsUpdated, this));
        const styleElement = dom.createStyleSheet(container);
        this.applyStyles(styleElement);
        this._register(this.themeService.onDidColorThemeChange(_ => this.applyStyles(styleElement)));
        this._register(this.onDidChangeBodyVisibility(visible => {
            if (visible) {
                this.refresh();
            }
        }));
        this.renderComments();
    }
    focus() {
        if (this.tree && this.tree.getHTMLElement() === document.activeElement) {
            return;
        }
        if (!this.commentsModel.hasCommentThreads() && this.messageBoxContainer) {
            this.messageBoxContainer.focus();
        }
        else if (this.tree) {
            this.tree.domFocus();
        }
    }
    applyStyles(styleElement) {
        const content = [];
        const theme = this.themeService.getColorTheme();
        const linkColor = theme.getColor(textLinkForeground);
        if (linkColor) {
            content.push(`.comments-panel .comments-panel-container a { color: ${linkColor}; }`);
        }
        const linkActiveColor = theme.getColor(textLinkActiveForeground);
        if (linkActiveColor) {
            content.push(`.comments-panel .comments-panel-container a:hover, a:active { color: ${linkActiveColor}; }`);
        }
        const focusColor = theme.getColor(focusBorder);
        if (focusColor) {
            content.push(`.comments-panel .comments-panel-container a:focus { outline-color: ${focusColor}; }`);
        }
        const codeTextForegroundColor = theme.getColor(textPreformatForeground);
        if (codeTextForegroundColor) {
            content.push(`.comments-panel .comments-panel-container .text code { color: ${codeTextForegroundColor}; }`);
        }
        styleElement.textContent = content.join('\n');
    }
    async renderComments() {
        this.treeContainer.classList.toggle('hidden', !this.commentsModel.hasCommentThreads());
        this.renderMessage();
        await this.tree?.setInput(this.commentsModel);
    }
    collapseAll() {
        if (this.tree) {
            this.tree.collapseAll();
            this.tree.setSelection([]);
            this.tree.setFocus([]);
            this.tree.domFocus();
            this.tree.focusFirst();
        }
    }
    get hasRendered() {
        return !!this.tree;
    }
    layoutBodyContent(height = this.currentHeight, width = this.currentWidth) {
        if (this.messageBoxContainer) {
            this.messageBoxContainer.style.height = `${height}px`;
        }
        this.tree?.layout(height, width);
        this.currentHeight = height;
        this.currentWidth = width;
    }
    createMessageBox(parent) {
        this.messageBoxContainer = dom.append(parent, dom.$('.message-box-container'));
        this.messageBoxContainer.setAttribute('tabIndex', '0');
    }
    renderMessage() {
        this.messageBoxContainer.textContent = this.commentsModel.getMessage();
        this.messageBoxContainer.classList.toggle('hidden', this.commentsModel.hasCommentThreads());
    }
    createTree() {
        this.treeLabels = this._register(this.instantiationService.createInstance(ResourceLabels, this));
        this.tree = this._register(this.instantiationService.createInstance(CommentsList, this.treeLabels, this.treeContainer, {
            overrideStyles: { listBackground: this.getBackgroundColor() },
            selectionNavigation: true,
            filter: this.filter,
            keyboardNavigationLabelProvider: {
                getKeyboardNavigationLabel: (item) => {
                    return undefined;
                }
            },
            accessibilityProvider: {
                getAriaLabel(element) {
                    if (element instanceof CommentsModel) {
                        return nls.localize('rootCommentsLabel', "Comments for current workspace");
                    }
                    if (element instanceof ResourceWithCommentThreads) {
                        return nls.localize('resourceWithCommentThreadsLabel', "Comments in {0}, full path {1}", basename(element.resource), element.resource.fsPath);
                    }
                    if (element instanceof CommentNode) {
                        return nls.localize('resourceWithCommentLabel', "Comment from ${0} at line {1} column {2} in {3}, source: {4}", element.comment.userName, element.range.startLineNumber, element.range.startColumn, basename(element.resource), (typeof element.comment.body === 'string') ? element.comment.body : element.comment.body.value);
                    }
                    return '';
                },
                getWidgetAriaLabel() {
                    return COMMENTS_VIEW_TITLE;
                }
            }
        }));
        this._register(this.tree.onDidOpen(e => {
            this.openFile(e.element, e.editorOptions.pinned, e.editorOptions.preserveFocus, e.sideBySide);
        }));
        this._register(this.tree?.onDidChangeModel(() => {
            this.cachedFilterStats = undefined;
            this.updateFilter();
        }));
    }
    openFile(element, pinned, preserveFocus, sideBySide) {
        if (!element) {
            return false;
        }
        if (!(element instanceof ResourceWithCommentThreads || element instanceof CommentNode)) {
            return false;
        }
        if (!this.commentService.isCommentingEnabled) {
            this.commentService.enableCommenting(true);
        }
        const range = element instanceof ResourceWithCommentThreads ? element.commentThreads[0].range : element.range;
        const activeEditor = this.editorService.activeTextEditorControl;
        // If the active editor is a diff editor where one of the sides has the comment,
        // then we try to reveal the comment in the diff editor.
        const currentActiveResources = isDiffEditor(activeEditor) ? [activeEditor.getOriginalEditor(), activeEditor.getModifiedEditor()]
            : (activeEditor ? [activeEditor] : []);
        for (const editor of currentActiveResources) {
            const model = editor.getModel();
            if ((model instanceof TextModel) && this.uriIdentityService.extUri.isEqual(element.resource, model.uri)) {
                const threadToReveal = element instanceof ResourceWithCommentThreads ? element.commentThreads[0].threadId : element.threadId;
                const commentToReveal = element instanceof ResourceWithCommentThreads ? element.commentThreads[0].comment.uniqueIdInThread : element.comment.uniqueIdInThread;
                if (threadToReveal && isCodeEditor(editor)) {
                    const controller = CommentController.get(editor);
                    controller?.revealCommentThread(threadToReveal, commentToReveal, true);
                }
                return true;
            }
        }
        const threadToReveal = element instanceof ResourceWithCommentThreads ? element.commentThreads[0].threadId : element.threadId;
        const commentToReveal = element instanceof ResourceWithCommentThreads ? element.commentThreads[0].comment : element.comment;
        this.editorService.openEditor({
            resource: element.resource,
            options: {
                pinned: pinned,
                preserveFocus: preserveFocus,
                selection: range
            }
        }, sideBySide ? SIDE_GROUP : ACTIVE_GROUP).then(editor => {
            if (editor) {
                const control = editor.getControl();
                if (threadToReveal && isCodeEditor(control)) {
                    const controller = CommentController.get(control);
                    controller?.revealCommentThread(threadToReveal, commentToReveal.uniqueIdInThread, true);
                }
            }
        });
        return true;
    }
    async refresh() {
        if (!this.tree) {
            return;
        }
        if (this.isVisible()) {
            this.hasCommentsContextKey.set(this.commentsModel.hasCommentThreads());
            this.treeContainer.classList.toggle('hidden', !this.commentsModel.hasCommentThreads());
            this.cachedFilterStats = undefined;
            this.renderMessage();
            await this.tree.updateChildren();
            if (this.tree.getSelection().length === 0 && this.commentsModel.hasCommentThreads()) {
                const firstComment = this.commentsModel.resourceCommentThreads[0].commentThreads[0];
                if (firstComment) {
                    this.tree.setFocus([firstComment]);
                    this.tree.setSelection([firstComment]);
                }
            }
        }
    }
    onAllCommentsChanged(e) {
        this.commentsModel.setCommentThreads(e.ownerId, e.commentThreads);
        this.totalComments += e.commentThreads.length;
        let unresolved = 0;
        for (const thread of e.commentThreads) {
            if (thread.state === CommentThreadState.Unresolved) {
                unresolved++;
            }
        }
        this.updateBadge(unresolved);
        this.refresh();
    }
    onCommentsUpdated(e) {
        const didUpdate = this.commentsModel.updateCommentThreads(e);
        this.totalComments += e.added.length;
        this.totalComments -= e.removed.length;
        let unresolved = 0;
        for (const resource of this.commentsModel.resourceCommentThreads) {
            for (const thread of resource.commentThreads) {
                if (thread.threadState === CommentThreadState.Unresolved) {
                    unresolved++;
                }
            }
        }
        this.updateBadge(unresolved);
        if (didUpdate) {
            this.refresh();
        }
    }
};
CommentsPanel = __decorate([
    __param(1, IInstantiationService),
    __param(2, IViewDescriptorService),
    __param(3, IEditorService),
    __param(4, IConfigurationService),
    __param(5, IContextKeyService),
    __param(6, IContextMenuService),
    __param(7, IKeybindingService),
    __param(8, IOpenerService),
    __param(9, IThemeService),
    __param(10, ICommentService),
    __param(11, ITelemetryService),
    __param(12, IUriIdentityService),
    __param(13, IActivityService),
    __param(14, IStorageService)
], CommentsPanel);
export { CommentsPanel };
CommandsRegistry.registerCommand({
    id: 'workbench.action.focusCommentsPanel',
    handler: async (accessor) => {
        const viewsService = accessor.get(IViewsService);
        viewsService.openView(COMMENTS_VIEW_ID, true);
    }
});
registerAction2(class Collapse extends ViewAction {
    constructor() {
        super({
            viewId: COMMENTS_VIEW_ID,
            id: 'comments.collapse',
            title: nls.localize('collapseAll', "Collapse All"),
            f1: false,
            icon: Codicon.collapseAll,
            menu: {
                id: MenuId.ViewTitle,
                group: 'navigation',
                when: ContextKeyExpr.and(ContextKeyExpr.equals('view', COMMENTS_VIEW_ID), CONTEXT_KEY_HAS_COMMENTS),
                order: 100
            }
        });
    }
    runInView(_accessor, view) {
        view.collapseAll();
    }
});

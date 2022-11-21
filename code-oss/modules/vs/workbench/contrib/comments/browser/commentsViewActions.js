/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Disposable } from 'vs/base/common/lifecycle';
import { localize } from 'vs/nls';
import { ContextKeyExpr, RawContextKey } from 'vs/platform/contextkey/common/contextkey';
import { Emitter } from 'vs/base/common/event';
import { CommentsViewFilterFocusContextKey } from 'vs/workbench/contrib/comments/browser/comments';
import { registerAction2 } from 'vs/platform/actions/common/actions';
import { ViewAction } from 'vs/workbench/browser/parts/views/viewPane';
import { COMMENTS_VIEW_ID } from 'vs/workbench/contrib/comments/browser/commentsTreeViewer';
import { FocusedViewContext } from 'vs/workbench/common/contextkeys';
import { viewFilterSubmenu } from 'vs/workbench/browser/parts/views/viewFilter';
const CONTEXT_KEY_SHOW_RESOLVED = new RawContextKey('commentsView.showResolvedFilter', true);
const CONTEXT_KEY_SHOW_UNRESOLVED = new RawContextKey('commentsView.showUnResolvedFilter', true);
export class CommentsFilters extends Disposable {
    contextKeyService;
    _onDidChange = this._register(new Emitter());
    onDidChange = this._onDidChange.event;
    constructor(options, contextKeyService) {
        super();
        this.contextKeyService = contextKeyService;
        this._showResolved.set(options.showResolved);
        this._showUnresolved.set(options.showUnresolved);
    }
    _showUnresolved = CONTEXT_KEY_SHOW_UNRESOLVED.bindTo(this.contextKeyService);
    get showUnresolved() {
        return !!this._showUnresolved.get();
    }
    set showUnresolved(showUnresolved) {
        if (this._showUnresolved.get() !== showUnresolved) {
            this._showUnresolved.set(showUnresolved);
            this._onDidChange.fire({ showUnresolved: true });
        }
    }
    _showResolved = CONTEXT_KEY_SHOW_RESOLVED.bindTo(this.contextKeyService);
    get showResolved() {
        return !!this._showResolved.get();
    }
    set showResolved(showResolved) {
        if (this._showResolved.get() !== showResolved) {
            this._showResolved.set(showResolved);
            this._onDidChange.fire({ showResolved: true });
        }
    }
}
registerAction2(class extends ViewAction {
    constructor() {
        super({
            id: 'commentsFocusViewFromFilter',
            title: localize('focusCommentsList', "Focus Comments view"),
            keybinding: {
                when: CommentsViewFilterFocusContextKey,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                primary: 2048 /* KeyMod.CtrlCmd */ | 18 /* KeyCode.DownArrow */
            },
            viewId: COMMENTS_VIEW_ID
        });
    }
    async runInView(serviceAccessor, commentsView) {
        commentsView.focus();
    }
});
registerAction2(class extends ViewAction {
    constructor() {
        super({
            id: 'commentsClearFilterText',
            title: localize('commentsClearFilterText', "Clear filter text"),
            keybinding: {
                when: CommentsViewFilterFocusContextKey,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                primary: 9 /* KeyCode.Escape */
            },
            viewId: COMMENTS_VIEW_ID
        });
    }
    async runInView(serviceAccessor, commentsView) {
        commentsView.clearFilterText();
    }
});
registerAction2(class extends ViewAction {
    constructor() {
        super({
            id: 'commentsFocusFilter',
            title: localize('focusCommentsFilter', "Focus comments filter"),
            keybinding: {
                when: FocusedViewContext.isEqualTo(COMMENTS_VIEW_ID),
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                primary: 2048 /* KeyMod.CtrlCmd */ | 36 /* KeyCode.KeyF */
            },
            viewId: COMMENTS_VIEW_ID
        });
    }
    async runInView(serviceAccessor, commentsView) {
        commentsView.focusFilter();
    }
});
registerAction2(class extends ViewAction {
    constructor() {
        super({
            id: `workbench.actions.${COMMENTS_VIEW_ID}.toggleUnResolvedComments`,
            title: localize('toggle unresolved', "Toggle Unresolved Comments"),
            category: localize('comments', "Comments"),
            toggled: {
                condition: CONTEXT_KEY_SHOW_UNRESOLVED,
                title: localize('unresolved', "Show Unresolved"),
            },
            menu: {
                id: viewFilterSubmenu,
                group: '1_filter',
                when: ContextKeyExpr.equals('view', COMMENTS_VIEW_ID),
                order: 1
            },
            viewId: COMMENTS_VIEW_ID
        });
    }
    async runInView(serviceAccessor, view) {
        view.filters.showUnresolved = !view.filters.showUnresolved;
    }
});
registerAction2(class extends ViewAction {
    constructor() {
        super({
            id: `workbench.actions.${COMMENTS_VIEW_ID}.toggleResolvedComments`,
            title: localize('toggle resolved', "Toggle Resolved Comments"),
            category: localize('comments', "Comments"),
            toggled: {
                condition: CONTEXT_KEY_SHOW_RESOLVED,
                title: localize('resolved', "Show Resolved"),
            },
            menu: {
                id: viewFilterSubmenu,
                group: '1_filter',
                when: ContextKeyExpr.equals('view', COMMENTS_VIEW_ID),
                order: 1
            },
            viewId: COMMENTS_VIEW_ID
        });
    }
    async runInView(serviceAccessor, view) {
        view.filters.showResolved = !view.filters.showResolved;
    }
});

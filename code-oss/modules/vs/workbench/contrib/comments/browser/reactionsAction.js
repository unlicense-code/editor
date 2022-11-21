/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as nls from 'vs/nls';
import * as dom from 'vs/base/browser/dom';
import { Action } from 'vs/base/common/actions';
import { URI } from 'vs/base/common/uri';
import { ActionViewItem } from 'vs/base/browser/ui/actionbar/actionViewItems';
export class ToggleReactionsAction extends Action {
    static ID = 'toolbar.toggle.pickReactions';
    _menuActions = [];
    toggleDropdownMenu;
    constructor(toggleDropdownMenu, title) {
        super(ToggleReactionsAction.ID, title || nls.localize('pickReactions', "Pick Reactions..."), 'toggle-reactions', true);
        this.toggleDropdownMenu = toggleDropdownMenu;
    }
    run() {
        this.toggleDropdownMenu();
        return Promise.resolve(true);
    }
    get menuActions() {
        return this._menuActions;
    }
    set menuActions(actions) {
        this._menuActions = actions;
    }
}
export class ReactionActionViewItem extends ActionViewItem {
    constructor(action) {
        super(null, action, {});
    }
    updateLabel() {
        if (!this.label) {
            return;
        }
        const action = this.action;
        if (action.class) {
            this.label.classList.add(action.class);
        }
        if (!action.icon) {
            const reactionLabel = dom.append(this.label, dom.$('span.reaction-label'));
            reactionLabel.innerText = action.label;
        }
        else {
            const reactionIcon = dom.append(this.label, dom.$('.reaction-icon'));
            reactionIcon.style.display = '';
            const uri = URI.revive(action.icon);
            reactionIcon.style.backgroundImage = dom.asCSSUrl(uri);
            reactionIcon.title = action.label;
        }
        if (action.count) {
            const reactionCount = dom.append(this.label, dom.$('span.reaction-count'));
            reactionCount.innerText = `${action.count}`;
        }
    }
}
export class ReactionAction extends Action {
    icon;
    count;
    static ID = 'toolbar.toggle.reaction';
    constructor(id, label = '', cssClass = '', enabled = true, actionCallback, icon, count) {
        super(ReactionAction.ID, label, cssClass, enabled, actionCallback);
        this.icon = icon;
        this.count = count;
    }
}

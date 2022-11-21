/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Button } from 'vs/base/browser/ui/button/button';
import { DisposableStore } from 'vs/base/common/lifecycle';
import { defaultButtonStyles } from 'vs/platform/theme/browser/defaultStyles';
export class CommentFormActions {
    container;
    actionHandler;
    _buttonElements = [];
    _toDispose = new DisposableStore();
    _actions = [];
    constructor(container, actionHandler) {
        this.container = container;
        this.actionHandler = actionHandler;
    }
    setActions(menu) {
        this._toDispose.clear();
        this._buttonElements.forEach(b => b.remove());
        const groups = menu.getActions({ shouldForwardArgs: true });
        let isPrimary = true;
        for (const group of groups) {
            const [, actions] = group;
            this._actions = actions;
            for (const action of actions) {
                const button = new Button(this.container, { secondary: !isPrimary, ...defaultButtonStyles });
                isPrimary = false;
                this._buttonElements.push(button.element);
                this._toDispose.add(button);
                this._toDispose.add(button.onDidClick(() => this.actionHandler(action)));
                button.enabled = action.enabled;
                button.label = action.label;
            }
        }
    }
    triggerDefaultAction() {
        if (this._actions.length) {
            const lastAction = this._actions[0];
            if (lastAction.enabled) {
                this.actionHandler(lastAction);
            }
        }
    }
    dispose() {
        this._toDispose.dispose();
    }
}

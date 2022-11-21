/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Action } from 'vs/base/common/actions';
import { createActionViewItem, createAndFillInActionBarActions, createAndFillInContextMenuActions } from 'vs/platform/actions/browser/menuEntryActionViewItem';
import { equals } from 'vs/base/common/arrays';
import { ActionViewItem } from 'vs/base/browser/ui/actionbar/actionViewItems';
import { renderLabelWithIcons } from 'vs/base/browser/ui/iconLabel/iconLabels';
import { reset } from 'vs/base/browser/dom';
export function isSCMRepository(element) {
    return !!element.provider && !!element.input;
}
export function isSCMInput(element) {
    return !!element.validateInput && typeof element.value === 'string';
}
export function isSCMActionButton(element) {
    return element.type === 'actionButton';
}
export function isSCMResourceGroup(element) {
    return !!element.provider && !!element.elements;
}
export function isSCMResource(element) {
    return !!element.sourceUri && isSCMResourceGroup(element.resourceGroup);
}
const compareActions = (a, b) => a.id === b.id && a.enabled === b.enabled;
export function connectPrimaryMenu(menu, callback, primaryGroup) {
    let cachedPrimary = [];
    let cachedSecondary = [];
    const updateActions = () => {
        const primary = [];
        const secondary = [];
        createAndFillInActionBarActions(menu, { shouldForwardArgs: true }, { primary, secondary }, primaryGroup);
        if (equals(cachedPrimary, primary, compareActions) && equals(cachedSecondary, secondary, compareActions)) {
            return;
        }
        cachedPrimary = primary;
        cachedSecondary = secondary;
        callback(primary, secondary);
    };
    updateActions();
    return menu.onDidChange(updateActions);
}
export function connectPrimaryMenuToInlineActionBar(menu, actionBar) {
    return connectPrimaryMenu(menu, (primary) => {
        actionBar.clear();
        actionBar.push(primary, { icon: true, label: false });
    }, 'inline');
}
export function collectContextMenuActions(menu) {
    const primary = [];
    const actions = [];
    createAndFillInContextMenuActions(menu, { shouldForwardArgs: true }, { primary, secondary: actions }, 'inline');
    return actions;
}
export class StatusBarAction extends Action {
    command;
    commandService;
    constructor(command, commandService) {
        super(`statusbaraction{${command.id}}`, command.title, '', true);
        this.command = command;
        this.commandService = commandService;
        this.tooltip = command.tooltip || '';
    }
    run() {
        return this.commandService.executeCommand(this.command.id, ...(this.command.arguments || []));
    }
}
class StatusBarActionViewItem extends ActionViewItem {
    constructor(action) {
        super(null, action, {});
    }
    updateLabel() {
        if (this.options.label && this.label) {
            reset(this.label, ...renderLabelWithIcons(this.action.label));
        }
    }
}
export function getActionViewItemProvider(instaService) {
    return action => {
        if (action instanceof StatusBarAction) {
            return new StatusBarActionViewItem(action);
        }
        return createActionViewItem(instaService, action);
    };
}

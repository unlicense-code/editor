/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { StandardMouseEvent } from 'vs/base/browser/mouseEvent';
import { createAndFillInContextMenuActions } from 'vs/platform/actions/browser/menuEntryActionViewItem';
export function openContextMenu(event, parent, menu, contextMenuService, extraActions) {
    const standardEvent = new StandardMouseEvent(event);
    const anchor = { x: standardEvent.posx, y: standardEvent.posy };
    const actions = [];
    createAndFillInContextMenuActions(menu, undefined, actions);
    if (extraActions) {
        actions.push(...extraActions);
    }
    contextMenuService.showContextMenu({
        getAnchor: () => anchor,
        getActions: () => actions,
        getActionsContext: () => parent,
    });
}

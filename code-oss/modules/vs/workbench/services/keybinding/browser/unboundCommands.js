/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { CommandsRegistry } from 'vs/platform/commands/common/commands';
import { isNonEmptyArray } from 'vs/base/common/arrays';
import { EditorExtensionsRegistry } from 'vs/editor/browser/editorExtensions';
import { MenuRegistry, MenuId, isIMenuItem } from 'vs/platform/actions/common/actions';
export function getAllUnboundCommands(boundCommands) {
    const unboundCommands = [];
    const seenMap = new Map();
    const addCommand = (id, includeCommandWithArgs) => {
        if (seenMap.has(id)) {
            return;
        }
        seenMap.set(id, true);
        if (id[0] === '_' || id.indexOf('vscode.') === 0) { // private command
            return;
        }
        if (boundCommands.get(id) === true) {
            return;
        }
        if (!includeCommandWithArgs) {
            const command = CommandsRegistry.getCommand(id);
            if (command && typeof command.description === 'object'
                && isNonEmptyArray(command.description.args)) { // command with args
                return;
            }
        }
        unboundCommands.push(id);
    };
    // Add all commands from Command Palette
    for (const menuItem of MenuRegistry.getMenuItems(MenuId.CommandPalette)) {
        if (isIMenuItem(menuItem)) {
            addCommand(menuItem.command.id, true);
        }
    }
    // Add all editor actions
    for (const editorAction of EditorExtensionsRegistry.getEditorActions()) {
        addCommand(editorAction.id, true);
    }
    for (const id of CommandsRegistry.getCommands().keys()) {
        addCommand(id, false);
    }
    return unboundCommands;
}

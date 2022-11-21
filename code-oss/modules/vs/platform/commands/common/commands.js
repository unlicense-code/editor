/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Emitter } from 'vs/base/common/event';
import { Iterable } from 'vs/base/common/iterator';
import { toDisposable } from 'vs/base/common/lifecycle';
import { LinkedList } from 'vs/base/common/linkedList';
import { validateConstraints } from 'vs/base/common/types';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
export const ICommandService = createDecorator('commandService');
export const CommandsRegistry = new class {
    _commands = new Map();
    _onDidRegisterCommand = new Emitter();
    onDidRegisterCommand = this._onDidRegisterCommand.event;
    registerCommand(idOrCommand, handler) {
        if (!idOrCommand) {
            throw new Error(`invalid command`);
        }
        if (typeof idOrCommand === 'string') {
            if (!handler) {
                throw new Error(`invalid command`);
            }
            return this.registerCommand({ id: idOrCommand, handler });
        }
        // add argument validation if rich command metadata is provided
        if (idOrCommand.description) {
            const constraints = [];
            for (const arg of idOrCommand.description.args) {
                constraints.push(arg.constraint);
            }
            const actualHandler = idOrCommand.handler;
            idOrCommand.handler = function (accessor, ...args) {
                validateConstraints(args, constraints);
                return actualHandler(accessor, ...args);
            };
        }
        // find a place to store the command
        const { id } = idOrCommand;
        let commands = this._commands.get(id);
        if (!commands) {
            commands = new LinkedList();
            this._commands.set(id, commands);
        }
        const removeFn = commands.unshift(idOrCommand);
        const ret = toDisposable(() => {
            removeFn();
            const command = this._commands.get(id);
            if (command?.isEmpty()) {
                this._commands.delete(id);
            }
        });
        // tell the world about this command
        this._onDidRegisterCommand.fire(id);
        return ret;
    }
    registerCommandAlias(oldId, newId) {
        return CommandsRegistry.registerCommand(oldId, (accessor, ...args) => accessor.get(ICommandService).executeCommand(newId, ...args));
    }
    getCommand(id) {
        const list = this._commands.get(id);
        if (!list || list.isEmpty()) {
            return undefined;
        }
        return Iterable.first(list);
    }
    getCommands() {
        const result = new Map();
        for (const key of this._commands.keys()) {
            const command = this.getCommand(key);
            if (command) {
                result.set(key, command);
            }
        }
        return result;
    }
};
CommandsRegistry.registerCommand('noop', () => { });

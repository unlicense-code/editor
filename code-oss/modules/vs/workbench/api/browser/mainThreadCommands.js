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
import { DisposableMap } from 'vs/base/common/lifecycle';
import { revive } from 'vs/base/common/marshalling';
import { CommandsRegistry, ICommandService } from 'vs/platform/commands/common/commands';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { extHostNamedCustomer } from 'vs/workbench/services/extensions/common/extHostCustomers';
import { SerializableObjectWithBuffers } from 'vs/workbench/services/extensions/common/proxyIdentifier';
import { ExtHostContext, MainContext } from '../common/extHost.protocol';
let MainThreadCommands = class MainThreadCommands {
    _commandService;
    _extensionService;
    _commandRegistrations = new DisposableMap();
    _generateCommandsDocumentationRegistration;
    _proxy;
    constructor(extHostContext, _commandService, _extensionService) {
        this._commandService = _commandService;
        this._extensionService = _extensionService;
        this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostCommands);
        this._generateCommandsDocumentationRegistration = CommandsRegistry.registerCommand('_generateCommandsDocumentation', () => this._generateCommandsDocumentation());
    }
    dispose() {
        this._commandRegistrations.dispose();
        this._generateCommandsDocumentationRegistration.dispose();
    }
    async _generateCommandsDocumentation() {
        const result = await this._proxy.$getContributedCommandHandlerDescriptions();
        // add local commands
        const commands = CommandsRegistry.getCommands();
        for (const [id, command] of commands) {
            if (command.description) {
                result[id] = command.description;
            }
        }
        // print all as markdown
        const all = [];
        for (const id in result) {
            all.push('`' + id + '` - ' + _generateMarkdown(result[id]));
        }
        console.log(all.join('\n'));
    }
    $registerCommand(id) {
        this._commandRegistrations.set(id, CommandsRegistry.registerCommand(id, (accessor, ...args) => {
            return this._proxy.$executeContributedCommand(id, ...args).then(result => {
                return revive(result);
            });
        }));
    }
    $unregisterCommand(id) {
        this._commandRegistrations.deleteAndDispose(id);
    }
    $fireCommandActivationEvent(id) {
        const activationEvent = `onCommand:${id}`;
        if (!this._extensionService.activationEventIsDone(activationEvent)) {
            // this is NOT awaited because we only use it as drive-by-activation
            // for commands that are already known inside the extension host
            this._extensionService.activateByEvent(activationEvent);
        }
    }
    async $executeCommand(id, args, retry) {
        if (args instanceof SerializableObjectWithBuffers) {
            args = args.value;
        }
        for (let i = 0; i < args.length; i++) {
            args[i] = revive(args[i]);
        }
        if (retry && args.length > 0 && !CommandsRegistry.getCommand(id)) {
            await this._extensionService.activateByEvent(`onCommand:${id}`);
            throw new Error('$executeCommand:retry');
        }
        return this._commandService.executeCommand(id, ...args);
    }
    $getCommands() {
        return Promise.resolve([...CommandsRegistry.getCommands().keys()]);
    }
};
MainThreadCommands = __decorate([
    extHostNamedCustomer(MainContext.MainThreadCommands),
    __param(1, ICommandService),
    __param(2, IExtensionService)
], MainThreadCommands);
export { MainThreadCommands };
// --- command doc
function _generateMarkdown(description) {
    if (typeof description === 'string') {
        return description;
    }
    else {
        const parts = [description.description];
        parts.push('\n\n');
        if (description.args) {
            for (const arg of description.args) {
                parts.push(`* _${arg.name}_ - ${arg.description || ''}\n`);
            }
        }
        if (description.returns) {
            parts.push(`* _(returns)_ - ${description.returns}`);
        }
        parts.push('\n\n');
        return parts.join('');
    }
}

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
import { URI } from 'vs/base/common/uri';
import { ITerminalEditorService } from 'vs/workbench/contrib/terminal/browser/terminal';
let TerminalInputSerializer = class TerminalInputSerializer {
    _terminalEditorService;
    constructor(_terminalEditorService) {
        this._terminalEditorService = _terminalEditorService;
    }
    canSerialize(editorInput) {
        return !!editorInput.terminalInstance?.persistentProcessId;
    }
    serialize(editorInput) {
        if (!editorInput.terminalInstance?.persistentProcessId || !editorInput.terminalInstance.shouldPersist) {
            return;
        }
        const term = JSON.stringify(this._toJson(editorInput.terminalInstance));
        return term;
    }
    deserialize(instantiationService, serializedEditorInput) {
        const terminalInstance = JSON.parse(serializedEditorInput);
        terminalInstance.resource = URI.parse(terminalInstance.resource);
        return this._terminalEditorService.reviveInput(terminalInstance);
    }
    _toJson(instance) {
        return {
            id: instance.persistentProcessId,
            pid: instance.processId || 0,
            title: instance.title,
            titleSource: instance.titleSource,
            cwd: '',
            icon: instance.icon,
            color: instance.color,
            resource: instance.resource.toString(),
            hasChildProcesses: instance.hasChildProcesses,
            isFeatureTerminal: instance.shellLaunchConfig.isFeatureTerminal,
            hideFromUser: instance.shellLaunchConfig.hideFromUser,
            reconnectionProperties: instance.shellLaunchConfig.reconnectionProperties
        };
    }
};
TerminalInputSerializer = __decorate([
    __param(0, ITerminalEditorService)
], TerminalInputSerializer);
export { TerminalInputSerializer };

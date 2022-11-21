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
import { EnvironmentVariableMutatorType } from 'vs/workbench/contrib/terminal/common/environmentVariable';
import { ITerminalService } from 'vs/workbench/contrib/terminal/browser/terminal';
import { localize } from 'vs/nls';
import { Codicon } from 'vs/base/common/codicons';
let EnvironmentVariableInfoStale = class EnvironmentVariableInfoStale {
    _diff;
    _terminalId;
    _terminalService;
    requiresAction = true;
    constructor(_diff, _terminalId, _terminalService) {
        this._diff = _diff;
        this._terminalId = _terminalId;
        this._terminalService = _terminalService;
    }
    getInfo() {
        const addsAndChanges = [];
        const removals = [];
        this._diff.added.forEach((mutators, variable) => {
            mutators.forEach(mutator => addsAndChanges.push(mutatorTypeLabel(mutator.type, mutator.value, variable)));
        });
        this._diff.changed.forEach((mutators, variable) => {
            mutators.forEach(mutator => addsAndChanges.push(mutatorTypeLabel(mutator.type, mutator.value, variable)));
        });
        this._diff.removed.forEach((mutators, variable) => {
            mutators.forEach(mutator => removals.push(mutatorTypeLabel(mutator.type, mutator.value, variable)));
        });
        let info = '';
        if (addsAndChanges.length > 0) {
            info = localize('extensionEnvironmentContributionChanges', "Extensions want to make the following changes to the terminal's environment:");
            info += '\n\n';
            info += '```\n';
            info += addsAndChanges.join('\n');
            info += '\n```';
        }
        if (removals.length > 0) {
            info += info.length > 0 ? '\n\n' : '';
            info += localize('extensionEnvironmentContributionRemoval', "Extensions want to remove these existing changes from the terminal's environment:");
            info += '\n\n';
            info += '```\n';
            info += removals.join('\n');
            info += '\n```';
        }
        return info;
    }
    getIcon() {
        return Codicon.warning;
    }
    getActions() {
        return [{
                label: localize('relaunchTerminalLabel', "Relaunch terminal"),
                run: () => this._terminalService.getInstanceFromId(this._terminalId)?.relaunch(),
                commandId: "workbench.action.terminal.relaunch" /* TerminalCommandId.Relaunch */
            }];
    }
};
EnvironmentVariableInfoStale = __decorate([
    __param(2, ITerminalService)
], EnvironmentVariableInfoStale);
export { EnvironmentVariableInfoStale };
export class EnvironmentVariableInfoChangesActive {
    _collection;
    requiresAction = false;
    constructor(_collection) {
        this._collection = _collection;
    }
    getInfo() {
        const changes = [];
        this._collection.map.forEach((mutators, variable) => {
            mutators.forEach(mutator => changes.push(mutatorTypeLabel(mutator.type, mutator.value, variable)));
        });
        const message = localize('extensionEnvironmentContributionInfo', "Extensions have made changes to this terminal's environment");
        return message + '\n\n```\n' + changes.join('\n') + '\n```';
    }
    getIcon() {
        return Codicon.info;
    }
}
function mutatorTypeLabel(type, value, variable) {
    switch (type) {
        case EnvironmentVariableMutatorType.Prepend: return `${variable}=${value}\${env:${variable}}`;
        case EnvironmentVariableMutatorType.Append: return `${variable}=\${env:${variable}}${value}`;
        default: return `${variable}=${value}`;
    }
}

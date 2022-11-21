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
import { localize } from 'vs/nls';
import { ITerminalService } from 'vs/workbench/contrib/terminal/browser/terminal';
import { Emitter } from 'vs/base/common/event';
import { Schemas } from 'vs/base/common/network';
import { getColorForSeverity } from 'vs/workbench/contrib/terminal/browser/terminalStatusList';
let TerminalDecorationsProvider = class TerminalDecorationsProvider {
    _terminalService;
    label = localize('label', "Terminal");
    _onDidChange = new Emitter();
    constructor(_terminalService) {
        this._terminalService = _terminalService;
        this._terminalService.onDidChangeInstancePrimaryStatus(e => this._onDidChange.fire([e.resource]));
    }
    get onDidChange() {
        return this._onDidChange.event;
    }
    provideDecorations(resource) {
        if (resource.scheme !== Schemas.vscodeTerminal) {
            return undefined;
        }
        const instance = this._terminalService.getInstanceFromResource(resource);
        if (!instance) {
            return undefined;
        }
        const primaryStatus = instance?.statusList?.primary;
        if (!primaryStatus?.icon) {
            return undefined;
        }
        return {
            color: getColorForSeverity(primaryStatus.severity),
            letter: primaryStatus.icon,
            tooltip: primaryStatus.tooltip
        };
    }
    dispose() {
        this.dispose();
    }
};
TerminalDecorationsProvider = __decorate([
    __param(0, ITerminalService)
], TerminalDecorationsProvider);
export { TerminalDecorationsProvider };

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
import { IDebugService } from 'vs/workbench/contrib/debug/common/debug';
import { dispose } from 'vs/base/common/lifecycle';
import { IHostService } from 'vs/workbench/services/host/browser/host';
import { ITitleService } from 'vs/workbench/services/title/common/titleService';
let DebugTitleContribution = class DebugTitleContribution {
    debugService;
    hostService;
    titleService;
    toDispose = [];
    constructor(debugService, hostService, titleService) {
        this.debugService = debugService;
        this.hostService = hostService;
        this.titleService = titleService;
        const updateTitle = () => {
            if (debugService.state === 2 /* State.Stopped */ && !hostService.hasFocus) {
                titleService.updateProperties({ prefix: '🔴' });
            }
            else {
                titleService.updateProperties({ prefix: '' });
            }
        };
        this.toDispose.push(debugService.onDidChangeState(updateTitle));
        this.toDispose.push(hostService.onDidChangeFocus(updateTitle));
    }
    dispose() {
        dispose(this.toDispose);
    }
};
DebugTitleContribution = __decorate([
    __param(0, IDebugService),
    __param(1, IHostService),
    __param(2, ITitleService)
], DebugTitleContribution);
export { DebugTitleContribution };

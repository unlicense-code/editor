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
import * as nls from 'vs/nls';
import { dispose } from 'vs/base/common/lifecycle';
import { IDebugService } from 'vs/workbench/contrib/debug/common/debug';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IStatusbarService } from 'vs/workbench/services/statusbar/browser/statusbar';
let DebugStatusContribution = class DebugStatusContribution {
    statusBarService;
    debugService;
    configurationService;
    showInStatusBar;
    toDispose = [];
    entryAccessor;
    constructor(statusBarService, debugService, configurationService) {
        this.statusBarService = statusBarService;
        this.debugService = debugService;
        this.configurationService = configurationService;
        const addStatusBarEntry = () => {
            this.entryAccessor = this.statusBarService.addEntry(this.entry, 'status.debug', 0 /* StatusbarAlignment.LEFT */, 30 /* Low Priority */);
        };
        const setShowInStatusBar = () => {
            this.showInStatusBar = configurationService.getValue('debug').showInStatusBar;
            if (this.showInStatusBar === 'always' && !this.entryAccessor) {
                addStatusBarEntry();
            }
        };
        setShowInStatusBar();
        this.toDispose.push(this.debugService.onDidChangeState(state => {
            if (state !== 0 /* State.Inactive */ && this.showInStatusBar === 'onFirstSessionStart' && !this.entryAccessor) {
                addStatusBarEntry();
            }
        }));
        this.toDispose.push(configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('debug.showInStatusBar')) {
                setShowInStatusBar();
                if (this.entryAccessor && this.showInStatusBar === 'never') {
                    this.entryAccessor.dispose();
                    this.entryAccessor = undefined;
                }
            }
        }));
        this.toDispose.push(this.debugService.getConfigurationManager().onDidSelectConfiguration(e => {
            this.entryAccessor?.update(this.entry);
        }));
    }
    get entry() {
        let text = '';
        const manager = this.debugService.getConfigurationManager();
        const name = manager.selectedConfiguration.name || '';
        const nameAndLaunchPresent = name && manager.selectedConfiguration.launch;
        if (nameAndLaunchPresent) {
            text = (manager.getLaunches().length > 1 ? `${name} (${manager.selectedConfiguration.launch.name})` : name);
        }
        return {
            name: nls.localize('status.debug', "Debug"),
            text: '$(debug-alt-small) ' + text,
            ariaLabel: nls.localize('debugTarget', "Debug: {0}", text),
            tooltip: nls.localize('selectAndStartDebug', "Select and start debug configuration"),
            command: 'workbench.action.debug.selectandstart'
        };
    }
    dispose() {
        this.entryAccessor?.dispose();
        dispose(this.toDispose);
    }
};
DebugStatusContribution = __decorate([
    __param(0, IStatusbarService),
    __param(1, IDebugService),
    __param(2, IConfigurationService)
], DebugStatusContribution);
export { DebugStatusContribution };

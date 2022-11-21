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
import { Registry } from 'vs/platform/registry/common/platform';
import { Extensions } from 'vs/workbench/common/contributions';
import { registerColor } from 'vs/platform/theme/common/colorRegistry';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { STATUS_BAR_FOREGROUND, STATUS_BAR_BORDER } from 'vs/workbench/common/theme';
import { IDebugService } from 'vs/workbench/contrib/debug/common/debug';
import { localize } from 'vs/nls';
import { combinedDisposable, DisposableStore } from 'vs/base/common/lifecycle';
import { Event } from 'vs/base/common/event';
import { DomEmitter } from 'vs/base/browser/event';
import { IStatusbarService } from 'vs/workbench/services/statusbar/browser/statusbar';
export const STATUS_BAR_OFFLINE_BACKGROUND = registerColor('statusBar.offlineBackground', {
    dark: '#6c1717',
    light: '#6c1717',
    hcDark: '#6c1717',
    hcLight: '#6c1717'
}, localize('statusBarOfflineBackground', "Status bar background color when the workbench is offline. The status bar is shown in the bottom of the window"));
export const STATUS_BAR_OFFLINE_FOREGROUND = registerColor('statusBar.offlineForeground', {
    dark: STATUS_BAR_FOREGROUND,
    light: STATUS_BAR_FOREGROUND,
    hcDark: STATUS_BAR_FOREGROUND,
    hcLight: STATUS_BAR_FOREGROUND
}, localize('statusBarOfflineForeground', "Status bar foreground color when the workbench is offline. The status bar is shown in the bottom of the window"));
export const STATUS_BAR_OFFLINE_BORDER = registerColor('statusBar.offlineBorder', {
    dark: STATUS_BAR_BORDER,
    light: STATUS_BAR_BORDER,
    hcDark: STATUS_BAR_BORDER,
    hcLight: STATUS_BAR_BORDER
}, localize('statusBarOfflineBorder', "Status bar border color separating to the sidebar and editor when the workbench is offline. The status bar is shown in the bottom of the window"));
let OfflineStatusBarController = class OfflineStatusBarController {
    debugService;
    contextService;
    statusbarService;
    disposables = new DisposableStore();
    disposable;
    set enabled(enabled) {
        if (enabled === !!this.disposable) {
            return;
        }
        if (enabled) {
            this.disposable = combinedDisposable(this.statusbarService.overrideStyle({
                priority: 100,
                foreground: STATUS_BAR_OFFLINE_FOREGROUND,
                background: STATUS_BAR_OFFLINE_BACKGROUND,
                border: STATUS_BAR_OFFLINE_BORDER,
            }), this.statusbarService.addEntry({
                name: 'Offline Indicator',
                text: '$(debug-disconnect) Offline',
                ariaLabel: 'Network is offline.',
                tooltip: localize('offline', "Network appears to be offline, certain features might be unavailable.")
            }, 'offline', 0 /* StatusbarAlignment.LEFT */, 10000));
        }
        else {
            this.disposable.dispose();
            this.disposable = undefined;
        }
    }
    constructor(debugService, contextService, statusbarService) {
        this.debugService = debugService;
        this.contextService = contextService;
        this.statusbarService = statusbarService;
        Event.any(this.disposables.add(new DomEmitter(window, 'online')).event, this.disposables.add(new DomEmitter(window, 'offline')).event)(this.update, this, this.disposables);
        this.debugService.onDidChangeState(this.update, this, this.disposables);
        this.contextService.onDidChangeWorkbenchState(this.update, this, this.disposables);
        this.update();
    }
    update() {
        this.enabled = !navigator.onLine;
    }
    dispose() {
        this.disposable?.dispose();
        this.disposables.dispose();
    }
};
OfflineStatusBarController = __decorate([
    __param(0, IDebugService),
    __param(1, IWorkspaceContextService),
    __param(2, IStatusbarService)
], OfflineStatusBarController);
export { OfflineStatusBarController };
Registry.as(Extensions.Workbench)
    .registerWorkbenchContribution(OfflineStatusBarController, 3 /* LifecyclePhase.Restored */);

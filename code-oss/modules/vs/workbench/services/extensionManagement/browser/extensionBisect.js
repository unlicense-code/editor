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
import { IExtensionManagementService, IGlobalExtensionEnablementService } from 'vs/platform/extensionManagement/common/extensionManagement';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { isResolverExtension } from 'vs/platform/extensions/common/extensions';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { INotificationService, Severity } from 'vs/platform/notification/common/notification';
import { IHostService } from 'vs/workbench/services/host/browser/host';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { Action2, MenuId, registerAction2 } from 'vs/platform/actions/common/actions';
import { ContextKeyExpr, IContextKeyService, RawContextKey } from 'vs/platform/contextkey/common/contextkey';
import { IDialogService } from 'vs/platform/dialogs/common/dialogs';
import { Registry } from 'vs/platform/registry/common/platform';
import { Extensions } from 'vs/workbench/common/contributions';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { ILogService } from 'vs/platform/log/common/log';
import { IProductService } from 'vs/platform/product/common/productService';
import { IWorkbenchIssueService } from 'vs/workbench/services/issue/common/issue';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { areSameExtensions } from 'vs/platform/extensionManagement/common/extensionManagementUtil';
import { Categories } from 'vs/platform/action/common/actionCommonCategories';
// --- bisect service
export const IExtensionBisectService = createDecorator('IExtensionBisectService');
class BisectState {
    extensions;
    low;
    high;
    mid;
    static fromJSON(raw) {
        if (!raw) {
            return undefined;
        }
        try {
            const data = JSON.parse(raw);
            return new BisectState(data.extensions, data.low, data.high, data.mid);
        }
        catch {
            return undefined;
        }
    }
    constructor(extensions, low, high, mid = ((low + high) / 2) | 0) {
        this.extensions = extensions;
        this.low = low;
        this.high = high;
        this.mid = mid;
    }
}
let ExtensionBisectService = class ExtensionBisectService {
    _storageService;
    _envService;
    static _storageKey = 'extensionBisectState';
    _state;
    _disabled = new Map();
    constructor(logService, _storageService, _envService) {
        this._storageService = _storageService;
        this._envService = _envService;
        const raw = _storageService.get(ExtensionBisectService._storageKey, -1 /* StorageScope.APPLICATION */);
        this._state = BisectState.fromJSON(raw);
        if (this._state) {
            const { mid, high } = this._state;
            for (let i = 0; i < this._state.extensions.length; i++) {
                const isDisabled = i >= mid && i < high;
                this._disabled.set(this._state.extensions[i], isDisabled);
            }
            logService.warn('extension BISECT active', [...this._disabled]);
        }
    }
    get isActive() {
        return !!this._state;
    }
    get disabledCount() {
        return this._state ? this._state.high - this._state.mid : -1;
    }
    isDisabledByBisect(extension) {
        if (!this._state) {
            // bisect isn't active
            return false;
        }
        if (isResolverExtension(extension.manifest, this._envService.remoteAuthority)) {
            // the current remote resolver extension cannot be disabled
            return false;
        }
        if (this._isEnabledInEnv(extension)) {
            // Extension enabled in env cannot be disabled
            return false;
        }
        const disabled = this._disabled.get(extension.identifier.id);
        return disabled ?? false;
    }
    _isEnabledInEnv(extension) {
        return Array.isArray(this._envService.enableExtensions) && this._envService.enableExtensions.some(id => areSameExtensions({ id }, extension.identifier));
    }
    async start(extensions) {
        if (this._state) {
            throw new Error('invalid state');
        }
        const extensionIds = extensions.map(ext => ext.identifier.id);
        const newState = new BisectState(extensionIds, 0, extensionIds.length, 0);
        this._storageService.store(ExtensionBisectService._storageKey, JSON.stringify(newState), -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
        await this._storageService.flush();
    }
    async next(seeingBad) {
        if (!this._state) {
            throw new Error('invalid state');
        }
        // check if bad when all extensions are disabled
        if (seeingBad && this._state.mid === 0 && this._state.high === this._state.extensions.length) {
            return { bad: true, id: '' };
        }
        // check if there is only one left
        if (this._state.low === this._state.high - 1) {
            await this.reset();
            return { id: this._state.extensions[this._state.low], bad: seeingBad };
        }
        // the second half is disabled so if there is still bad it must be
        // in the first half
        const nextState = new BisectState(this._state.extensions, seeingBad ? this._state.low : this._state.mid, seeingBad ? this._state.mid : this._state.high);
        this._storageService.store(ExtensionBisectService._storageKey, JSON.stringify(nextState), -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
        await this._storageService.flush();
        return undefined;
    }
    async reset() {
        this._storageService.remove(ExtensionBisectService._storageKey, -1 /* StorageScope.APPLICATION */);
        await this._storageService.flush();
    }
};
ExtensionBisectService = __decorate([
    __param(0, ILogService),
    __param(1, IStorageService),
    __param(2, IWorkbenchEnvironmentService)
], ExtensionBisectService);
registerSingleton(IExtensionBisectService, ExtensionBisectService, 1 /* InstantiationType.Delayed */);
// --- bisect UI
let ExtensionBisectUi = class ExtensionBisectUi {
    _extensionBisectService;
    _notificationService;
    _commandService;
    static ctxIsBisectActive = new RawContextKey('isExtensionBisectActive', false);
    constructor(contextKeyService, _extensionBisectService, _notificationService, _commandService) {
        this._extensionBisectService = _extensionBisectService;
        this._notificationService = _notificationService;
        this._commandService = _commandService;
        if (_extensionBisectService.isActive) {
            ExtensionBisectUi.ctxIsBisectActive.bindTo(contextKeyService).set(true);
            this._showBisectPrompt();
        }
    }
    _showBisectPrompt() {
        const goodPrompt = {
            label: 'Good now',
            run: () => this._commandService.executeCommand('extension.bisect.next', false)
        };
        const badPrompt = {
            label: 'This is bad',
            run: () => this._commandService.executeCommand('extension.bisect.next', true)
        };
        const stop = {
            label: 'Stop Bisect',
            run: () => this._commandService.executeCommand('extension.bisect.stop')
        };
        const message = this._extensionBisectService.disabledCount === 1
            ? localize('bisect.singular', "Extension Bisect is active and has disabled 1 extension. Check if you can still reproduce the problem and proceed by selecting from these options.")
            : localize('bisect.plural', "Extension Bisect is active and has disabled {0} extensions. Check if you can still reproduce the problem and proceed by selecting from these options.", this._extensionBisectService.disabledCount);
        this._notificationService.prompt(Severity.Info, message, [goodPrompt, badPrompt, stop], { sticky: true });
    }
};
ExtensionBisectUi = __decorate([
    __param(0, IContextKeyService),
    __param(1, IExtensionBisectService),
    __param(2, INotificationService),
    __param(3, ICommandService)
], ExtensionBisectUi);
Registry.as(Extensions.Workbench).registerWorkbenchContribution(ExtensionBisectUi, 3 /* LifecyclePhase.Restored */);
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: 'extension.bisect.start',
            title: { value: localize('title.start', "Start Extension Bisect"), original: 'Start Extension Bisect' },
            category: Categories.Help,
            f1: true,
            precondition: ExtensionBisectUi.ctxIsBisectActive.negate(),
            menu: {
                id: MenuId.ViewContainerTitle,
                when: ContextKeyExpr.equals('viewContainer', 'workbench.view.extensions'),
                group: '2_enablement',
                order: 4
            }
        });
    }
    async run(accessor) {
        const dialogService = accessor.get(IDialogService);
        const hostService = accessor.get(IHostService);
        const extensionManagement = accessor.get(IExtensionManagementService);
        const extensionEnablementService = accessor.get(IGlobalExtensionEnablementService);
        const extensionsBisect = accessor.get(IExtensionBisectService);
        const disabled = new Set(extensionEnablementService.getDisabledExtensions().map(id => id.id));
        const extensions = (await extensionManagement.getInstalled(1 /* ExtensionType.User */)).filter(ext => !disabled.has(ext.identifier.id));
        const res = await dialogService.confirm({
            message: localize('msg.start', "Extension Bisect"),
            detail: localize('detail.start', "Extension Bisect will use binary search to find an extension that causes a problem. During the process the window reloads repeatedly (~{0} times). Each time you must confirm if you are still seeing problems.", 2 + Math.log2(extensions.length) | 0),
            primaryButton: localize('msg2', "Start Extension Bisect")
        });
        if (res.confirmed) {
            await extensionsBisect.start(extensions);
            hostService.reload();
        }
    }
});
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: 'extension.bisect.next',
            title: { value: localize('title.isBad', "Continue Extension Bisect"), original: 'Continue Extension Bisect' },
            category: Categories.Help,
            f1: true,
            precondition: ExtensionBisectUi.ctxIsBisectActive
        });
    }
    async run(accessor, seeingBad) {
        const dialogService = accessor.get(IDialogService);
        const hostService = accessor.get(IHostService);
        const bisectService = accessor.get(IExtensionBisectService);
        const productService = accessor.get(IProductService);
        const extensionEnablementService = accessor.get(IGlobalExtensionEnablementService);
        const issueService = accessor.get(IWorkbenchIssueService);
        if (!bisectService.isActive) {
            return;
        }
        if (seeingBad === undefined) {
            const goodBadStopCancel = await this._checkForBad(dialogService, bisectService);
            if (goodBadStopCancel === null) {
                return;
            }
            seeingBad = goodBadStopCancel;
        }
        if (seeingBad === undefined) {
            await bisectService.reset();
            hostService.reload();
            return;
        }
        const done = await bisectService.next(seeingBad);
        if (!done) {
            hostService.reload();
            return;
        }
        if (done.bad) {
            // DONE but nothing found
            await dialogService.show(Severity.Info, localize('done.msg', "Extension Bisect"), undefined, {
                detail: localize('done.detail2', "Extension Bisect is done but no extension has been identified. This might be a problem with {0}.", productService.nameShort)
            });
        }
        else {
            // DONE and identified extension
            const res = await dialogService.show(Severity.Info, localize('done.msg', "Extension Bisect"), [localize('report', "Report Issue & Continue"), localize('done', "Continue")], {
                detail: localize('done.detail', "Extension Bisect is done and has identified {0} as the extension causing the problem.", done.id),
                checkbox: { label: localize('done.disbale', "Keep this extension disabled"), checked: true },
                cancelId: 1
            });
            if (res.checkboxChecked) {
                await extensionEnablementService.disableExtension({ id: done.id }, undefined);
            }
            if (res.choice === 0) {
                await issueService.openReporter({ extensionId: done.id });
            }
        }
        await bisectService.reset();
        hostService.reload();
    }
    async _checkForBad(dialogService, bisectService) {
        const options = {
            cancelId: 3,
            detail: localize('bisect', "Extension Bisect is active and has disabled {0} extensions. Check if you can still reproduce the problem and proceed by selecting from these options.", bisectService.disabledCount),
        };
        const res = await dialogService.show(Severity.Info, localize('msg.next', "Extension Bisect"), [localize('next.good', "Good now"), localize('next.bad', "This is bad"), localize('next.stop', "Stop Bisect"), localize('next.cancel', "Cancel")], options);
        switch (res.choice) {
            case 0: return false; //good now
            case 1: return true; //bad
            case 2: return undefined; //stop
        }
        return null; //cancel
    }
});
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: 'extension.bisect.stop',
            title: { value: localize('title.stop', "Stop Extension Bisect"), original: 'Stop Extension Bisect' },
            category: Categories.Help,
            f1: true,
            precondition: ExtensionBisectUi.ctxIsBisectActive
        });
    }
    async run(accessor) {
        const extensionsBisect = accessor.get(IExtensionBisectService);
        const hostService = accessor.get(IHostService);
        await extensionsBisect.reset();
        hostService.reload();
    }
});

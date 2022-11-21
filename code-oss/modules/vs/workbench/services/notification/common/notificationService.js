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
import { INotificationService, Severity, NoOpNotification, NeverShowAgainScope, NotificationsFilter } from 'vs/platform/notification/common/notification';
import { NotificationsModel, ChoiceAction } from 'vs/workbench/common/notifications';
import { Disposable, DisposableStore } from 'vs/base/common/lifecycle';
import { Emitter, Event } from 'vs/base/common/event';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { Action } from 'vs/base/common/actions';
import { IStorageService } from 'vs/platform/storage/common/storage';
let NotificationService = class NotificationService extends Disposable {
    storageService;
    model = this._register(new NotificationsModel());
    _onDidAddNotification = this._register(new Emitter());
    onDidAddNotification = this._onDidAddNotification.event;
    _onDidRemoveNotification = this._register(new Emitter());
    onDidRemoveNotification = this._onDidRemoveNotification.event;
    _onDidChangeDoNotDisturbMode = this._register(new Emitter());
    onDidChangeDoNotDisturbMode = this._onDidChangeDoNotDisturbMode.event;
    constructor(storageService) {
        super();
        this.storageService = storageService;
        this.updateDoNotDisturbFilters();
        this.registerListeners();
    }
    registerListeners() {
        this._register(this.model.onDidChangeNotification(e => {
            switch (e.kind) {
                case 0 /* NotificationChangeType.ADD */:
                case 3 /* NotificationChangeType.REMOVE */: {
                    const notification = {
                        message: e.item.message.original,
                        severity: e.item.severity,
                        source: typeof e.item.sourceId === 'string' && typeof e.item.source === 'string' ? { id: e.item.sourceId, label: e.item.source } : e.item.source,
                        silent: e.item.silent
                    };
                    if (e.kind === 0 /* NotificationChangeType.ADD */) {
                        this._onDidAddNotification.fire(notification);
                    }
                    if (e.kind === 3 /* NotificationChangeType.REMOVE */) {
                        this._onDidRemoveNotification.fire(notification);
                    }
                    break;
                }
            }
        }));
    }
    //#region Do not disturb mode
    static DND_SETTINGS_KEY = 'notifications.doNotDisturbMode';
    _doNotDisturbMode = this.storageService.getBoolean(NotificationService.DND_SETTINGS_KEY, -1 /* StorageScope.APPLICATION */, false);
    get doNotDisturbMode() {
        return this._doNotDisturbMode;
    }
    set doNotDisturbMode(enabled) {
        if (this._doNotDisturbMode === enabled) {
            return; // no change
        }
        this.storageService.store(NotificationService.DND_SETTINGS_KEY, enabled, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
        this._doNotDisturbMode = enabled;
        // Toggle via filter
        this.updateDoNotDisturbFilters();
        // Events
        this._onDidChangeDoNotDisturbMode.fire();
    }
    updateDoNotDisturbFilters() {
        let filter;
        if (this._doNotDisturbMode) {
            filter = NotificationsFilter.ERROR;
        }
        else {
            filter = NotificationsFilter.OFF;
        }
        this.model.setFilter(filter);
    }
    //#endregion
    info(message) {
        if (Array.isArray(message)) {
            message.forEach(m => this.info(m));
            return;
        }
        this.model.addNotification({ severity: Severity.Info, message });
    }
    warn(message) {
        if (Array.isArray(message)) {
            message.forEach(m => this.warn(m));
            return;
        }
        this.model.addNotification({ severity: Severity.Warning, message });
    }
    error(message) {
        if (Array.isArray(message)) {
            message.forEach(m => this.error(m));
            return;
        }
        this.model.addNotification({ severity: Severity.Error, message });
    }
    notify(notification) {
        const toDispose = new DisposableStore();
        // Handle neverShowAgain option accordingly
        if (notification.neverShowAgain) {
            const scope = this.toStorageScope(notification.neverShowAgain);
            const id = notification.neverShowAgain.id;
            // If the user already picked to not show the notification
            // again, we return with a no-op notification here
            if (this.storageService.getBoolean(id, scope)) {
                return new NoOpNotification();
            }
            const neverShowAgainAction = toDispose.add(new Action('workbench.notification.neverShowAgain', localize('neverShowAgain', "Don't Show Again"), undefined, true, async () => {
                // Close notification
                handle.close();
                // Remember choice
                this.storageService.store(id, true, scope, 0 /* StorageTarget.USER */);
            }));
            // Insert as primary or secondary action
            const actions = {
                primary: notification.actions?.primary || [],
                secondary: notification.actions?.secondary || []
            };
            if (!notification.neverShowAgain.isSecondary) {
                actions.primary = [neverShowAgainAction, ...actions.primary]; // action comes first
            }
            else {
                actions.secondary = [...actions.secondary, neverShowAgainAction]; // actions comes last
            }
            notification.actions = actions;
        }
        // Show notification
        const handle = this.model.addNotification(notification);
        // Cleanup when notification gets disposed
        Event.once(handle.onDidClose)(() => toDispose.dispose());
        return handle;
    }
    toStorageScope(options) {
        switch (options.scope) {
            case NeverShowAgainScope.APPLICATION:
                return -1 /* StorageScope.APPLICATION */;
            case NeverShowAgainScope.PROFILE:
                return 0 /* StorageScope.PROFILE */;
            case NeverShowAgainScope.WORKSPACE:
                return 1 /* StorageScope.WORKSPACE */;
            default:
                return -1 /* StorageScope.APPLICATION */;
        }
    }
    prompt(severity, message, choices, options) {
        const toDispose = new DisposableStore();
        // Handle neverShowAgain option accordingly
        if (options?.neverShowAgain) {
            const scope = this.toStorageScope(options.neverShowAgain);
            const id = options.neverShowAgain.id;
            // If the user already picked to not show the notification
            // again, we return with a no-op notification here
            if (this.storageService.getBoolean(id, scope)) {
                return new NoOpNotification();
            }
            const neverShowAgainChoice = {
                label: localize('neverShowAgain', "Don't Show Again"),
                run: () => this.storageService.store(id, true, scope, 0 /* StorageTarget.USER */),
                isSecondary: options.neverShowAgain.isSecondary
            };
            // Insert as primary or secondary action
            if (!options.neverShowAgain.isSecondary) {
                choices = [neverShowAgainChoice, ...choices]; // action comes first
            }
            else {
                choices = [...choices, neverShowAgainChoice]; // actions comes last
            }
        }
        let choiceClicked = false;
        // Convert choices into primary/secondary actions
        const primaryActions = [];
        const secondaryActions = [];
        choices.forEach((choice, index) => {
            const action = new ChoiceAction(`workbench.dialog.choice.${index}`, choice);
            if (!choice.isSecondary) {
                primaryActions.push(action);
            }
            else {
                secondaryActions.push(action);
            }
            // React to action being clicked
            toDispose.add(action.onDidRun(() => {
                choiceClicked = true;
                // Close notification unless we are told to keep open
                if (!choice.keepOpen) {
                    handle.close();
                }
            }));
            toDispose.add(action);
        });
        // Show notification with actions
        const actions = { primary: primaryActions, secondary: secondaryActions };
        const handle = this.notify({ severity, message, actions, sticky: options?.sticky, silent: options?.silent });
        Event.once(handle.onDidClose)(() => {
            // Cleanup when notification gets disposed
            toDispose.dispose();
            // Indicate cancellation to the outside if no action was executed
            if (options && typeof options.onCancel === 'function' && !choiceClicked) {
                options.onCancel();
            }
        });
        return handle;
    }
    status(message, options) {
        return this.model.showStatusMessage(message, options);
    }
};
NotificationService = __decorate([
    __param(0, IStorageService)
], NotificationService);
export { NotificationService };
registerSingleton(INotificationService, NotificationService, 1 /* InstantiationType.Delayed */);

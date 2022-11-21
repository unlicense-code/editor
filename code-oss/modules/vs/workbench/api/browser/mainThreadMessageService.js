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
import { toAction } from 'vs/base/common/actions';
import { MainContext } from '../common/extHost.protocol';
import { extHostNamedCustomer } from 'vs/workbench/services/extensions/common/extHostCustomers';
import { IDialogService } from 'vs/platform/dialogs/common/dialogs';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { Event } from 'vs/base/common/event';
import { ICommandService } from 'vs/platform/commands/common/commands';
let MainThreadMessageService = class MainThreadMessageService {
    _notificationService;
    _commandService;
    _dialogService;
    constructor(extHostContext, _notificationService, _commandService, _dialogService) {
        this._notificationService = _notificationService;
        this._commandService = _commandService;
        this._dialogService = _dialogService;
        //
    }
    dispose() {
        //
    }
    $showMessage(severity, message, options, commands) {
        if (options.modal) {
            return this._showModalMessage(severity, message, options.detail, commands, options.useCustom);
        }
        else {
            return this._showMessage(severity, message, commands, options);
        }
    }
    _showMessage(severity, message, commands, options) {
        return new Promise(resolve => {
            const primaryActions = commands.map(command => toAction({
                id: `_extension_message_handle_${command.handle}`,
                label: command.title,
                enabled: true,
                run: () => {
                    resolve(command.handle);
                    return Promise.resolve();
                }
            }));
            let source;
            if (options.source) {
                source = {
                    label: nls.localize('extensionSource', "{0} (Extension)", options.source.label),
                    id: options.source.identifier.value
                };
            }
            if (!source) {
                source = nls.localize('defaultSource', "Extension");
            }
            const secondaryActions = [];
            if (options.source) {
                secondaryActions.push(toAction({
                    id: options.source.identifier.value,
                    label: nls.localize('manageExtension', "Manage Extension"),
                    run: () => {
                        return this._commandService.executeCommand('_extensions.manage', options.source.identifier.value);
                    }
                }));
            }
            const messageHandle = this._notificationService.notify({
                severity,
                message,
                actions: { primary: primaryActions, secondary: secondaryActions },
                source
            });
            // if promise has not been resolved yet, now is the time to ensure a return value
            // otherwise if already resolved it means the user clicked one of the buttons
            Event.once(messageHandle.onDidClose)(() => {
                resolve(undefined);
            });
        });
    }
    async _showModalMessage(severity, message, detail, commands, useCustom) {
        let cancelId = undefined;
        const buttons = commands.map((command, index) => {
            if (command.isCloseAffordance === true) {
                cancelId = index;
            }
            return command.title;
        });
        if (cancelId === undefined) {
            if (buttons.length > 0) {
                buttons.push(nls.localize('cancel', "Cancel"));
            }
            else {
                buttons.push(nls.localize('ok', "OK"));
            }
            cancelId = buttons.length - 1;
        }
        const { choice } = await this._dialogService.show(severity, message, buttons, { cancelId, custom: useCustom, detail });
        return choice === commands.length ? undefined : commands[choice].handle;
    }
};
MainThreadMessageService = __decorate([
    extHostNamedCustomer(MainContext.MainThreadMessageService),
    __param(1, INotificationService),
    __param(2, ICommandService),
    __param(3, IDialogService)
], MainThreadMessageService);
export { MainThreadMessageService };

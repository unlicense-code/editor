/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { NoOpNotification, Severity } from 'vs/platform/notification/common/notification';
export class TestNotificationService {
    onDidAddNotification = Event.None;
    onDidRemoveNotification = Event.None;
    onDidChangeDoNotDisturbMode = Event.None;
    doNotDisturbMode = false;
    static NO_OP = new NoOpNotification();
    info(message) {
        return this.notify({ severity: Severity.Info, message });
    }
    warn(message) {
        return this.notify({ severity: Severity.Warning, message });
    }
    error(error) {
        return this.notify({ severity: Severity.Error, message: error });
    }
    notify(notification) {
        return TestNotificationService.NO_OP;
    }
    prompt(severity, message, choices, options) {
        return TestNotificationService.NO_OP;
    }
    status(message, options) {
        return Disposable.None;
    }
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { alert } from 'vs/base/browser/ui/aria/aria';
import { localize } from 'vs/nls';
import { Disposable } from 'vs/base/common/lifecycle';
import { toErrorMessage } from 'vs/base/common/errorMessage';
import { Severity } from 'vs/platform/notification/common/notification';
import { Event } from 'vs/base/common/event';
export class NotificationsAlerts extends Disposable {
    model;
    constructor(model) {
        super();
        this.model = model;
        // Alert initial notifications if any
        for (const notification of model.notifications) {
            this.triggerAriaAlert(notification);
        }
        this.registerListeners();
    }
    registerListeners() {
        this._register(this.model.onDidChangeNotification(e => this.onDidChangeNotification(e)));
    }
    onDidChangeNotification(e) {
        if (e.kind === 0 /* NotificationChangeType.ADD */) {
            // ARIA alert for screen readers
            this.triggerAriaAlert(e.item);
            // Always log errors to console with full details
            if (e.item.severity === Severity.Error) {
                if (e.item.message.original instanceof Error) {
                    console.error(e.item.message.original);
                }
                else {
                    console.error(toErrorMessage(e.item.message.linkedText.toString(), true));
                }
            }
        }
    }
    triggerAriaAlert(notification) {
        if (notification.silent) {
            return;
        }
        // Trigger the alert again whenever the message changes
        const listener = notification.onDidChangeContent(e => {
            if (e.kind === 1 /* NotificationViewItemContentChangeKind.MESSAGE */) {
                this.doTriggerAriaAlert(notification);
            }
        });
        Event.once(notification.onDidClose)(() => listener.dispose());
        this.doTriggerAriaAlert(notification);
    }
    doTriggerAriaAlert(notification) {
        let alertText;
        if (notification.severity === Severity.Error) {
            alertText = localize('alertErrorMessage', "Error: {0}", notification.message.linkedText.toString());
        }
        else if (notification.severity === Severity.Warning) {
            alertText = localize('alertWarningMessage', "Warning: {0}", notification.message.linkedText.toString());
        }
        else {
            alertText = localize('alertInfoMessage', "Info: {0}", notification.message.linkedText.toString());
        }
        alert(alertText);
    }
}

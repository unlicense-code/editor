/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as assert from 'assert';
import { MainThreadMessageService } from 'vs/workbench/api/browser/mainThreadMessageService';
import { NoOpNotification } from 'vs/platform/notification/common/notification';
import { mock } from 'vs/base/test/common/mock';
import { Disposable } from 'vs/base/common/lifecycle';
import { Event } from 'vs/base/common/event';
import { TestDialogService } from 'vs/platform/dialogs/test/common/testDialogService';
const emptyCommandService = {
    _serviceBrand: undefined,
    onWillExecuteCommand: () => Disposable.None,
    onDidExecuteCommand: () => Disposable.None,
    executeCommand: (commandId, ...args) => {
        return Promise.resolve(undefined);
    }
};
const emptyNotificationService = new class {
    doNotDisturbMode = false;
    onDidAddNotification = Event.None;
    onDidRemoveNotification = Event.None;
    onDidChangeDoNotDisturbMode = Event.None;
    notify(...args) {
        throw new Error('not implemented');
    }
    info(...args) {
        throw new Error('not implemented');
    }
    warn(...args) {
        throw new Error('not implemented');
    }
    error(...args) {
        throw new Error('not implemented');
    }
    prompt(severity, message, choices, options) {
        throw new Error('not implemented');
    }
    status(message, options) {
        return Disposable.None;
    }
};
class EmptyNotificationService {
    withNotify;
    doNotDisturbMode = false;
    constructor(withNotify) {
        this.withNotify = withNotify;
    }
    onDidAddNotification = Event.None;
    onDidRemoveNotification = Event.None;
    onDidChangeDoNotDisturbMode = Event.None;
    notify(notification) {
        this.withNotify(notification);
        return new NoOpNotification();
    }
    info(message) {
        throw new Error('Method not implemented.');
    }
    warn(message) {
        throw new Error('Method not implemented.');
    }
    error(message) {
        throw new Error('Method not implemented.');
    }
    prompt(severity, message, choices, options) {
        throw new Error('Method not implemented');
    }
    status(message, options) {
        return Disposable.None;
    }
}
suite('ExtHostMessageService', function () {
    test('propagte handle on select', async function () {
        const service = new MainThreadMessageService(null, new EmptyNotificationService(notification => {
            assert.strictEqual(notification.actions.primary.length, 1);
            queueMicrotask(() => notification.actions.primary[0].run());
        }), emptyCommandService, new TestDialogService());
        const handle = await service.$showMessage(1, 'h', {}, [{ handle: 42, title: 'a thing', isCloseAffordance: true }]);
        assert.strictEqual(handle, 42);
    });
    suite('modal', () => {
        test('calls dialog service', async () => {
            const service = new MainThreadMessageService(null, emptyNotificationService, emptyCommandService, new class extends mock() {
                show(severity, message, buttons) {
                    assert.strictEqual(severity, 1);
                    assert.strictEqual(message, 'h');
                    assert.strictEqual(buttons.length, 2);
                    assert.strictEqual(buttons[1], 'Cancel');
                    return Promise.resolve({ choice: 0 });
                }
            });
            const handle = await service.$showMessage(1, 'h', { modal: true }, [{ handle: 42, title: 'a thing', isCloseAffordance: false }]);
            assert.strictEqual(handle, 42);
        });
        test('returns undefined when cancelled', async () => {
            const service = new MainThreadMessageService(null, emptyNotificationService, emptyCommandService, new class extends mock() {
                show() {
                    return Promise.resolve({ choice: 1 });
                }
            });
            const handle = await service.$showMessage(1, 'h', { modal: true }, [{ handle: 42, title: 'a thing', isCloseAffordance: false }]);
            assert.strictEqual(handle, undefined);
        });
        test('hides Cancel button when not needed', async () => {
            const service = new MainThreadMessageService(null, emptyNotificationService, emptyCommandService, new class extends mock() {
                show(severity, message, buttons) {
                    assert.strictEqual(buttons.length, 1);
                    return Promise.resolve({ choice: 0 });
                }
            });
            const handle = await service.$showMessage(1, 'h', { modal: true }, [{ handle: 42, title: 'a thing', isCloseAffordance: true }]);
            assert.strictEqual(handle, 42);
        });
    });
});

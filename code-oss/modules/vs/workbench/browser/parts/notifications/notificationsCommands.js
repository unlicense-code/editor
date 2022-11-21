/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { CommandsRegistry } from 'vs/platform/commands/common/commands';
import { ContextKeyExpr } from 'vs/platform/contextkey/common/contextkey';
import { KeybindingsRegistry } from 'vs/platform/keybinding/common/keybindingsRegistry';
import { isNotificationViewItem } from 'vs/workbench/common/notifications';
import { MenuRegistry, MenuId } from 'vs/platform/actions/common/actions';
import { localize } from 'vs/nls';
import { IListService, WorkbenchList } from 'vs/platform/list/browser/listService';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { notificationToMetrics } from 'vs/workbench/browser/parts/notifications/notificationsTelemetry';
import { NotificationFocusedContext, NotificationsCenterVisibleContext, NotificationsToastsVisibleContext } from 'vs/workbench/common/contextkeys';
import { INotificationService } from 'vs/platform/notification/common/notification';
// Center
export const SHOW_NOTIFICATIONS_CENTER = 'notifications.showList';
export const HIDE_NOTIFICATIONS_CENTER = 'notifications.hideList';
const TOGGLE_NOTIFICATIONS_CENTER = 'notifications.toggleList';
// Toasts
export const HIDE_NOTIFICATION_TOAST = 'notifications.hideToasts';
const FOCUS_NOTIFICATION_TOAST = 'notifications.focusToasts';
const FOCUS_NEXT_NOTIFICATION_TOAST = 'notifications.focusNextToast';
const FOCUS_PREVIOUS_NOTIFICATION_TOAST = 'notifications.focusPreviousToast';
const FOCUS_FIRST_NOTIFICATION_TOAST = 'notifications.focusFirstToast';
const FOCUS_LAST_NOTIFICATION_TOAST = 'notifications.focusLastToast';
// Notification
export const COLLAPSE_NOTIFICATION = 'notification.collapse';
export const EXPAND_NOTIFICATION = 'notification.expand';
const TOGGLE_NOTIFICATION = 'notification.toggle';
export const CLEAR_NOTIFICATION = 'notification.clear';
export const CLEAR_ALL_NOTIFICATIONS = 'notifications.clearAll';
export const TOGGLE_DO_NOT_DISTURB_MODE = 'notifications.toggleDoNotDisturbMode';
export function registerNotificationCommands(center, toasts, model) {
    function getNotificationFromContext(listService, context) {
        if (isNotificationViewItem(context)) {
            return context;
        }
        const list = listService.lastFocusedList;
        if (list instanceof WorkbenchList) {
            const focusedElement = list.getFocusedElements()[0];
            if (isNotificationViewItem(focusedElement)) {
                return focusedElement;
            }
        }
        return undefined;
    }
    // Show Notifications Cneter
    CommandsRegistry.registerCommand(SHOW_NOTIFICATIONS_CENTER, () => {
        toasts.hide();
        center.show();
    });
    // Hide Notifications Center
    KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: HIDE_NOTIFICATIONS_CENTER,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 50,
        when: NotificationsCenterVisibleContext,
        primary: 9 /* KeyCode.Escape */,
        handler: accessor => {
            const telemetryService = accessor.get(ITelemetryService);
            for (const notification of model.notifications) {
                if (notification.visible) {
                    telemetryService.publicLog2('notification:hide', notificationToMetrics(notification.message.original, notification.sourceId, notification.silent));
                }
            }
            center.hide();
        }
    });
    // Toggle Notifications Center
    CommandsRegistry.registerCommand(TOGGLE_NOTIFICATIONS_CENTER, accessor => {
        if (center.isVisible) {
            center.hide();
        }
        else {
            toasts.hide();
            center.show();
        }
    });
    // Clear Notification
    KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: CLEAR_NOTIFICATION,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: NotificationFocusedContext,
        primary: 20 /* KeyCode.Delete */,
        mac: {
            primary: 2048 /* KeyMod.CtrlCmd */ | 1 /* KeyCode.Backspace */
        },
        handler: (accessor, args) => {
            const notification = getNotificationFromContext(accessor.get(IListService), args);
            if (notification && !notification.hasProgress) {
                notification.close();
            }
        }
    });
    // Expand Notification
    KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: EXPAND_NOTIFICATION,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: NotificationFocusedContext,
        primary: 17 /* KeyCode.RightArrow */,
        handler: (accessor, args) => {
            const notification = getNotificationFromContext(accessor.get(IListService), args);
            notification?.expand();
        }
    });
    // Collapse Notification
    KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: COLLAPSE_NOTIFICATION,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: NotificationFocusedContext,
        primary: 15 /* KeyCode.LeftArrow */,
        handler: (accessor, args) => {
            const notification = getNotificationFromContext(accessor.get(IListService), args);
            notification?.collapse();
        }
    });
    // Toggle Notification
    KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: TOGGLE_NOTIFICATION,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: NotificationFocusedContext,
        primary: 10 /* KeyCode.Space */,
        secondary: [3 /* KeyCode.Enter */],
        handler: accessor => {
            const notification = getNotificationFromContext(accessor.get(IListService));
            notification?.toggle();
        }
    });
    // Hide Toasts
    CommandsRegistry.registerCommand(HIDE_NOTIFICATION_TOAST, accessor => {
        const telemetryService = accessor.get(ITelemetryService);
        for (const notification of model.notifications) {
            if (notification.visible) {
                telemetryService.publicLog2('notification:hide', notificationToMetrics(notification.message.original, notification.sourceId, notification.silent));
            }
        }
        toasts.hide();
    });
    KeybindingsRegistry.registerKeybindingRule({
        id: HIDE_NOTIFICATION_TOAST,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ - 50,
        when: NotificationsToastsVisibleContext,
        primary: 9 /* KeyCode.Escape */
    });
    KeybindingsRegistry.registerKeybindingRule({
        id: HIDE_NOTIFICATION_TOAST,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 100,
        when: ContextKeyExpr.and(NotificationsToastsVisibleContext, NotificationFocusedContext),
        primary: 9 /* KeyCode.Escape */
    });
    // Focus Toasts
    CommandsRegistry.registerCommand(FOCUS_NOTIFICATION_TOAST, () => toasts.focus());
    // Focus Next Toast
    KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: FOCUS_NEXT_NOTIFICATION_TOAST,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: ContextKeyExpr.and(NotificationFocusedContext, NotificationsToastsVisibleContext),
        primary: 18 /* KeyCode.DownArrow */,
        handler: (accessor) => {
            toasts.focusNext();
        }
    });
    // Focus Previous Toast
    KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: FOCUS_PREVIOUS_NOTIFICATION_TOAST,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: ContextKeyExpr.and(NotificationFocusedContext, NotificationsToastsVisibleContext),
        primary: 16 /* KeyCode.UpArrow */,
        handler: (accessor) => {
            toasts.focusPrevious();
        }
    });
    // Focus First Toast
    KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: FOCUS_FIRST_NOTIFICATION_TOAST,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: ContextKeyExpr.and(NotificationFocusedContext, NotificationsToastsVisibleContext),
        primary: 11 /* KeyCode.PageUp */,
        secondary: [14 /* KeyCode.Home */],
        handler: (accessor) => {
            toasts.focusFirst();
        }
    });
    // Focus Last Toast
    KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: FOCUS_LAST_NOTIFICATION_TOAST,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: ContextKeyExpr.and(NotificationFocusedContext, NotificationsToastsVisibleContext),
        primary: 12 /* KeyCode.PageDown */,
        secondary: [13 /* KeyCode.End */],
        handler: (accessor) => {
            toasts.focusLast();
        }
    });
    // Clear All Notifications
    CommandsRegistry.registerCommand(CLEAR_ALL_NOTIFICATIONS, () => center.clearAll());
    // Toggle Do Not Disturb Mode
    CommandsRegistry.registerCommand(TOGGLE_DO_NOT_DISTURB_MODE, accessor => {
        const notificationService = accessor.get(INotificationService);
        notificationService.doNotDisturbMode = !notificationService.doNotDisturbMode;
    });
    // Commands for Command Palette
    const category = { value: localize('notifications', "Notifications"), original: 'Notifications' };
    MenuRegistry.appendMenuItem(MenuId.CommandPalette, { command: { id: SHOW_NOTIFICATIONS_CENTER, title: { value: localize('showNotifications', "Show Notifications"), original: 'Show Notifications' }, category } });
    MenuRegistry.appendMenuItem(MenuId.CommandPalette, { command: { id: HIDE_NOTIFICATIONS_CENTER, title: { value: localize('hideNotifications', "Hide Notifications"), original: 'Hide Notifications' }, category }, when: NotificationsCenterVisibleContext });
    MenuRegistry.appendMenuItem(MenuId.CommandPalette, { command: { id: CLEAR_ALL_NOTIFICATIONS, title: { value: localize('clearAllNotifications', "Clear All Notifications"), original: 'Clear All Notifications' }, category } });
    MenuRegistry.appendMenuItem(MenuId.CommandPalette, { command: { id: TOGGLE_DO_NOT_DISTURB_MODE, title: { value: localize('toggleDoNotDisturbMode', "Toggle Do Not Disturb Mode"), original: 'Toggle Do Not Disturb Mode' }, category } });
    MenuRegistry.appendMenuItem(MenuId.CommandPalette, { command: { id: FOCUS_NOTIFICATION_TOAST, title: { value: localize('focusNotificationToasts', "Focus Notification Toast"), original: 'Focus Notification Toast' }, category }, when: NotificationsToastsVisibleContext });
}

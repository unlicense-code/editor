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
import 'vs/css!./media/notificationsList';
import { localize } from 'vs/nls';
import { isAncestor, trackFocus } from 'vs/base/browser/dom';
import { WorkbenchList } from 'vs/platform/list/browser/listService';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { NOTIFICATIONS_LINKS, NOTIFICATIONS_BACKGROUND, NOTIFICATIONS_FOREGROUND, NOTIFICATIONS_ERROR_ICON_FOREGROUND, NOTIFICATIONS_WARNING_ICON_FOREGROUND, NOTIFICATIONS_INFO_ICON_FOREGROUND } from 'vs/workbench/common/theme';
import { IThemeService, registerThemingParticipant, Themable } from 'vs/platform/theme/common/themeService';
import { contrastBorder, focusBorder } from 'vs/platform/theme/common/colorRegistry';
import { NotificationsListDelegate, NotificationRenderer } from 'vs/workbench/browser/parts/notifications/notificationsViewer';
import { NotificationActionRunner, CopyNotificationMessageAction } from 'vs/workbench/browser/parts/notifications/notificationsActions';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { assertIsDefined, assertAllDefined } from 'vs/base/common/types';
import { Codicon } from 'vs/base/common/codicons';
import { NotificationFocusedContext } from 'vs/workbench/common/contextkeys';
let NotificationsList = class NotificationsList extends Themable {
    container;
    options;
    instantiationService;
    contextMenuService;
    listContainer;
    list;
    listDelegate;
    viewModel = [];
    isVisible;
    constructor(container, options, instantiationService, themeService, contextMenuService) {
        super(themeService);
        this.container = container;
        this.options = options;
        this.instantiationService = instantiationService;
        this.contextMenuService = contextMenuService;
    }
    show(focus) {
        if (this.isVisible) {
            if (focus) {
                const list = assertIsDefined(this.list);
                list.domFocus();
            }
            return; // already visible
        }
        // Lazily create if showing for the first time
        if (!this.list) {
            this.createNotificationsList();
        }
        // Make visible
        this.isVisible = true;
        // Focus
        if (focus) {
            const list = assertIsDefined(this.list);
            list.domFocus();
        }
    }
    createNotificationsList() {
        // List Container
        this.listContainer = document.createElement('div');
        this.listContainer.classList.add('notifications-list-container');
        const actionRunner = this._register(this.instantiationService.createInstance(NotificationActionRunner));
        // Notification Renderer
        const renderer = this.instantiationService.createInstance(NotificationRenderer, actionRunner);
        // List
        const listDelegate = this.listDelegate = new NotificationsListDelegate(this.listContainer);
        const options = this.options;
        const list = this.list = this._register(this.instantiationService.createInstance(WorkbenchList, 'NotificationsList', this.listContainer, listDelegate, [renderer], {
            ...options,
            setRowLineHeight: false,
            horizontalScrolling: false,
            overrideStyles: {
                listBackground: NOTIFICATIONS_BACKGROUND
            },
            accessibilityProvider: {
                getAriaLabel(element) {
                    if (!element.source) {
                        return localize('notificationAriaLabel', "{0}, notification", element.message.raw);
                    }
                    return localize('notificationWithSourceAriaLabel', "{0}, source: {1}, notification", element.message.raw, element.source);
                },
                getWidgetAriaLabel() {
                    return options.widgetAriaLabel ?? localize('notificationsList', "Notifications List");
                },
                getRole() {
                    return 'dialog'; // https://github.com/microsoft/vscode/issues/82728
                }
            }
        }));
        // Context menu to copy message
        const copyAction = this._register(this.instantiationService.createInstance(CopyNotificationMessageAction, CopyNotificationMessageAction.ID, CopyNotificationMessageAction.LABEL));
        this._register((list.onContextMenu(e => {
            if (!e.element) {
                return;
            }
            this.contextMenuService.showContextMenu({
                getAnchor: () => e.anchor,
                getActions: () => [copyAction],
                getActionsContext: () => e.element,
                actionRunner
            });
        })));
        // Toggle on double click
        this._register((list.onMouseDblClick(event => event.element.toggle())));
        // Clear focus when DOM focus moves out
        // Use document.hasFocus() to not clear the focus when the entire window lost focus
        // This ensures that when the focus comes back, the notification is still focused
        const listFocusTracker = this._register(trackFocus(list.getHTMLElement()));
        this._register(listFocusTracker.onDidBlur(() => {
            if (document.hasFocus()) {
                list.setFocus([]);
            }
        }));
        // Context key
        NotificationFocusedContext.bindTo(list.contextKeyService);
        // Only allow for focus in notifications, as the
        // selection is too strong over the contents of
        // the notification
        this._register(list.onDidChangeSelection(e => {
            if (e.indexes.length > 0) {
                list.setSelection([]);
            }
        }));
        this.container.appendChild(this.listContainer);
        this.updateStyles();
    }
    updateNotificationsList(start, deleteCount, items = []) {
        const [list, listContainer] = assertAllDefined(this.list, this.listContainer);
        const listHasDOMFocus = isAncestor(document.activeElement, listContainer);
        // Remember focus and relative top of that item
        const focusedIndex = list.getFocus()[0];
        const focusedItem = this.viewModel[focusedIndex];
        let focusRelativeTop = null;
        if (typeof focusedIndex === 'number') {
            focusRelativeTop = list.getRelativeTop(focusedIndex);
        }
        // Update view model
        this.viewModel.splice(start, deleteCount, ...items);
        // Update list
        list.splice(start, deleteCount, items);
        list.layout();
        // Hide if no more notifications to show
        if (this.viewModel.length === 0) {
            this.hide();
        }
        // Otherwise restore focus if we had
        else if (typeof focusedIndex === 'number') {
            let indexToFocus = 0;
            if (focusedItem) {
                let indexToFocusCandidate = this.viewModel.indexOf(focusedItem);
                if (indexToFocusCandidate === -1) {
                    indexToFocusCandidate = focusedIndex - 1; // item could have been removed
                }
                if (indexToFocusCandidate < this.viewModel.length && indexToFocusCandidate >= 0) {
                    indexToFocus = indexToFocusCandidate;
                }
            }
            if (typeof focusRelativeTop === 'number') {
                list.reveal(indexToFocus, focusRelativeTop);
            }
            list.setFocus([indexToFocus]);
        }
        // Restore DOM focus if we had focus before
        if (this.isVisible && listHasDOMFocus) {
            list.domFocus();
        }
    }
    updateNotificationHeight(item) {
        const index = this.viewModel.indexOf(item);
        if (index === -1) {
            return;
        }
        const [list, listDelegate] = assertAllDefined(this.list, this.listDelegate);
        list.updateElementHeight(index, listDelegate.getHeight(item));
        list.layout();
    }
    hide() {
        if (!this.isVisible || !this.list) {
            return; // already hidden
        }
        // Hide
        this.isVisible = false;
        // Clear list
        this.list.splice(0, this.viewModel.length);
        // Clear view model
        this.viewModel = [];
    }
    focusFirst() {
        if (!this.isVisible || !this.list) {
            return; // hidden
        }
        this.list.focusFirst();
        this.list.domFocus();
    }
    hasFocus() {
        if (!this.isVisible || !this.listContainer) {
            return false; // hidden
        }
        return isAncestor(document.activeElement, this.listContainer);
    }
    updateStyles() {
        if (this.listContainer) {
            const foreground = this.getColor(NOTIFICATIONS_FOREGROUND);
            this.listContainer.style.color = foreground ? foreground : '';
            const background = this.getColor(NOTIFICATIONS_BACKGROUND);
            this.listContainer.style.background = background ? background : '';
            const outlineColor = this.getColor(contrastBorder);
            this.listContainer.style.outlineColor = outlineColor ? outlineColor : '';
        }
    }
    layout(width, maxHeight) {
        if (this.listContainer && this.list) {
            this.listContainer.style.width = `${width}px`;
            if (typeof maxHeight === 'number') {
                this.list.getHTMLElement().style.maxHeight = `${maxHeight}px`;
            }
            this.list.layout();
        }
    }
    dispose() {
        this.hide();
        super.dispose();
    }
};
NotificationsList = __decorate([
    __param(2, IInstantiationService),
    __param(3, IThemeService),
    __param(4, IContextMenuService)
], NotificationsList);
export { NotificationsList };
registerThemingParticipant((theme, collector) => {
    const linkColor = theme.getColor(NOTIFICATIONS_LINKS);
    if (linkColor) {
        collector.addRule(`.monaco-workbench .notifications-list-container .notification-list-item .notification-list-item-message a { color: ${linkColor}; }`);
    }
    const focusOutline = theme.getColor(focusBorder);
    if (focusOutline) {
        collector.addRule(`
		.monaco-workbench .notifications-list-container .notification-list-item .notification-list-item-message a:focus {
			outline-color: ${focusOutline};
		}`);
    }
    // Notification Error Icon
    const notificationErrorIconForegroundColor = theme.getColor(NOTIFICATIONS_ERROR_ICON_FOREGROUND);
    if (notificationErrorIconForegroundColor) {
        collector.addRule(`
		.monaco-workbench .notifications-center ${Codicon.error.cssSelector},
		.monaco-workbench .notifications-toasts ${Codicon.error.cssSelector} {
			color: ${notificationErrorIconForegroundColor};
		}`);
    }
    // Notification Warning Icon
    const notificationWarningIconForegroundColor = theme.getColor(NOTIFICATIONS_WARNING_ICON_FOREGROUND);
    if (notificationWarningIconForegroundColor) {
        collector.addRule(`
		.monaco-workbench .notifications-center ${Codicon.warning.cssSelector},
		.monaco-workbench .notifications-toasts ${Codicon.warning.cssSelector} {
			color: ${notificationWarningIconForegroundColor};
		}`);
    }
    // Notification Info Icon
    const notificationInfoIconForegroundColor = theme.getColor(NOTIFICATIONS_INFO_ICON_FOREGROUND);
    if (notificationInfoIconForegroundColor) {
        collector.addRule(`
		.monaco-workbench .notifications-center ${Codicon.info.cssSelector},
		.monaco-workbench .notifications-toasts ${Codicon.info.cssSelector} {
			color: ${notificationInfoIconForegroundColor};
		}`);
    }
});

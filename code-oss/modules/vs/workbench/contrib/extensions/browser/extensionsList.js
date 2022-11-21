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
import 'vs/css!./media/extension';
import { append, $, addDisposableListener } from 'vs/base/browser/dom';
import { dispose, combinedDisposable } from 'vs/base/common/lifecycle';
import { ActionBar } from 'vs/base/browser/ui/actionbar/actionbar';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { Event } from 'vs/base/common/event';
import { ExtensionContainers, IExtensionsWorkbenchService } from 'vs/workbench/contrib/extensions/common/extensions';
import { ManageExtensionAction, ReloadAction, ExtensionStatusLabelAction, RemoteInstallAction, ExtensionStatusAction, LocalInstallAction, ActionWithDropDownAction, InstallDropdownAction, InstallingLabelAction, ExtensionActionWithDropdownActionViewItem, ExtensionDropDownAction, WebInstallAction, SwitchToPreReleaseVersionAction, SwitchToReleasedVersionAction, MigrateDeprecatedExtensionAction, SetLanguageAction, ClearLanguageAction, UpdateAction, SkipUpdateAction } from 'vs/workbench/contrib/extensions/browser/extensionsActions';
import { areSameExtensions } from 'vs/platform/extensionManagement/common/extensionManagementUtil';
import { RatingsWidget, InstallCountWidget, RecommendationWidget, RemoteBadgeWidget, ExtensionPackCountWidget as ExtensionPackBadgeWidget, SyncIgnoredWidget, ExtensionHoverWidget, ExtensionActivationStatusWidget, PreReleaseBookmarkWidget, extensionVerifiedPublisherIconColor } from 'vs/workbench/contrib/extensions/browser/extensionsWidgets';
import { IExtensionService, toExtension } from 'vs/workbench/services/extensions/common/extensions';
import { IExtensionManagementServerService } from 'vs/workbench/services/extensionManagement/common/extensionManagement';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { isLanguagePackExtension } from 'vs/platform/extensions/common/extensions';
import { registerThemingParticipant, ThemeIcon } from 'vs/platform/theme/common/themeService';
import { foreground, listActiveSelectionForeground, listActiveSelectionBackground, listInactiveSelectionForeground, listInactiveSelectionBackground, listFocusForeground, listFocusBackground, listHoverForeground, listHoverBackground } from 'vs/platform/theme/common/colorRegistry';
import { WORKBENCH_BACKGROUND } from 'vs/workbench/common/theme';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { verifiedPublisherIcon as verifiedPublisherThemeIcon } from 'vs/workbench/contrib/extensions/browser/extensionsIcons';
export const EXTENSION_LIST_ELEMENT_HEIGHT = 62;
export class Delegate {
    getHeight() { return EXTENSION_LIST_ELEMENT_HEIGHT; }
    getTemplateId() { return 'extension'; }
}
let Renderer = class Renderer {
    extensionViewState;
    options;
    instantiationService;
    notificationService;
    extensionService;
    extensionManagementServerService;
    extensionsWorkbenchService;
    contextMenuService;
    constructor(extensionViewState, options, instantiationService, notificationService, extensionService, extensionManagementServerService, extensionsWorkbenchService, contextMenuService) {
        this.extensionViewState = extensionViewState;
        this.options = options;
        this.instantiationService = instantiationService;
        this.notificationService = notificationService;
        this.extensionService = extensionService;
        this.extensionManagementServerService = extensionManagementServerService;
        this.extensionsWorkbenchService = extensionsWorkbenchService;
        this.contextMenuService = contextMenuService;
    }
    get templateId() { return 'extension'; }
    renderTemplate(root) {
        const recommendationWidget = this.instantiationService.createInstance(RecommendationWidget, append(root, $('.extension-bookmark-container')));
        const preReleaseWidget = this.instantiationService.createInstance(PreReleaseBookmarkWidget, append(root, $('.extension-bookmark-container')));
        const element = append(root, $('.extension-list-item'));
        const iconContainer = append(element, $('.icon-container'));
        const icon = append(iconContainer, $('img.icon'));
        const iconRemoteBadgeWidget = this.instantiationService.createInstance(RemoteBadgeWidget, iconContainer, false);
        const extensionPackBadgeWidget = this.instantiationService.createInstance(ExtensionPackBadgeWidget, iconContainer);
        const details = append(element, $('.details'));
        const headerContainer = append(details, $('.header-container'));
        const header = append(headerContainer, $('.header'));
        const name = append(header, $('span.name'));
        const installCount = append(header, $('span.install-count'));
        const ratings = append(header, $('span.ratings'));
        const syncIgnore = append(header, $('span.sync-ignored'));
        const activationStatus = append(header, $('span.activation-status'));
        const headerRemoteBadgeWidget = this.instantiationService.createInstance(RemoteBadgeWidget, header, false);
        const description = append(details, $('.description.ellipsis'));
        const footer = append(details, $('.footer'));
        const publisher = append(footer, $('.author.ellipsis'));
        const verifiedPublisherIcon = append(publisher, $(`.publisher-verified${ThemeIcon.asCSSSelector(verifiedPublisherThemeIcon)}`));
        const publisherDisplayName = append(publisher, $('.publisher-name.ellipsis'));
        const actionbar = new ActionBar(footer, {
            animated: false,
            actionViewItemProvider: (action) => {
                if (action instanceof ActionWithDropDownAction) {
                    return new ExtensionActionWithDropdownActionViewItem(action, { icon: true, label: true, menuActionsOrProvider: { getActions: () => action.menuActions }, menuActionClassNames: (action.class || '').split(' ') }, this.contextMenuService);
                }
                if (action instanceof ExtensionDropDownAction) {
                    return action.createActionViewItem();
                }
                return undefined;
            },
            focusOnlyEnabledItems: true
        });
        actionbar.setFocusable(false);
        actionbar.onDidRun(({ error }) => error && this.notificationService.error(error));
        const extensionStatusIconAction = this.instantiationService.createInstance(ExtensionStatusAction);
        const actions = [
            this.instantiationService.createInstance(ExtensionStatusLabelAction),
            this.instantiationService.createInstance(MigrateDeprecatedExtensionAction, true),
            this.instantiationService.createInstance(ReloadAction),
            this.instantiationService.createInstance(ActionWithDropDownAction, 'extensions.updateActions', '', [[this.instantiationService.createInstance(UpdateAction, false)], [this.instantiationService.createInstance(SkipUpdateAction)]]),
            this.instantiationService.createInstance(InstallDropdownAction),
            this.instantiationService.createInstance(InstallingLabelAction),
            this.instantiationService.createInstance(SetLanguageAction),
            this.instantiationService.createInstance(ClearLanguageAction),
            this.instantiationService.createInstance(RemoteInstallAction, false),
            this.instantiationService.createInstance(LocalInstallAction),
            this.instantiationService.createInstance(WebInstallAction),
            extensionStatusIconAction,
            this.instantiationService.createInstance(SwitchToReleasedVersionAction, true),
            this.instantiationService.createInstance(SwitchToPreReleaseVersionAction, true),
            this.instantiationService.createInstance(ManageExtensionAction)
        ];
        const extensionHoverWidget = this.instantiationService.createInstance(ExtensionHoverWidget, { target: root, position: this.options.hoverOptions.position }, extensionStatusIconAction);
        const widgets = [
            recommendationWidget,
            preReleaseWidget,
            iconRemoteBadgeWidget,
            extensionPackBadgeWidget,
            headerRemoteBadgeWidget,
            extensionHoverWidget,
            this.instantiationService.createInstance(SyncIgnoredWidget, syncIgnore),
            this.instantiationService.createInstance(ExtensionActivationStatusWidget, activationStatus, true),
            this.instantiationService.createInstance(InstallCountWidget, installCount, true),
            this.instantiationService.createInstance(RatingsWidget, ratings, true),
        ];
        const extensionContainers = this.instantiationService.createInstance(ExtensionContainers, [...actions, ...widgets]);
        actionbar.push(actions, { icon: true, label: true });
        const disposable = combinedDisposable(...actions, ...widgets, actionbar, extensionContainers);
        return {
            root, element, icon, name, installCount, ratings, description, publisherDisplayName, verifiedPublisherIcon, disposables: [disposable], actionbar,
            extensionDisposables: [],
            set extension(extension) {
                extensionContainers.extension = extension;
            }
        };
    }
    renderPlaceholder(index, data) {
        data.element.classList.add('loading');
        data.root.removeAttribute('aria-label');
        data.root.removeAttribute('data-extension-id');
        data.extensionDisposables = dispose(data.extensionDisposables);
        data.icon.src = '';
        data.name.textContent = '';
        data.description.textContent = '';
        data.publisherDisplayName.textContent = '';
        data.verifiedPublisherIcon.style.display = 'none';
        data.installCount.style.display = 'none';
        data.ratings.style.display = 'none';
        data.extension = null;
    }
    renderElement(extension, index, data) {
        data.element.classList.remove('loading');
        data.root.setAttribute('data-extension-id', extension.identifier.id);
        if (extension.state !== 3 /* ExtensionState.Uninstalled */ && !extension.server) {
            // Get the extension if it is installed and has no server information
            extension = this.extensionsWorkbenchService.local.filter(e => e.server === extension.server && areSameExtensions(e.identifier, extension.identifier))[0] || extension;
        }
        data.extensionDisposables = dispose(data.extensionDisposables);
        const computeEnablement = async () => {
            if (extension.state === 3 /* ExtensionState.Uninstalled */) {
                if (!!extension.deprecationInfo) {
                    return true;
                }
                if (this.extensionsWorkbenchService.canSetLanguage(extension)) {
                    return false;
                }
                return !(await this.extensionsWorkbenchService.canInstall(extension));
            }
            else if (extension.local && !isLanguagePackExtension(extension.local.manifest)) {
                const runningExtension = this.extensionService.extensions.filter(e => areSameExtensions({ id: e.identifier.value, uuid: e.uuid }, extension.identifier))[0];
                return !(runningExtension && extension.server === this.extensionManagementServerService.getExtensionManagementServer(toExtension(runningExtension)));
            }
            return false;
        };
        const updateEnablement = async () => {
            const disabled = await computeEnablement();
            const deprecated = !!extension.deprecationInfo;
            data.element.classList.toggle('deprecated', deprecated);
            data.root.classList.toggle('disabled', disabled);
        };
        updateEnablement();
        this.extensionService.onDidChangeExtensions(() => updateEnablement(), this, data.extensionDisposables);
        data.extensionDisposables.push(addDisposableListener(data.icon, 'error', () => data.icon.src = extension.iconUrlFallback, { once: true }));
        data.icon.src = extension.iconUrl;
        if (!data.icon.complete) {
            data.icon.style.visibility = 'hidden';
            data.icon.onload = () => data.icon.style.visibility = 'inherit';
        }
        else {
            data.icon.style.visibility = 'inherit';
        }
        data.name.textContent = extension.displayName;
        data.description.textContent = extension.description;
        const updatePublisher = () => {
            data.publisherDisplayName.textContent = extension.publisherDisplayName;
            data.verifiedPublisherIcon.style.display = extension.publisherDomain?.verified ? 'inherit' : 'none';
        };
        updatePublisher();
        Event.filter(this.extensionsWorkbenchService.onChange, e => !!e && areSameExtensions(e.identifier, extension.identifier))(() => updatePublisher(), this, data.extensionDisposables);
        data.installCount.style.display = '';
        data.ratings.style.display = '';
        data.extension = extension;
        if (extension.gallery && extension.gallery.properties && extension.gallery.properties.localizedLanguages && extension.gallery.properties.localizedLanguages.length) {
            data.description.textContent = extension.gallery.properties.localizedLanguages.map(name => name[0].toLocaleUpperCase() + name.slice(1)).join(', ');
        }
        this.extensionViewState.onFocus(e => {
            if (areSameExtensions(extension.identifier, e.identifier)) {
                data.actionbar.setFocusable(true);
            }
        }, this, data.extensionDisposables);
        this.extensionViewState.onBlur(e => {
            if (areSameExtensions(extension.identifier, e.identifier)) {
                data.actionbar.setFocusable(false);
            }
        }, this, data.extensionDisposables);
    }
    disposeElement(extension, index, data) {
        data.extensionDisposables = dispose(data.extensionDisposables);
    }
    disposeTemplate(data) {
        data.extensionDisposables = dispose(data.extensionDisposables);
        data.disposables = dispose(data.disposables);
    }
};
Renderer = __decorate([
    __param(2, IInstantiationService),
    __param(3, INotificationService),
    __param(4, IExtensionService),
    __param(5, IExtensionManagementServerService),
    __param(6, IExtensionsWorkbenchService),
    __param(7, IContextMenuService)
], Renderer);
export { Renderer };
registerThemingParticipant((theme, collector) => {
    const foregroundColor = theme.getColor(foreground);
    if (foregroundColor) {
        const authorForeground = foregroundColor.transparent(.9).makeOpaque(WORKBENCH_BACKGROUND(theme));
        collector.addRule(`.extensions-list .monaco-list .monaco-list-row:not(.disabled) .author { color: ${authorForeground}; }`);
        const disabledExtensionForeground = foregroundColor.transparent(.5).makeOpaque(WORKBENCH_BACKGROUND(theme));
        collector.addRule(`.extensions-list .monaco-list .monaco-list-row.disabled { color: ${disabledExtensionForeground}; }`);
    }
    const listActiveSelectionForegroundColor = theme.getColor(listActiveSelectionForeground);
    if (listActiveSelectionForegroundColor) {
        const backgroundColor = theme.getColor(listActiveSelectionBackground) || WORKBENCH_BACKGROUND(theme);
        const authorForeground = listActiveSelectionForegroundColor.transparent(.9).makeOpaque(backgroundColor);
        collector.addRule(`.extensions-list .monaco-list:focus .monaco-list-row:not(.disabled).focused.selected .author { color: ${authorForeground}; }`);
        collector.addRule(`.extensions-list .monaco-list:focus .monaco-list-row:not(.disabled).selected .author { color: ${authorForeground}; }`);
        const disabledExtensionForeground = listActiveSelectionForegroundColor.transparent(.5).makeOpaque(backgroundColor);
        collector.addRule(`.extensions-list .monaco-list:focus .monaco-list-row.disabled.focused.selected { color: ${disabledExtensionForeground}; }`);
        collector.addRule(`.extensions-list .monaco-list:focus .monaco-list-row.disabled.selected { color: ${disabledExtensionForeground}; }`);
    }
    const listInactiveSelectionForegroundColor = theme.getColor(listInactiveSelectionForeground);
    if (listInactiveSelectionForegroundColor) {
        const backgroundColor = theme.getColor(listInactiveSelectionBackground) || WORKBENCH_BACKGROUND(theme);
        const authorForeground = listInactiveSelectionForegroundColor.transparent(.9).makeOpaque(backgroundColor);
        collector.addRule(`.extensions-list .monaco-list .monaco-list-row:not(.disabled).selected .author { color: ${authorForeground}; }`);
        const disabledExtensionForeground = listInactiveSelectionForegroundColor.transparent(.5).makeOpaque(backgroundColor);
        collector.addRule(`.extensions-list .monaco-list .monaco-list-row.disabled.selected { color: ${disabledExtensionForeground}; }`);
    }
    const listFocusForegroundColor = theme.getColor(listFocusForeground);
    if (listFocusForegroundColor) {
        const backgroundColor = theme.getColor(listFocusBackground) || WORKBENCH_BACKGROUND(theme);
        const authorForeground = listFocusForegroundColor.transparent(.9).makeOpaque(backgroundColor);
        collector.addRule(`.extensions-list .monaco-list:focus .monaco-list-row:not(.disabled).focused .author { color: ${authorForeground}; }`);
        const disabledExtensionForeground = listFocusForegroundColor.transparent(.5).makeOpaque(backgroundColor);
        collector.addRule(`.extensions-list .monaco-list:focus .monaco-list-row.disabled.focused { color: ${disabledExtensionForeground}; }`);
    }
    const listHoverForegroundColor = theme.getColor(listHoverForeground);
    if (listHoverForegroundColor) {
        const backgroundColor = theme.getColor(listHoverBackground) || WORKBENCH_BACKGROUND(theme);
        const authorForeground = listHoverForegroundColor.transparent(.9).makeOpaque(backgroundColor);
        collector.addRule(`.extensions-list .monaco-list .monaco-list-row:hover:not(.disabled):not(.selected):.not(.focused) .author { color: ${authorForeground}; }`);
        const disabledExtensionForeground = listHoverForegroundColor.transparent(.5).makeOpaque(backgroundColor);
        collector.addRule(`.extensions-list .monaco-list .monaco-list-row.disabled:hover:not(.selected):.not(.focused) { color: ${disabledExtensionForeground}; }`);
    }
    const verifiedPublisherIconColor = theme.getColor(extensionVerifiedPublisherIconColor);
    if (verifiedPublisherIconColor) {
        const disabledVerifiedPublisherIconColor = verifiedPublisherIconColor.transparent(.5).makeOpaque(WORKBENCH_BACKGROUND(theme));
        collector.addRule(`.extensions-list .monaco-list .monaco-list-row.disabled .author .publisher-verified${ThemeIcon.asCSSSelector(verifiedPublisherThemeIcon)} { color: ${disabledVerifiedPublisherIconColor}; }`);
    }
});
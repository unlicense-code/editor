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
import 'vs/css!./media/basepanelpart';
import 'vs/css!./media/panelpart';
import { localize } from 'vs/nls';
import { Separator, toAction } from 'vs/base/common/actions';
import { Event } from 'vs/base/common/event';
import { Registry } from 'vs/platform/registry/common/platform';
import { prepareActions } from 'vs/base/browser/ui/actionbar/actionbar';
import { ActivePanelContext, PanelFocusContext, getEnabledViewContainerContextKey } from 'vs/workbench/common/contextkeys';
import { CompositePart } from 'vs/workbench/browser/parts/compositePart';
import { IWorkbenchLayoutService } from 'vs/workbench/services/layout/browser/layoutService';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { PanelActivityAction, TogglePanelAction, PlaceHolderPanelActivityAction, PlaceHolderToggleCompositePinnedAction, PositionPanelActionConfigs, SetPanelPositionAction } from 'vs/workbench/browser/parts/panel/panelActions';
import { IThemeService, ThemeIcon } from 'vs/platform/theme/common/themeService';
import { PANEL_BACKGROUND, PANEL_BORDER, PANEL_ACTIVE_TITLE_FOREGROUND, PANEL_INACTIVE_TITLE_FOREGROUND, PANEL_ACTIVE_TITLE_BORDER, EDITOR_DRAG_AND_DROP_BACKGROUND, PANEL_DRAG_AND_DROP_BORDER } from 'vs/workbench/common/theme';
import { contrastBorder, badgeBackground, badgeForeground } from 'vs/platform/theme/common/colorRegistry';
import { CompositeBar, CompositeDragAndDrop } from 'vs/workbench/browser/parts/compositeBar';
import { ToggleCompositePinnedAction } from 'vs/workbench/browser/parts/compositeBarActions';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { Dimension, trackFocus, EventHelper, $, asCSSUrl, createCSSRule } from 'vs/base/browser/dom';
import { DisposableStore } from 'vs/base/common/lifecycle';
import { IContextKeyService, ContextKeyExpr } from 'vs/platform/contextkey/common/contextkey';
import { isUndefinedOrNull, assertIsDefined } from 'vs/base/common/types';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { IViewDescriptorService } from 'vs/workbench/common/views';
import { CompositeDragAndDropObserver, toggleDropEffect } from 'vs/workbench/browser/dnd';
import { Extensions as PaneCompositeExtensions } from 'vs/workbench/browser/panecomposite';
import { CompositeMenuActions } from 'vs/workbench/browser/actions';
import { MenuId } from 'vs/platform/actions/common/actions';
import { StringSHA1 } from 'vs/base/common/hash';
import { URI } from 'vs/base/common/uri';
import { ToolBar } from 'vs/base/browser/ui/toolbar/toolbar';
import { ICommandService } from 'vs/platform/commands/common/commands';
let BasePanelPart = class BasePanelPart extends CompositePart {
    viewDescriptorService;
    contextKeyService;
    extensionService;
    partId;
    pinnedPanelsKey;
    placeholdeViewContainersKey;
    backgroundColor;
    viewContainerLocation;
    activePanelContextKey;
    panelFocusContextKey;
    panelOptions;
    static MIN_COMPOSITE_BAR_WIDTH = 50;
    //#region IView
    minimumWidth = 300;
    maximumWidth = Number.POSITIVE_INFINITY;
    minimumHeight = 77;
    maximumHeight = Number.POSITIVE_INFINITY;
    snap = true;
    get preferredHeight() {
        // Don't worry about titlebar or statusbar visibility
        // The difference is minimal and keeps this function clean
        return this.layoutService.dimension.height * 0.4;
    }
    get preferredWidth() {
        const activeComposite = this.getActivePaneComposite();
        if (!activeComposite) {
            return;
        }
        const width = activeComposite.getOptimalWidth();
        if (typeof width !== 'number') {
            return;
        }
        return Math.max(width, 300);
    }
    //#endregion
    get onDidPaneCompositeOpen() { return Event.map(this.onDidCompositeOpen.event, compositeEvent => compositeEvent.composite); }
    onDidPaneCompositeClose = this.onDidCompositeClose.event;
    compositeBar;
    compositeActions = new Map();
    globalToolBar;
    globalActions;
    panelDisposables = new Map();
    blockOpeningPanel = false;
    contentDimension;
    extensionsRegistered = false;
    panelRegistry;
    dndHandler;
    enabledViewContainersContextKeys = new Map();
    constructor(notificationService, storageService, telemetryService, contextMenuService, layoutService, keybindingService, instantiationService, themeService, viewDescriptorService, contextKeyService, extensionService, partId, activePanelSettingsKey, pinnedPanelsKey, placeholdeViewContainersKey, panelRegistryId, backgroundColor, viewContainerLocation, activePanelContextKey, panelFocusContextKey, panelOptions) {
        super(notificationService, storageService, telemetryService, contextMenuService, layoutService, keybindingService, instantiationService, themeService, Registry.as(panelRegistryId), activePanelSettingsKey, viewDescriptorService.getDefaultViewContainer(viewContainerLocation)?.id || '', 'panel', 'panel', undefined, partId, panelOptions);
        this.viewDescriptorService = viewDescriptorService;
        this.contextKeyService = contextKeyService;
        this.extensionService = extensionService;
        this.partId = partId;
        this.pinnedPanelsKey = pinnedPanelsKey;
        this.placeholdeViewContainersKey = placeholdeViewContainersKey;
        this.backgroundColor = backgroundColor;
        this.viewContainerLocation = viewContainerLocation;
        this.activePanelContextKey = activePanelContextKey;
        this.panelFocusContextKey = panelFocusContextKey;
        this.panelOptions = panelOptions;
        this.panelRegistry = Registry.as(panelRegistryId);
        this.dndHandler = new CompositeDragAndDrop(this.viewDescriptorService, this.viewContainerLocation, (id, focus) => this.openPaneComposite(id, focus).then(panel => panel || null), (from, to, before) => this.compositeBar.move(from, to, before?.horizontallyBefore), () => this.compositeBar.getCompositeBarItems());
        this.compositeBar = this._register(this.instantiationService.createInstance(CompositeBar, this.getCachedPanels(), {
            icon: !!this.panelOptions.useIcons,
            orientation: 0 /* ActionsOrientation.HORIZONTAL */,
            activityHoverOptions: this.getActivityHoverOptions(),
            openComposite: (compositeId, preserveFocus) => this.openPaneComposite(compositeId, !preserveFocus).then(panel => panel || null),
            getActivityAction: compositeId => this.getCompositeActions(compositeId).activityAction,
            getCompositePinnedAction: compositeId => this.getCompositeActions(compositeId).pinnedAction,
            getOnCompositeClickAction: compositeId => this.instantiationService.createInstance(PanelActivityAction, assertIsDefined(this.getPaneComposite(compositeId)), this.viewContainerLocation),
            fillExtraContextMenuActions: actions => this.fillExtraContextMenuActions(actions),
            getContextMenuActionsForComposite: compositeId => this.getContextMenuActionsForComposite(compositeId),
            getDefaultCompositeId: () => viewDescriptorService.getDefaultViewContainer(this.viewContainerLocation)?.id,
            hidePart: () => this.layoutService.setPartHidden(true, this.partId),
            dndHandler: this.dndHandler,
            compositeSize: 0,
            overflowActionSize: 44,
            colors: theme => ({
                activeBackgroundColor: theme.getColor(this.backgroundColor),
                inactiveBackgroundColor: theme.getColor(this.backgroundColor),
                activeBorderBottomColor: theme.getColor(PANEL_ACTIVE_TITLE_BORDER),
                activeForegroundColor: theme.getColor(PANEL_ACTIVE_TITLE_FOREGROUND),
                inactiveForegroundColor: theme.getColor(PANEL_INACTIVE_TITLE_FOREGROUND),
                badgeBackground: theme.getColor(badgeBackground),
                badgeForeground: theme.getColor(badgeForeground),
                dragAndDropBorder: theme.getColor(PANEL_DRAG_AND_DROP_BORDER)
            })
        }));
        this.registerListeners();
        this.onDidRegisterPanels([...this.getPaneComposites()]);
        // Global Panel Actions
        this.globalActions = this._register(this.instantiationService.createInstance(CompositeMenuActions, partId === "workbench.parts.panel" /* Parts.PANEL_PART */ ? MenuId.PanelTitle : MenuId.AuxiliaryBarTitle, undefined, undefined));
        this._register(this.globalActions.onDidChange(() => this.updateGlobalToolbarActions()));
    }
    getContextMenuActionsForComposite(compositeId) {
        const result = [];
        const viewContainer = this.viewDescriptorService.getViewContainerById(compositeId);
        const defaultLocation = this.viewDescriptorService.getDefaultViewContainerLocation(viewContainer);
        if (defaultLocation !== this.viewDescriptorService.getViewContainerLocation(viewContainer)) {
            result.push(toAction({ id: 'resetLocationAction', label: localize('resetLocation', "Reset Location"), run: () => this.viewDescriptorService.moveViewContainerToLocation(viewContainer, defaultLocation) }));
        }
        else {
            const viewContainerModel = this.viewDescriptorService.getViewContainerModel(viewContainer);
            if (viewContainerModel.allViewDescriptors.length === 1) {
                const viewToReset = viewContainerModel.allViewDescriptors[0];
                const defaultContainer = this.viewDescriptorService.getDefaultContainerById(viewToReset.id);
                if (defaultContainer !== viewContainer) {
                    result.push(toAction({ id: 'resetLocationAction', label: localize('resetLocation', "Reset Location"), run: () => this.viewDescriptorService.moveViewsToContainer([viewToReset], defaultContainer) }));
                }
            }
        }
        return result;
    }
    onDidRegisterPanels(panels) {
        const cachedPanels = this.getCachedPanels();
        for (const panel of panels) {
            const cachedPanel = cachedPanels.filter(({ id }) => id === panel.id)[0];
            const activePanel = this.getActivePaneComposite();
            const isActive = activePanel?.getId() === panel.id ||
                (this.extensionsRegistered && this.compositeBar.getVisibleComposites().length === 0);
            if (isActive || !this.shouldBeHidden(panel.id, cachedPanel)) {
                // Override order
                const newPanel = {
                    id: panel.id,
                    name: panel.name,
                    order: panel.order,
                    requestedIndex: panel.requestedIndex
                };
                this.compositeBar.addComposite(newPanel);
                // Pin it by default if it is new
                if (!cachedPanel) {
                    this.compositeBar.pin(panel.id);
                }
                if (isActive) {
                    this.compositeBar.activateComposite(panel.id);
                    // Only try to open the panel if it has been created and visible
                    if (!activePanel && this.element && this.layoutService.isVisible(this.partId)) {
                        this.doOpenPanel(panel.id);
                    }
                }
            }
        }
        for (const panel of panels) {
            const viewContainer = this.getViewContainer(panel.id);
            const viewContainerModel = this.viewDescriptorService.getViewContainerModel(viewContainer);
            this.updateActivity(viewContainer, viewContainerModel);
            this.showOrHideViewContainer(viewContainer, viewContainerModel);
            const disposables = new DisposableStore();
            disposables.add(viewContainerModel.onDidChangeActiveViewDescriptors(() => this.showOrHideViewContainer(viewContainer, viewContainerModel)));
            disposables.add(viewContainerModel.onDidChangeContainerInfo(() => this.updateActivity(viewContainer, viewContainerModel)));
            this.panelDisposables.set(panel.id, disposables);
        }
    }
    async onDidDeregisterPanel(panelId) {
        const disposable = this.panelDisposables.get(panelId);
        disposable?.dispose();
        this.panelDisposables.delete(panelId);
        const activeContainers = this.viewDescriptorService.getViewContainersByLocation(this.viewContainerLocation)
            .filter(container => this.viewDescriptorService.getViewContainerModel(container).activeViewDescriptors.length > 0);
        if (activeContainers.length) {
            if (this.getActivePaneComposite()?.getId() === panelId) {
                const defaultPanelId = this.viewDescriptorService.getDefaultViewContainer(this.viewContainerLocation)?.id;
                const containerToOpen = activeContainers.filter(c => c.id === defaultPanelId)[0] || activeContainers[0];
                await this.openPaneComposite(containerToOpen.id);
            }
        }
        else {
            this.layoutService.setPartHidden(true, this.partId);
        }
        this.removeComposite(panelId);
    }
    updateActivity(viewContainer, viewContainerModel) {
        const cachedTitle = this.getPlaceholderViewContainers().filter(panel => panel.id === viewContainer.id)[0]?.name;
        const activity = {
            id: viewContainer.id,
            name: this.extensionsRegistered || cachedTitle === undefined ? viewContainerModel.title : cachedTitle,
            keybindingId: viewContainerModel.keybindingId
        };
        const { activityAction, pinnedAction } = this.getCompositeActions(viewContainer.id);
        activityAction.setActivity(this.toActivity(viewContainerModel));
        if (pinnedAction instanceof PlaceHolderToggleCompositePinnedAction) {
            pinnedAction.setActivity(activity);
        }
        // Composite Bar Swither needs to refresh tabs sizes and overflow action
        this.compositeBar.recomputeSizes();
        this.layoutCompositeBar();
        // only update our cached panel info after extensions are done registering
        if (this.extensionsRegistered) {
            this.saveCachedPanels();
        }
    }
    toActivity(viewContainerModel) {
        return BasePanelPart.toActivity(viewContainerModel.viewContainer.id, viewContainerModel.title, this.panelOptions.useIcons ? viewContainerModel.icon : undefined, viewContainerModel.keybindingId);
    }
    static toActivity(id, name, icon, keybindingId) {
        let cssClass = undefined;
        let iconUrl = undefined;
        if (URI.isUri(icon)) {
            iconUrl = icon;
            const cssUrl = asCSSUrl(icon);
            const hash = new StringSHA1();
            hash.update(cssUrl);
            cssClass = `activity-${id.replace(/\./g, '-')}-${hash.digest()}`;
            const iconClass = `.monaco-workbench .basepanel .monaco-action-bar .action-label.${cssClass}`;
            createCSSRule(iconClass, `
				mask: ${cssUrl} no-repeat 50% 50%;
				mask-size: 16px;
				-webkit-mask: ${cssUrl} no-repeat 50% 50%;
				-webkit-mask-size: 16px;
				mask-origin: padding;
				-webkit-mask-origin: padding;
			`);
        }
        else if (ThemeIcon.isThemeIcon(icon)) {
            cssClass = ThemeIcon.asClassName(icon);
        }
        return { id, name, cssClass, iconUrl, keybindingId };
    }
    showOrHideViewContainer(viewContainer, viewContainerModel) {
        let contextKey = this.enabledViewContainersContextKeys.get(viewContainer.id);
        if (!contextKey) {
            contextKey = this.contextKeyService.createKey(getEnabledViewContainerContextKey(viewContainer.id), false);
            this.enabledViewContainersContextKeys.set(viewContainer.id, contextKey);
        }
        if (viewContainerModel.activeViewDescriptors.length) {
            contextKey.set(true);
            this.compositeBar.addComposite({ id: viewContainer.id, name: typeof viewContainer.title === 'string' ? viewContainer.title : viewContainer.title.value, order: viewContainer.order, requestedIndex: viewContainer.requestedIndex });
            if (this.layoutService.isRestored() && this.layoutService.isVisible(this.partId)) {
                const activeComposite = this.getActiveComposite();
                if (activeComposite === undefined || activeComposite.getId() === viewContainer.id) {
                    this.compositeBar.activateComposite(viewContainer.id);
                }
            }
            this.layoutCompositeBar();
            this.layoutEmptyMessage();
        }
        else if (viewContainer.hideIfEmpty) {
            contextKey.set(false);
            this.hideComposite(viewContainer.id);
        }
    }
    shouldBeHidden(panelId, cachedPanel) {
        const viewContainer = this.getViewContainer(panelId);
        if (!viewContainer || !viewContainer.hideIfEmpty) {
            return false;
        }
        return cachedPanel?.views && cachedPanel.views.length
            ? cachedPanel.views.every(({ when }) => !!when && !this.contextKeyService.contextMatchesRules(ContextKeyExpr.deserialize(when)))
            : false;
    }
    registerListeners() {
        // Panel registration
        this._register(this.registry.onDidRegister(panel => this.onDidRegisterPanels([panel])));
        this._register(this.registry.onDidDeregister(panel => this.onDidDeregisterPanel(panel.id)));
        // Activate on panel open
        this._register(this.onDidPaneCompositeOpen(panel => this.onPanelOpen(panel)));
        // Deactivate on panel close
        this._register(this.onDidPaneCompositeClose(this.onPanelClose, this));
        // Extension registration
        const disposables = this._register(new DisposableStore());
        this._register(this.extensionService.onDidRegisterExtensions(() => {
            disposables.clear();
            this.onDidRegisterExtensions();
            this.compositeBar.onDidChange(() => this.saveCachedPanels(), this, disposables);
            this.storageService.onDidChangeValue(e => this.onDidStorageValueChange(e), this, disposables);
        }));
    }
    onDidRegisterExtensions() {
        this.extensionsRegistered = true;
        // hide/remove composites
        const panels = this.getPaneComposites();
        for (const { id } of this.getCachedPanels()) {
            if (panels.every(panel => panel.id !== id)) {
                if (this.viewDescriptorService.isViewContainerRemovedPermanently(id)) {
                    this.removeComposite(id);
                }
                else {
                    this.hideComposite(id);
                }
            }
        }
        this.saveCachedPanels();
    }
    hideComposite(compositeId) {
        this.compositeBar.hideComposite(compositeId);
        const compositeActions = this.compositeActions.get(compositeId);
        if (compositeActions) {
            compositeActions.activityAction.dispose();
            compositeActions.pinnedAction.dispose();
            this.compositeActions.delete(compositeId);
        }
    }
    onPanelOpen(panel) {
        this.activePanelContextKey.set(panel.getId());
        const foundPanel = this.panelRegistry.getPaneComposite(panel.getId());
        if (foundPanel) {
            this.compositeBar.addComposite(foundPanel);
        }
        // Activate composite when opened
        this.compositeBar.activateComposite(panel.getId());
        const panelDescriptor = this.panelRegistry.getPaneComposite(panel.getId());
        if (panelDescriptor) {
            const viewContainer = this.getViewContainer(panelDescriptor.id);
            if (viewContainer?.hideIfEmpty) {
                const viewContainerModel = this.viewDescriptorService.getViewContainerModel(viewContainer);
                if (viewContainerModel.activeViewDescriptors.length === 0) {
                    this.hideComposite(panelDescriptor.id); // Update the composite bar by hiding
                }
            }
        }
        this.layoutCompositeBar(); // Need to relayout composite bar since different panels have different action bar width
        this.layoutEmptyMessage();
    }
    onPanelClose(panel) {
        const id = panel.getId();
        if (this.activePanelContextKey.get() === id) {
            this.activePanelContextKey.reset();
        }
        this.compositeBar.deactivateComposite(panel.getId());
        this.layoutEmptyMessage();
    }
    create(parent) {
        this.element = parent;
        super.create(parent);
        this.createEmptyPanelMessage();
        const focusTracker = this._register(trackFocus(parent));
        this._register(focusTracker.onDidFocus(() => this.panelFocusContextKey.set(true)));
        this._register(focusTracker.onDidBlur(() => this.panelFocusContextKey.set(false)));
    }
    createEmptyPanelMessage() {
        const contentArea = this.getContentArea();
        this.emptyPanelMessageElement = document.createElement('div');
        this.emptyPanelMessageElement.classList.add('empty-panel-message-area');
        const messageElement = document.createElement('div');
        messageElement.classList.add('empty-panel-message');
        messageElement.innerText = localize('panel.emptyMessage', "Drag a view here to display.");
        this.emptyPanelMessageElement.appendChild(messageElement);
        contentArea.appendChild(this.emptyPanelMessageElement);
        this._register(CompositeDragAndDropObserver.INSTANCE.registerTarget(this.emptyPanelMessageElement, {
            onDragOver: (e) => {
                EventHelper.stop(e.eventData, true);
                const validDropTarget = this.dndHandler.onDragEnter(e.dragAndDropData, undefined, e.eventData);
                toggleDropEffect(e.eventData.dataTransfer, 'move', validDropTarget);
            },
            onDragEnter: (e) => {
                EventHelper.stop(e.eventData, true);
                const validDropTarget = this.dndHandler.onDragEnter(e.dragAndDropData, undefined, e.eventData);
                this.emptyPanelMessageElement.style.backgroundColor = validDropTarget ? this.theme.getColor(EDITOR_DRAG_AND_DROP_BACKGROUND)?.toString() || '' : '';
            },
            onDragLeave: (e) => {
                EventHelper.stop(e.eventData, true);
                this.emptyPanelMessageElement.style.backgroundColor = '';
            },
            onDragEnd: (e) => {
                EventHelper.stop(e.eventData, true);
                this.emptyPanelMessageElement.style.backgroundColor = '';
            },
            onDrop: (e) => {
                EventHelper.stop(e.eventData, true);
                this.emptyPanelMessageElement.style.backgroundColor = '';
                this.dndHandler.drop(e.dragAndDropData, undefined, e.eventData);
            },
        }));
    }
    createTitleArea(parent) {
        const element = super.createTitleArea(parent);
        const globalTitleActionsContainer = element.appendChild($('.global-actions'));
        // Global Actions Toolbar
        this.globalToolBar = this._register(new ToolBar(globalTitleActionsContainer, this.contextMenuService, {
            actionViewItemProvider: action => this.actionViewItemProvider(action),
            orientation: 0 /* ActionsOrientation.HORIZONTAL */,
            getKeyBinding: action => this.keybindingService.lookupKeybinding(action.id),
            anchorAlignmentProvider: () => this.getTitleAreaDropDownAnchorAlignment(),
            toggleMenuTitle: localize('moreActions', "More Actions...")
        }));
        this.updateGlobalToolbarActions();
        return element;
    }
    updateStyles() {
        super.updateStyles();
        const container = assertIsDefined(this.getContainer());
        container.style.backgroundColor = this.getColor(this.backgroundColor) || '';
        const borderColor = this.getColor(contrastBorder) || '';
        container.style.borderLeftColor = borderColor;
        container.style.borderRightColor = borderColor;
        const title = this.getTitleArea();
        if (title) {
            title.style.borderTopColor = this.getColor(contrastBorder) || '';
        }
    }
    doOpenPanel(id, focus) {
        if (this.blockOpeningPanel) {
            return undefined; // Workaround against a potential race condition
        }
        // First check if panel is hidden and show if so
        if (!this.layoutService.isVisible(this.partId)) {
            try {
                this.blockOpeningPanel = true;
                this.layoutService.setPartHidden(false, this.partId);
            }
            finally {
                this.blockOpeningPanel = false;
            }
        }
        return this.openComposite(id, focus);
    }
    async openPaneComposite(id, focus) {
        if (typeof id === 'string' && this.getPaneComposite(id)) {
            return this.doOpenPanel(id, focus);
        }
        await this.extensionService.whenInstalledExtensionsRegistered();
        if (typeof id === 'string' && this.getPaneComposite(id)) {
            return this.doOpenPanel(id, focus);
        }
        return undefined;
    }
    showActivity(panelId, badge, clazz) {
        return this.compositeBar.showActivity(panelId, badge, clazz);
    }
    getPaneComposite(panelId) {
        return this.panelRegistry.getPaneComposite(panelId);
    }
    getPaneComposites() {
        return this.panelRegistry.getPaneComposites()
            .sort((v1, v2) => {
            if (typeof v1.order !== 'number') {
                return 1;
            }
            if (typeof v2.order !== 'number') {
                return -1;
            }
            return v1.order - v2.order;
        });
    }
    getPinnedPaneCompositeIds() {
        const pinnedCompositeIds = this.compositeBar.getPinnedComposites().map(c => c.id);
        return this.getPaneComposites()
            .filter(p => pinnedCompositeIds.includes(p.id))
            .sort((p1, p2) => pinnedCompositeIds.indexOf(p1.id) - pinnedCompositeIds.indexOf(p2.id))
            .map(p => p.id);
    }
    getVisiblePaneCompositeIds() {
        return this.compositeBar.getVisibleComposites()
            .filter(v => this.getActivePaneComposite()?.getId() === v.id || this.compositeBar.isPinned(v.id))
            .map(v => v.id);
    }
    getActivePaneComposite() {
        return this.getActiveComposite();
    }
    getLastActivePaneCompositeId() {
        return this.getLastActiveCompositetId();
    }
    hideActivePaneComposite() {
        // First check if panel is visible and hide if so
        if (this.layoutService.isVisible(this.partId)) {
            this.layoutService.setPartHidden(true, this.partId);
        }
        this.hideActiveComposite();
    }
    createTitleLabel(parent) {
        const titleArea = this.compositeBar.create(parent);
        titleArea.classList.add('panel-switcher-container');
        return {
            updateTitle: (id, title, keybinding) => {
                const action = this.compositeBar.getAction(id);
                if (action) {
                    action.label = title;
                }
            },
            updateStyles: () => {
                // Handled via theming participant
            }
        };
    }
    onTitleAreaUpdate(compositeId) {
        super.onTitleAreaUpdate(compositeId);
        // If title actions change, relayout the composite bar
        this.layoutCompositeBar();
    }
    layout(width, height, top, left) {
        if (!this.layoutService.isVisible(this.partId)) {
            return;
        }
        this.contentDimension = new Dimension(width, height);
        // Layout contents
        super.layout(this.contentDimension.width, this.contentDimension.height, top, left);
        // Layout composite bar
        this.layoutCompositeBar();
        // Add empty panel message
        this.layoutEmptyMessage();
    }
    layoutCompositeBar() {
        if (this.contentDimension && this.dimension) {
            let availableWidth = this.contentDimension.width - 40; // take padding into account
            if (this.toolBar) {
                availableWidth = Math.max(BasePanelPart.MIN_COMPOSITE_BAR_WIDTH, availableWidth - this.getToolbarWidth()); // adjust height for global actions showing
            }
            this.compositeBar.layout(new Dimension(availableWidth, this.dimension.height));
        }
    }
    emptyPanelMessageElement;
    layoutEmptyMessage() {
        this.emptyPanelMessageElement?.classList.toggle('visible', this.compositeBar.getVisibleComposites().length === 0);
    }
    getViewContainer(id) {
        const viewContainer = this.viewDescriptorService.getViewContainerById(id);
        return viewContainer && this.viewDescriptorService.getViewContainerLocation(viewContainer) === this.viewContainerLocation ? viewContainer : undefined;
    }
    updateGlobalToolbarActions() {
        const primaryActions = this.globalActions.getPrimaryActions();
        const secondaryActions = this.globalActions.getSecondaryActions();
        this.globalToolBar?.setActions(prepareActions(primaryActions), prepareActions(secondaryActions));
    }
    getCompositeActions(compositeId) {
        let compositeActions = this.compositeActions.get(compositeId);
        if (!compositeActions) {
            // const panel = this.getPaneComposite(compositeId);
            const viewContainer = this.getViewContainer(compositeId);
            if (viewContainer) {
                const viewContainerModel = this.viewDescriptorService.getViewContainerModel(viewContainer);
                compositeActions = {
                    activityAction: this.instantiationService.createInstance(PanelActivityAction, this.toActivity(viewContainerModel), this.viewContainerLocation),
                    pinnedAction: new ToggleCompositePinnedAction(this.toActivity(viewContainerModel), this.compositeBar)
                };
            }
            else {
                compositeActions = {
                    activityAction: this.instantiationService.createInstance(PlaceHolderPanelActivityAction, compositeId, this.viewContainerLocation),
                    pinnedAction: new PlaceHolderToggleCompositePinnedAction(compositeId, this.compositeBar)
                };
            }
            this.compositeActions.set(compositeId, compositeActions);
        }
        return compositeActions;
    }
    removeComposite(compositeId) {
        if (super.removeComposite(compositeId)) {
            this.compositeBar.removeComposite(compositeId);
            const compositeActions = this.compositeActions.get(compositeId);
            if (compositeActions) {
                compositeActions.activityAction.dispose();
                compositeActions.pinnedAction.dispose();
                this.compositeActions.delete(compositeId);
            }
            return true;
        }
        return false;
    }
    getToolbarWidth() {
        const activePanel = this.getActivePaneComposite();
        if (!activePanel || !this.toolBar) {
            return 0;
        }
        return this.toolBar.getItemsWidth() + (this.globalToolBar?.getItemsWidth() ?? 0);
    }
    onDidStorageValueChange(e) {
        if (e.key === this.pinnedPanelsKey && e.scope === 0 /* StorageScope.PROFILE */
            && this.cachedPanelsValue !== this.getStoredCachedPanelsValue() /* This checks if current window changed the value or not */) {
            this._cachedPanelsValue = undefined;
            const newCompositeItems = [];
            const compositeItems = this.compositeBar.getCompositeBarItems();
            const cachedPanels = this.getCachedPanels();
            for (const cachedPanel of cachedPanels) {
                // copy behavior from activity bar
                newCompositeItems.push({
                    id: cachedPanel.id,
                    name: cachedPanel.name,
                    order: cachedPanel.order,
                    pinned: cachedPanel.pinned,
                    visible: !!compositeItems.find(({ id }) => id === cachedPanel.id)
                });
            }
            for (let index = 0; index < compositeItems.length; index++) {
                // Add items currently exists but does not exist in new.
                if (!newCompositeItems.some(({ id }) => id === compositeItems[index].id)) {
                    newCompositeItems.splice(index, 0, compositeItems[index]);
                }
            }
            this.compositeBar.setCompositeBarItems(newCompositeItems);
        }
    }
    saveCachedPanels() {
        const state = [];
        const placeholders = [];
        const compositeItems = this.compositeBar.getCompositeBarItems();
        for (const compositeItem of compositeItems) {
            const viewContainer = this.getViewContainer(compositeItem.id);
            if (viewContainer) {
                const viewContainerModel = this.viewDescriptorService.getViewContainerModel(viewContainer);
                state.push({ id: compositeItem.id, name: viewContainerModel.title, pinned: compositeItem.pinned, order: compositeItem.order, visible: compositeItem.visible });
                placeholders.push({ id: compositeItem.id, name: this.getCompositeActions(compositeItem.id).activityAction.label });
            }
            else {
                state.push({ id: compositeItem.id, name: compositeItem.name, pinned: compositeItem.pinned, order: compositeItem.order, visible: compositeItem.visible });
            }
        }
        this.cachedPanelsValue = JSON.stringify(state);
        this.setPlaceholderViewContainers(placeholders);
    }
    getCachedPanels() {
        const registeredPanels = this.getPaneComposites();
        const storedStates = JSON.parse(this.cachedPanelsValue);
        const cachedPanels = storedStates.map(c => {
            const serialized = typeof c === 'string' /* migration from pinned states to composites states */ ? { id: c, pinned: true, order: undefined, visible: true } : c;
            const registered = registeredPanels.some(p => p.id === serialized.id);
            serialized.visible = registered ? isUndefinedOrNull(serialized.visible) ? true : serialized.visible : false;
            return serialized;
        });
        for (const placeholderViewContainer of this.getPlaceholderViewContainers()) {
            const cachedViewContainer = cachedPanels.filter(cached => cached.id === placeholderViewContainer.id)[0];
            if (cachedViewContainer) {
                cachedViewContainer.name = placeholderViewContainer.name;
            }
        }
        return cachedPanels;
    }
    _cachedPanelsValue;
    get cachedPanelsValue() {
        if (!this._cachedPanelsValue) {
            this._cachedPanelsValue = this.getStoredCachedPanelsValue();
        }
        return this._cachedPanelsValue;
    }
    set cachedPanelsValue(cachedViewletsValue) {
        if (this.cachedPanelsValue !== cachedViewletsValue) {
            this._cachedPanelsValue = cachedViewletsValue;
            this.setStoredCachedViewletsValue(cachedViewletsValue);
        }
    }
    getStoredCachedPanelsValue() {
        return this.storageService.get(this.pinnedPanelsKey, 0 /* StorageScope.PROFILE */, '[]');
    }
    setStoredCachedViewletsValue(value) {
        this.storageService.store(this.pinnedPanelsKey, value, 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
    }
    getPlaceholderViewContainers() {
        return JSON.parse(this.placeholderViewContainersValue);
    }
    setPlaceholderViewContainers(placeholderViewContainers) {
        this.placeholderViewContainersValue = JSON.stringify(placeholderViewContainers);
    }
    _placeholderViewContainersValue;
    get placeholderViewContainersValue() {
        if (!this._placeholderViewContainersValue) {
            this._placeholderViewContainersValue = this.getStoredPlaceholderViewContainersValue();
        }
        return this._placeholderViewContainersValue;
    }
    set placeholderViewContainersValue(placeholderViewContainesValue) {
        if (this.placeholderViewContainersValue !== placeholderViewContainesValue) {
            this._placeholderViewContainersValue = placeholderViewContainesValue;
            this.setStoredPlaceholderViewContainersValue(placeholderViewContainesValue);
        }
    }
    getStoredPlaceholderViewContainersValue() {
        return this.storageService.get(this.placeholdeViewContainersKey, 1 /* StorageScope.WORKSPACE */, '[]');
    }
    setStoredPlaceholderViewContainersValue(value) {
        this.storageService.store(this.placeholdeViewContainersKey, value, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
    }
};
BasePanelPart = __decorate([
    __param(0, INotificationService),
    __param(1, IStorageService),
    __param(2, ITelemetryService),
    __param(3, IContextMenuService),
    __param(4, IWorkbenchLayoutService),
    __param(5, IKeybindingService),
    __param(6, IInstantiationService),
    __param(7, IThemeService),
    __param(8, IViewDescriptorService),
    __param(9, IContextKeyService),
    __param(10, IExtensionService)
], BasePanelPart);
export { BasePanelPart };
let PanelPart = class PanelPart extends BasePanelPart {
    commandService;
    static activePanelSettingsKey = 'workbench.panelpart.activepanelid';
    static pinnedPanelsKey = 'workbench.panel.pinnedPanels';
    static placeholdeViewContainersKey = 'workbench.panel.placeholderPanels';
    constructor(notificationService, storageService, telemetryService, contextMenuService, layoutService, keybindingService, instantiationService, themeService, viewDescriptorService, contextKeyService, extensionService, commandService) {
        super(notificationService, storageService, telemetryService, contextMenuService, layoutService, keybindingService, instantiationService, themeService, viewDescriptorService, contextKeyService, extensionService, "workbench.parts.panel" /* Parts.PANEL_PART */, PanelPart.activePanelSettingsKey, PanelPart.pinnedPanelsKey, PanelPart.placeholdeViewContainersKey, PaneCompositeExtensions.Panels, PANEL_BACKGROUND, 1 /* ViewContainerLocation.Panel */, ActivePanelContext.bindTo(contextKeyService), PanelFocusContext.bindTo(contextKeyService), {
            useIcons: false,
            hasTitle: true
        });
        this.commandService = commandService;
    }
    updateStyles() {
        super.updateStyles();
        const container = assertIsDefined(this.getContainer());
        const borderColor = this.getColor(PANEL_BORDER) || this.getColor(contrastBorder) || '';
        container.style.borderLeftColor = borderColor;
        container.style.borderRightColor = borderColor;
        const title = this.getTitleArea();
        if (title) {
            title.style.borderTopColor = this.getColor(PANEL_BORDER) || this.getColor(contrastBorder) || '';
        }
    }
    getActivityHoverOptions() {
        return {
            position: () => this.layoutService.getPanelPosition() === 2 /* Position.BOTTOM */ && !this.layoutService.isPanelMaximized() ? 3 /* HoverPosition.ABOVE */ : 2 /* HoverPosition.BELOW */,
        };
    }
    fillExtraContextMenuActions(actions) {
        actions.push(...[
            new Separator(),
            ...PositionPanelActionConfigs
                // show the contextual menu item if it is not in that position
                .filter(({ when }) => this.contextKeyService.contextMatchesRules(when))
                .map(({ id, title }) => this.instantiationService.createInstance(SetPanelPositionAction, id, title.value)),
            toAction({ id: TogglePanelAction.ID, label: localize('hidePanel', "Hide Panel"), run: () => this.commandService.executeCommand(TogglePanelAction.ID) })
        ]);
    }
    layout(width, height, top, left) {
        let dimensions;
        if (this.layoutService.getPanelPosition() === 1 /* Position.RIGHT */) {
            dimensions = new Dimension(width - 1, height); // Take into account the 1px border when layouting
        }
        else {
            dimensions = new Dimension(width, height);
        }
        // Layout contents
        super.layout(dimensions.width, dimensions.height, top, left);
    }
    toJSON() {
        return {
            type: "workbench.parts.panel" /* Parts.PANEL_PART */
        };
    }
};
PanelPart = __decorate([
    __param(0, INotificationService),
    __param(1, IStorageService),
    __param(2, ITelemetryService),
    __param(3, IContextMenuService),
    __param(4, IWorkbenchLayoutService),
    __param(5, IKeybindingService),
    __param(6, IInstantiationService),
    __param(7, IThemeService),
    __param(8, IViewDescriptorService),
    __param(9, IContextKeyService),
    __param(10, IExtensionService),
    __param(11, ICommandService)
], PanelPart);
export { PanelPart };

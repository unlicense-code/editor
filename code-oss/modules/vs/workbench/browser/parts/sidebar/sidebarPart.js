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
import 'vs/css!./media/sidebarpart';
import 'vs/workbench/browser/parts/sidebar/sidebarActions';
import { Registry } from 'vs/platform/registry/common/platform';
import { CompositePart } from 'vs/workbench/browser/parts/compositePart';
import { Extensions as ViewletExtensions } from 'vs/workbench/browser/panecomposite';
import { IWorkbenchLayoutService } from 'vs/workbench/services/layout/browser/layoutService';
import { SidebarFocusContext, ActiveViewletContext } from 'vs/workbench/common/contextkeys';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { Event, Emitter } from 'vs/base/common/event';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { contrastBorder } from 'vs/platform/theme/common/colorRegistry';
import { SIDE_BAR_TITLE_FOREGROUND, SIDE_BAR_BACKGROUND, SIDE_BAR_FOREGROUND, SIDE_BAR_BORDER, SIDE_BAR_DRAG_AND_DROP_BACKGROUND } from 'vs/workbench/common/theme';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { EventType, addDisposableListener, trackFocus } from 'vs/base/browser/dom';
import { StandardMouseEvent } from 'vs/base/browser/mouseEvent';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { assertIsDefined } from 'vs/base/common/types';
import { CompositeDragAndDropObserver } from 'vs/workbench/browser/dnd';
import { IViewDescriptorService } from 'vs/workbench/common/views';
import { Gesture, EventType as GestureEventType } from 'vs/base/browser/touch';
let SidebarPart = class SidebarPart extends CompositePart {
    viewDescriptorService;
    contextKeyService;
    extensionService;
    static activeViewletSettingsKey = 'workbench.sidebar.activeviewletid';
    //#region IView
    minimumWidth = 170;
    maximumWidth = Number.POSITIVE_INFINITY;
    minimumHeight = 0;
    maximumHeight = Number.POSITIVE_INFINITY;
    priority = 1 /* LayoutPriority.Low */;
    snap = true;
    get preferredWidth() {
        const viewlet = this.getActivePaneComposite();
        if (!viewlet) {
            return;
        }
        const width = viewlet.getOptimalWidth();
        if (typeof width !== 'number') {
            return;
        }
        return Math.max(width, 300);
    }
    //#endregion
    get onDidPaneCompositeRegister() { return this.viewletRegistry.onDidRegister; }
    _onDidViewletDeregister = this._register(new Emitter());
    onDidPaneCompositeDeregister = this._onDidViewletDeregister.event;
    get onDidPaneCompositeOpen() { return Event.map(this.onDidCompositeOpen.event, compositeEvent => compositeEvent.composite); }
    get onDidPaneCompositeClose() { return this.onDidCompositeClose.event; }
    viewletRegistry = Registry.as(ViewletExtensions.Viewlets);
    sideBarFocusContextKey = SidebarFocusContext.bindTo(this.contextKeyService);
    activeViewletContextKey = ActiveViewletContext.bindTo(this.contextKeyService);
    blockOpeningViewlet = false;
    constructor(notificationService, storageService, telemetryService, contextMenuService, layoutService, keybindingService, instantiationService, themeService, viewDescriptorService, contextKeyService, extensionService) {
        super(notificationService, storageService, telemetryService, contextMenuService, layoutService, keybindingService, instantiationService, themeService, Registry.as(ViewletExtensions.Viewlets), SidebarPart.activeViewletSettingsKey, viewDescriptorService.getDefaultViewContainer(0 /* ViewContainerLocation.Sidebar */).id, 'sideBar', 'viewlet', SIDE_BAR_TITLE_FOREGROUND, "workbench.parts.sidebar" /* Parts.SIDEBAR_PART */, { hasTitle: true, borderWidth: () => (this.getColor(SIDE_BAR_BORDER) || this.getColor(contrastBorder)) ? 1 : 0 });
        this.viewDescriptorService = viewDescriptorService;
        this.contextKeyService = contextKeyService;
        this.extensionService = extensionService;
        this.registerListeners();
    }
    registerListeners() {
        // Viewlet open
        this._register(this.onDidPaneCompositeOpen(viewlet => {
            this.activeViewletContextKey.set(viewlet.getId());
        }));
        // Viewlet close
        this._register(this.onDidPaneCompositeClose(viewlet => {
            if (this.activeViewletContextKey.get() === viewlet.getId()) {
                this.activeViewletContextKey.reset();
            }
        }));
        // Viewlet deregister
        this._register(this.registry.onDidDeregister(async (viewletDescriptor) => {
            const activeContainers = this.viewDescriptorService.getViewContainersByLocation(0 /* ViewContainerLocation.Sidebar */)
                .filter(container => this.viewDescriptorService.getViewContainerModel(container).activeViewDescriptors.length > 0);
            if (activeContainers.length) {
                if (this.getActiveComposite()?.getId() === viewletDescriptor.id) {
                    const defaultViewletId = this.viewDescriptorService.getDefaultViewContainer(0 /* ViewContainerLocation.Sidebar */)?.id;
                    const containerToOpen = activeContainers.filter(c => c.id === defaultViewletId)[0] || activeContainers[0];
                    await this.openPaneComposite(containerToOpen.id);
                }
            }
            else {
                this.layoutService.setPartHidden(true, "workbench.parts.sidebar" /* Parts.SIDEBAR_PART */);
            }
            this.removeComposite(viewletDescriptor.id);
            this._onDidViewletDeregister.fire(viewletDescriptor);
        }));
    }
    create(parent) {
        this.element = parent;
        super.create(parent);
        const focusTracker = this._register(trackFocus(parent));
        this._register(focusTracker.onDidFocus(() => this.sideBarFocusContextKey.set(true)));
        this._register(focusTracker.onDidBlur(() => this.sideBarFocusContextKey.set(false)));
    }
    createTitleArea(parent) {
        const titleArea = super.createTitleArea(parent);
        this._register(addDisposableListener(titleArea, EventType.CONTEXT_MENU, e => {
            this.onTitleAreaContextMenu(new StandardMouseEvent(e));
        }));
        this._register(Gesture.addTarget(titleArea));
        this._register(addDisposableListener(titleArea, GestureEventType.Contextmenu, e => {
            this.onTitleAreaContextMenu(new StandardMouseEvent(e));
        }));
        this.titleLabelElement.draggable = true;
        const draggedItemProvider = () => {
            const activeViewlet = this.getActivePaneComposite();
            return { type: 'composite', id: activeViewlet.getId() };
        };
        this._register(CompositeDragAndDropObserver.INSTANCE.registerDraggable(this.titleLabelElement, draggedItemProvider, {}));
        return titleArea;
    }
    updateStyles() {
        super.updateStyles();
        // Part container
        const container = assertIsDefined(this.getContainer());
        container.style.backgroundColor = this.getColor(SIDE_BAR_BACKGROUND) || '';
        container.style.color = this.getColor(SIDE_BAR_FOREGROUND) || '';
        const borderColor = this.getColor(SIDE_BAR_BORDER) || this.getColor(contrastBorder);
        const isPositionLeft = this.layoutService.getSideBarPosition() === 0 /* SideBarPosition.LEFT */;
        container.style.borderRightWidth = borderColor && isPositionLeft ? '1px' : '';
        container.style.borderRightStyle = borderColor && isPositionLeft ? 'solid' : '';
        container.style.borderRightColor = isPositionLeft ? borderColor || '' : '';
        container.style.borderLeftWidth = borderColor && !isPositionLeft ? '1px' : '';
        container.style.borderLeftStyle = borderColor && !isPositionLeft ? 'solid' : '';
        container.style.borderLeftColor = !isPositionLeft ? borderColor || '' : '';
        container.style.outlineColor = this.getColor(SIDE_BAR_DRAG_AND_DROP_BACKGROUND) ?? '';
    }
    layout(width, height, top, left) {
        if (!this.layoutService.isVisible("workbench.parts.sidebar" /* Parts.SIDEBAR_PART */)) {
            return;
        }
        super.layout(width, height, top, left);
    }
    // Viewlet service
    getActivePaneComposite() {
        return this.getActiveComposite();
    }
    getLastActivePaneCompositeId() {
        return this.getLastActiveCompositetId();
    }
    hideActivePaneComposite() {
        this.hideActiveComposite();
    }
    async openPaneComposite(id, focus) {
        if (typeof id === 'string' && this.getPaneComposite(id)) {
            return this.doOpenViewlet(id, focus);
        }
        await this.extensionService.whenInstalledExtensionsRegistered();
        if (typeof id === 'string' && this.getPaneComposite(id)) {
            return this.doOpenViewlet(id, focus);
        }
        return undefined;
    }
    getPaneComposites() {
        return this.viewletRegistry.getPaneComposites().sort((v1, v2) => {
            if (typeof v1.order !== 'number') {
                return -1;
            }
            if (typeof v2.order !== 'number') {
                return 1;
            }
            return v1.order - v2.order;
        });
    }
    getPaneComposite(id) {
        return this.getPaneComposites().filter(viewlet => viewlet.id === id)[0];
    }
    doOpenViewlet(id, focus) {
        if (this.blockOpeningViewlet) {
            return undefined; // Workaround against a potential race condition
        }
        // First check if sidebar is hidden and show if so
        if (!this.layoutService.isVisible("workbench.parts.sidebar" /* Parts.SIDEBAR_PART */)) {
            try {
                this.blockOpeningViewlet = true;
                this.layoutService.setPartHidden(false, "workbench.parts.sidebar" /* Parts.SIDEBAR_PART */);
            }
            finally {
                this.blockOpeningViewlet = false;
            }
        }
        return this.openComposite(id, focus);
    }
    getTitleAreaDropDownAnchorAlignment() {
        return this.layoutService.getSideBarPosition() === 0 /* SideBarPosition.LEFT */ ? 0 /* AnchorAlignment.LEFT */ : 1 /* AnchorAlignment.RIGHT */;
    }
    onTitleAreaContextMenu(event) {
        const activeViewlet = this.getActivePaneComposite();
        if (activeViewlet) {
            const contextMenuActions = activeViewlet ? activeViewlet.getContextMenuActions() : [];
            if (contextMenuActions.length) {
                const anchor = { x: event.posx, y: event.posy };
                this.contextMenuService.showContextMenu({
                    getAnchor: () => anchor,
                    getActions: () => contextMenuActions.slice(),
                    getActionViewItem: action => this.actionViewItemProvider(action),
                    actionRunner: activeViewlet.getActionRunner()
                });
            }
        }
    }
    toJSON() {
        return {
            type: "workbench.parts.sidebar" /* Parts.SIDEBAR_PART */
        };
    }
};
SidebarPart = __decorate([
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
], SidebarPart);
export { SidebarPart };

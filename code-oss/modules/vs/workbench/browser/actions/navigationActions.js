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
import { Registry } from 'vs/platform/registry/common/platform';
import { Action } from 'vs/base/common/actions';
import { IEditorGroupsService } from 'vs/workbench/services/editor/common/editorGroupsService';
import { IWorkbenchLayoutService } from 'vs/workbench/services/layout/browser/layoutService';
import { SyncActionDescriptor } from 'vs/platform/actions/common/actions';
import { Extensions } from 'vs/workbench/common/actions';
import { Categories } from 'vs/platform/action/common/actionCommonCategories';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IPaneCompositePartService } from 'vs/workbench/services/panecomposite/browser/panecomposite';
let BaseNavigationAction = class BaseNavigationAction extends Action {
    direction;
    editorGroupService;
    paneCompositeService;
    layoutService;
    constructor(id, label, direction, editorGroupService, paneCompositeService, layoutService) {
        super(id, label);
        this.direction = direction;
        this.editorGroupService = editorGroupService;
        this.paneCompositeService = paneCompositeService;
        this.layoutService = layoutService;
    }
    async run() {
        const isEditorFocus = this.layoutService.hasFocus("workbench.parts.editor" /* Parts.EDITOR_PART */);
        const isPanelFocus = this.layoutService.hasFocus("workbench.parts.panel" /* Parts.PANEL_PART */);
        const isSidebarFocus = this.layoutService.hasFocus("workbench.parts.sidebar" /* Parts.SIDEBAR_PART */);
        const isAuxiliaryBarFocus = this.layoutService.hasFocus("workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */);
        let neighborPart;
        if (isEditorFocus) {
            const didNavigate = this.navigateAcrossEditorGroup(this.toGroupDirection(this.direction));
            if (didNavigate) {
                return;
            }
            neighborPart = this.layoutService.getVisibleNeighborPart("workbench.parts.editor" /* Parts.EDITOR_PART */, this.direction);
        }
        if (isPanelFocus) {
            neighborPart = this.layoutService.getVisibleNeighborPart("workbench.parts.panel" /* Parts.PANEL_PART */, this.direction);
        }
        if (isSidebarFocus) {
            neighborPart = this.layoutService.getVisibleNeighborPart("workbench.parts.sidebar" /* Parts.SIDEBAR_PART */, this.direction);
        }
        if (isAuxiliaryBarFocus) {
            neighborPart = neighborPart = this.layoutService.getVisibleNeighborPart("workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */, this.direction);
        }
        if (neighborPart === "workbench.parts.editor" /* Parts.EDITOR_PART */) {
            if (!this.navigateBackToEditorGroup(this.toGroupDirection(this.direction))) {
                this.navigateToEditorGroup(this.direction === 3 /* Direction.Right */ ? 0 /* GroupLocation.FIRST */ : 1 /* GroupLocation.LAST */);
            }
        }
        else if (neighborPart === "workbench.parts.sidebar" /* Parts.SIDEBAR_PART */) {
            this.navigateToSidebar();
        }
        else if (neighborPart === "workbench.parts.panel" /* Parts.PANEL_PART */) {
            this.navigateToPanel();
        }
        else if (neighborPart === "workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */) {
            this.navigateToAuxiliaryBar();
        }
    }
    async navigateToPanel() {
        if (!this.layoutService.isVisible("workbench.parts.panel" /* Parts.PANEL_PART */)) {
            return false;
        }
        const activePanel = this.paneCompositeService.getActivePaneComposite(1 /* ViewContainerLocation.Panel */);
        if (!activePanel) {
            return false;
        }
        const activePanelId = activePanel.getId();
        const res = await this.paneCompositeService.openPaneComposite(activePanelId, 1 /* ViewContainerLocation.Panel */, true);
        if (!res) {
            return false;
        }
        return res;
    }
    async navigateToSidebar() {
        if (!this.layoutService.isVisible("workbench.parts.sidebar" /* Parts.SIDEBAR_PART */)) {
            return false;
        }
        const activeViewlet = this.paneCompositeService.getActivePaneComposite(0 /* ViewContainerLocation.Sidebar */);
        if (!activeViewlet) {
            return false;
        }
        const activeViewletId = activeViewlet.getId();
        const viewlet = await this.paneCompositeService.openPaneComposite(activeViewletId, 0 /* ViewContainerLocation.Sidebar */, true);
        return !!viewlet;
    }
    async navigateToAuxiliaryBar() {
        if (!this.layoutService.isVisible("workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */)) {
            return false;
        }
        const activePanel = this.paneCompositeService.getActivePaneComposite(2 /* ViewContainerLocation.AuxiliaryBar */);
        if (!activePanel) {
            return false;
        }
        const activePanelId = activePanel.getId();
        const res = await this.paneCompositeService.openPaneComposite(activePanelId, 2 /* ViewContainerLocation.AuxiliaryBar */, true);
        if (!res) {
            return false;
        }
        return res;
    }
    navigateAcrossEditorGroup(direction) {
        return this.doNavigateToEditorGroup({ direction });
    }
    navigateToEditorGroup(location) {
        return this.doNavigateToEditorGroup({ location });
    }
    navigateBackToEditorGroup(direction) {
        if (!this.editorGroupService.activeGroup) {
            return false;
        }
        const oppositeDirection = this.toOppositeDirection(direction);
        // Check to see if there is a group in between the last active group and the direction of movement
        const groupInBetween = this.editorGroupService.findGroup({ direction: oppositeDirection }, this.editorGroupService.activeGroup);
        if (!groupInBetween) {
            // No group in between means we can return focus to the last active editor group
            this.editorGroupService.activeGroup.focus();
            return true;
        }
        return false;
    }
    toGroupDirection(direction) {
        switch (direction) {
            case 1 /* Direction.Down */: return 1 /* GroupDirection.DOWN */;
            case 2 /* Direction.Left */: return 2 /* GroupDirection.LEFT */;
            case 3 /* Direction.Right */: return 3 /* GroupDirection.RIGHT */;
            case 0 /* Direction.Up */: return 0 /* GroupDirection.UP */;
        }
    }
    toOppositeDirection(direction) {
        switch (direction) {
            case 0 /* GroupDirection.UP */: return 1 /* GroupDirection.DOWN */;
            case 3 /* GroupDirection.RIGHT */: return 2 /* GroupDirection.LEFT */;
            case 2 /* GroupDirection.LEFT */: return 3 /* GroupDirection.RIGHT */;
            case 1 /* GroupDirection.DOWN */: return 0 /* GroupDirection.UP */;
        }
    }
    doNavigateToEditorGroup(scope) {
        const targetGroup = this.editorGroupService.findGroup(scope, this.editorGroupService.activeGroup);
        if (targetGroup) {
            targetGroup.focus();
            return true;
        }
        return false;
    }
};
BaseNavigationAction = __decorate([
    __param(3, IEditorGroupsService),
    __param(4, IPaneCompositePartService),
    __param(5, IWorkbenchLayoutService)
], BaseNavigationAction);
let NavigateLeftAction = class NavigateLeftAction extends BaseNavigationAction {
    static ID = 'workbench.action.navigateLeft';
    static LABEL = localize('navigateLeft', "Navigate to the View on the Left");
    constructor(id, label, editorGroupService, paneCompositeService, layoutService) {
        super(id, label, 2 /* Direction.Left */, editorGroupService, paneCompositeService, layoutService);
    }
};
NavigateLeftAction = __decorate([
    __param(2, IEditorGroupsService),
    __param(3, IPaneCompositePartService),
    __param(4, IWorkbenchLayoutService)
], NavigateLeftAction);
let NavigateRightAction = class NavigateRightAction extends BaseNavigationAction {
    static ID = 'workbench.action.navigateRight';
    static LABEL = localize('navigateRight', "Navigate to the View on the Right");
    constructor(id, label, editorGroupService, paneCompositeService, layoutService) {
        super(id, label, 3 /* Direction.Right */, editorGroupService, paneCompositeService, layoutService);
    }
};
NavigateRightAction = __decorate([
    __param(2, IEditorGroupsService),
    __param(3, IPaneCompositePartService),
    __param(4, IWorkbenchLayoutService)
], NavigateRightAction);
let NavigateUpAction = class NavigateUpAction extends BaseNavigationAction {
    static ID = 'workbench.action.navigateUp';
    static LABEL = localize('navigateUp', "Navigate to the View Above");
    constructor(id, label, editorGroupService, paneCompositeService, layoutService) {
        super(id, label, 0 /* Direction.Up */, editorGroupService, paneCompositeService, layoutService);
    }
};
NavigateUpAction = __decorate([
    __param(2, IEditorGroupsService),
    __param(3, IPaneCompositePartService),
    __param(4, IWorkbenchLayoutService)
], NavigateUpAction);
let NavigateDownAction = class NavigateDownAction extends BaseNavigationAction {
    static ID = 'workbench.action.navigateDown';
    static LABEL = localize('navigateDown', "Navigate to the View Below");
    constructor(id, label, editorGroupService, paneCompositeService, layoutService) {
        super(id, label, 1 /* Direction.Down */, editorGroupService, paneCompositeService, layoutService);
    }
};
NavigateDownAction = __decorate([
    __param(2, IEditorGroupsService),
    __param(3, IPaneCompositePartService),
    __param(4, IWorkbenchLayoutService)
], NavigateDownAction);
function findVisibleNeighbour(layoutService, part, next) {
    const neighbour = part === "workbench.parts.editor" /* Parts.EDITOR_PART */ ? (next ? "workbench.parts.panel" /* Parts.PANEL_PART */ : "workbench.parts.sidebar" /* Parts.SIDEBAR_PART */) : part === "workbench.parts.panel" /* Parts.PANEL_PART */ ? (next ? "workbench.parts.statusbar" /* Parts.STATUSBAR_PART */ : "workbench.parts.editor" /* Parts.EDITOR_PART */) :
        part === "workbench.parts.statusbar" /* Parts.STATUSBAR_PART */ ? (next ? "workbench.parts.activitybar" /* Parts.ACTIVITYBAR_PART */ : "workbench.parts.panel" /* Parts.PANEL_PART */) : part === "workbench.parts.activitybar" /* Parts.ACTIVITYBAR_PART */ ? (next ? "workbench.parts.sidebar" /* Parts.SIDEBAR_PART */ : "workbench.parts.statusbar" /* Parts.STATUSBAR_PART */) :
            part === "workbench.parts.sidebar" /* Parts.SIDEBAR_PART */ ? (next ? "workbench.parts.editor" /* Parts.EDITOR_PART */ : "workbench.parts.activitybar" /* Parts.ACTIVITYBAR_PART */) : "workbench.parts.editor" /* Parts.EDITOR_PART */;
    if (layoutService.isVisible(neighbour) || neighbour === "workbench.parts.editor" /* Parts.EDITOR_PART */) {
        return neighbour;
    }
    return findVisibleNeighbour(layoutService, neighbour, next);
}
function focusNextOrPreviousPart(layoutService, editorService, next) {
    // Need to ask if the active editor has focus since the layoutService is not aware of some custom editor focus behavior(notebooks)
    // Also need to ask the layoutService for the case if no editor is opened
    const editorFocused = editorService.activeEditorPane?.hasFocus() || layoutService.hasFocus("workbench.parts.editor" /* Parts.EDITOR_PART */);
    const currentlyFocusedPart = editorFocused ? "workbench.parts.editor" /* Parts.EDITOR_PART */ : layoutService.hasFocus("workbench.parts.activitybar" /* Parts.ACTIVITYBAR_PART */) ? "workbench.parts.activitybar" /* Parts.ACTIVITYBAR_PART */ :
        layoutService.hasFocus("workbench.parts.statusbar" /* Parts.STATUSBAR_PART */) ? "workbench.parts.statusbar" /* Parts.STATUSBAR_PART */ : layoutService.hasFocus("workbench.parts.sidebar" /* Parts.SIDEBAR_PART */) ? "workbench.parts.sidebar" /* Parts.SIDEBAR_PART */ : layoutService.hasFocus("workbench.parts.panel" /* Parts.PANEL_PART */) ? "workbench.parts.panel" /* Parts.PANEL_PART */ : undefined;
    let partToFocus = "workbench.parts.editor" /* Parts.EDITOR_PART */;
    if (currentlyFocusedPart) {
        partToFocus = findVisibleNeighbour(layoutService, currentlyFocusedPart, next);
    }
    layoutService.focusPart(partToFocus);
}
let FocusNextPart = class FocusNextPart extends Action {
    layoutService;
    editorService;
    static ID = 'workbench.action.focusNextPart';
    static LABEL = localize('focusNextPart', "Focus Next Part");
    constructor(id, label, layoutService, editorService) {
        super(id, label);
        this.layoutService = layoutService;
        this.editorService = editorService;
    }
    async run() {
        focusNextOrPreviousPart(this.layoutService, this.editorService, true);
    }
};
FocusNextPart = __decorate([
    __param(2, IWorkbenchLayoutService),
    __param(3, IEditorService)
], FocusNextPart);
export { FocusNextPart };
let FocusPreviousPart = class FocusPreviousPart extends Action {
    layoutService;
    editorService;
    static ID = 'workbench.action.focusPreviousPart';
    static LABEL = localize('focusPreviousPart', "Focus Previous Part");
    constructor(id, label, layoutService, editorService) {
        super(id, label);
        this.layoutService = layoutService;
        this.editorService = editorService;
    }
    async run() {
        focusNextOrPreviousPart(this.layoutService, this.editorService, false);
    }
};
FocusPreviousPart = __decorate([
    __param(2, IWorkbenchLayoutService),
    __param(3, IEditorService)
], FocusPreviousPart);
export { FocusPreviousPart };
// --- Actions Registration
const actionsRegistry = Registry.as(Extensions.WorkbenchActions);
actionsRegistry.registerWorkbenchAction(SyncActionDescriptor.from(NavigateUpAction, undefined), 'View: Navigate to the View Above', Categories.View.value);
actionsRegistry.registerWorkbenchAction(SyncActionDescriptor.from(NavigateDownAction, undefined), 'View: Navigate to the View Below', Categories.View.value);
actionsRegistry.registerWorkbenchAction(SyncActionDescriptor.from(NavigateLeftAction, undefined), 'View: Navigate to the View on the Left', Categories.View.value);
actionsRegistry.registerWorkbenchAction(SyncActionDescriptor.from(NavigateRightAction, undefined), 'View: Navigate to the View on the Right', Categories.View.value);
actionsRegistry.registerWorkbenchAction(SyncActionDescriptor.from(FocusNextPart, { primary: 64 /* KeyCode.F6 */ }), 'View: Focus Next Part', Categories.View.value);
actionsRegistry.registerWorkbenchAction(SyncActionDescriptor.from(FocusPreviousPart, { primary: 1024 /* KeyMod.Shift */ | 64 /* KeyCode.F6 */ }), 'View: Focus Previous Part', Categories.View.value);

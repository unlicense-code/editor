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
import 'vs/css!./media/panelpart';
import { localize } from 'vs/nls';
import { Action } from 'vs/base/common/actions';
import { MenuId, MenuRegistry, registerAction2, Action2 } from 'vs/platform/actions/common/actions';
import { Categories } from 'vs/platform/action/common/actionCommonCategories';
import { IWorkbenchLayoutService, positionToString } from 'vs/workbench/services/layout/browser/layoutService';
import { ActivityAction, ToggleCompositePinnedAction } from 'vs/workbench/browser/parts/compositeBarActions';
import { AuxiliaryBarVisibleContext, PanelAlignmentContext, PanelMaximizedContext, PanelPositionContext, PanelVisibleContext } from 'vs/workbench/common/contextkeys';
import { ContextKeyExpr } from 'vs/platform/contextkey/common/contextkey';
import { Codicon } from 'vs/base/common/codicons';
import { registerIcon } from 'vs/platform/theme/common/iconRegistry';
import { ViewContainerLocationToString, IViewDescriptorService, IViewsService } from 'vs/workbench/common/views';
import { IPaneCompositePartService } from 'vs/workbench/services/panecomposite/browser/panecomposite';
import { INotificationService } from 'vs/platform/notification/common/notification';
const maximizeIcon = registerIcon('panel-maximize', Codicon.chevronUp, localize('maximizeIcon', 'Icon to maximize a panel.'));
const restoreIcon = registerIcon('panel-restore', Codicon.chevronDown, localize('restoreIcon', 'Icon to restore a panel.'));
const closeIcon = registerIcon('panel-close', Codicon.close, localize('closeIcon', 'Icon to close a panel.'));
const panelIcon = registerIcon('panel-layout-icon', Codicon.layoutPanel, localize('togglePanelOffIcon', 'Icon to toggle the panel off when it is on.'));
const panelOffIcon = registerIcon('panel-layout-icon-off', Codicon.layoutPanelOff, localize('togglePanelOnIcon', 'Icon to toggle the panel on when it is off.'));
export class TogglePanelAction extends Action2 {
    static ID = 'workbench.action.togglePanel';
    static LABEL = localize('togglePanelVisibility', "Toggle Panel Visibility");
    constructor() {
        super({
            id: TogglePanelAction.ID,
            title: { value: TogglePanelAction.LABEL, original: 'Toggle Panel Visibility' },
            f1: true,
            category: Categories.View,
            keybinding: { primary: 2048 /* KeyMod.CtrlCmd */ | 40 /* KeyCode.KeyJ */, weight: 200 /* KeybindingWeight.WorkbenchContrib */ },
        });
    }
    async run(accessor) {
        const layoutService = accessor.get(IWorkbenchLayoutService);
        layoutService.setPartHidden(layoutService.isVisible("workbench.parts.panel" /* Parts.PANEL_PART */), "workbench.parts.panel" /* Parts.PANEL_PART */);
    }
}
registerAction2(TogglePanelAction);
registerAction2(class extends Action2 {
    static ID = 'workbench.action.focusPanel';
    static LABEL = localize('focusPanel', "Focus into Panel");
    constructor() {
        super({
            id: 'workbench.action.focusPanel',
            title: { value: localize('focusPanel', "Focus into Panel"), original: 'Focus into Panel' },
            category: Categories.View,
            f1: true,
        });
    }
    async run(accessor) {
        const layoutService = accessor.get(IWorkbenchLayoutService);
        const paneCompositeService = accessor.get(IPaneCompositePartService);
        // Show panel
        if (!layoutService.isVisible("workbench.parts.panel" /* Parts.PANEL_PART */)) {
            layoutService.setPartHidden(false, "workbench.parts.panel" /* Parts.PANEL_PART */);
        }
        // Focus into active panel
        const panel = paneCompositeService.getActivePaneComposite(1 /* ViewContainerLocation.Panel */);
        panel?.focus();
    }
});
const PositionPanelActionId = {
    LEFT: 'workbench.action.positionPanelLeft',
    RIGHT: 'workbench.action.positionPanelRight',
    BOTTOM: 'workbench.action.positionPanelBottom',
};
const AlignPanelActionId = {
    LEFT: 'workbench.action.alignPanelLeft',
    RIGHT: 'workbench.action.alignPanelRight',
    CENTER: 'workbench.action.alignPanelCenter',
    JUSTIFY: 'workbench.action.alignPanelJustify',
};
function createPanelActionConfig(id, title, shortLabel, value, when) {
    return {
        id,
        title,
        shortLabel,
        value,
        when,
    };
}
function createPositionPanelActionConfig(id, title, shortLabel, position) {
    return createPanelActionConfig(id, title, shortLabel, position, PanelPositionContext.notEqualsTo(positionToString(position)));
}
function createAlignmentPanelActionConfig(id, title, shortLabel, alignment) {
    return createPanelActionConfig(id, title, shortLabel, alignment, PanelAlignmentContext.notEqualsTo(alignment));
}
export const PositionPanelActionConfigs = [
    createPositionPanelActionConfig(PositionPanelActionId.LEFT, { value: localize('positionPanelLeft', 'Move Panel Left'), original: 'Move Panel Left' }, localize('positionPanelLeftShort', "Left"), 0 /* Position.LEFT */),
    createPositionPanelActionConfig(PositionPanelActionId.RIGHT, { value: localize('positionPanelRight', 'Move Panel Right'), original: 'Move Panel Right' }, localize('positionPanelRightShort', "Right"), 1 /* Position.RIGHT */),
    createPositionPanelActionConfig(PositionPanelActionId.BOTTOM, { value: localize('positionPanelBottom', 'Move Panel To Bottom'), original: 'Move Panel To Bottom' }, localize('positionPanelBottomShort', "Bottom"), 2 /* Position.BOTTOM */),
];
const AlignPanelActionConfigs = [
    createAlignmentPanelActionConfig(AlignPanelActionId.LEFT, { value: localize('alignPanelLeft', 'Set Panel Alignment to Left'), original: 'Set Panel Alignment to Left' }, localize('alignPanelLeftShort', "Left"), 'left'),
    createAlignmentPanelActionConfig(AlignPanelActionId.RIGHT, { value: localize('alignPanelRight', 'Set Panel Alignment to Right'), original: 'Set Panel Alignment to Right' }, localize('alignPanelRightShort', "Right"), 'right'),
    createAlignmentPanelActionConfig(AlignPanelActionId.CENTER, { value: localize('alignPanelCenter', 'Set Panel Alignment to Center'), original: 'Set Panel Alignment to Center' }, localize('alignPanelCenterShort', "Center"), 'center'),
    createAlignmentPanelActionConfig(AlignPanelActionId.JUSTIFY, { value: localize('alignPanelJustify', 'Set Panel Alignment to Justify'), original: 'Set Panel Alignment to Justify' }, localize('alignPanelJustifyShort', "Justify"), 'justify'),
];
const positionByActionId = new Map(PositionPanelActionConfigs.map(config => [config.id, config.value]));
let SetPanelPositionAction = class SetPanelPositionAction extends Action {
    layoutService;
    constructor(id, label, layoutService) {
        super(id, label);
        this.layoutService = layoutService;
    }
    async run() {
        const position = positionByActionId.get(this.id);
        this.layoutService.setPanelPosition(position === undefined ? 2 /* Position.BOTTOM */ : position);
    }
};
SetPanelPositionAction = __decorate([
    __param(2, IWorkbenchLayoutService)
], SetPanelPositionAction);
export { SetPanelPositionAction };
MenuRegistry.appendMenuItem(MenuId.MenubarAppearanceMenu, {
    submenu: MenuId.MenubarPanelPositionMenu,
    title: localize('positionPanel', "Panel Position"),
    group: '3_workbench_layout_move',
    order: 4
});
PositionPanelActionConfigs.forEach(positionPanelAction => {
    const { id, title, shortLabel, value, when } = positionPanelAction;
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id,
                title,
                category: Categories.View,
                f1: true
            });
        }
        run(accessor) {
            const layoutService = accessor.get(IWorkbenchLayoutService);
            layoutService.setPanelPosition(value === undefined ? 2 /* Position.BOTTOM */ : value);
        }
    });
    MenuRegistry.appendMenuItem(MenuId.MenubarPanelPositionMenu, {
        command: {
            id,
            title: shortLabel,
            toggled: when.negate()
        },
        order: 5
    });
});
MenuRegistry.appendMenuItem(MenuId.MenubarAppearanceMenu, {
    submenu: MenuId.MenubarPanelAlignmentMenu,
    title: localize('alignPanel', "Align Panel"),
    group: '3_workbench_layout_move',
    order: 5
});
AlignPanelActionConfigs.forEach(alignPanelAction => {
    const { id, title, shortLabel, value, when } = alignPanelAction;
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id,
                title: title,
                category: Categories.View,
                toggled: when.negate(),
                f1: true
            });
        }
        run(accessor) {
            const layoutService = accessor.get(IWorkbenchLayoutService);
            layoutService.setPanelAlignment(value === undefined ? 'center' : value);
        }
    });
    MenuRegistry.appendMenuItem(MenuId.MenubarPanelAlignmentMenu, {
        command: {
            id,
            title: shortLabel,
            toggled: when.negate()
        },
        order: 5
    });
});
let PanelActivityAction = class PanelActivityAction extends ActivityAction {
    viewContainerLocation;
    paneCompositeService;
    constructor(activity, viewContainerLocation, paneCompositeService) {
        super(activity);
        this.viewContainerLocation = viewContainerLocation;
        this.paneCompositeService = paneCompositeService;
    }
    async run() {
        await this.paneCompositeService.openPaneComposite(this.activity.id, this.viewContainerLocation, true);
        this.activate();
    }
    setActivity(activity) {
        this.activity = activity;
    }
};
PanelActivityAction = __decorate([
    __param(2, IPaneCompositePartService)
], PanelActivityAction);
export { PanelActivityAction };
let PlaceHolderPanelActivityAction = class PlaceHolderPanelActivityAction extends PanelActivityAction {
    constructor(id, viewContainerLocation, paneCompositeService) {
        super({ id, name: id }, viewContainerLocation, paneCompositeService);
    }
};
PlaceHolderPanelActivityAction = __decorate([
    __param(2, IPaneCompositePartService)
], PlaceHolderPanelActivityAction);
export { PlaceHolderPanelActivityAction };
export class PlaceHolderToggleCompositePinnedAction extends ToggleCompositePinnedAction {
    constructor(id, compositeBar) {
        super({ id, name: id, cssClass: undefined }, compositeBar);
    }
    setActivity(activity) {
        this.label = activity.name;
    }
}
class SwitchPanelViewAction extends Action2 {
    constructor(id, title) {
        super({
            id,
            title,
            category: Categories.View,
            f1: true,
        });
    }
    async run(accessor, offset) {
        const paneCompositeService = accessor.get(IPaneCompositePartService);
        const pinnedPanels = paneCompositeService.getPinnedPaneCompositeIds(1 /* ViewContainerLocation.Panel */);
        const activePanel = paneCompositeService.getActivePaneComposite(1 /* ViewContainerLocation.Panel */);
        if (!activePanel) {
            return;
        }
        let targetPanelId;
        for (let i = 0; i < pinnedPanels.length; i++) {
            if (pinnedPanels[i] === activePanel.getId()) {
                targetPanelId = pinnedPanels[(i + pinnedPanels.length + offset) % pinnedPanels.length];
                break;
            }
        }
        if (typeof targetPanelId === 'string') {
            await paneCompositeService.openPaneComposite(targetPanelId, 1 /* ViewContainerLocation.Panel */, true);
        }
    }
}
registerAction2(class extends SwitchPanelViewAction {
    constructor() {
        super('workbench.action.previousPanelView', {
            value: localize('previousPanelView', 'Previous Panel View'),
            original: 'Previous Panel View'
        });
    }
    run(accessor) {
        return super.run(accessor, -1);
    }
});
registerAction2(class extends SwitchPanelViewAction {
    constructor() {
        super('workbench.action.nextPanelView', {
            value: localize('nextPanelView', 'Next Panel View'),
            original: 'Next Panel View'
        });
    }
    run(accessor) {
        return super.run(accessor, 1);
    }
});
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: 'workbench.action.toggleMaximizedPanel',
            title: { value: localize('toggleMaximizedPanel', "Toggle Maximized Panel"), original: 'Toggle Maximized Panel' },
            tooltip: localize('maximizePanel', "Maximize Panel Size"),
            category: Categories.View,
            f1: true,
            icon: maximizeIcon,
            // the workbench grid currently prevents us from supporting panel maximization with non-center panel alignment
            precondition: ContextKeyExpr.or(PanelAlignmentContext.isEqualTo('center'), PanelPositionContext.notEqualsTo('bottom')),
            toggled: { condition: PanelMaximizedContext, icon: restoreIcon, tooltip: localize('minimizePanel', "Restore Panel Size") },
            menu: [{
                    id: MenuId.PanelTitle,
                    group: 'navigation',
                    order: 1,
                    // the workbench grid currently prevents us from supporting panel maximization with non-center panel alignment
                    when: ContextKeyExpr.or(PanelAlignmentContext.isEqualTo('center'), PanelPositionContext.notEqualsTo('bottom'))
                }]
        });
    }
    run(accessor) {
        const layoutService = accessor.get(IWorkbenchLayoutService);
        const notificationService = accessor.get(INotificationService);
        if (layoutService.getPanelAlignment() !== 'center' && layoutService.getPanelPosition() === 2 /* Position.BOTTOM */) {
            notificationService.warn(localize('panelMaxNotSupported', "Maximizing the panel is only supported when it is center aligned."));
            return;
        }
        if (!layoutService.isVisible("workbench.parts.panel" /* Parts.PANEL_PART */)) {
            layoutService.setPartHidden(false, "workbench.parts.panel" /* Parts.PANEL_PART */);
            // If the panel is not already maximized, maximize it
            if (!layoutService.isPanelMaximized()) {
                layoutService.toggleMaximizedPanel();
            }
        }
        else {
            layoutService.toggleMaximizedPanel();
        }
    }
});
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: 'workbench.action.closePanel',
            title: { value: localize('closePanel', "Close Panel"), original: 'Close Panel' },
            category: Categories.View,
            icon: closeIcon,
            menu: [{
                    id: MenuId.CommandPalette,
                    when: PanelVisibleContext,
                }, {
                    id: MenuId.PanelTitle,
                    group: 'navigation',
                    order: 2
                }]
        });
    }
    run(accessor) {
        accessor.get(IWorkbenchLayoutService).setPartHidden(true, "workbench.parts.panel" /* Parts.PANEL_PART */);
    }
});
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: 'workbench.action.closeAuxiliaryBar',
            title: { value: localize('closeSecondarySideBar', "Close Secondary Side Bar"), original: 'Close Secondary Side Bar' },
            category: Categories.View,
            icon: closeIcon,
            menu: [{
                    id: MenuId.CommandPalette,
                    when: AuxiliaryBarVisibleContext,
                }, {
                    id: MenuId.AuxiliaryBarTitle,
                    group: 'navigation',
                    order: 2
                }]
        });
    }
    run(accessor) {
        accessor.get(IWorkbenchLayoutService).setPartHidden(true, "workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */);
    }
});
MenuRegistry.appendMenuItems([
    {
        id: MenuId.MenubarAppearanceMenu,
        item: {
            group: '2_workbench_layout',
            command: {
                id: TogglePanelAction.ID,
                title: localize({ key: 'miPanel', comment: ['&& denotes a mnemonic'] }, "&&Panel"),
                toggled: PanelVisibleContext
            },
            order: 5
        }
    }, {
        id: MenuId.LayoutControlMenuSubmenu,
        item: {
            group: '0_workbench_layout',
            command: {
                id: TogglePanelAction.ID,
                title: localize('miPanelNoMnemonic', "Panel"),
                toggled: PanelVisibleContext
            },
            order: 4
        }
    }, {
        id: MenuId.LayoutControlMenu,
        item: {
            group: '0_workbench_toggles',
            command: {
                id: TogglePanelAction.ID,
                title: localize('togglePanel', "Toggle Panel"),
                icon: panelOffIcon,
                toggled: { condition: PanelVisibleContext, icon: panelIcon }
            },
            when: ContextKeyExpr.or(ContextKeyExpr.equals('config.workbench.layoutControl.type', 'toggles'), ContextKeyExpr.equals('config.workbench.layoutControl.type', 'both')),
            order: 1
        }
    }, {
        id: MenuId.ViewTitleContext,
        item: {
            group: '3_workbench_layout_move',
            command: {
                id: TogglePanelAction.ID,
                title: { value: localize('hidePanel', "Hide Panel"), original: 'Hide Panel' },
            },
            when: ContextKeyExpr.and(PanelVisibleContext, ContextKeyExpr.equals('viewLocation', ViewContainerLocationToString(1 /* ViewContainerLocation.Panel */))),
            order: 2
        }
    }
]);
class MoveViewsBetweenPanelsAction extends Action2 {
    source;
    destination;
    constructor(source, destination, desc) {
        super(desc);
        this.source = source;
        this.destination = destination;
    }
    run(accessor, ...args) {
        const viewDescriptorService = accessor.get(IViewDescriptorService);
        const layoutService = accessor.get(IWorkbenchLayoutService);
        const viewsService = accessor.get(IViewsService);
        const srcContainers = viewDescriptorService.getViewContainersByLocation(this.source);
        const destContainers = viewDescriptorService.getViewContainersByLocation(this.destination);
        if (srcContainers.length) {
            const activeViewContainer = viewsService.getVisibleViewContainer(this.source);
            srcContainers.forEach(viewContainer => viewDescriptorService.moveViewContainerToLocation(viewContainer, this.destination));
            layoutService.setPartHidden(false, this.destination === 1 /* ViewContainerLocation.Panel */ ? "workbench.parts.panel" /* Parts.PANEL_PART */ : "workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */);
            if (activeViewContainer && destContainers.length === 0) {
                viewsService.openViewContainer(activeViewContainer.id, true);
            }
        }
    }
}
// --- Move Panel Views To Secondary Side Bar
class MovePanelToSidePanelAction extends MoveViewsBetweenPanelsAction {
    static ID = 'workbench.action.movePanelToSidePanel';
    constructor() {
        super(1 /* ViewContainerLocation.Panel */, 2 /* ViewContainerLocation.AuxiliaryBar */, {
            id: MovePanelToSidePanelAction.ID,
            title: {
                value: localize('movePanelToSecondarySideBar', "Move Panel Views To Secondary Side Bar"),
                original: 'Move Panel Views To Secondary Side Bar'
            },
            category: Categories.View,
            f1: false
        });
    }
}
export class MovePanelToSecondarySideBarAction extends MoveViewsBetweenPanelsAction {
    static ID = 'workbench.action.movePanelToSecondarySideBar';
    constructor() {
        super(1 /* ViewContainerLocation.Panel */, 2 /* ViewContainerLocation.AuxiliaryBar */, {
            id: MovePanelToSecondarySideBarAction.ID,
            title: {
                value: localize('movePanelToSecondarySideBar', "Move Panel Views To Secondary Side Bar"),
                original: 'Move Panel Views To Secondary Side Bar'
            },
            category: Categories.View,
            f1: true
        });
    }
}
registerAction2(MovePanelToSidePanelAction);
registerAction2(MovePanelToSecondarySideBarAction);
// --- Move Secondary Side Bar Views To Panel
class MoveSidePanelToPanelAction extends MoveViewsBetweenPanelsAction {
    static ID = 'workbench.action.moveSidePanelToPanel';
    constructor() {
        super(2 /* ViewContainerLocation.AuxiliaryBar */, 1 /* ViewContainerLocation.Panel */, {
            id: MoveSidePanelToPanelAction.ID,
            title: {
                value: localize('moveSidePanelToPanel', "Move Secondary Side Bar Views To Panel"),
                original: 'Move Secondary Side Bar Views To Panel'
            },
            category: Categories.View,
            f1: false
        });
    }
}
export class MoveSecondarySideBarToPanelAction extends MoveViewsBetweenPanelsAction {
    static ID = 'workbench.action.moveSecondarySideBarToPanel';
    constructor() {
        super(2 /* ViewContainerLocation.AuxiliaryBar */, 1 /* ViewContainerLocation.Panel */, {
            id: MoveSecondarySideBarToPanelAction.ID,
            title: {
                value: localize('moveSidePanelToPanel', "Move Secondary Side Bar Views To Panel"),
                original: 'Move Secondary Side Bar Views To Panel'
            },
            category: Categories.View,
            f1: true
        });
    }
}
registerAction2(MoveSidePanelToPanelAction);
registerAction2(MoveSecondarySideBarToPanelAction);

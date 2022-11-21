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
import 'vs/css!./media/auxiliaryBarPart';
import { localize } from 'vs/nls';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { contrastBorder } from 'vs/platform/theme/common/colorRegistry';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { Extensions as PaneCompositeExtensions } from 'vs/workbench/browser/panecomposite';
import { BasePanelPart } from 'vs/workbench/browser/parts/panel/panelPart';
import { ActiveAuxiliaryContext, AuxiliaryBarFocusContext } from 'vs/workbench/common/contextkeys';
import { SIDE_BAR_BACKGROUND, SIDE_BAR_BORDER, SIDE_BAR_FOREGROUND } from 'vs/workbench/common/theme';
import { IViewDescriptorService } from 'vs/workbench/common/views';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { IWorkbenchLayoutService } from 'vs/workbench/services/layout/browser/layoutService';
import { Separator, toAction } from 'vs/base/common/actions';
import { ToggleAuxiliaryBarAction } from 'vs/workbench/browser/parts/auxiliarybar/auxiliaryBarActions';
import { assertIsDefined } from 'vs/base/common/types';
import { ToggleSidebarPositionAction } from 'vs/workbench/browser/actions/layoutActions';
import { ICommandService } from 'vs/platform/commands/common/commands';
let AuxiliaryBarPart = class AuxiliaryBarPart extends BasePanelPart {
    commandService;
    static activePanelSettingsKey = 'workbench.auxiliarybar.activepanelid';
    static pinnedPanelsKey = 'workbench.auxiliarybar.pinnedPanels';
    static placeholdeViewContainersKey = 'workbench.auxiliarybar.placeholderPanels';
    // Use the side bar dimensions
    minimumWidth = 170;
    maximumWidth = Number.POSITIVE_INFINITY;
    minimumHeight = 0;
    maximumHeight = Number.POSITIVE_INFINITY;
    priority = 1 /* LayoutPriority.Low */;
    constructor(notificationService, storageService, telemetryService, contextMenuService, layoutService, keybindingService, instantiationService, themeService, viewDescriptorService, contextKeyService, extensionService, commandService) {
        super(notificationService, storageService, telemetryService, contextMenuService, layoutService, keybindingService, instantiationService, themeService, viewDescriptorService, contextKeyService, extensionService, "workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */, AuxiliaryBarPart.activePanelSettingsKey, AuxiliaryBarPart.pinnedPanelsKey, AuxiliaryBarPart.placeholdeViewContainersKey, PaneCompositeExtensions.Auxiliary, SIDE_BAR_BACKGROUND, 2 /* ViewContainerLocation.AuxiliaryBar */, ActiveAuxiliaryContext.bindTo(contextKeyService), AuxiliaryBarFocusContext.bindTo(contextKeyService), {
            useIcons: true,
            hasTitle: true,
            borderWidth: () => (this.getColor(SIDE_BAR_BORDER) || this.getColor(contrastBorder)) ? 1 : 0,
        });
        this.commandService = commandService;
    }
    updateStyles() {
        super.updateStyles();
        const container = assertIsDefined(this.getContainer());
        const borderColor = this.getColor(SIDE_BAR_BORDER) || this.getColor(contrastBorder);
        const isPositionLeft = this.layoutService.getSideBarPosition() === 1 /* Position.RIGHT */;
        container.style.color = this.getColor(SIDE_BAR_FOREGROUND) || '';
        container.style.borderLeftColor = borderColor ?? '';
        container.style.borderRightColor = borderColor ?? '';
        container.style.borderLeftStyle = borderColor && !isPositionLeft ? 'solid' : 'none';
        container.style.borderRightStyle = borderColor && isPositionLeft ? 'solid' : 'none';
        container.style.borderLeftWidth = borderColor && !isPositionLeft ? '1px' : '0px';
        container.style.borderRightWidth = borderColor && isPositionLeft ? '1px' : '0px';
    }
    getActivityHoverOptions() {
        return {
            position: () => 2 /* HoverPosition.BELOW */
        };
    }
    fillExtraContextMenuActions(actions) {
        const currentPositionRight = this.layoutService.getSideBarPosition() === 0 /* Position.LEFT */;
        actions.push(...[
            new Separator(),
            toAction({ id: ToggleSidebarPositionAction.ID, label: currentPositionRight ? localize('move second side bar left', "Move Secondary Side Bar Left") : localize('move second side bar right', "Move Secondary Side Bar Right"), run: () => this.commandService.executeCommand(ToggleSidebarPositionAction.ID) }),
            toAction({ id: ToggleAuxiliaryBarAction.ID, label: localize('hide second side bar', "Hide Secondary Side Bar"), run: () => this.commandService.executeCommand(ToggleAuxiliaryBarAction.ID) })
        ]);
    }
    toJSON() {
        return {
            type: "workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */
        };
    }
};
AuxiliaryBarPart = __decorate([
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
], AuxiliaryBarPart);
export { AuxiliaryBarPart };

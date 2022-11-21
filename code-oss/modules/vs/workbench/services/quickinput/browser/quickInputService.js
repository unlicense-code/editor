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
import { ILayoutService } from 'vs/platform/layout/browser/layoutService';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { IAccessibilityService } from 'vs/platform/accessibility/common/accessibility';
import { QuickInputService as BaseQuickInputService } from 'vs/platform/quickinput/browser/quickInput';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { IQuickInputService } from 'vs/platform/quickinput/common/quickInput';
import { InQuickPickContextKey } from 'vs/workbench/browser/quickaccess';
let QuickInputService = class QuickInputService extends BaseQuickInputService {
    configurationService;
    keybindingService;
    inQuickInputContext = InQuickPickContextKey.bindTo(this.contextKeyService);
    constructor(configurationService, instantiationService, keybindingService, contextKeyService, themeService, accessibilityService, layoutService) {
        super(instantiationService, contextKeyService, themeService, accessibilityService, layoutService);
        this.configurationService = configurationService;
        this.keybindingService = keybindingService;
        this.registerListeners();
    }
    registerListeners() {
        this._register(this.onShow(() => this.inQuickInputContext.set(true)));
        this._register(this.onHide(() => this.inQuickInputContext.set(false)));
    }
    createController() {
        return super.createController(this.layoutService, {
            ignoreFocusOut: () => !this.configurationService.getValue('workbench.quickOpen.closeOnFocusLost'),
            backKeybindingLabel: () => this.keybindingService.lookupKeybinding('workbench.action.quickInputBack')?.getLabel() || undefined
        });
    }
};
QuickInputService = __decorate([
    __param(0, IConfigurationService),
    __param(1, IInstantiationService),
    __param(2, IKeybindingService),
    __param(3, IContextKeyService),
    __param(4, IThemeService),
    __param(5, IAccessibilityService),
    __param(6, ILayoutService)
], QuickInputService);
export { QuickInputService };
registerSingleton(IQuickInputService, QuickInputService, 1 /* InstantiationType.Delayed */);

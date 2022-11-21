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
import { CancellationToken } from 'vs/base/common/cancellation';
import { Emitter } from 'vs/base/common/event';
import { QuickInputController } from 'vs/base/parts/quickinput/browser/quickInput';
import { IAccessibilityService } from 'vs/platform/accessibility/common/accessibility';
import { IContextKeyService, RawContextKey } from 'vs/platform/contextkey/common/contextkey';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ILayoutService } from 'vs/platform/layout/browser/layoutService';
import { WorkbenchList } from 'vs/platform/list/browser/listService';
import { QuickAccessController } from 'vs/platform/quickinput/browser/quickAccess';
import { defaultButtonStyles, getProgressBarStyles } from 'vs/platform/theme/browser/defaultStyles';
import { activeContrastBorder, badgeBackground, badgeForeground, contrastBorder, inputBackground, inputBorder, inputForeground, inputValidationErrorBackground, inputValidationErrorBorder, inputValidationErrorForeground, inputValidationInfoBackground, inputValidationInfoBorder, inputValidationInfoForeground, inputValidationWarningBackground, inputValidationWarningBorder, inputValidationWarningForeground, keybindingLabelBackground, keybindingLabelBorder, keybindingLabelBottomBorder, keybindingLabelForeground, pickerGroupBorder, pickerGroupForeground, quickInputBackground, quickInputForeground, quickInputListFocusBackground, quickInputListFocusForeground, quickInputListFocusIconForeground, quickInputTitleBackground, widgetShadow } from 'vs/platform/theme/common/colorRegistry';
import { computeStyles } from 'vs/platform/theme/common/styler';
import { IThemeService, Themable } from 'vs/platform/theme/common/themeService';
let QuickInputService = class QuickInputService extends Themable {
    instantiationService;
    contextKeyService;
    accessibilityService;
    layoutService;
    get backButton() { return this.controller.backButton; }
    _onShow = this._register(new Emitter());
    onShow = this._onShow.event;
    _onHide = this._register(new Emitter());
    onHide = this._onHide.event;
    _controller;
    get controller() {
        if (!this._controller) {
            this._controller = this._register(this.createController());
        }
        return this._controller;
    }
    get hasController() { return !!this._controller; }
    _quickAccess;
    get quickAccess() {
        if (!this._quickAccess) {
            this._quickAccess = this._register(this.instantiationService.createInstance(QuickAccessController));
        }
        return this._quickAccess;
    }
    contexts = new Map();
    constructor(instantiationService, contextKeyService, themeService, accessibilityService, layoutService) {
        super(themeService);
        this.instantiationService = instantiationService;
        this.contextKeyService = contextKeyService;
        this.accessibilityService = accessibilityService;
        this.layoutService = layoutService;
    }
    createController(host = this.layoutService, options) {
        const defaultOptions = {
            idPrefix: 'quickInput_',
            container: host.container,
            ignoreFocusOut: () => false,
            isScreenReaderOptimized: () => this.accessibilityService.isScreenReaderOptimized(),
            backKeybindingLabel: () => undefined,
            setContextKey: (id) => this.setContextKey(id),
            returnFocus: () => host.focus(),
            createList: (user, container, delegate, renderers, options) => this.instantiationService.createInstance(WorkbenchList, user, container, delegate, renderers, options),
            styles: this.computeStyles()
        };
        const controller = this._register(new QuickInputController({
            ...defaultOptions,
            ...options
        }));
        controller.layout(host.dimension, host.offset.quickPickTop);
        // Layout changes
        this._register(host.onDidLayout(dimension => controller.layout(dimension, host.offset.quickPickTop)));
        // Context keys
        this._register(controller.onShow(() => {
            this.resetContextKeys();
            this._onShow.fire();
        }));
        this._register(controller.onHide(() => {
            this.resetContextKeys();
            this._onHide.fire();
        }));
        return controller;
    }
    setContextKey(id) {
        let key;
        if (id) {
            key = this.contexts.get(id);
            if (!key) {
                key = new RawContextKey(id, false)
                    .bindTo(this.contextKeyService);
                this.contexts.set(id, key);
            }
        }
        if (key && key.get()) {
            return; // already active context
        }
        this.resetContextKeys();
        key?.set(true);
    }
    resetContextKeys() {
        this.contexts.forEach(context => {
            if (context.get()) {
                context.reset();
            }
        });
    }
    pick(picks, options = {}, token = CancellationToken.None) {
        return this.controller.pick(picks, options, token);
    }
    input(options = {}, token = CancellationToken.None) {
        return this.controller.input(options, token);
    }
    createQuickPick() {
        return this.controller.createQuickPick();
    }
    createInputBox() {
        return this.controller.createInputBox();
    }
    focus() {
        this.controller.focus();
    }
    toggle() {
        this.controller.toggle();
    }
    navigate(next, quickNavigate) {
        this.controller.navigate(next, quickNavigate);
    }
    accept(keyMods) {
        return this.controller.accept(keyMods);
    }
    back() {
        return this.controller.back();
    }
    cancel() {
        return this.controller.cancel();
    }
    updateStyles() {
        if (this.hasController) {
            this.controller.applyStyles(this.computeStyles());
        }
    }
    computeStyles() {
        return {
            widget: {
                ...computeStyles(this.theme, {
                    quickInputBackground,
                    quickInputForeground,
                    quickInputTitleBackground,
                    contrastBorder,
                    widgetShadow
                }),
            },
            inputBox: computeStyles(this.theme, {
                inputForeground,
                inputBackground,
                inputBorder,
                inputValidationInfoBackground,
                inputValidationInfoForeground,
                inputValidationInfoBorder,
                inputValidationWarningBackground,
                inputValidationWarningForeground,
                inputValidationWarningBorder,
                inputValidationErrorBackground,
                inputValidationErrorForeground,
                inputValidationErrorBorder
            }),
            countBadge: computeStyles(this.theme, {
                badgeBackground,
                badgeForeground,
                badgeBorder: contrastBorder
            }),
            button: defaultButtonStyles,
            progressBar: getProgressBarStyles(),
            keybindingLabel: computeStyles(this.theme, {
                keybindingLabelBackground,
                keybindingLabelForeground,
                keybindingLabelBorder,
                keybindingLabelBottomBorder,
                keybindingLabelShadow: widgetShadow
            }),
            list: computeStyles(this.theme, {
                listBackground: quickInputBackground,
                // Look like focused when inactive.
                listInactiveFocusForeground: quickInputListFocusForeground,
                listInactiveSelectionIconForeground: quickInputListFocusIconForeground,
                listInactiveFocusBackground: quickInputListFocusBackground,
                listFocusOutline: activeContrastBorder,
                listInactiveFocusOutline: activeContrastBorder,
                pickerGroupBorder,
                pickerGroupForeground
            })
        };
    }
};
QuickInputService = __decorate([
    __param(0, IInstantiationService),
    __param(1, IContextKeyService),
    __param(2, IThemeService),
    __param(3, IAccessibilityService),
    __param(4, ILayoutService)
], QuickInputService);
export { QuickInputService };

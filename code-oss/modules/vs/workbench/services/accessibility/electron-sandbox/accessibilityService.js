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
import { IAccessibilityService } from 'vs/platform/accessibility/common/accessibility';
import { isWindows, isLinux } from 'vs/base/common/platform';
import { INativeWorkbenchEnvironmentService } from 'vs/workbench/services/environment/electron-sandbox/environmentService';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { Registry } from 'vs/platform/registry/common/platform';
import { AccessibilityService } from 'vs/platform/accessibility/browser/accessibilityService';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IJSONEditingService } from 'vs/workbench/services/configuration/common/jsonEditing';
import { Extensions as WorkbenchExtensions } from 'vs/workbench/common/contributions';
import { INativeHostService } from 'vs/platform/native/electron-sandbox/native';
import { ILayoutService } from 'vs/platform/layout/browser/layoutService';
let NativeAccessibilityService = class NativeAccessibilityService extends AccessibilityService {
    _telemetryService;
    nativeHostService;
    didSendTelemetry = false;
    shouldAlwaysUnderlineAccessKeys = undefined;
    constructor(environmentService, contextKeyService, configurationService, _layoutService, _telemetryService, nativeHostService) {
        super(contextKeyService, _layoutService, configurationService);
        this._telemetryService = _telemetryService;
        this.nativeHostService = nativeHostService;
        this.setAccessibilitySupport(environmentService.window.accessibilitySupport ? 2 /* AccessibilitySupport.Enabled */ : 1 /* AccessibilitySupport.Disabled */);
    }
    async alwaysUnderlineAccessKeys() {
        if (!isWindows) {
            return false;
        }
        if (typeof this.shouldAlwaysUnderlineAccessKeys !== 'boolean') {
            const windowsKeyboardAccessibility = await this.nativeHostService.windowsGetStringRegKey('HKEY_CURRENT_USER', 'Control Panel\\Accessibility\\Keyboard Preference', 'On');
            this.shouldAlwaysUnderlineAccessKeys = (windowsKeyboardAccessibility === '1');
        }
        return this.shouldAlwaysUnderlineAccessKeys;
    }
    setAccessibilitySupport(accessibilitySupport) {
        super.setAccessibilitySupport(accessibilitySupport);
        if (!this.didSendTelemetry && accessibilitySupport === 2 /* AccessibilitySupport.Enabled */) {
            this._telemetryService.publicLog2('accessibility', { enabled: true });
            this.didSendTelemetry = true;
        }
    }
};
NativeAccessibilityService = __decorate([
    __param(0, INativeWorkbenchEnvironmentService),
    __param(1, IContextKeyService),
    __param(2, IConfigurationService),
    __param(3, ILayoutService),
    __param(4, ITelemetryService),
    __param(5, INativeHostService)
], NativeAccessibilityService);
export { NativeAccessibilityService };
registerSingleton(IAccessibilityService, NativeAccessibilityService, 1 /* InstantiationType.Delayed */);
// On linux we do not automatically detect that a screen reader is detected, thus we have to implicitly notify the renderer to enable accessibility when user configures it in settings
let LinuxAccessibilityContribution = class LinuxAccessibilityContribution {
    constructor(jsonEditingService, accessibilityService, environmentService) {
        const forceRendererAccessibility = () => {
            if (accessibilityService.isScreenReaderOptimized()) {
                jsonEditingService.write(environmentService.argvResource, [{ path: ['force-renderer-accessibility'], value: true }], true);
            }
        };
        forceRendererAccessibility();
        accessibilityService.onDidChangeScreenReaderOptimized(forceRendererAccessibility);
    }
};
LinuxAccessibilityContribution = __decorate([
    __param(0, IJSONEditingService),
    __param(1, IAccessibilityService),
    __param(2, INativeWorkbenchEnvironmentService)
], LinuxAccessibilityContribution);
if (isLinux) {
    Registry.as(WorkbenchExtensions.Workbench).registerWorkbenchContribution(LinuxAccessibilityContribution, 2 /* LifecyclePhase.Ready */);
}

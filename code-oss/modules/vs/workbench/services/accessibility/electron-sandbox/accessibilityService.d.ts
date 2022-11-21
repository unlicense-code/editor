import { IAccessibilityService, AccessibilitySupport } from 'vs/platform/accessibility/common/accessibility';
import { INativeWorkbenchEnvironmentService } from 'vs/workbench/services/environment/electron-sandbox/environmentService';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { AccessibilityService } from 'vs/platform/accessibility/browser/accessibilityService';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { INativeHostService } from 'vs/platform/native/electron-sandbox/native';
import { ILayoutService } from 'vs/platform/layout/browser/layoutService';
export declare class NativeAccessibilityService extends AccessibilityService implements IAccessibilityService {
    private readonly _telemetryService;
    private readonly nativeHostService;
    private didSendTelemetry;
    private shouldAlwaysUnderlineAccessKeys;
    constructor(environmentService: INativeWorkbenchEnvironmentService, contextKeyService: IContextKeyService, configurationService: IConfigurationService, _layoutService: ILayoutService, _telemetryService: ITelemetryService, nativeHostService: INativeHostService);
    alwaysUnderlineAccessKeys(): Promise<boolean>;
    setAccessibilitySupport(accessibilitySupport: AccessibilitySupport): void;
}

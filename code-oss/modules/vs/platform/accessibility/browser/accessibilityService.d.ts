import { Emitter, Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { AccessibilitySupport, IAccessibilityService } from 'vs/platform/accessibility/common/accessibility';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { ILayoutService } from 'vs/platform/layout/browser/layoutService';
export declare class AccessibilityService extends Disposable implements IAccessibilityService {
    private readonly _contextKeyService;
    private readonly _layoutService;
    protected readonly _configurationService: IConfigurationService;
    readonly _serviceBrand: undefined;
    private _accessibilityModeEnabledContext;
    protected _accessibilitySupport: AccessibilitySupport;
    protected readonly _onDidChangeScreenReaderOptimized: Emitter<void>;
    protected _configMotionReduced: 'auto' | 'on' | 'off';
    protected _systemMotionReduced: boolean;
    protected readonly _onDidChangeReducedMotion: Emitter<void>;
    constructor(_contextKeyService: IContextKeyService, _layoutService: ILayoutService, _configurationService: IConfigurationService);
    private initReducedMotionListeners;
    get onDidChangeScreenReaderOptimized(): Event<void>;
    isScreenReaderOptimized(): boolean;
    get onDidChangeReducedMotion(): Event<void>;
    isMotionReduced(): boolean;
    alwaysUnderlineAccessKeys(): Promise<boolean>;
    getAccessibilitySupport(): AccessibilitySupport;
    setAccessibilitySupport(accessibilitySupport: AccessibilitySupport): void;
    alert(message: string): void;
}

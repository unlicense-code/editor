import { Event } from 'vs/base/common/event';
import { IAccessibilityService, AccessibilitySupport } from 'vs/platform/accessibility/common/accessibility';
export declare class TestAccessibilityService implements IAccessibilityService {
    readonly _serviceBrand: undefined;
    onDidChangeScreenReaderOptimized: Event<any>;
    onDidChangeReducedMotion: Event<any>;
    isScreenReaderOptimized(): boolean;
    isMotionReduced(): boolean;
    alwaysUnderlineAccessKeys(): Promise<boolean>;
    setAccessibilitySupport(accessibilitySupport: AccessibilitySupport): void;
    getAccessibilitySupport(): AccessibilitySupport;
    alert(message: string): void;
}

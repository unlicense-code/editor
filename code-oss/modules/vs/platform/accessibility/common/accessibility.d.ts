import { Event } from 'vs/base/common/event';
import { RawContextKey } from 'vs/platform/contextkey/common/contextkey';
export declare const IAccessibilityService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IAccessibilityService>;
export interface IAccessibilityService {
    readonly _serviceBrand: undefined;
    readonly onDidChangeScreenReaderOptimized: Event<void>;
    readonly onDidChangeReducedMotion: Event<void>;
    alwaysUnderlineAccessKeys(): Promise<boolean>;
    isScreenReaderOptimized(): boolean;
    isMotionReduced(): boolean;
    getAccessibilitySupport(): AccessibilitySupport;
    setAccessibilitySupport(accessibilitySupport: AccessibilitySupport): void;
    alert(message: string): void;
}
export declare const enum AccessibilitySupport {
    /**
     * This should be the browser case where it is not known if a screen reader is attached or no.
     */
    Unknown = 0,
    Disabled = 1,
    Enabled = 2
}
export declare const CONTEXT_ACCESSIBILITY_MODE_ENABLED: RawContextKey<boolean>;
export interface IAccessibilityInformation {
    label: string;
    role?: string;
}

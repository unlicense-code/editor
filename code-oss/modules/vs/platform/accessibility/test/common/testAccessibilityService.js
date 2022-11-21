/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Event } from 'vs/base/common/event';
export class TestAccessibilityService {
    onDidChangeScreenReaderOptimized = Event.None;
    onDidChangeReducedMotion = Event.None;
    isScreenReaderOptimized() { return false; }
    isMotionReduced() { return false; }
    alwaysUnderlineAccessKeys() { return Promise.resolve(false); }
    setAccessibilitySupport(accessibilitySupport) { }
    getAccessibilitySupport() { return 0 /* AccessibilitySupport.Unknown */; }
    alert(message) { }
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { EditorConfiguration } from 'vs/editor/browser/config/editorConfiguration';
import { EditorFontLigatures } from 'vs/editor/common/config/editorOptions';
import { FontInfo } from 'vs/editor/common/config/fontInfo';
import { TestAccessibilityService } from 'vs/platform/accessibility/test/common/testAccessibilityService';
export class TestConfiguration extends EditorConfiguration {
    constructor(opts) {
        super(false, opts, null, new TestAccessibilityService());
    }
    _readEnvConfiguration() {
        return {
            extraEditorClassName: '',
            outerWidth: 100,
            outerHeight: 100,
            emptySelectionClipboard: true,
            pixelRatio: 1,
            accessibilitySupport: 0 /* AccessibilitySupport.Unknown */
        };
    }
    _readFontInfo(styling) {
        return new FontInfo({
            pixelRatio: 1,
            fontFamily: 'mockFont',
            fontWeight: 'normal',
            fontSize: 14,
            fontFeatureSettings: EditorFontLigatures.OFF,
            lineHeight: 19,
            letterSpacing: 1.5,
            isMonospace: true,
            typicalHalfwidthCharacterWidth: 10,
            typicalFullwidthCharacterWidth: 20,
            canUseHalfwidthRightwardsArrow: true,
            spaceWidth: 10,
            middotWidth: 10,
            wsmiddotWidth: 10,
            maxDigitWidth: 10,
        }, true);
    }
}

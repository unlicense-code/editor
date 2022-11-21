/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Color } from 'vs/base/common/color';
import { Emitter } from 'vs/base/common/event';
import { ColorScheme } from 'vs/platform/theme/common/theme';
export class TestColorTheme {
    colors;
    type;
    semanticHighlighting;
    label = 'test';
    constructor(colors = {}, type = ColorScheme.DARK, semanticHighlighting = false) {
        this.colors = colors;
        this.type = type;
        this.semanticHighlighting = semanticHighlighting;
    }
    getColor(color, useDefault) {
        const value = this.colors[color];
        if (value) {
            return Color.fromHex(value);
        }
        return undefined;
    }
    defines(color) {
        throw new Error('Method not implemented.');
    }
    getTokenStyleMetadata(type, modifiers, modelLanguage) {
        return undefined;
    }
    get tokenColorMap() {
        return [];
    }
}
class TestFileIconTheme {
    hasFileIcons = false;
    hasFolderIcons = false;
    hidesExplorerArrows = false;
}
class UnthemedProductIconTheme {
    getIcon(contribution) {
        return undefined;
    }
}
export class TestThemeService {
    _colorTheme;
    _fileIconTheme;
    _productIconTheme;
    _onThemeChange = new Emitter();
    _onFileIconThemeChange = new Emitter();
    _onProductIconThemeChange = new Emitter();
    constructor(theme = new TestColorTheme(), fileIconTheme = new TestFileIconTheme(), productIconTheme = new UnthemedProductIconTheme()) {
        this._colorTheme = theme;
        this._fileIconTheme = fileIconTheme;
        this._productIconTheme = productIconTheme;
    }
    getColorTheme() {
        return this._colorTheme;
    }
    setTheme(theme) {
        this._colorTheme = theme;
        this.fireThemeChange();
    }
    fireThemeChange() {
        this._onThemeChange.fire(this._colorTheme);
    }
    get onDidColorThemeChange() {
        return this._onThemeChange.event;
    }
    getFileIconTheme() {
        return this._fileIconTheme;
    }
    get onDidFileIconThemeChange() {
        return this._onFileIconThemeChange.event;
    }
    getProductIconTheme() {
        return this._productIconTheme;
    }
    get onDidProductIconThemeChange() {
        return this._onProductIconThemeChange.event;
    }
}

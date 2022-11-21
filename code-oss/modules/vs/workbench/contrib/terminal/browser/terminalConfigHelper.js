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
import * as nls from 'vs/nls';
import { EDITOR_FONT_DEFAULTS } from 'vs/editor/common/config/editorOptions';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { TERMINAL_CONFIG_SECTION, DEFAULT_LETTER_SPACING, DEFAULT_LINE_HEIGHT, MINIMUM_LETTER_SPACING, MINIMUM_FONT_WEIGHT, MAXIMUM_FONT_WEIGHT, DEFAULT_FONT_WEIGHT, DEFAULT_BOLD_FONT_WEIGHT } from 'vs/workbench/contrib/terminal/common/terminal';
import Severity from 'vs/base/common/severity';
import { INotificationService, NeverShowAgainScope } from 'vs/platform/notification/common/notification';
import { Emitter } from 'vs/base/common/event';
import { basename } from 'vs/base/common/path';
import { IExtensionManagementService } from 'vs/platform/extensionManagement/common/extensionManagement';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { InstallRecommendedExtensionAction } from 'vs/workbench/contrib/extensions/browser/extensionsActions';
import { IProductService } from 'vs/platform/product/common/productService';
import { isLinux, isWindows } from 'vs/base/common/platform';
const MINIMUM_FONT_SIZE = 6;
const MAXIMUM_FONT_SIZE = 100;
/**
 * Encapsulates terminal configuration logic, the primary purpose of this file is so that platform
 * specific test cases can be written.
 */
let TerminalConfigHelper = class TerminalConfigHelper {
    _configurationService;
    _extensionManagementService;
    _notificationService;
    _instantiationService;
    _productService;
    panelContainer;
    _charMeasureElement;
    _lastFontMeasurement;
    _linuxDistro = 1 /* LinuxDistro.Unknown */;
    config;
    _onConfigChanged = new Emitter();
    get onConfigChanged() { return this._onConfigChanged.event; }
    constructor(_configurationService, _extensionManagementService, _notificationService, _instantiationService, _productService) {
        this._configurationService = _configurationService;
        this._extensionManagementService = _extensionManagementService;
        this._notificationService = _notificationService;
        this._instantiationService = _instantiationService;
        this._productService = _productService;
        this._updateConfig();
        this._configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration(TERMINAL_CONFIG_SECTION)) {
                this._updateConfig();
            }
        });
        if (isLinux) {
            if (navigator.userAgent.includes('Ubuntu')) {
                this._linuxDistro = 3 /* LinuxDistro.Ubuntu */;
            }
            else if (navigator.userAgent.includes('Fedora')) {
                this._linuxDistro = 2 /* LinuxDistro.Fedora */;
            }
        }
    }
    _updateConfig() {
        const configValues = this._configurationService.getValue(TERMINAL_CONFIG_SECTION);
        configValues.fontWeight = this._normalizeFontWeight(configValues.fontWeight, DEFAULT_FONT_WEIGHT);
        configValues.fontWeightBold = this._normalizeFontWeight(configValues.fontWeightBold, DEFAULT_BOLD_FONT_WEIGHT);
        this.config = configValues;
        this._onConfigChanged.fire();
    }
    configFontIsMonospace() {
        const fontSize = 15;
        const fontFamily = this.config.fontFamily || this._configurationService.getValue('editor').fontFamily || EDITOR_FONT_DEFAULTS.fontFamily;
        const iRect = this._getBoundingRectFor('i', fontFamily, fontSize);
        const wRect = this._getBoundingRectFor('w', fontFamily, fontSize);
        // Check for invalid bounds, there is no reason to believe the font is not monospace
        if (!iRect || !wRect || !iRect.width || !wRect.width) {
            return true;
        }
        return iRect.width === wRect.width;
    }
    _createCharMeasureElementIfNecessary() {
        if (!this.panelContainer) {
            throw new Error('Cannot measure element when terminal is not attached');
        }
        // Create charMeasureElement if it hasn't been created or if it was orphaned by its parent
        if (!this._charMeasureElement || !this._charMeasureElement.parentElement) {
            this._charMeasureElement = document.createElement('div');
            this.panelContainer.appendChild(this._charMeasureElement);
        }
        return this._charMeasureElement;
    }
    _getBoundingRectFor(char, fontFamily, fontSize) {
        let charMeasureElement;
        try {
            charMeasureElement = this._createCharMeasureElementIfNecessary();
        }
        catch {
            return undefined;
        }
        const style = charMeasureElement.style;
        style.display = 'inline-block';
        style.fontFamily = fontFamily;
        style.fontSize = fontSize + 'px';
        style.lineHeight = 'normal';
        charMeasureElement.innerText = char;
        const rect = charMeasureElement.getBoundingClientRect();
        style.display = 'none';
        return rect;
    }
    _measureFont(fontFamily, fontSize, letterSpacing, lineHeight) {
        const rect = this._getBoundingRectFor('X', fontFamily, fontSize);
        // Bounding client rect was invalid, use last font measurement if available.
        if (this._lastFontMeasurement && (!rect || !rect.width || !rect.height)) {
            return this._lastFontMeasurement;
        }
        this._lastFontMeasurement = {
            fontFamily,
            fontSize,
            letterSpacing,
            lineHeight,
            charWidth: 0,
            charHeight: 0
        };
        if (rect && rect.width && rect.height) {
            this._lastFontMeasurement.charHeight = Math.ceil(rect.height);
            // Char width is calculated differently for DOM and the other renderer types. Refer to
            // how each renderer updates their dimensions in xterm.js
            if (this.config.gpuAcceleration === 'off') {
                this._lastFontMeasurement.charWidth = rect.width;
            }
            else {
                const deviceCharWidth = Math.floor(rect.width * window.devicePixelRatio);
                const deviceCellWidth = deviceCharWidth + Math.round(letterSpacing);
                const cssCellWidth = deviceCellWidth / window.devicePixelRatio;
                this._lastFontMeasurement.charWidth = cssCellWidth - Math.round(letterSpacing) / window.devicePixelRatio;
            }
        }
        return this._lastFontMeasurement;
    }
    /**
     * Gets the font information based on the terminal.integrated.fontFamily
     * terminal.integrated.fontSize, terminal.integrated.lineHeight configuration properties
     */
    getFont(xtermCore, excludeDimensions) {
        const editorConfig = this._configurationService.getValue('editor');
        let fontFamily = this.config.fontFamily || editorConfig.fontFamily || EDITOR_FONT_DEFAULTS.fontFamily;
        let fontSize = this._clampInt(this.config.fontSize, MINIMUM_FONT_SIZE, MAXIMUM_FONT_SIZE, EDITOR_FONT_DEFAULTS.fontSize);
        // Work around bad font on Fedora/Ubuntu
        if (!this.config.fontFamily) {
            if (this._linuxDistro === 2 /* LinuxDistro.Fedora */) {
                fontFamily = '\'DejaVu Sans Mono\', monospace';
            }
            if (this._linuxDistro === 3 /* LinuxDistro.Ubuntu */) {
                fontFamily = '\'Ubuntu Mono\', monospace';
                // Ubuntu mono is somehow smaller, so set fontSize a bit larger to get the same perceived size.
                fontSize = this._clampInt(fontSize + 2, MINIMUM_FONT_SIZE, MAXIMUM_FONT_SIZE, EDITOR_FONT_DEFAULTS.fontSize);
            }
        }
        const letterSpacing = this.config.letterSpacing ? Math.max(Math.floor(this.config.letterSpacing), MINIMUM_LETTER_SPACING) : DEFAULT_LETTER_SPACING;
        const lineHeight = this.config.lineHeight ? Math.max(this.config.lineHeight, 1) : DEFAULT_LINE_HEIGHT;
        if (excludeDimensions) {
            return {
                fontFamily,
                fontSize,
                letterSpacing,
                lineHeight
            };
        }
        // Get the character dimensions from xterm if it's available
        if (xtermCore) {
            if (xtermCore._renderService && xtermCore._renderService.dimensions?.css.cell.width && xtermCore._renderService.dimensions?.css.cell.height) {
                return {
                    fontFamily,
                    fontSize,
                    letterSpacing,
                    lineHeight,
                    charHeight: xtermCore._renderService.dimensions.css.cell.height / lineHeight,
                    charWidth: xtermCore._renderService.dimensions.css.cell.width - Math.round(letterSpacing) / window.devicePixelRatio
                };
            }
        }
        // Fall back to measuring the font ourselves
        return this._measureFont(fontFamily, fontSize, letterSpacing, lineHeight);
    }
    _clampInt(source, minimum, maximum, fallback) {
        let r = parseInt(source, 10);
        if (isNaN(r)) {
            return fallback;
        }
        if (typeof minimum === 'number') {
            r = Math.max(minimum, r);
        }
        if (typeof maximum === 'number') {
            r = Math.min(maximum, r);
        }
        return r;
    }
    _recommendationsShown = false;
    async showRecommendations(shellLaunchConfig) {
        if (this._recommendationsShown) {
            return;
        }
        this._recommendationsShown = true;
        if (isWindows && shellLaunchConfig.executable && basename(shellLaunchConfig.executable).toLowerCase() === 'wsl.exe') {
            const exeBasedExtensionTips = this._productService.exeBasedExtensionTips;
            if (!exeBasedExtensionTips || !exeBasedExtensionTips.wsl) {
                return;
            }
            const extId = Object.keys(exeBasedExtensionTips.wsl.recommendations).find(extId => exeBasedExtensionTips.wsl.recommendations[extId].important);
            if (extId && !await this._isExtensionInstalled(extId)) {
                this._notificationService.prompt(Severity.Info, nls.localize('useWslExtension.title', "The '{0}' extension is recommended for opening a terminal in WSL.", exeBasedExtensionTips.wsl.friendlyName), [
                    {
                        label: nls.localize('install', 'Install'),
                        run: () => {
                            this._instantiationService.createInstance(InstallRecommendedExtensionAction, extId).run();
                        }
                    }
                ], {
                    sticky: true,
                    neverShowAgain: { id: 'terminalConfigHelper/launchRecommendationsIgnore', scope: NeverShowAgainScope.APPLICATION },
                    onCancel: () => { }
                });
            }
        }
    }
    async _isExtensionInstalled(id) {
        const extensions = await this._extensionManagementService.getInstalled();
        return extensions.some(e => e.identifier.id === id);
    }
    _normalizeFontWeight(input, defaultWeight) {
        if (input === 'normal' || input === 'bold') {
            return input;
        }
        return this._clampInt(input, MINIMUM_FONT_WEIGHT, MAXIMUM_FONT_WEIGHT, defaultWeight);
    }
};
TerminalConfigHelper = __decorate([
    __param(0, IConfigurationService),
    __param(1, IExtensionManagementService),
    __param(2, INotificationService),
    __param(3, IInstantiationService),
    __param(4, IProductService)
], TerminalConfigHelper);
export { TerminalConfigHelper };

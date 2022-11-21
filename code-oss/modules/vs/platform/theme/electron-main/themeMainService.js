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
import { BrowserWindow, nativeTheme } from 'electron';
import { Emitter } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { isLinux, isMacintosh, isWindows } from 'vs/base/common/platform';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { IStateMainService } from 'vs/platform/state/electron-main/state';
const DEFAULT_BG_LIGHT = '#FFFFFF';
const DEFAULT_BG_DARK = '#1E1E1E';
const DEFAULT_BG_HC_BLACK = '#000000';
const DEFAULT_BG_HC_LIGHT = '#FFFFFF';
const THEME_STORAGE_KEY = 'theme';
const THEME_BG_STORAGE_KEY = 'themeBackground';
const THEME_WINDOW_SPLASH = 'windowSplash';
export const IThemeMainService = createDecorator('themeMainService');
let ThemeMainService = class ThemeMainService extends Disposable {
    stateMainService;
    configurationService;
    _onDidChangeColorScheme = this._register(new Emitter());
    onDidChangeColorScheme = this._onDidChangeColorScheme.event;
    constructor(stateMainService, configurationService) {
        super();
        this.stateMainService = stateMainService;
        this.configurationService = configurationService;
        // Color Scheme changes
        nativeTheme.on('updated', () => {
            this._onDidChangeColorScheme.fire(this.getColorScheme());
        });
    }
    getColorScheme() {
        if (isWindows) {
            // high contrast is refelected by the shouldUseInvertedColorScheme property
            if (nativeTheme.shouldUseHighContrastColors) {
                // shouldUseInvertedColorScheme is dark, !shouldUseInvertedColorScheme is light
                return { dark: nativeTheme.shouldUseInvertedColorScheme, highContrast: true };
            }
        }
        else if (isMacintosh) {
            // high contrast is set if one of shouldUseInvertedColorScheme or shouldUseHighContrastColors is set, reflecting the 'Invert colours' and `Increase contrast` settings in MacOS
            if (nativeTheme.shouldUseInvertedColorScheme || nativeTheme.shouldUseHighContrastColors) {
                return { dark: nativeTheme.shouldUseDarkColors, highContrast: true };
            }
        }
        else if (isLinux) {
            // ubuntu gnome seems to have 3 states, light dark and high contrast
            if (nativeTheme.shouldUseHighContrastColors) {
                return { dark: true, highContrast: true };
            }
        }
        return {
            dark: nativeTheme.shouldUseDarkColors,
            highContrast: false
        };
    }
    getBackgroundColor() {
        const colorScheme = this.getColorScheme();
        if (colorScheme.highContrast && this.configurationService.getValue('window.autoDetectHighContrast')) {
            return colorScheme.dark ? DEFAULT_BG_HC_BLACK : DEFAULT_BG_HC_LIGHT;
        }
        let background = this.stateMainService.getItem(THEME_BG_STORAGE_KEY, null);
        if (!background) {
            const baseTheme = this.stateMainService.getItem(THEME_STORAGE_KEY, 'vs-dark').split(' ')[0];
            switch (baseTheme) {
                case 'vs':
                    background = DEFAULT_BG_LIGHT;
                    break;
                case 'hc-black':
                    background = DEFAULT_BG_HC_BLACK;
                    break;
                case 'hc-light':
                    background = DEFAULT_BG_HC_LIGHT;
                    break;
                default: background = DEFAULT_BG_DARK;
            }
        }
        if (isMacintosh && background.toUpperCase() === DEFAULT_BG_DARK) {
            background = '#171717'; // https://github.com/electron/electron/issues/5150
        }
        return background;
    }
    saveWindowSplash(windowId, splash) {
        // Update in storage
        this.stateMainService.setItems([
            { key: THEME_STORAGE_KEY, data: splash.baseTheme },
            { key: THEME_BG_STORAGE_KEY, data: splash.colorInfo.background },
            { key: THEME_WINDOW_SPLASH, data: splash }
        ]);
        // Update in opened windows
        if (typeof windowId === 'number') {
            this.updateBackgroundColor(windowId, splash);
        }
    }
    updateBackgroundColor(windowId, splash) {
        for (const window of BrowserWindow.getAllWindows()) {
            if (window.id === windowId) {
                window.setBackgroundColor(splash.colorInfo.background);
                break;
            }
        }
    }
    getWindowSplash() {
        return this.stateMainService.getItem(THEME_WINDOW_SPLASH);
    }
};
ThemeMainService = __decorate([
    __param(0, IStateMainService),
    __param(1, IConfigurationService)
], ThemeMainService);
export { ThemeMainService };

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
import { onDidChangeFullscreen, isFullscreen } from 'vs/base/browser/browser';
import { getTotalHeight, getTotalWidth } from 'vs/base/browser/dom';
import { Color } from 'vs/base/common/color';
import { Event } from 'vs/base/common/event';
import { DisposableStore } from 'vs/base/common/lifecycle';
import { ILifecycleService } from 'vs/workbench/services/lifecycle/common/lifecycle';
import { editorBackground, foreground } from 'vs/platform/theme/common/colorRegistry';
import { getThemeTypeSelector, IThemeService } from 'vs/platform/theme/common/themeService';
import { DEFAULT_EDITOR_MIN_DIMENSIONS } from 'vs/workbench/browser/parts/editor/editor';
import * as themes from 'vs/workbench/common/theme';
import { IWorkbenchLayoutService } from 'vs/workbench/services/layout/browser/layoutService';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { IEditorGroupsService } from 'vs/workbench/services/editor/common/editorGroupsService';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import * as perf from 'vs/base/common/performance';
import { assertIsDefined } from 'vs/base/common/types';
import { RunOnceScheduler } from 'vs/base/common/async';
import { ISplashStorageService } from 'vs/workbench/contrib/splash/browser/splash';
let PartsSplash = class PartsSplash {
    _themeService;
    _layoutService;
    _environmentService;
    _partSplashService;
    static _splashElementId = 'monaco-parts-splash';
    _disposables = new DisposableStore();
    _didChangeTitleBarStyle;
    constructor(_themeService, _layoutService, _environmentService, lifecycleService, editorGroupsService, configService, _partSplashService) {
        this._themeService = _themeService;
        this._layoutService = _layoutService;
        this._environmentService = _environmentService;
        this._partSplashService = _partSplashService;
        lifecycleService.when(3 /* LifecyclePhase.Restored */).then(_ => {
            this._removePartsSplash();
            perf.mark('code/didRemovePartsSplash');
        });
        const savePartsSplashSoon = new RunOnceScheduler(() => this._savePartsSplash(), 800);
        Event.any(onDidChangeFullscreen, editorGroupsService.onDidLayout)(() => {
            savePartsSplashSoon.schedule();
        }, undefined, this._disposables);
        configService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('window.titleBarStyle')) {
                this._didChangeTitleBarStyle = true;
                this._savePartsSplash();
            }
        }, this, this._disposables);
        _themeService.onDidColorThemeChange(_ => {
            this._savePartsSplash();
        }, this, this._disposables);
    }
    dispose() {
        this._disposables.dispose();
    }
    _savePartsSplash() {
        const theme = this._themeService.getColorTheme();
        this._partSplashService.saveWindowSplash({
            baseTheme: getThemeTypeSelector(theme.type),
            colorInfo: {
                foreground: theme.getColor(foreground)?.toString(),
                background: Color.Format.CSS.formatHex(theme.getColor(editorBackground) || themes.WORKBENCH_BACKGROUND(theme)),
                editorBackground: theme.getColor(editorBackground)?.toString(),
                titleBarBackground: theme.getColor(themes.TITLE_BAR_ACTIVE_BACKGROUND)?.toString(),
                activityBarBackground: theme.getColor(themes.ACTIVITY_BAR_BACKGROUND)?.toString(),
                sideBarBackground: theme.getColor(themes.SIDE_BAR_BACKGROUND)?.toString(),
                statusBarBackground: theme.getColor(themes.STATUS_BAR_BACKGROUND)?.toString(),
                statusBarNoFolderBackground: theme.getColor(themes.STATUS_BAR_NO_FOLDER_BACKGROUND)?.toString(),
                windowBorder: theme.getColor(themes.WINDOW_ACTIVE_BORDER)?.toString() ?? theme.getColor(themes.WINDOW_INACTIVE_BORDER)?.toString()
            },
            layoutInfo: !this._shouldSaveLayoutInfo() ? undefined : {
                sideBarSide: this._layoutService.getSideBarPosition() === 1 /* Position.RIGHT */ ? 'right' : 'left',
                editorPartMinWidth: DEFAULT_EDITOR_MIN_DIMENSIONS.width,
                titleBarHeight: this._layoutService.isVisible("workbench.parts.titlebar" /* Parts.TITLEBAR_PART */) ? getTotalHeight(assertIsDefined(this._layoutService.getContainer("workbench.parts.titlebar" /* Parts.TITLEBAR_PART */))) : 0,
                activityBarWidth: this._layoutService.isVisible("workbench.parts.activitybar" /* Parts.ACTIVITYBAR_PART */) ? getTotalWidth(assertIsDefined(this._layoutService.getContainer("workbench.parts.activitybar" /* Parts.ACTIVITYBAR_PART */))) : 0,
                sideBarWidth: this._layoutService.isVisible("workbench.parts.sidebar" /* Parts.SIDEBAR_PART */) ? getTotalWidth(assertIsDefined(this._layoutService.getContainer("workbench.parts.sidebar" /* Parts.SIDEBAR_PART */))) : 0,
                statusBarHeight: this._layoutService.isVisible("workbench.parts.statusbar" /* Parts.STATUSBAR_PART */) ? getTotalHeight(assertIsDefined(this._layoutService.getContainer("workbench.parts.statusbar" /* Parts.STATUSBAR_PART */))) : 0,
                windowBorder: this._layoutService.hasWindowBorder(),
                windowBorderRadius: this._layoutService.getWindowBorderRadius()
            }
        });
    }
    _shouldSaveLayoutInfo() {
        return !isFullscreen() && !this._environmentService.isExtensionDevelopment && !this._didChangeTitleBarStyle;
    }
    _removePartsSplash() {
        const element = document.getElementById(PartsSplash._splashElementId);
        if (element) {
            element.style.display = 'none';
        }
        // remove initial colors
        const defaultStyles = document.head.getElementsByClassName('initialShellColors');
        if (defaultStyles.length) {
            document.head.removeChild(defaultStyles[0]);
        }
    }
};
PartsSplash = __decorate([
    __param(0, IThemeService),
    __param(1, IWorkbenchLayoutService),
    __param(2, IWorkbenchEnvironmentService),
    __param(3, ILifecycleService),
    __param(4, IEditorGroupsService),
    __param(5, IConfigurationService),
    __param(6, ISplashStorageService)
], PartsSplash);
export { PartsSplash };

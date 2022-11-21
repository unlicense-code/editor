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
import * as types from 'vs/base/common/types';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { IWorkbenchThemeService, ExtensionData, VS_LIGHT_THEME, VS_DARK_THEME, VS_HC_THEME, VS_HC_LIGHT_THEME, ThemeSettings } from 'vs/workbench/services/themes/common/workbenchThemeService';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { Registry } from 'vs/platform/registry/common/platform';
import * as errors from 'vs/base/common/errors';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { ColorThemeData } from 'vs/workbench/services/themes/common/colorThemeData';
import { Extensions as ThemingExtensions } from 'vs/platform/theme/common/themeService';
import { Emitter } from 'vs/base/common/event';
import { registerFileIconThemeSchemas } from 'vs/workbench/services/themes/common/fileIconThemeSchema';
import { dispose } from 'vs/base/common/lifecycle';
import { FileIconThemeData, FileIconThemeLoader } from 'vs/workbench/services/themes/browser/fileIconThemeData';
import { createStyleSheet } from 'vs/base/browser/dom';
import { IBrowserWorkbenchEnvironmentService } from 'vs/workbench/services/environment/browser/environmentService';
import { IFileService } from 'vs/platform/files/common/files';
import * as resources from 'vs/base/common/resources';
import { registerColorThemeSchemas } from 'vs/workbench/services/themes/common/colorThemeSchema';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { getRemoteAuthority } from 'vs/platform/remote/common/remoteHosts';
import { IWorkbenchLayoutService } from 'vs/workbench/services/layout/browser/layoutService';
import { IExtensionResourceLoaderService } from 'vs/platform/extensionResourceLoader/common/extensionResourceLoader';
import { ThemeRegistry, registerColorThemeExtensionPoint, registerFileIconThemeExtensionPoint, registerProductIconThemeExtensionPoint } from 'vs/workbench/services/themes/common/themeExtensionPoints';
import { updateColorThemeConfigurationSchemas, updateFileIconThemeConfigurationSchemas, ThemeConfiguration, updateProductIconThemeConfigurationSchemas } from 'vs/workbench/services/themes/common/themeConfiguration';
import { ProductIconThemeData, DEFAULT_PRODUCT_ICON_THEME_ID } from 'vs/workbench/services/themes/browser/productIconThemeData';
import { registerProductIconThemeSchemas } from 'vs/workbench/services/themes/common/productIconThemeSchema';
import { ILogService } from 'vs/platform/log/common/log';
import { isWeb } from 'vs/base/common/platform';
import { ColorScheme } from 'vs/platform/theme/common/theme';
import { IHostColorSchemeService } from 'vs/workbench/services/themes/common/hostColorSchemeService';
import { RunOnceScheduler, Sequencer } from 'vs/base/common/async';
import { IUserDataInitializationService } from 'vs/workbench/services/userData/browser/userDataInit';
import { getIconsStyleSheet } from 'vs/platform/theme/browser/iconsStyleSheet';
import { asCssVariableName, getColorRegistry } from 'vs/platform/theme/common/colorRegistry';
import { ILanguageService } from 'vs/editor/common/languages/language';
// implementation
const DEFAULT_COLOR_THEME_ID = 'vs-dark vscode-theme-defaults-themes-dark_plus-json';
const DEFAULT_LIGHT_COLOR_THEME_ID = 'vs vscode-theme-defaults-themes-light_plus-json';
const PERSISTED_OS_COLOR_SCHEME = 'osColorScheme';
const PERSISTED_OS_COLOR_SCHEME_SCOPE = -1 /* StorageScope.APPLICATION */; // the OS scheme depends on settings in the OS
const defaultThemeExtensionId = 'vscode-theme-defaults';
const DEFAULT_FILE_ICON_THEME_ID = 'vscode.vscode-theme-seti-vs-seti';
const fileIconsEnabledClass = 'file-icons-enabled';
const colorThemeRulesClassName = 'contributedColorTheme';
const fileIconThemeRulesClassName = 'contributedFileIconTheme';
const productIconThemeRulesClassName = 'contributedProductIconTheme';
const themingRegistry = Registry.as(ThemingExtensions.ThemingContribution);
function validateThemeId(theme) {
    // migrations
    switch (theme) {
        case VS_LIGHT_THEME: return `vs ${defaultThemeExtensionId}-themes-light_vs-json`;
        case VS_DARK_THEME: return `vs-dark ${defaultThemeExtensionId}-themes-dark_vs-json`;
        case VS_HC_THEME: return `hc-black ${defaultThemeExtensionId}-themes-hc_black-json`;
        case VS_HC_LIGHT_THEME: return `hc-light ${defaultThemeExtensionId}-themes-hc_light-json`;
    }
    return theme;
}
const colorThemesExtPoint = registerColorThemeExtensionPoint();
const fileIconThemesExtPoint = registerFileIconThemeExtensionPoint();
const productIconThemesExtPoint = registerProductIconThemeExtensionPoint();
let WorkbenchThemeService = class WorkbenchThemeService {
    storageService;
    configurationService;
    telemetryService;
    environmentService;
    extensionResourceLoaderService;
    layoutService;
    logService;
    hostColorService;
    userDataInitializationService;
    languageService;
    container;
    settings;
    colorThemeRegistry;
    currentColorTheme;
    onColorThemeChange;
    colorThemeWatcher;
    colorThemingParticipantChangeListener;
    colorThemeSequencer;
    fileIconThemeRegistry;
    currentFileIconTheme;
    onFileIconThemeChange;
    fileIconThemeLoader;
    fileIconThemeWatcher;
    fileIconThemeSequencer;
    productIconThemeRegistry;
    currentProductIconTheme;
    onProductIconThemeChange;
    productIconThemeWatcher;
    productIconThemeSequencer;
    themeSettingIdBeforeSchemeSwitch;
    constructor(extensionService, storageService, configurationService, telemetryService, environmentService, fileService, extensionResourceLoaderService, layoutService, logService, hostColorService, userDataInitializationService, languageService) {
        this.storageService = storageService;
        this.configurationService = configurationService;
        this.telemetryService = telemetryService;
        this.environmentService = environmentService;
        this.extensionResourceLoaderService = extensionResourceLoaderService;
        this.layoutService = layoutService;
        this.logService = logService;
        this.hostColorService = hostColorService;
        this.userDataInitializationService = userDataInitializationService;
        this.languageService = languageService;
        this.container = layoutService.container;
        this.settings = new ThemeConfiguration(configurationService);
        this.colorThemeRegistry = new ThemeRegistry(colorThemesExtPoint, ColorThemeData.fromExtensionTheme);
        this.colorThemeWatcher = new ThemeFileWatcher(fileService, environmentService, this.reloadCurrentColorTheme.bind(this));
        this.onColorThemeChange = new Emitter({ leakWarningThreshold: 400 });
        this.currentColorTheme = ColorThemeData.createUnloadedTheme('');
        this.colorThemeSequencer = new Sequencer();
        this.fileIconThemeWatcher = new ThemeFileWatcher(fileService, environmentService, this.reloadCurrentFileIconTheme.bind(this));
        this.fileIconThemeRegistry = new ThemeRegistry(fileIconThemesExtPoint, FileIconThemeData.fromExtensionTheme, true, FileIconThemeData.noIconTheme);
        this.fileIconThemeLoader = new FileIconThemeLoader(extensionResourceLoaderService, languageService);
        this.onFileIconThemeChange = new Emitter({ leakWarningThreshold: 400 });
        this.currentFileIconTheme = FileIconThemeData.createUnloadedTheme('');
        this.fileIconThemeSequencer = new Sequencer();
        this.productIconThemeWatcher = new ThemeFileWatcher(fileService, environmentService, this.reloadCurrentProductIconTheme.bind(this));
        this.productIconThemeRegistry = new ThemeRegistry(productIconThemesExtPoint, ProductIconThemeData.fromExtensionTheme, true, ProductIconThemeData.defaultTheme);
        this.onProductIconThemeChange = new Emitter();
        this.currentProductIconTheme = ProductIconThemeData.createUnloadedTheme('');
        this.productIconThemeSequencer = new Sequencer();
        // In order to avoid paint flashing for tokens, because
        // themes are loaded asynchronously, we need to initialize
        // a color theme document with good defaults until the theme is loaded
        let themeData = ColorThemeData.fromStorageData(this.storageService);
        if (themeData && this.settings.colorTheme !== themeData.settingsId && this.settings.isDefaultColorTheme()) {
            // the web has different defaults than the desktop, therefore do not restore when the setting is the default theme and the storage doesn't match that.
            themeData = undefined;
        }
        // the preferred color scheme (high contrast, light, dark) has changed since the last start
        const preferredColorScheme = this.getPreferredColorScheme();
        if (preferredColorScheme && themeData?.type !== preferredColorScheme && this.storageService.get(PERSISTED_OS_COLOR_SCHEME, PERSISTED_OS_COLOR_SCHEME_SCOPE) !== preferredColorScheme) {
            themeData = ColorThemeData.createUnloadedThemeForThemeType(preferredColorScheme);
        }
        if (!themeData) {
            const initialColorTheme = environmentService.options?.initialColorTheme;
            if (initialColorTheme) {
                themeData = ColorThemeData.createUnloadedThemeForThemeType(initialColorTheme.themeType, initialColorTheme.colors);
            }
        }
        if (!themeData) {
            themeData = ColorThemeData.createUnloadedThemeForThemeType(isWeb ? ColorScheme.LIGHT : ColorScheme.DARK);
        }
        themeData.setCustomizations(this.settings);
        this.applyTheme(themeData, undefined, true);
        const fileIconData = FileIconThemeData.fromStorageData(this.storageService);
        if (fileIconData) {
            this.applyAndSetFileIconTheme(fileIconData, true);
        }
        const productIconData = ProductIconThemeData.fromStorageData(this.storageService);
        if (productIconData) {
            this.applyAndSetProductIconTheme(productIconData, true);
        }
        Promise.all([extensionService.whenInstalledExtensionsRegistered(), userDataInitializationService.whenInitializationFinished()]).then(_ => {
            this.installConfigurationListener();
            this.installPreferredSchemeListener();
            this.installRegistryListeners();
            this.initialize().catch(errors.onUnexpectedError);
        });
        const codiconStyleSheet = createStyleSheet();
        codiconStyleSheet.id = 'codiconStyles';
        const iconsStyleSheet = getIconsStyleSheet(this);
        function updateAll() {
            codiconStyleSheet.textContent = iconsStyleSheet.getCSS();
        }
        const delayer = new RunOnceScheduler(updateAll, 0);
        iconsStyleSheet.onDidChange(() => delayer.schedule());
        delayer.schedule();
    }
    initialize() {
        const extDevLocs = this.environmentService.extensionDevelopmentLocationURI;
        const extDevLoc = extDevLocs && extDevLocs.length === 1 ? extDevLocs[0] : undefined; // in dev mode, switch to a theme provided by the extension under dev.
        const initializeColorTheme = async () => {
            const devThemes = this.colorThemeRegistry.findThemeByExtensionLocation(extDevLoc);
            if (devThemes.length) {
                return this.setColorTheme(devThemes[0].id, 8 /* ConfigurationTarget.MEMORY */);
            }
            const fallbackTheme = this.currentColorTheme.type === ColorScheme.LIGHT ? DEFAULT_LIGHT_COLOR_THEME_ID : DEFAULT_COLOR_THEME_ID;
            const theme = this.colorThemeRegistry.findThemeBySettingsId(this.settings.colorTheme, fallbackTheme);
            const preferredColorScheme = this.getPreferredColorScheme();
            const prevScheme = this.storageService.get(PERSISTED_OS_COLOR_SCHEME, PERSISTED_OS_COLOR_SCHEME_SCOPE);
            if (preferredColorScheme !== prevScheme) {
                this.storageService.store(PERSISTED_OS_COLOR_SCHEME, preferredColorScheme, PERSISTED_OS_COLOR_SCHEME_SCOPE, 0 /* StorageTarget.USER */);
                if (preferredColorScheme && theme?.type !== preferredColorScheme) {
                    return this.applyPreferredColorTheme(preferredColorScheme);
                }
            }
            return this.setColorTheme(theme && theme.id, undefined);
        };
        const initializeFileIconTheme = async () => {
            const devThemes = this.fileIconThemeRegistry.findThemeByExtensionLocation(extDevLoc);
            if (devThemes.length) {
                return this.setFileIconTheme(devThemes[0].id, 8 /* ConfigurationTarget.MEMORY */);
            }
            const theme = this.fileIconThemeRegistry.findThemeBySettingsId(this.settings.fileIconTheme);
            return this.setFileIconTheme(theme ? theme.id : DEFAULT_FILE_ICON_THEME_ID, undefined);
        };
        const initializeProductIconTheme = async () => {
            const devThemes = this.productIconThemeRegistry.findThemeByExtensionLocation(extDevLoc);
            if (devThemes.length) {
                return this.setProductIconTheme(devThemes[0].id, 8 /* ConfigurationTarget.MEMORY */);
            }
            const theme = this.productIconThemeRegistry.findThemeBySettingsId(this.settings.productIconTheme);
            return this.setProductIconTheme(theme ? theme.id : DEFAULT_PRODUCT_ICON_THEME_ID, undefined);
        };
        return Promise.all([initializeColorTheme(), initializeFileIconTheme(), initializeProductIconTheme()]);
    }
    installConfigurationListener() {
        this.configurationService.onDidChangeConfiguration(e => {
            let lazyPreferredColorScheme = null;
            const getPreferredColorScheme = () => {
                if (lazyPreferredColorScheme === null) {
                    lazyPreferredColorScheme = this.getPreferredColorScheme();
                }
                return lazyPreferredColorScheme;
            };
            if (e.affectsConfiguration(ThemeSettings.COLOR_THEME)) {
                this.restoreColorTheme();
            }
            if (e.affectsConfiguration(ThemeSettings.DETECT_COLOR_SCHEME) || e.affectsConfiguration(ThemeSettings.DETECT_HC)) {
                this.handlePreferredSchemeUpdated();
            }
            if (e.affectsConfiguration(ThemeSettings.PREFERRED_DARK_THEME) && getPreferredColorScheme() === ColorScheme.DARK) {
                this.applyPreferredColorTheme(ColorScheme.DARK);
            }
            if (e.affectsConfiguration(ThemeSettings.PREFERRED_LIGHT_THEME) && getPreferredColorScheme() === ColorScheme.LIGHT) {
                this.applyPreferredColorTheme(ColorScheme.LIGHT);
            }
            if (e.affectsConfiguration(ThemeSettings.PREFERRED_HC_DARK_THEME) && getPreferredColorScheme() === ColorScheme.HIGH_CONTRAST_DARK) {
                this.applyPreferredColorTheme(ColorScheme.HIGH_CONTRAST_DARK);
            }
            if (e.affectsConfiguration(ThemeSettings.PREFERRED_HC_LIGHT_THEME) && getPreferredColorScheme() === ColorScheme.HIGH_CONTRAST_LIGHT) {
                this.applyPreferredColorTheme(ColorScheme.HIGH_CONTRAST_LIGHT);
            }
            if (e.affectsConfiguration(ThemeSettings.FILE_ICON_THEME)) {
                this.restoreFileIconTheme();
            }
            if (e.affectsConfiguration(ThemeSettings.PRODUCT_ICON_THEME)) {
                this.restoreProductIconTheme();
            }
            if (this.currentColorTheme) {
                let hasColorChanges = false;
                if (e.affectsConfiguration(ThemeSettings.COLOR_CUSTOMIZATIONS)) {
                    this.currentColorTheme.setCustomColors(this.settings.colorCustomizations);
                    hasColorChanges = true;
                }
                if (e.affectsConfiguration(ThemeSettings.TOKEN_COLOR_CUSTOMIZATIONS)) {
                    this.currentColorTheme.setCustomTokenColors(this.settings.tokenColorCustomizations);
                    hasColorChanges = true;
                }
                if (e.affectsConfiguration(ThemeSettings.SEMANTIC_TOKEN_COLOR_CUSTOMIZATIONS)) {
                    this.currentColorTheme.setCustomSemanticTokenColors(this.settings.semanticTokenColorCustomizations);
                    hasColorChanges = true;
                }
                if (hasColorChanges) {
                    this.updateDynamicCSSRules(this.currentColorTheme);
                    this.onColorThemeChange.fire(this.currentColorTheme);
                }
            }
        });
    }
    installRegistryListeners() {
        let prevColorId = undefined;
        // update settings schema setting for theme specific settings
        this.colorThemeRegistry.onDidChange(async (event) => {
            updateColorThemeConfigurationSchemas(event.themes);
            if (await this.restoreColorTheme()) { // checks if theme from settings exists and is set
                // restore theme
                if (this.currentColorTheme.id === DEFAULT_COLOR_THEME_ID && !types.isUndefined(prevColorId) && await this.colorThemeRegistry.findThemeById(prevColorId)) {
                    await this.setColorTheme(prevColorId, 'auto');
                    prevColorId = undefined;
                }
                else if (event.added.some(t => t.settingsId === this.currentColorTheme.settingsId)) {
                    await this.reloadCurrentColorTheme();
                }
            }
            else if (event.removed.some(t => t.settingsId === this.currentColorTheme.settingsId)) {
                // current theme is no longer available
                prevColorId = this.currentColorTheme.id;
                await this.setColorTheme(DEFAULT_COLOR_THEME_ID, 'auto');
            }
        });
        let prevFileIconId = undefined;
        this.fileIconThemeRegistry.onDidChange(async (event) => {
            updateFileIconThemeConfigurationSchemas(event.themes);
            if (await this.restoreFileIconTheme()) { // checks if theme from settings exists and is set
                // restore theme
                if (this.currentFileIconTheme.id === DEFAULT_FILE_ICON_THEME_ID && !types.isUndefined(prevFileIconId) && this.fileIconThemeRegistry.findThemeById(prevFileIconId)) {
                    await this.setFileIconTheme(prevFileIconId, 'auto');
                    prevFileIconId = undefined;
                }
                else if (event.added.some(t => t.settingsId === this.currentFileIconTheme.settingsId)) {
                    await this.reloadCurrentFileIconTheme();
                }
            }
            else if (event.removed.some(t => t.settingsId === this.currentFileIconTheme.settingsId)) {
                // current theme is no longer available
                prevFileIconId = this.currentFileIconTheme.id;
                await this.setFileIconTheme(DEFAULT_FILE_ICON_THEME_ID, 'auto');
            }
        });
        let prevProductIconId = undefined;
        this.productIconThemeRegistry.onDidChange(async (event) => {
            updateProductIconThemeConfigurationSchemas(event.themes);
            if (await this.restoreProductIconTheme()) { // checks if theme from settings exists and is set
                // restore theme
                if (this.currentProductIconTheme.id === DEFAULT_PRODUCT_ICON_THEME_ID && !types.isUndefined(prevProductIconId) && this.productIconThemeRegistry.findThemeById(prevProductIconId)) {
                    await this.setProductIconTheme(prevProductIconId, 'auto');
                    prevProductIconId = undefined;
                }
                else if (event.added.some(t => t.settingsId === this.currentProductIconTheme.settingsId)) {
                    await this.reloadCurrentProductIconTheme();
                }
            }
            else if (event.removed.some(t => t.settingsId === this.currentProductIconTheme.settingsId)) {
                // current theme is no longer available
                prevProductIconId = this.currentProductIconTheme.id;
                await this.setProductIconTheme(DEFAULT_PRODUCT_ICON_THEME_ID, 'auto');
            }
        });
        return Promise.all([this.getColorThemes(), this.getFileIconThemes(), this.getProductIconThemes()]).then(([ct, fit, pit]) => {
            updateColorThemeConfigurationSchemas(ct);
            updateFileIconThemeConfigurationSchemas(fit);
            updateProductIconThemeConfigurationSchemas(pit);
        });
    }
    // preferred scheme handling
    installPreferredSchemeListener() {
        this.hostColorService.onDidChangeColorScheme(() => this.handlePreferredSchemeUpdated());
    }
    async handlePreferredSchemeUpdated() {
        const scheme = this.getPreferredColorScheme();
        const prevScheme = this.storageService.get(PERSISTED_OS_COLOR_SCHEME, PERSISTED_OS_COLOR_SCHEME_SCOPE);
        if (scheme !== prevScheme) {
            this.storageService.store(PERSISTED_OS_COLOR_SCHEME, scheme, PERSISTED_OS_COLOR_SCHEME_SCOPE, 1 /* StorageTarget.MACHINE */);
            if (scheme) {
                if (!prevScheme) {
                    // remember the theme before scheme switching
                    this.themeSettingIdBeforeSchemeSwitch = this.settings.colorTheme;
                }
                return this.applyPreferredColorTheme(scheme);
            }
            else if (prevScheme && this.themeSettingIdBeforeSchemeSwitch) {
                // reapply the theme before scheme switching
                const theme = this.colorThemeRegistry.findThemeBySettingsId(this.themeSettingIdBeforeSchemeSwitch, undefined);
                if (theme) {
                    this.setColorTheme(theme.id, 'auto');
                }
            }
        }
        return undefined;
    }
    getPreferredColorScheme() {
        if (this.configurationService.getValue(ThemeSettings.DETECT_HC) && this.hostColorService.highContrast) {
            return this.hostColorService.dark ? ColorScheme.HIGH_CONTRAST_DARK : ColorScheme.HIGH_CONTRAST_LIGHT;
        }
        if (this.configurationService.getValue(ThemeSettings.DETECT_COLOR_SCHEME)) {
            return this.hostColorService.dark ? ColorScheme.DARK : ColorScheme.LIGHT;
        }
        return undefined;
    }
    async applyPreferredColorTheme(type) {
        let settingId;
        switch (type) {
            case ColorScheme.LIGHT:
                settingId = ThemeSettings.PREFERRED_LIGHT_THEME;
                break;
            case ColorScheme.HIGH_CONTRAST_DARK:
                settingId = ThemeSettings.PREFERRED_HC_DARK_THEME;
                break;
            case ColorScheme.HIGH_CONTRAST_LIGHT:
                settingId = ThemeSettings.PREFERRED_HC_LIGHT_THEME;
                break;
            default:
                settingId = ThemeSettings.PREFERRED_DARK_THEME;
        }
        const themeSettingId = this.configurationService.getValue(settingId);
        if (themeSettingId && typeof themeSettingId === 'string') {
            const theme = this.colorThemeRegistry.findThemeBySettingsId(themeSettingId, undefined);
            if (theme) {
                const configurationTarget = this.settings.findAutoConfigurationTarget(settingId);
                return this.setColorTheme(theme.id, configurationTarget);
            }
        }
        return null;
    }
    getColorTheme() {
        return this.currentColorTheme;
    }
    async getColorThemes() {
        return this.colorThemeRegistry.getThemes();
    }
    async getMarketplaceColorThemes(publisher, name, version) {
        const extensionLocation = this.extensionResourceLoaderService.getExtensionGalleryResourceURL({ publisher, name, version }, 'extension');
        if (extensionLocation) {
            try {
                const manifestContent = await this.extensionResourceLoaderService.readExtensionResource(resources.joinPath(extensionLocation, 'package.json'));
                return this.colorThemeRegistry.getMarketplaceThemes(JSON.parse(manifestContent), extensionLocation, ExtensionData.fromName(publisher, name));
            }
            catch (e) {
                this.logService.error('Problem loading themes from marketplace', e);
            }
        }
        return [];
    }
    get onDidColorThemeChange() {
        return this.onColorThemeChange.event;
    }
    setColorTheme(themeIdOrTheme, settingsTarget) {
        return this.colorThemeSequencer.queue(async () => {
            return this.internalSetColorTheme(themeIdOrTheme, settingsTarget);
        });
    }
    async internalSetColorTheme(themeIdOrTheme, settingsTarget) {
        if (!themeIdOrTheme) {
            return null;
        }
        const themeId = types.isString(themeIdOrTheme) ? validateThemeId(themeIdOrTheme) : themeIdOrTheme.id;
        if (this.currentColorTheme.isLoaded && themeId === this.currentColorTheme.id) {
            if (settingsTarget !== 'preview') {
                this.currentColorTheme.toStorage(this.storageService);
            }
            return this.settings.setColorTheme(this.currentColorTheme, settingsTarget);
        }
        let themeData = this.colorThemeRegistry.findThemeById(themeId);
        if (!themeData) {
            if (themeIdOrTheme instanceof ColorThemeData) {
                themeData = themeIdOrTheme;
            }
            else {
                return null;
            }
        }
        try {
            await themeData.ensureLoaded(this.extensionResourceLoaderService);
            themeData.setCustomizations(this.settings);
            return this.applyTheme(themeData, settingsTarget);
        }
        catch (error) {
            throw new Error(nls.localize('error.cannotloadtheme', "Unable to load {0}: {1}", themeData.location?.toString(), error.message));
        }
    }
    reloadCurrentColorTheme() {
        return this.colorThemeSequencer.queue(async () => {
            try {
                const theme = this.colorThemeRegistry.findThemeBySettingsId(this.currentColorTheme.settingsId) || this.currentColorTheme;
                await theme.reload(this.extensionResourceLoaderService);
                theme.setCustomizations(this.settings);
                await this.applyTheme(theme, undefined, false);
            }
            catch (error) {
                this.logService.info('Unable to reload {0}: {1}', this.currentColorTheme.location?.toString());
            }
        });
    }
    async restoreColorTheme() {
        return this.colorThemeSequencer.queue(async () => {
            const settingId = this.settings.colorTheme;
            const theme = this.colorThemeRegistry.findThemeBySettingsId(settingId);
            if (theme) {
                if (settingId !== this.currentColorTheme.settingsId) {
                    await this.internalSetColorTheme(theme.id, undefined);
                }
                else if (theme !== this.currentColorTheme) {
                    await theme.ensureLoaded(this.extensionResourceLoaderService);
                    theme.setCustomizations(this.settings);
                    await this.applyTheme(theme, undefined, true);
                }
                return true;
            }
            return false;
        });
    }
    updateDynamicCSSRules(themeData) {
        const cssRules = new Set();
        const ruleCollector = {
            addRule: (rule) => {
                if (!cssRules.has(rule)) {
                    cssRules.add(rule);
                }
            }
        };
        ruleCollector.addRule(`.monaco-workbench { forced-color-adjust: none; }`);
        themingRegistry.getThemingParticipants().forEach(p => p(themeData, ruleCollector, this.environmentService));
        const colorVariables = [];
        for (const item of getColorRegistry().getColors()) {
            const color = themeData.getColor(item.id, true);
            if (color) {
                colorVariables.push(`${asCssVariableName(item.id)}: ${color.toString()};`);
            }
        }
        ruleCollector.addRule(`.monaco-workbench { ${colorVariables.join('\n')} }`);
        _applyRules([...cssRules].join('\n'), colorThemeRulesClassName);
    }
    applyTheme(newTheme, settingsTarget, silent = false) {
        this.updateDynamicCSSRules(newTheme);
        if (this.currentColorTheme.id) {
            this.container.classList.remove(...this.currentColorTheme.classNames);
        }
        else {
            this.container.classList.remove(VS_DARK_THEME, VS_LIGHT_THEME, VS_HC_THEME, VS_HC_LIGHT_THEME);
        }
        this.container.classList.add(...newTheme.classNames);
        this.currentColorTheme.clearCaches();
        this.currentColorTheme = newTheme;
        if (!this.colorThemingParticipantChangeListener) {
            this.colorThemingParticipantChangeListener = themingRegistry.onThemingParticipantAdded(_ => this.updateDynamicCSSRules(this.currentColorTheme));
        }
        this.colorThemeWatcher.update(newTheme);
        this.sendTelemetry(newTheme.id, newTheme.extensionData, 'color');
        if (silent) {
            return Promise.resolve(null);
        }
        this.onColorThemeChange.fire(this.currentColorTheme);
        // remember theme data for a quick restore
        if (newTheme.isLoaded && settingsTarget !== 'preview') {
            newTheme.toStorage(this.storageService);
        }
        return this.settings.setColorTheme(this.currentColorTheme, settingsTarget);
    }
    themeExtensionsActivated = new Map();
    sendTelemetry(themeId, themeData, themeType) {
        if (themeData) {
            const key = themeType + themeData.extensionId;
            if (!this.themeExtensionsActivated.get(key)) {
                this.telemetryService.publicLog2('activatePlugin', {
                    id: themeData.extensionId,
                    name: themeData.extensionName,
                    isBuiltin: themeData.extensionIsBuiltin,
                    publisherDisplayName: themeData.extensionPublisher,
                    themeId: themeId
                });
                this.themeExtensionsActivated.set(key, true);
            }
        }
    }
    async getFileIconThemes() {
        return this.fileIconThemeRegistry.getThemes();
    }
    getFileIconTheme() {
        return this.currentFileIconTheme;
    }
    get onDidFileIconThemeChange() {
        return this.onFileIconThemeChange.event;
    }
    async setFileIconTheme(iconThemeOrId, settingsTarget) {
        return this.fileIconThemeSequencer.queue(async () => {
            return this.internalSetFileIconTheme(iconThemeOrId, settingsTarget);
        });
    }
    async internalSetFileIconTheme(iconThemeOrId, settingsTarget) {
        if (iconThemeOrId === undefined) {
            iconThemeOrId = '';
        }
        const themeId = types.isString(iconThemeOrId) ? iconThemeOrId : iconThemeOrId.id;
        if (themeId !== this.currentFileIconTheme.id || !this.currentFileIconTheme.isLoaded) {
            let newThemeData = this.fileIconThemeRegistry.findThemeById(themeId);
            if (!newThemeData && iconThemeOrId instanceof FileIconThemeData) {
                newThemeData = iconThemeOrId;
            }
            if (!newThemeData) {
                newThemeData = FileIconThemeData.noIconTheme;
            }
            await newThemeData.ensureLoaded(this.fileIconThemeLoader);
            this.applyAndSetFileIconTheme(newThemeData); // updates this.currentFileIconTheme
        }
        const themeData = this.currentFileIconTheme;
        // remember theme data for a quick restore
        if (themeData.isLoaded && settingsTarget !== 'preview' && (!themeData.location || !getRemoteAuthority(themeData.location))) {
            themeData.toStorage(this.storageService);
        }
        await this.settings.setFileIconTheme(this.currentFileIconTheme, settingsTarget);
        return themeData;
    }
    async getMarketplaceFileIconThemes(publisher, name, version) {
        const extensionLocation = this.extensionResourceLoaderService.getExtensionGalleryResourceURL({ publisher, name, version }, 'extension');
        if (extensionLocation) {
            try {
                const manifestContent = await this.extensionResourceLoaderService.readExtensionResource(resources.joinPath(extensionLocation, 'package.json'));
                return this.fileIconThemeRegistry.getMarketplaceThemes(JSON.parse(manifestContent), extensionLocation, ExtensionData.fromName(publisher, name));
            }
            catch (e) {
                this.logService.error('Problem loading themes from marketplace', e);
            }
        }
        return [];
    }
    async reloadCurrentFileIconTheme() {
        return this.fileIconThemeSequencer.queue(async () => {
            await this.currentFileIconTheme.reload(this.fileIconThemeLoader);
            this.applyAndSetFileIconTheme(this.currentFileIconTheme);
        });
    }
    async restoreFileIconTheme() {
        return this.fileIconThemeSequencer.queue(async () => {
            const settingId = this.settings.fileIconTheme;
            const theme = this.fileIconThemeRegistry.findThemeBySettingsId(settingId);
            if (theme) {
                if (settingId !== this.currentFileIconTheme.settingsId) {
                    await this.internalSetFileIconTheme(theme.id, undefined);
                }
                else if (theme !== this.currentFileIconTheme) {
                    await theme.ensureLoaded(this.fileIconThemeLoader);
                    this.applyAndSetFileIconTheme(theme, true);
                }
                return true;
            }
            return false;
        });
    }
    applyAndSetFileIconTheme(iconThemeData, silent = false) {
        this.currentFileIconTheme = iconThemeData;
        _applyRules(iconThemeData.styleSheetContent, fileIconThemeRulesClassName);
        if (iconThemeData.id) {
            this.container.classList.add(fileIconsEnabledClass);
        }
        else {
            this.container.classList.remove(fileIconsEnabledClass);
        }
        this.fileIconThemeWatcher.update(iconThemeData);
        if (iconThemeData.id) {
            this.sendTelemetry(iconThemeData.id, iconThemeData.extensionData, 'fileIcon');
        }
        if (!silent) {
            this.onFileIconThemeChange.fire(this.currentFileIconTheme);
        }
    }
    async getProductIconThemes() {
        return this.productIconThemeRegistry.getThemes();
    }
    getProductIconTheme() {
        return this.currentProductIconTheme;
    }
    get onDidProductIconThemeChange() {
        return this.onProductIconThemeChange.event;
    }
    async setProductIconTheme(iconThemeOrId, settingsTarget) {
        return this.productIconThemeSequencer.queue(async () => {
            return this.internalSetProductIconTheme(iconThemeOrId, settingsTarget);
        });
    }
    async internalSetProductIconTheme(iconThemeOrId, settingsTarget) {
        if (iconThemeOrId === undefined) {
            iconThemeOrId = '';
        }
        const themeId = types.isString(iconThemeOrId) ? iconThemeOrId : iconThemeOrId.id;
        if (themeId !== this.currentProductIconTheme.id || !this.currentProductIconTheme.isLoaded) {
            let newThemeData = this.productIconThemeRegistry.findThemeById(themeId);
            if (!newThemeData && iconThemeOrId instanceof ProductIconThemeData) {
                newThemeData = iconThemeOrId;
            }
            if (!newThemeData) {
                newThemeData = ProductIconThemeData.defaultTheme;
            }
            await newThemeData.ensureLoaded(this.extensionResourceLoaderService, this.logService);
            this.applyAndSetProductIconTheme(newThemeData); // updates this.currentProductIconTheme
        }
        const themeData = this.currentProductIconTheme;
        // remember theme data for a quick restore
        if (themeData.isLoaded && settingsTarget !== 'preview' && (!themeData.location || !getRemoteAuthority(themeData.location))) {
            themeData.toStorage(this.storageService);
        }
        await this.settings.setProductIconTheme(this.currentProductIconTheme, settingsTarget);
        return themeData;
    }
    async getMarketplaceProductIconThemes(publisher, name, version) {
        const extensionLocation = this.extensionResourceLoaderService.getExtensionGalleryResourceURL({ publisher, name, version }, 'extension');
        if (extensionLocation) {
            try {
                const manifestContent = await this.extensionResourceLoaderService.readExtensionResource(resources.joinPath(extensionLocation, 'package.json'));
                return this.productIconThemeRegistry.getMarketplaceThemes(JSON.parse(manifestContent), extensionLocation, ExtensionData.fromName(publisher, name));
            }
            catch (e) {
                this.logService.error('Problem loading themes from marketplace', e);
            }
        }
        return [];
    }
    async reloadCurrentProductIconTheme() {
        return this.productIconThemeSequencer.queue(async () => {
            await this.currentProductIconTheme.reload(this.extensionResourceLoaderService, this.logService);
            this.applyAndSetProductIconTheme(this.currentProductIconTheme);
        });
    }
    async restoreProductIconTheme() {
        return this.productIconThemeSequencer.queue(async () => {
            const settingId = this.settings.productIconTheme;
            const theme = this.productIconThemeRegistry.findThemeBySettingsId(settingId);
            if (theme) {
                if (settingId !== this.currentProductIconTheme.settingsId) {
                    await this.internalSetProductIconTheme(theme.id, undefined);
                }
                else if (theme !== this.currentProductIconTheme) {
                    await theme.ensureLoaded(this.extensionResourceLoaderService, this.logService);
                    this.applyAndSetProductIconTheme(theme, true);
                }
                return true;
            }
            return false;
        });
    }
    applyAndSetProductIconTheme(iconThemeData, silent = false) {
        this.currentProductIconTheme = iconThemeData;
        _applyRules(iconThemeData.styleSheetContent, productIconThemeRulesClassName);
        this.productIconThemeWatcher.update(iconThemeData);
        if (iconThemeData.id) {
            this.sendTelemetry(iconThemeData.id, iconThemeData.extensionData, 'productIcon');
        }
        if (!silent) {
            this.onProductIconThemeChange.fire(this.currentProductIconTheme);
        }
    }
};
WorkbenchThemeService = __decorate([
    __param(0, IExtensionService),
    __param(1, IStorageService),
    __param(2, IConfigurationService),
    __param(3, ITelemetryService),
    __param(4, IBrowserWorkbenchEnvironmentService),
    __param(5, IFileService),
    __param(6, IExtensionResourceLoaderService),
    __param(7, IWorkbenchLayoutService),
    __param(8, ILogService),
    __param(9, IHostColorSchemeService),
    __param(10, IUserDataInitializationService),
    __param(11, ILanguageService)
], WorkbenchThemeService);
export { WorkbenchThemeService };
class ThemeFileWatcher {
    fileService;
    environmentService;
    onUpdate;
    watchedLocation;
    watcherDisposable;
    fileChangeListener;
    constructor(fileService, environmentService, onUpdate) {
        this.fileService = fileService;
        this.environmentService = environmentService;
        this.onUpdate = onUpdate;
    }
    update(theme) {
        if (!resources.isEqual(theme.location, this.watchedLocation)) {
            this.dispose();
            if (theme.location && (theme.watch || this.environmentService.isExtensionDevelopment)) {
                this.watchedLocation = theme.location;
                this.watcherDisposable = this.fileService.watch(theme.location);
                this.fileService.onDidFilesChange(e => {
                    if (this.watchedLocation && e.contains(this.watchedLocation, 0 /* FileChangeType.UPDATED */)) {
                        this.onUpdate();
                    }
                });
            }
        }
    }
    dispose() {
        this.watcherDisposable = dispose(this.watcherDisposable);
        this.fileChangeListener = dispose(this.fileChangeListener);
        this.watchedLocation = undefined;
    }
}
function _applyRules(styleSheetContent, rulesClassName) {
    const themeStyles = document.head.getElementsByClassName(rulesClassName);
    if (themeStyles.length === 0) {
        const elStyle = document.createElement('style');
        elStyle.type = 'text/css';
        elStyle.className = rulesClassName;
        elStyle.textContent = styleSheetContent;
        document.head.appendChild(elStyle);
    }
    else {
        themeStyles[0].textContent = styleSheetContent;
    }
}
registerColorThemeSchemas();
registerFileIconThemeSchemas();
registerProductIconThemeSchemas();
// The WorkbenchThemeService should stay eager as the constructor restores the
// last used colors / icons from storage. This needs to happen as quickly as possible
// for a flicker-free startup experience.
registerSingleton(IWorkbenchThemeService, WorkbenchThemeService, 0 /* InstantiationType.Eager */);

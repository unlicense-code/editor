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
import { localize } from 'vs/nls';
import { KeyChord } from 'vs/base/common/keyCodes';
import { MenuRegistry, MenuId, Action2, registerAction2 } from 'vs/platform/actions/common/actions';
import { equalsIgnoreCase } from 'vs/base/common/strings';
import { Registry } from 'vs/platform/registry/common/platform';
import { Categories } from 'vs/platform/action/common/actionCommonCategories';
import { IWorkbenchThemeService, ThemeSettings } from 'vs/workbench/services/themes/common/workbenchThemeService';
import { VIEWLET_ID } from 'vs/workbench/contrib/extensions/common/extensions';
import { IExtensionGalleryService, IExtensionManagementService } from 'vs/platform/extensionManagement/common/extensionManagement';
import { Extensions as ColorRegistryExtensions } from 'vs/platform/theme/common/colorRegistry';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { Color } from 'vs/base/common/color';
import { ColorScheme, isHighContrast } from 'vs/platform/theme/common/theme';
import { colorThemeSchemaId } from 'vs/workbench/services/themes/common/colorThemeSchema';
import { isCancellationError, onUnexpectedError } from 'vs/base/common/errors';
import { IQuickInputService } from 'vs/platform/quickinput/common/quickInput';
import { DEFAULT_PRODUCT_ICON_THEME_ID, ProductIconThemeData } from 'vs/workbench/services/themes/browser/productIconThemeData';
import { IPaneCompositePartService } from 'vs/workbench/services/panecomposite/browser/panecomposite';
import { ThrottledDelayer } from 'vs/base/common/async';
import { CancellationTokenSource } from 'vs/base/common/cancellation';
import { ILogService } from 'vs/platform/log/common/log';
import { IProgressService } from 'vs/platform/progress/common/progress';
import { Codicon } from 'vs/base/common/codicons';
import { registerIcon } from 'vs/platform/theme/common/iconRegistry';
import { ThemeIcon } from 'vs/platform/theme/common/themeService';
import { Emitter } from 'vs/base/common/event';
import { IExtensionResourceLoaderService } from 'vs/platform/extensionResourceLoader/common/extensionResourceLoader';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { CommandsRegistry } from 'vs/platform/commands/common/commands';
import { FileIconThemeData } from 'vs/workbench/services/themes/browser/fileIconThemeData';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
export const manageExtensionIcon = registerIcon('theme-selection-manage-extension', Codicon.gear, localize('manageExtensionIcon', 'Icon for the \'Manage\' action in the theme selection quick pick.'));
let MarketplaceThemesPicker = class MarketplaceThemesPicker {
    getMarketplaceColorThemes;
    marketplaceQuery;
    extensionGalleryService;
    extensionManagementService;
    quickInputService;
    logService;
    progressService;
    paneCompositeService;
    _installedExtensions;
    _marketplaceExtensions = new Set();
    _marketplaceThemes = [];
    _searchOngoing = false;
    _onDidChange = new Emitter();
    _tokenSource;
    _queryDelayer = new ThrottledDelayer(200);
    constructor(getMarketplaceColorThemes, marketplaceQuery, extensionGalleryService, extensionManagementService, quickInputService, logService, progressService, paneCompositeService) {
        this.getMarketplaceColorThemes = getMarketplaceColorThemes;
        this.marketplaceQuery = marketplaceQuery;
        this.extensionGalleryService = extensionGalleryService;
        this.extensionManagementService = extensionManagementService;
        this.quickInputService = quickInputService;
        this.logService = logService;
        this.progressService = progressService;
        this.paneCompositeService = paneCompositeService;
        this._installedExtensions = extensionManagementService.getInstalled().then(installed => {
            const result = new Set();
            for (const ext of installed) {
                result.add(ext.identifier.id);
            }
            return result;
        });
    }
    get themes() {
        return this._marketplaceThemes;
    }
    get isSearching() {
        return this._searchOngoing;
    }
    get onDidChange() {
        return this._onDidChange.event;
    }
    trigger(value) {
        if (this._tokenSource) {
            this._tokenSource.cancel();
            this._tokenSource = undefined;
        }
        this._queryDelayer.trigger(() => {
            this._tokenSource = new CancellationTokenSource();
            return this.doSearch(value, this._tokenSource.token);
        });
    }
    async doSearch(value, token) {
        this._searchOngoing = true;
        this._onDidChange.fire();
        try {
            const installedExtensions = await this._installedExtensions;
            const options = { text: `${this.marketplaceQuery} ${value}`, pageSize: 20 };
            const pager = await this.extensionGalleryService.query(options, token);
            for (let i = 0; i < pager.total && i < 1; i++) { // loading multiple pages is turned of for now to avoid flickering
                if (token.isCancellationRequested) {
                    break;
                }
                const nThemes = this._marketplaceThemes.length;
                const gallery = i === 0 ? pager.firstPage : await pager.getPage(i, token);
                const promises = [];
                const promisesGalleries = [];
                for (let i = 0; i < gallery.length; i++) {
                    if (token.isCancellationRequested) {
                        break;
                    }
                    const ext = gallery[i];
                    if (!installedExtensions.has(ext.identifier.id) && !this._marketplaceExtensions.has(ext.identifier.id)) {
                        this._marketplaceExtensions.add(ext.identifier.id);
                        promises.push(this.getMarketplaceColorThemes(ext.publisher, ext.name, ext.version));
                        promisesGalleries.push(ext);
                    }
                }
                const allThemes = await Promise.all(promises);
                for (let i = 0; i < allThemes.length; i++) {
                    const ext = promisesGalleries[i];
                    for (const theme of allThemes[i]) {
                        this._marketplaceThemes.push({ id: theme.id, theme: theme, label: theme.label, description: `${ext.displayName} · ${ext.publisherDisplayName}`, galleryExtension: ext, buttons: [configureButton] });
                    }
                }
                if (nThemes !== this._marketplaceThemes.length) {
                    this._marketplaceThemes.sort((t1, t2) => t1.label.localeCompare(t2.label));
                    this._onDidChange.fire();
                }
            }
        }
        catch (e) {
            if (!isCancellationError(e)) {
                this.logService.error(`Error while searching for themes:`, e);
            }
        }
        finally {
            this._searchOngoing = false;
            this._onDidChange.fire();
        }
    }
    openQuickPick(value, currentTheme, selectTheme) {
        let result = undefined;
        return new Promise((s, _) => {
            const quickpick = this.quickInputService.createQuickPick();
            quickpick.items = [];
            quickpick.sortByLabel = false;
            quickpick.matchOnDescription = true;
            quickpick.buttons = [this.quickInputService.backButton];
            quickpick.title = 'Marketplace Themes';
            quickpick.placeholder = localize('themes.selectMarketplaceTheme', "Type to Search More. Select to Install. Up/Down Keys to Preview");
            quickpick.canSelectMany = false;
            quickpick.onDidChangeValue(() => this.trigger(quickpick.value));
            quickpick.onDidAccept(async (_) => {
                const themeItem = quickpick.selectedItems[0];
                if (themeItem?.galleryExtension) {
                    result = 'selected';
                    quickpick.hide();
                    const success = await this.installExtension(themeItem.galleryExtension);
                    if (success) {
                        selectTheme(themeItem.theme, true);
                    }
                }
            });
            quickpick.onDidTriggerItemButton(e => {
                if (isItem(e.item)) {
                    const extensionId = e.item.theme?.extensionData?.extensionId;
                    if (extensionId) {
                        openExtensionViewlet(this.paneCompositeService, `@id:${extensionId}`);
                    }
                    else {
                        openExtensionViewlet(this.paneCompositeService, `${this.marketplaceQuery} ${quickpick.value}`);
                    }
                }
            });
            quickpick.onDidChangeActive(themes => selectTheme(themes[0]?.theme, false));
            quickpick.onDidHide(() => {
                if (result === undefined) {
                    selectTheme(currentTheme, true);
                    result = 'cancelled';
                }
                quickpick.dispose();
                s(result);
            });
            quickpick.onDidTriggerButton(e => {
                if (e === this.quickInputService.backButton) {
                    result = 'back';
                    quickpick.hide();
                }
            });
            this.onDidChange(() => {
                let items = this.themes;
                if (this.isSearching) {
                    items = items.concat({ label: '$(sync~spin) Searching for themes...', id: undefined, alwaysShow: true });
                }
                const activeItemId = quickpick.activeItems[0]?.id;
                const newActiveItem = activeItemId ? items.find(i => isItem(i) && i.id === activeItemId) : undefined;
                quickpick.items = items;
                if (newActiveItem) {
                    quickpick.activeItems = [newActiveItem];
                }
            });
            this.trigger(value);
            quickpick.show();
        });
    }
    async installExtension(galleryExtension) {
        try {
            openExtensionViewlet(this.paneCompositeService, `@id:${galleryExtension.identifier.id}`);
            await this.progressService.withProgress({
                location: 15 /* ProgressLocation.Notification */,
                title: localize('installing extensions', "Installing Extension {0}...", galleryExtension.displayName)
            }, async () => {
                await this.extensionManagementService.installFromGallery(galleryExtension);
            });
            return true;
        }
        catch (e) {
            this.logService.error(`Problem installing extension ${galleryExtension.identifier.id}`, e);
            return false;
        }
    }
    dispose() {
        if (this._tokenSource) {
            this._tokenSource.cancel();
            this._tokenSource = undefined;
        }
        this._queryDelayer.dispose();
        this._marketplaceExtensions.clear();
        this._marketplaceThemes.length = 0;
    }
};
MarketplaceThemesPicker = __decorate([
    __param(2, IExtensionGalleryService),
    __param(3, IExtensionManagementService),
    __param(4, IQuickInputService),
    __param(5, ILogService),
    __param(6, IProgressService),
    __param(7, IPaneCompositePartService)
], MarketplaceThemesPicker);
let InstalledThemesPicker = class InstalledThemesPicker {
    installMessage;
    browseMessage;
    placeholderMessage;
    marketplaceTag;
    setTheme;
    getMarketplaceColorThemes;
    quickInputService;
    extensionGalleryService;
    paneCompositeService;
    extensionResourceLoaderService;
    instantiationService;
    constructor(installMessage, browseMessage, placeholderMessage, marketplaceTag, setTheme, getMarketplaceColorThemes, quickInputService, extensionGalleryService, paneCompositeService, extensionResourceLoaderService, instantiationService) {
        this.installMessage = installMessage;
        this.browseMessage = browseMessage;
        this.placeholderMessage = placeholderMessage;
        this.marketplaceTag = marketplaceTag;
        this.setTheme = setTheme;
        this.getMarketplaceColorThemes = getMarketplaceColorThemes;
        this.quickInputService = quickInputService;
        this.extensionGalleryService = extensionGalleryService;
        this.paneCompositeService = paneCompositeService;
        this.extensionResourceLoaderService = extensionResourceLoaderService;
        this.instantiationService = instantiationService;
    }
    async openQuickPick(picks, currentTheme) {
        let marketplaceThemePicker;
        if (this.extensionGalleryService.isEnabled()) {
            if (this.extensionResourceLoaderService.supportsExtensionGalleryResources && this.browseMessage) {
                marketplaceThemePicker = this.instantiationService.createInstance(MarketplaceThemesPicker, this.getMarketplaceColorThemes.bind(this), this.marketplaceTag);
                picks = [...configurationEntries(this.browseMessage), ...picks];
            }
            else {
                picks = [...picks, ...configurationEntries(this.installMessage)];
            }
        }
        let selectThemeTimeout;
        const selectTheme = (theme, applyTheme) => {
            if (selectThemeTimeout) {
                clearTimeout(selectThemeTimeout);
            }
            selectThemeTimeout = window.setTimeout(() => {
                selectThemeTimeout = undefined;
                const newTheme = (theme ?? currentTheme);
                this.setTheme(newTheme, applyTheme ? 'auto' : 'preview').then(undefined, err => {
                    onUnexpectedError(err);
                    this.setTheme(currentTheme, undefined);
                });
            }, applyTheme ? 0 : 200);
        };
        const pickInstalledThemes = (activeItemId) => {
            return new Promise((s, _) => {
                let isCompleted = false;
                const autoFocusIndex = picks.findIndex(p => isItem(p) && p.id === activeItemId);
                const quickpick = this.quickInputService.createQuickPick();
                quickpick.items = picks;
                quickpick.placeholder = this.placeholderMessage;
                quickpick.activeItems = [picks[autoFocusIndex]];
                quickpick.canSelectMany = false;
                quickpick.onDidAccept(async (_) => {
                    isCompleted = true;
                    const theme = quickpick.selectedItems[0];
                    if (!theme || typeof theme.id === 'undefined') { // 'pick in marketplace' entry
                        if (marketplaceThemePicker) {
                            const res = await marketplaceThemePicker.openQuickPick(quickpick.value, currentTheme, selectTheme);
                            if (res === 'back') {
                                await pickInstalledThemes(undefined);
                            }
                        }
                        else {
                            openExtensionViewlet(this.paneCompositeService, `${this.marketplaceTag} ${quickpick.value}`);
                        }
                    }
                    else {
                        selectTheme(theme.theme, true);
                    }
                    quickpick.hide();
                    s();
                });
                quickpick.onDidChangeActive(themes => selectTheme(themes[0]?.theme, false));
                quickpick.onDidHide(() => {
                    if (!isCompleted) {
                        selectTheme(currentTheme, true);
                        s();
                    }
                    quickpick.dispose();
                });
                quickpick.onDidTriggerItemButton(e => {
                    if (isItem(e.item)) {
                        const extensionId = e.item.theme?.extensionData?.extensionId;
                        if (extensionId) {
                            openExtensionViewlet(this.paneCompositeService, `@id:${extensionId}`);
                        }
                        else {
                            openExtensionViewlet(this.paneCompositeService, `${this.marketplaceTag} ${quickpick.value}`);
                        }
                    }
                });
                quickpick.show();
            });
        };
        await pickInstalledThemes(currentTheme.id);
        marketplaceThemePicker?.dispose();
    }
};
InstalledThemesPicker = __decorate([
    __param(6, IQuickInputService),
    __param(7, IExtensionGalleryService),
    __param(8, IPaneCompositePartService),
    __param(9, IExtensionResourceLoaderService),
    __param(10, IInstantiationService)
], InstalledThemesPicker);
const SelectColorThemeCommandId = 'workbench.action.selectTheme';
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: SelectColorThemeCommandId,
            title: { value: localize('selectTheme.label', "Color Theme"), original: 'Color Theme' },
            category: Categories.Preferences,
            f1: true,
            keybinding: {
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                primary: KeyChord(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 50 /* KeyCode.KeyT */)
            }
        });
    }
    async run(accessor) {
        const themeService = accessor.get(IWorkbenchThemeService);
        const installMessage = localize('installColorThemes', "Install Additional Color Themes...");
        const browseMessage = '$(plus) ' + localize('browseColorThemes', "Browse Additional Color Themes...");
        const placeholderMessage = localize('themes.selectTheme', "Select Color Theme (Up/Down Keys to Preview)");
        const marketplaceTag = 'category:themes';
        const setTheme = (theme, settingsTarget) => themeService.setColorTheme(theme, settingsTarget);
        const getMarketplaceColorThemes = (publisher, name, version) => themeService.getMarketplaceColorThemes(publisher, name, version);
        const instantiationService = accessor.get(IInstantiationService);
        const picker = instantiationService.createInstance(InstalledThemesPicker, installMessage, browseMessage, placeholderMessage, marketplaceTag, setTheme, getMarketplaceColorThemes);
        const themes = await themeService.getColorThemes();
        const currentTheme = themeService.getColorTheme();
        const picks = [
            ...toEntries(themes.filter(t => t.type === ColorScheme.LIGHT), localize('themes.category.light', "light themes")),
            ...toEntries(themes.filter(t => t.type === ColorScheme.DARK), localize('themes.category.dark', "dark themes")),
            ...toEntries(themes.filter(t => isHighContrast(t.type)), localize('themes.category.hc', "high contrast themes")),
        ];
        await picker.openQuickPick(picks, currentTheme);
    }
});
const SelectFileIconThemeCommandId = 'workbench.action.selectIconTheme';
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: SelectFileIconThemeCommandId,
            title: { value: localize('selectIconTheme.label', "File Icon Theme"), original: 'File Icon Theme' },
            category: Categories.Preferences,
            f1: true
        });
    }
    async run(accessor) {
        const themeService = accessor.get(IWorkbenchThemeService);
        const installMessage = localize('installIconThemes', "Install Additional File Icon Themes...");
        const placeholderMessage = localize('themes.selectIconTheme', "Select File Icon Theme (Up/Down Keys to Preview)");
        const marketplaceTag = 'tag:icon-theme';
        const setTheme = (theme, settingsTarget) => themeService.setFileIconTheme(theme, settingsTarget);
        const getMarketplaceColorThemes = (publisher, name, version) => themeService.getMarketplaceFileIconThemes(publisher, name, version);
        const instantiationService = accessor.get(IInstantiationService);
        const picker = instantiationService.createInstance(InstalledThemesPicker, installMessage, undefined, placeholderMessage, marketplaceTag, setTheme, getMarketplaceColorThemes);
        const picks = [
            { type: 'separator', label: localize('fileIconThemeCategory', 'file icon themes') },
            { id: '', theme: FileIconThemeData.noIconTheme, label: localize('noIconThemeLabel', 'None'), description: localize('noIconThemeDesc', 'Disable File Icons') },
            ...toEntries(await themeService.getFileIconThemes()),
        ];
        await picker.openQuickPick(picks, themeService.getFileIconTheme());
    }
});
const SelectProductIconThemeCommandId = 'workbench.action.selectProductIconTheme';
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: SelectProductIconThemeCommandId,
            title: { value: localize('selectProductIconTheme.label', "Product Icon Theme"), original: 'Product Icon Theme' },
            category: Categories.Preferences,
            f1: true
        });
    }
    async run(accessor) {
        const themeService = accessor.get(IWorkbenchThemeService);
        const installMessage = localize('installProductIconThemes', "Install Additional Product Icon Themes...");
        const browseMessage = '$(plus) ' + localize('browseProductIconThemes', "Browse Additional Product Icon Themes...");
        const placeholderMessage = localize('themes.selectProductIconTheme', "Select Product Icon Theme (Up/Down Keys to Preview)");
        const marketplaceTag = 'tag:product-icon-theme';
        const setTheme = (theme, settingsTarget) => themeService.setProductIconTheme(theme, settingsTarget);
        const getMarketplaceColorThemes = (publisher, name, version) => themeService.getMarketplaceProductIconThemes(publisher, name, version);
        const instantiationService = accessor.get(IInstantiationService);
        const picker = instantiationService.createInstance(InstalledThemesPicker, installMessage, browseMessage, placeholderMessage, marketplaceTag, setTheme, getMarketplaceColorThemes);
        const picks = [
            { type: 'separator', label: localize('productIconThemeCategory', 'product icon themes') },
            { id: DEFAULT_PRODUCT_ICON_THEME_ID, theme: ProductIconThemeData.defaultTheme, label: localize('defaultProductIconThemeLabel', 'Default') },
            ...toEntries(await themeService.getProductIconThemes()),
        ];
        await picker.openQuickPick(picks, themeService.getProductIconTheme());
    }
});
CommandsRegistry.registerCommand('workbench.action.previewColorTheme', async function (accessor, extension, themeSettingsId) {
    const themeService = accessor.get(IWorkbenchThemeService);
    let themes = findBuiltInThemes(await themeService.getColorThemes(), extension);
    if (themes.length === 0) {
        themes = await themeService.getMarketplaceColorThemes(extension.publisher, extension.name, extension.version);
    }
    for (const theme of themes) {
        if (!themeSettingsId || theme.settingsId === themeSettingsId) {
            await themeService.setColorTheme(theme, 'preview');
            return theme.settingsId;
        }
    }
    return undefined;
});
function findBuiltInThemes(themes, extension) {
    return themes.filter(({ extensionData }) => extensionData && extensionData.extensionIsBuiltin && equalsIgnoreCase(extensionData.extensionPublisher, extension.publisher) && equalsIgnoreCase(extensionData.extensionName, extension.name));
}
function configurationEntries(label) {
    return [
        {
            type: 'separator'
        },
        {
            id: undefined,
            label: label,
            alwaysShow: true,
            buttons: [configureButton]
        }
    ];
}
function openExtensionViewlet(paneCompositeService, query) {
    return paneCompositeService.openPaneComposite(VIEWLET_ID, 0 /* ViewContainerLocation.Sidebar */, true).then(viewlet => {
        if (viewlet) {
            (viewlet?.getViewPaneContainer()).search(query);
            viewlet.focus();
        }
    });
}
function isItem(i) {
    return i['type'] !== 'separator';
}
function toEntry(theme) {
    const item = { id: theme.id, theme: theme, label: theme.label, description: theme.description };
    if (theme.extensionData) {
        item.buttons = [configureButton];
    }
    return item;
}
function toEntries(themes, label) {
    const sorter = (t1, t2) => t1.label.localeCompare(t2.label);
    const entries = themes.map(toEntry).sort(sorter);
    if (entries.length > 0 && label) {
        entries.unshift({ type: 'separator', label });
    }
    return entries;
}
const configureButton = {
    iconClass: ThemeIcon.asClassName(manageExtensionIcon),
    tooltip: localize('manage extension', "Manage Extension"),
};
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: 'workbench.action.generateColorTheme',
            title: { value: localize('generateColorTheme.label', "Generate Color Theme From Current Settings"), original: 'Generate Color Theme From Current Settings' },
            category: Categories.Developer,
            f1: true
        });
    }
    run(accessor) {
        const themeService = accessor.get(IWorkbenchThemeService);
        const theme = themeService.getColorTheme();
        const colors = Registry.as(ColorRegistryExtensions.ColorContribution).getColors();
        const colorIds = colors.map(c => c.id).sort();
        const resultingColors = {};
        const inherited = [];
        for (const colorId of colorIds) {
            const color = theme.getColor(colorId, false);
            if (color) {
                resultingColors[colorId] = Color.Format.CSS.formatHexA(color, true);
            }
            else {
                inherited.push(colorId);
            }
        }
        const nullDefaults = [];
        for (const id of inherited) {
            const color = theme.getColor(id);
            if (color) {
                resultingColors['__' + id] = Color.Format.CSS.formatHexA(color, true);
            }
            else {
                nullDefaults.push(id);
            }
        }
        for (const id of nullDefaults) {
            resultingColors['__' + id] = null;
        }
        let contents = JSON.stringify({
            '$schema': colorThemeSchemaId,
            type: theme.type,
            colors: resultingColors,
            tokenColors: theme.tokenColors.filter(t => !!t.scope)
        }, null, '\t');
        contents = contents.replace(/\"__/g, '//"');
        const editorService = accessor.get(IEditorService);
        return editorService.openEditor({ resource: undefined, contents, languageId: 'jsonc', options: { pinned: true } });
    }
});
const toggleLightDarkThemesCommandId = 'workbench.action.toggleLightDarkThemes';
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: toggleLightDarkThemesCommandId,
            title: { value: localize('toggleLightDarkThemes.label', "Toggle between Light/Dark Themes"), original: 'Toggle between Light/Dark Themes' },
            category: Categories.Preferences,
            f1: true,
        });
    }
    async run(accessor) {
        const themeService = accessor.get(IWorkbenchThemeService);
        const configurationService = accessor.get(IConfigurationService);
        const currentTheme = themeService.getColorTheme();
        let newSettingsId = ThemeSettings.PREFERRED_DARK_THEME;
        switch (currentTheme.type) {
            case ColorScheme.LIGHT:
                newSettingsId = ThemeSettings.PREFERRED_DARK_THEME;
                break;
            case ColorScheme.DARK:
                newSettingsId = ThemeSettings.PREFERRED_LIGHT_THEME;
                break;
            case ColorScheme.HIGH_CONTRAST_LIGHT:
                newSettingsId = ThemeSettings.PREFERRED_HC_DARK_THEME;
                break;
            case ColorScheme.HIGH_CONTRAST_DARK:
                newSettingsId = ThemeSettings.PREFERRED_HC_LIGHT_THEME;
                break;
        }
        const themeSettingId = configurationService.getValue(newSettingsId);
        if (themeSettingId && typeof themeSettingId === 'string') {
            const theme = (await themeService.getColorThemes()).find(t => t.settingsId === themeSettingId);
            if (theme) {
                themeService.setColorTheme(theme.id, 'auto');
            }
        }
    }
});
MenuRegistry.appendMenuItem(MenuId.MenubarPreferencesMenu, {
    group: '4_themes',
    command: {
        id: SelectColorThemeCommandId,
        title: localize({ key: 'miSelectColorTheme', comment: ['&& denotes a mnemonic'] }, "&&Color Theme")
    },
    order: 1
});
MenuRegistry.appendMenuItem(MenuId.MenubarPreferencesMenu, {
    group: '4_themes',
    command: {
        id: SelectFileIconThemeCommandId,
        title: localize({ key: 'miSelectIconTheme', comment: ['&& denotes a mnemonic'] }, "File &&Icon Theme")
    },
    order: 2
});
MenuRegistry.appendMenuItem(MenuId.MenubarPreferencesMenu, {
    group: '4_themes',
    command: {
        id: SelectProductIconThemeCommandId,
        title: localize({ key: 'miSelectProductIconTheme', comment: ['&& denotes a mnemonic'] }, "&&Product Icon Theme")
    },
    order: 3
});
MenuRegistry.appendMenuItem(MenuId.GlobalActivity, {
    group: '4_themes',
    command: {
        id: SelectColorThemeCommandId,
        title: localize('selectTheme.label', "Color Theme")
    },
    order: 1
});
MenuRegistry.appendMenuItem(MenuId.GlobalActivity, {
    group: '4_themes',
    command: {
        id: SelectFileIconThemeCommandId,
        title: localize('themes.selectIconTheme.label', "File Icon Theme")
    },
    order: 2
});
MenuRegistry.appendMenuItem(MenuId.GlobalActivity, {
    group: '4_themes',
    command: {
        id: SelectProductIconThemeCommandId,
        title: localize('themes.selectProductIconTheme.label', "Product Icon Theme")
    },
    order: 3
});

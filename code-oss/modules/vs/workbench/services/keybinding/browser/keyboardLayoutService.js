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
import { Emitter, Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { KeymapInfo } from 'vs/workbench/services/keybinding/common/keymapInfo';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { CachedKeyboardMapper } from 'vs/platform/keyboardLayout/common/keyboardMapper';
import { OS, isMacintosh, isWindows } from 'vs/base/common/platform';
import { WindowsKeyboardMapper } from 'vs/workbench/services/keybinding/common/windowsKeyboardMapper';
import { MacLinuxFallbackKeyboardMapper } from 'vs/workbench/services/keybinding/common/macLinuxFallbackKeyboardMapper';
import { MacLinuxKeyboardMapper } from 'vs/workbench/services/keybinding/common/macLinuxKeyboardMapper';
import { IFileService } from 'vs/platform/files/common/files';
import { RunOnceScheduler } from 'vs/base/common/async';
import { parse, getNodeType } from 'vs/base/common/json';
import * as objects from 'vs/base/common/objects';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { Registry } from 'vs/platform/registry/common/platform';
import { Extensions as ConfigExtensions } from 'vs/platform/configuration/common/configurationRegistry';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { getKeyboardLayoutId, IKeyboardLayoutService } from 'vs/platform/keyboardLayout/common/keyboardLayout';
export class BrowserKeyboardMapperFactoryBase {
    // keyboard mapper
    _initialized;
    _keyboardMapper;
    _onDidChangeKeyboardMapper = new Emitter();
    onDidChangeKeyboardMapper = this._onDidChangeKeyboardMapper.event;
    // keymap infos
    _keymapInfos;
    _mru;
    _activeKeymapInfo;
    get activeKeymap() {
        return this._activeKeymapInfo;
    }
    get keymapInfos() {
        return this._keymapInfos;
    }
    get activeKeyboardLayout() {
        if (!this._initialized) {
            return null;
        }
        return this._activeKeymapInfo && this._activeKeymapInfo.layout;
    }
    get activeKeyMapping() {
        if (!this._initialized) {
            return null;
        }
        return this._activeKeymapInfo && this._activeKeymapInfo.mapping;
    }
    get keyboardLayouts() {
        return this._keymapInfos.map(keymapInfo => keymapInfo.layout);
    }
    constructor(
    // private _notificationService: INotificationService,
    // private _storageService: IStorageService,
    // private _commandService: ICommandService
    ) {
        this._keyboardMapper = null;
        this._initialized = false;
        this._keymapInfos = [];
        this._mru = [];
        this._activeKeymapInfo = null;
        if (navigator.keyboard && navigator.keyboard.addEventListener) {
            navigator.keyboard.addEventListener('layoutchange', () => {
                // Update user keyboard map settings
                this._getBrowserKeyMapping().then((mapping) => {
                    if (this.isKeyMappingActive(mapping)) {
                        return;
                    }
                    this.setLayoutFromBrowserAPI();
                });
            });
        }
    }
    registerKeyboardLayout(layout) {
        this._keymapInfos.push(layout);
        this._mru = this._keymapInfos;
    }
    removeKeyboardLayout(layout) {
        let index = this._mru.indexOf(layout);
        this._mru.splice(index, 1);
        index = this._keymapInfos.indexOf(layout);
        this._keymapInfos.splice(index, 1);
    }
    getMatchedKeymapInfo(keyMapping) {
        if (!keyMapping) {
            return null;
        }
        const usStandard = this.getUSStandardLayout();
        if (usStandard) {
            let maxScore = usStandard.getScore(keyMapping);
            if (maxScore === 0) {
                return {
                    result: usStandard,
                    score: 0
                };
            }
            let result = usStandard;
            for (let i = 0; i < this._mru.length; i++) {
                const score = this._mru[i].getScore(keyMapping);
                if (score > maxScore) {
                    if (score === 0) {
                        return {
                            result: this._mru[i],
                            score: 0
                        };
                    }
                    maxScore = score;
                    result = this._mru[i];
                }
            }
            return {
                result,
                score: maxScore
            };
        }
        for (let i = 0; i < this._mru.length; i++) {
            if (this._mru[i].fuzzyEqual(keyMapping)) {
                return {
                    result: this._mru[i],
                    score: 0
                };
            }
        }
        return null;
    }
    getUSStandardLayout() {
        const usStandardLayouts = this._mru.filter(layout => layout.layout.isUSStandard);
        if (usStandardLayouts.length) {
            return usStandardLayouts[0];
        }
        return null;
    }
    isKeyMappingActive(keymap) {
        return this._activeKeymapInfo && keymap && this._activeKeymapInfo.fuzzyEqual(keymap);
    }
    setUSKeyboardLayout() {
        this._activeKeymapInfo = this.getUSStandardLayout();
    }
    setActiveKeyMapping(keymap) {
        let keymapUpdated = false;
        const matchedKeyboardLayout = this.getMatchedKeymapInfo(keymap);
        if (matchedKeyboardLayout) {
            // let score = matchedKeyboardLayout.score;
            // Due to https://bugs.chromium.org/p/chromium/issues/detail?id=977609, any key after a dead key will generate a wrong mapping,
            // we shoud avoid yielding the false error.
            // if (keymap && score < 0) {
            // const donotAskUpdateKey = 'missing.keyboardlayout.donotask';
            // if (this._storageService.getBoolean(donotAskUpdateKey, StorageScope.APPLICATION)) {
            // 	return;
            // }
            // the keyboard layout doesn't actually match the key event or the keymap from chromium
            // this._notificationService.prompt(
            // 	Severity.Info,
            // 	nls.localize('missing.keyboardlayout', 'Fail to find matching keyboard layout'),
            // 	[{
            // 		label: nls.localize('keyboardLayoutMissing.configure', "Configure"),
            // 		run: () => this._commandService.executeCommand('workbench.action.openKeyboardLayoutPicker')
            // 	}, {
            // 		label: nls.localize('neverAgain', "Don't Show Again"),
            // 		isSecondary: true,
            // 		run: () => this._storageService.store(donotAskUpdateKey, true, StorageScope.APPLICATION)
            // 	}]
            // );
            // console.warn('Active keymap/keyevent does not match current keyboard layout', JSON.stringify(keymap), this._activeKeymapInfo ? JSON.stringify(this._activeKeymapInfo.layout) : '');
            // return;
            // }
            if (!this._activeKeymapInfo) {
                this._activeKeymapInfo = matchedKeyboardLayout.result;
                keymapUpdated = true;
            }
            else if (keymap) {
                if (matchedKeyboardLayout.result.getScore(keymap) > this._activeKeymapInfo.getScore(keymap)) {
                    this._activeKeymapInfo = matchedKeyboardLayout.result;
                    keymapUpdated = true;
                }
            }
        }
        if (!this._activeKeymapInfo) {
            this._activeKeymapInfo = this.getUSStandardLayout();
            keymapUpdated = true;
        }
        if (!this._activeKeymapInfo || !keymapUpdated) {
            return;
        }
        const index = this._mru.indexOf(this._activeKeymapInfo);
        this._mru.splice(index, 1);
        this._mru.unshift(this._activeKeymapInfo);
        this._setKeyboardData(this._activeKeymapInfo);
    }
    setActiveKeymapInfo(keymapInfo) {
        this._activeKeymapInfo = keymapInfo;
        const index = this._mru.indexOf(this._activeKeymapInfo);
        if (index === 0) {
            return;
        }
        this._mru.splice(index, 1);
        this._mru.unshift(this._activeKeymapInfo);
        this._setKeyboardData(this._activeKeymapInfo);
    }
    setLayoutFromBrowserAPI() {
        this._updateKeyboardLayoutAsync(this._initialized);
    }
    _updateKeyboardLayoutAsync(initialized, keyboardEvent) {
        if (!initialized) {
            return;
        }
        this._getBrowserKeyMapping(keyboardEvent).then(keyMap => {
            // might be false positive
            if (this.isKeyMappingActive(keyMap)) {
                return;
            }
            this.setActiveKeyMapping(keyMap);
        });
    }
    getKeyboardMapper(dispatchConfig) {
        if (!this._initialized) {
            return new MacLinuxFallbackKeyboardMapper(OS);
        }
        if (dispatchConfig === 1 /* DispatchConfig.KeyCode */) {
            // Forcefully set to use keyCode
            return new MacLinuxFallbackKeyboardMapper(OS);
        }
        return this._keyboardMapper;
    }
    validateCurrentKeyboardMapping(keyboardEvent) {
        if (!this._initialized) {
            return;
        }
        const isCurrentKeyboard = this._validateCurrentKeyboardMapping(keyboardEvent);
        if (isCurrentKeyboard) {
            return;
        }
        this._updateKeyboardLayoutAsync(true, keyboardEvent);
    }
    setKeyboardLayout(layoutName) {
        const matchedLayouts = this.keymapInfos.filter(keymapInfo => getKeyboardLayoutId(keymapInfo.layout) === layoutName);
        if (matchedLayouts.length > 0) {
            this.setActiveKeymapInfo(matchedLayouts[0]);
        }
    }
    _setKeyboardData(keymapInfo) {
        this._initialized = true;
        this._keyboardMapper = new CachedKeyboardMapper(BrowserKeyboardMapperFactory._createKeyboardMapper(keymapInfo));
        this._onDidChangeKeyboardMapper.fire();
    }
    static _createKeyboardMapper(keymapInfo) {
        const rawMapping = keymapInfo.mapping;
        const isUSStandard = !!keymapInfo.layout.isUSStandard;
        if (OS === 1 /* OperatingSystem.Windows */) {
            return new WindowsKeyboardMapper(isUSStandard, rawMapping);
        }
        if (Object.keys(rawMapping).length === 0) {
            // Looks like reading the mappings failed (most likely Mac + Japanese/Chinese keyboard layouts)
            return new MacLinuxFallbackKeyboardMapper(OS);
        }
        return new MacLinuxKeyboardMapper(isUSStandard, rawMapping, OS);
    }
    //#region Browser API
    _validateCurrentKeyboardMapping(keyboardEvent) {
        if (!this._initialized) {
            return true;
        }
        const standardKeyboardEvent = keyboardEvent;
        const currentKeymap = this._activeKeymapInfo;
        if (!currentKeymap) {
            return true;
        }
        if (standardKeyboardEvent.browserEvent.key === 'Dead' || standardKeyboardEvent.browserEvent.isComposing) {
            return true;
        }
        const mapping = currentKeymap.mapping[standardKeyboardEvent.code];
        if (!mapping) {
            return false;
        }
        if (mapping.value === '') {
            // The value is empty when the key is not a printable character, we skip validation.
            if (keyboardEvent.ctrlKey || keyboardEvent.metaKey) {
                setTimeout(() => {
                    this._getBrowserKeyMapping().then((keymap) => {
                        if (this.isKeyMappingActive(keymap)) {
                            return;
                        }
                        this.setLayoutFromBrowserAPI();
                    });
                }, 350);
            }
            return true;
        }
        const expectedValue = standardKeyboardEvent.altKey && standardKeyboardEvent.shiftKey ? mapping.withShiftAltGr :
            standardKeyboardEvent.altKey ? mapping.withAltGr :
                standardKeyboardEvent.shiftKey ? mapping.withShift : mapping.value;
        const isDead = (standardKeyboardEvent.altKey && standardKeyboardEvent.shiftKey && mapping.withShiftAltGrIsDeadKey) ||
            (standardKeyboardEvent.altKey && mapping.withAltGrIsDeadKey) ||
            (standardKeyboardEvent.shiftKey && mapping.withShiftIsDeadKey) ||
            mapping.valueIsDeadKey;
        if (isDead && standardKeyboardEvent.browserEvent.key !== 'Dead') {
            return false;
        }
        // TODO, this assumption is wrong as `browserEvent.key` doesn't necessarily equal expectedValue from real keymap
        if (!isDead && standardKeyboardEvent.browserEvent.key !== expectedValue) {
            return false;
        }
        return true;
    }
    async _getBrowserKeyMapping(keyboardEvent) {
        if (navigator.keyboard) {
            try {
                return navigator.keyboard.getLayoutMap().then((e) => {
                    const ret = {};
                    for (const key of e) {
                        ret[key[0]] = {
                            'value': key[1],
                            'withShift': '',
                            'withAltGr': '',
                            'withShiftAltGr': ''
                        };
                    }
                    return ret;
                    // const matchedKeyboardLayout = this.getMatchedKeymapInfo(ret);
                    // if (matchedKeyboardLayout) {
                    // 	return matchedKeyboardLayout.result.mapping;
                    // }
                    // return null;
                });
            }
            catch {
                // getLayoutMap can throw if invoked from a nested browsing context
            }
        }
        else if (keyboardEvent && !keyboardEvent.shiftKey && !keyboardEvent.altKey && !keyboardEvent.metaKey && !keyboardEvent.metaKey) {
            const ret = {};
            const standardKeyboardEvent = keyboardEvent;
            ret[standardKeyboardEvent.browserEvent.code] = {
                'value': standardKeyboardEvent.browserEvent.key,
                'withShift': '',
                'withAltGr': '',
                'withShiftAltGr': ''
            };
            const matchedKeyboardLayout = this.getMatchedKeymapInfo(ret);
            if (matchedKeyboardLayout) {
                return ret;
            }
            return null;
        }
        return null;
    }
}
export class BrowserKeyboardMapperFactory extends BrowserKeyboardMapperFactoryBase {
    constructor(notificationService, storageService, commandService) {
        // super(notificationService, storageService, commandService);
        super();
        const platform = isWindows ? 'win' : isMacintosh ? 'darwin' : 'linux';
        import('vs/workbench/services/keybinding/browser/keyboardLayouts/layout.contribution.' + platform).then((m) => {
            const keymapInfos = m.KeyboardLayoutContribution.INSTANCE.layoutInfos;
            this._keymapInfos.push(...keymapInfos.map(info => (new KeymapInfo(info.layout, info.secondaryLayouts, info.mapping, info.isUserKeyboardLayout))));
            this._mru = this._keymapInfos;
            this._initialized = true;
            this.setLayoutFromBrowserAPI();
        });
    }
}
class UserKeyboardLayout extends Disposable {
    keyboardLayoutResource;
    fileService;
    reloadConfigurationScheduler;
    _onDidChange = this._register(new Emitter());
    onDidChange = this._onDidChange.event;
    _keyboardLayout;
    get keyboardLayout() { return this._keyboardLayout; }
    constructor(keyboardLayoutResource, fileService) {
        super();
        this.keyboardLayoutResource = keyboardLayoutResource;
        this.fileService = fileService;
        this._keyboardLayout = null;
        this.reloadConfigurationScheduler = this._register(new RunOnceScheduler(() => this.reload().then(changed => {
            if (changed) {
                this._onDidChange.fire();
            }
        }), 50));
        this._register(Event.filter(this.fileService.onDidFilesChange, e => e.contains(this.keyboardLayoutResource))(() => this.reloadConfigurationScheduler.schedule()));
    }
    async initialize() {
        await this.reload();
    }
    async reload() {
        const existing = this._keyboardLayout;
        try {
            const content = await this.fileService.readFile(this.keyboardLayoutResource);
            const value = parse(content.value.toString());
            if (getNodeType(value) === 'object') {
                const layoutInfo = value.layout;
                const mappings = value.rawMapping;
                this._keyboardLayout = KeymapInfo.createKeyboardLayoutFromDebugInfo(layoutInfo, mappings, true);
            }
            else {
                this._keyboardLayout = null;
            }
        }
        catch (e) {
            this._keyboardLayout = null;
        }
        return existing ? !objects.equals(existing, this._keyboardLayout) : true;
    }
}
let BrowserKeyboardLayoutService = class BrowserKeyboardLayoutService extends Disposable {
    configurationService;
    _serviceBrand;
    _onDidChangeKeyboardLayout = new Emitter();
    onDidChangeKeyboardLayout = this._onDidChangeKeyboardLayout.event;
    _userKeyboardLayout;
    _factory;
    _keyboardLayoutMode;
    constructor(environmentService, fileService, notificationService, storageService, commandService, configurationService) {
        super();
        this.configurationService = configurationService;
        const keyboardConfig = configurationService.getValue('keyboard');
        const layout = keyboardConfig.layout;
        this._keyboardLayoutMode = layout ?? 'autodetect';
        this._factory = new BrowserKeyboardMapperFactory(notificationService, storageService, commandService);
        this._register(this._factory.onDidChangeKeyboardMapper(() => {
            this._onDidChangeKeyboardLayout.fire();
        }));
        if (layout && layout !== 'autodetect') {
            // set keyboard layout
            this._factory.setKeyboardLayout(layout);
        }
        this._register(configurationService.onDidChangeConfiguration(e => {
            if (e.affectedKeys.indexOf('keyboard.layout') >= 0) {
                const keyboardConfig = configurationService.getValue('keyboard');
                const layout = keyboardConfig.layout;
                this._keyboardLayoutMode = layout;
                if (layout === 'autodetect') {
                    this._factory.setLayoutFromBrowserAPI();
                }
                else {
                    this._factory.setKeyboardLayout(layout);
                }
            }
        }));
        this._userKeyboardLayout = new UserKeyboardLayout(environmentService.keyboardLayoutResource, fileService);
        this._userKeyboardLayout.initialize().then(() => {
            if (this._userKeyboardLayout.keyboardLayout) {
                this._factory.registerKeyboardLayout(this._userKeyboardLayout.keyboardLayout);
                this.setUserKeyboardLayoutIfMatched();
            }
        });
        this._register(this._userKeyboardLayout.onDidChange(() => {
            const userKeyboardLayouts = this._factory.keymapInfos.filter(layout => layout.isUserKeyboardLayout);
            if (userKeyboardLayouts.length) {
                if (this._userKeyboardLayout.keyboardLayout) {
                    userKeyboardLayouts[0].update(this._userKeyboardLayout.keyboardLayout);
                }
                else {
                    this._factory.removeKeyboardLayout(userKeyboardLayouts[0]);
                }
            }
            else {
                if (this._userKeyboardLayout.keyboardLayout) {
                    this._factory.registerKeyboardLayout(this._userKeyboardLayout.keyboardLayout);
                }
            }
            this.setUserKeyboardLayoutIfMatched();
        }));
    }
    setUserKeyboardLayoutIfMatched() {
        const keyboardConfig = this.configurationService.getValue('keyboard');
        const layout = keyboardConfig.layout;
        if (layout && this._userKeyboardLayout.keyboardLayout) {
            if (getKeyboardLayoutId(this._userKeyboardLayout.keyboardLayout.layout) === layout && this._factory.activeKeymap) {
                if (!this._userKeyboardLayout.keyboardLayout.equal(this._factory.activeKeymap)) {
                    this._factory.setActiveKeymapInfo(this._userKeyboardLayout.keyboardLayout);
                }
            }
        }
    }
    getKeyboardMapper(dispatchConfig) {
        return this._factory.getKeyboardMapper(dispatchConfig);
    }
    getCurrentKeyboardLayout() {
        return this._factory.activeKeyboardLayout;
    }
    getAllKeyboardLayouts() {
        return this._factory.keyboardLayouts;
    }
    getRawKeyboardMapping() {
        return this._factory.activeKeyMapping;
    }
    validateCurrentKeyboardMapping(keyboardEvent) {
        if (this._keyboardLayoutMode !== 'autodetect') {
            return;
        }
        this._factory.validateCurrentKeyboardMapping(keyboardEvent);
    }
};
BrowserKeyboardLayoutService = __decorate([
    __param(0, IEnvironmentService),
    __param(1, IFileService),
    __param(2, INotificationService),
    __param(3, IStorageService),
    __param(4, ICommandService),
    __param(5, IConfigurationService)
], BrowserKeyboardLayoutService);
export { BrowserKeyboardLayoutService };
registerSingleton(IKeyboardLayoutService, BrowserKeyboardLayoutService, 1 /* InstantiationType.Delayed */);
// Configuration
const configurationRegistry = Registry.as(ConfigExtensions.Configuration);
const keyboardConfiguration = {
    'id': 'keyboard',
    'order': 15,
    'type': 'object',
    'title': nls.localize('keyboardConfigurationTitle', "Keyboard"),
    'properties': {
        'keyboard.layout': {
            'type': 'string',
            'default': 'autodetect',
            'description': nls.localize('keyboard.layout.config', "Control the keyboard layout used in web.")
        }
    }
};
configurationRegistry.registerConfiguration(keyboardConfiguration);

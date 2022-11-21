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
import { Disposable } from 'vs/base/common/lifecycle';
import { macLinuxKeyboardMappingEquals, windowsKeyboardMappingEquals } from 'vs/platform/keyboardLayout/common/keyboardLayout';
import { Emitter } from 'vs/base/common/event';
import { OS } from 'vs/base/common/platform';
import { CachedKeyboardMapper } from 'vs/platform/keyboardLayout/common/keyboardMapper';
import { WindowsKeyboardMapper } from 'vs/workbench/services/keybinding/common/windowsKeyboardMapper';
import { MacLinuxFallbackKeyboardMapper } from 'vs/workbench/services/keybinding/common/macLinuxFallbackKeyboardMapper';
import { MacLinuxKeyboardMapper } from 'vs/workbench/services/keybinding/common/macLinuxKeyboardMapper';
import { IMainProcessService } from 'vs/platform/ipc/electron-sandbox/services';
import { ProxyChannel } from 'vs/base/parts/ipc/common/ipc';
let KeyboardLayoutService = class KeyboardLayoutService extends Disposable {
    _onDidChangeKeyboardLayout = this._register(new Emitter());
    onDidChangeKeyboardLayout = this._onDidChangeKeyboardLayout.event;
    _keyboardLayoutService;
    _initPromise;
    _keyboardMapping;
    _keyboardLayoutInfo;
    _keyboardMapper;
    constructor(mainProcessService) {
        super();
        this._keyboardLayoutService = ProxyChannel.toService(mainProcessService.getChannel('keyboardLayout'));
        this._initPromise = null;
        this._keyboardMapping = null;
        this._keyboardLayoutInfo = null;
        this._keyboardMapper = new MacLinuxFallbackKeyboardMapper(OS);
        this._register(this._keyboardLayoutService.onDidChangeKeyboardLayout(async ({ keyboardLayoutInfo, keyboardMapping }) => {
            await this.initialize();
            if (keyboardMappingEquals(this._keyboardMapping, keyboardMapping)) {
                // the mappings are equal
                return;
            }
            this._keyboardMapping = keyboardMapping;
            this._keyboardLayoutInfo = keyboardLayoutInfo;
            this._keyboardMapper = new CachedKeyboardMapper(createKeyboardMapper(this._keyboardLayoutInfo, this._keyboardMapping));
            this._onDidChangeKeyboardLayout.fire();
        }));
    }
    initialize() {
        if (!this._initPromise) {
            this._initPromise = this._doInitialize();
        }
        return this._initPromise;
    }
    async _doInitialize() {
        const keyboardLayoutData = await this._keyboardLayoutService.getKeyboardLayoutData();
        const { keyboardLayoutInfo, keyboardMapping } = keyboardLayoutData;
        this._keyboardMapping = keyboardMapping;
        this._keyboardLayoutInfo = keyboardLayoutInfo;
        this._keyboardMapper = new CachedKeyboardMapper(createKeyboardMapper(this._keyboardLayoutInfo, this._keyboardMapping));
    }
    getRawKeyboardMapping() {
        return this._keyboardMapping;
    }
    getCurrentKeyboardLayout() {
        return this._keyboardLayoutInfo;
    }
    getAllKeyboardLayouts() {
        return [];
    }
    getKeyboardMapper(dispatchConfig) {
        if (dispatchConfig === 1 /* DispatchConfig.KeyCode */) {
            // Forcefully set to use keyCode
            return new MacLinuxFallbackKeyboardMapper(OS);
        }
        return this._keyboardMapper;
    }
    validateCurrentKeyboardMapping(keyboardEvent) {
        return;
    }
};
KeyboardLayoutService = __decorate([
    __param(0, IMainProcessService)
], KeyboardLayoutService);
export { KeyboardLayoutService };
function keyboardMappingEquals(a, b) {
    if (OS === 1 /* OperatingSystem.Windows */) {
        return windowsKeyboardMappingEquals(a, b);
    }
    return macLinuxKeyboardMappingEquals(a, b);
}
function createKeyboardMapper(layoutInfo, rawMapping) {
    const _isUSStandard = isUSStandard(layoutInfo);
    if (OS === 1 /* OperatingSystem.Windows */) {
        return new WindowsKeyboardMapper(_isUSStandard, rawMapping);
    }
    if (!rawMapping || Object.keys(rawMapping).length === 0) {
        // Looks like reading the mappings failed (most likely Mac + Japanese/Chinese keyboard layouts)
        return new MacLinuxFallbackKeyboardMapper(OS);
    }
    if (OS === 2 /* OperatingSystem.Macintosh */) {
        const kbInfo = layoutInfo;
        if (kbInfo.id === 'com.apple.keylayout.DVORAK-QWERTYCMD') {
            // Use keyCode based dispatching for DVORAK - QWERTY ⌘
            return new MacLinuxFallbackKeyboardMapper(OS);
        }
    }
    return new MacLinuxKeyboardMapper(_isUSStandard, rawMapping, OS);
}
function isUSStandard(_kbInfo) {
    if (!_kbInfo) {
        return false;
    }
    if (OS === 3 /* OperatingSystem.Linux */) {
        const kbInfo = _kbInfo;
        const layouts = kbInfo.layout.split(/,/g);
        return (layouts[kbInfo.group] === 'us');
    }
    if (OS === 2 /* OperatingSystem.Macintosh */) {
        const kbInfo = _kbInfo;
        return (kbInfo.id === 'com.apple.keylayout.US');
    }
    if (OS === 1 /* OperatingSystem.Windows */) {
        const kbInfo = _kbInfo;
        return (kbInfo.name === '00000409');
    }
    return false;
}

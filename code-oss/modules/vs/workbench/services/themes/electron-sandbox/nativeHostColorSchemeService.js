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
import { Emitter } from 'vs/base/common/event';
import { INativeHostService } from 'vs/platform/native/electron-sandbox/native';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { Disposable } from 'vs/base/common/lifecycle';
import { IHostColorSchemeService } from 'vs/workbench/services/themes/common/hostColorSchemeService';
import { INativeWorkbenchEnvironmentService } from 'vs/workbench/services/environment/electron-sandbox/environmentService';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { isBoolean, isObject } from 'vs/base/common/types';
let NativeHostColorSchemeService = class NativeHostColorSchemeService extends Disposable {
    nativeHostService;
    storageService;
    static STORAGE_KEY = 'HostColorSchemeData';
    _onDidChangeColorScheme = this._register(new Emitter());
    onDidChangeColorScheme = this._onDidChangeColorScheme.event;
    dark;
    highContrast;
    constructor(nativeHostService, environmentService, storageService) {
        super();
        this.nativeHostService = nativeHostService;
        this.storageService = storageService;
        // register listener with the OS
        this._register(this.nativeHostService.onDidChangeColorScheme(scheme => this.update(scheme)));
        const initial = this.getStoredValue() ?? environmentService.window.colorScheme;
        this.dark = initial.dark;
        this.highContrast = initial.highContrast;
        // fetch the actual value from the OS
        this.nativeHostService.getOSColorScheme().then(scheme => this.update(scheme));
    }
    getStoredValue() {
        const stored = this.storageService.get(NativeHostColorSchemeService.STORAGE_KEY, -1 /* StorageScope.APPLICATION */);
        if (stored) {
            try {
                const scheme = JSON.parse(stored);
                if (isObject(scheme) && isBoolean(scheme.highContrast) && isBoolean(scheme.dark)) {
                    return scheme;
                }
            }
            catch (e) {
                // ignore
            }
        }
        return undefined;
    }
    update({ highContrast, dark }) {
        if (dark !== this.dark || highContrast !== this.highContrast) {
            this.dark = dark;
            this.highContrast = highContrast;
            this.storageService.store(NativeHostColorSchemeService.STORAGE_KEY, JSON.stringify({ highContrast, dark }), -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
            this._onDidChangeColorScheme.fire();
        }
    }
};
NativeHostColorSchemeService = __decorate([
    __param(0, INativeHostService),
    __param(1, INativeWorkbenchEnvironmentService),
    __param(2, IStorageService)
], NativeHostColorSchemeService);
export { NativeHostColorSchemeService };
registerSingleton(IHostColorSchemeService, NativeHostColorSchemeService, 1 /* InstantiationType.Delayed */);

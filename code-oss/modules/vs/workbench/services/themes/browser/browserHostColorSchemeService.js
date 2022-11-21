/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Emitter } from 'vs/base/common/event';
import { addMatchMediaChangeListener } from 'vs/base/browser/browser';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { Disposable } from 'vs/base/common/lifecycle';
import { IHostColorSchemeService } from 'vs/workbench/services/themes/common/hostColorSchemeService';
export class BrowserHostColorSchemeService extends Disposable {
    _onDidSchemeChangeEvent = this._register(new Emitter());
    constructor() {
        super();
        this.registerListeners();
    }
    registerListeners() {
        addMatchMediaChangeListener('(prefers-color-scheme: dark)', () => {
            this._onDidSchemeChangeEvent.fire();
        });
        addMatchMediaChangeListener('(forced-colors: active)', () => {
            this._onDidSchemeChangeEvent.fire();
        });
    }
    get onDidChangeColorScheme() {
        return this._onDidSchemeChangeEvent.event;
    }
    get dark() {
        if (window.matchMedia(`(prefers-color-scheme: light)`).matches) {
            return false;
        }
        else if (window.matchMedia(`(prefers-color-scheme: dark)`).matches) {
            return true;
        }
        return false;
    }
    get highContrast() {
        if (window.matchMedia(`(forced-colors: active)`).matches) {
            return true;
        }
        return false;
    }
}
registerSingleton(IHostColorSchemeService, BrowserHostColorSchemeService, 1 /* InstantiationType.Delayed */);

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Emitter } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { LanguageConfigurationRegistry, LanguageConfigurationServiceChangeEvent, ResolvedLanguageConfiguration } from 'vs/editor/common/languages/languageConfigurationRegistry';
export class TestLanguageConfigurationService extends Disposable {
    _serviceBrand;
    _registry = this._register(new LanguageConfigurationRegistry());
    _onDidChange = this._register(new Emitter());
    onDidChange = this._onDidChange.event;
    constructor() {
        super();
        this._register(this._registry.onDidChange((e) => this._onDidChange.fire(new LanguageConfigurationServiceChangeEvent(e.languageId))));
    }
    register(languageId, configuration, priority) {
        return this._registry.register(languageId, configuration, priority);
    }
    getLanguageConfiguration(languageId) {
        return this._registry.getLanguageConfiguration(languageId) ??
            new ResolvedLanguageConfiguration('unknown', {});
    }
}

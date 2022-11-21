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
import { Schemas } from 'vs/base/common/network';
import { URI } from 'vs/base/common/uri';
import * as nls from 'vs/nls';
import { EditorInput } from 'vs/workbench/common/editor/editorInput';
import { IPreferencesService } from 'vs/workbench/services/preferences/common/preferences';
let SettingsEditor2Input = class SettingsEditor2Input extends EditorInput {
    static ID = 'workbench.input.settings2';
    _settingsModel;
    resource = URI.from({
        scheme: Schemas.vscodeSettings,
        path: `settingseditor`
    });
    constructor(_preferencesService) {
        super();
        this._settingsModel = _preferencesService.createSettings2EditorModel();
    }
    matches(otherInput) {
        return super.matches(otherInput) || otherInput instanceof SettingsEditor2Input;
    }
    get typeId() {
        return SettingsEditor2Input.ID;
    }
    getName() {
        return nls.localize('settingsEditor2InputName', "Settings");
    }
    async resolve() {
        return this._settingsModel;
    }
    dispose() {
        this._settingsModel.dispose();
        super.dispose();
    }
};
SettingsEditor2Input = __decorate([
    __param(0, IPreferencesService)
], SettingsEditor2Input);
export { SettingsEditor2Input };

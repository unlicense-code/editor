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
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { IUserDataSyncUtilService, getDefaultIgnoredSettings } from 'vs/platform/userDataSync/common/userDataSync';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { ITextModelService } from 'vs/editor/common/services/resolverService';
import { ITextResourcePropertiesService, ITextResourceConfigurationService } from 'vs/editor/common/services/textResourceConfiguration';
let UserDataSyncUtilService = class UserDataSyncUtilService {
    keybindingsService;
    textModelService;
    textResourcePropertiesService;
    textResourceConfigurationService;
    constructor(keybindingsService, textModelService, textResourcePropertiesService, textResourceConfigurationService) {
        this.keybindingsService = keybindingsService;
        this.textModelService = textModelService;
        this.textResourcePropertiesService = textResourcePropertiesService;
        this.textResourceConfigurationService = textResourceConfigurationService;
    }
    async resolveDefaultIgnoredSettings() {
        return getDefaultIgnoredSettings();
    }
    async resolveUserBindings(userBindings) {
        const keys = {};
        for (const userbinding of userBindings) {
            keys[userbinding] = this.keybindingsService.resolveUserBinding(userbinding).map(part => part.getUserSettingsLabel()).join(' ');
        }
        return keys;
    }
    async resolveFormattingOptions(resource) {
        try {
            const modelReference = await this.textModelService.createModelReference(resource);
            const { insertSpaces, tabSize } = modelReference.object.textEditorModel.getOptions();
            const eol = modelReference.object.textEditorModel.getEOL();
            modelReference.dispose();
            return { eol, insertSpaces, tabSize };
        }
        catch (e) {
        }
        return {
            eol: this.textResourcePropertiesService.getEOL(resource),
            insertSpaces: !!this.textResourceConfigurationService.getValue(resource, 'editor.insertSpaces'),
            tabSize: this.textResourceConfigurationService.getValue(resource, 'editor.tabSize')
        };
    }
};
UserDataSyncUtilService = __decorate([
    __param(0, IKeybindingService),
    __param(1, ITextModelService),
    __param(2, ITextResourcePropertiesService),
    __param(3, ITextResourceConfigurationService)
], UserDataSyncUtilService);
registerSingleton(IUserDataSyncUtilService, UserDataSyncUtilService, 1 /* InstantiationType.Delayed */);

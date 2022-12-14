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
import { Queue } from 'vs/base/common/async';
import * as json from 'vs/base/common/json';
import * as objects from 'vs/base/common/objects';
import { setProperty } from 'vs/base/common/jsonEdit';
import { Disposable } from 'vs/base/common/lifecycle';
import { EditOperation } from 'vs/editor/common/core/editOperation';
import { Range } from 'vs/editor/common/core/range';
import { Selection } from 'vs/editor/common/core/selection';
import { ITextModelService } from 'vs/editor/common/services/resolverService';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { ContextKeyExpr } from 'vs/platform/contextkey/common/contextkey';
import { IFileService } from 'vs/platform/files/common/files';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { ITextFileService } from 'vs/workbench/services/textfile/common/textfiles';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { IUserDataProfileService } from 'vs/workbench/services/userDataProfile/common/userDataProfile';
export const IKeybindingEditingService = createDecorator('keybindingEditingService');
let KeybindingsEditingService = class KeybindingsEditingService extends Disposable {
    textModelResolverService;
    textFileService;
    fileService;
    configurationService;
    userDataProfileService;
    _serviceBrand;
    queue;
    constructor(textModelResolverService, textFileService, fileService, configurationService, userDataProfileService) {
        super();
        this.textModelResolverService = textModelResolverService;
        this.textFileService = textFileService;
        this.fileService = fileService;
        this.configurationService = configurationService;
        this.userDataProfileService = userDataProfileService;
        this.queue = new Queue();
    }
    addKeybinding(keybindingItem, key, when) {
        return this.queue.queue(() => this.doEditKeybinding(keybindingItem, key, when, true)); // queue up writes to prevent race conditions
    }
    editKeybinding(keybindingItem, key, when) {
        return this.queue.queue(() => this.doEditKeybinding(keybindingItem, key, when, false)); // queue up writes to prevent race conditions
    }
    resetKeybinding(keybindingItem) {
        return this.queue.queue(() => this.doResetKeybinding(keybindingItem)); // queue up writes to prevent race conditions
    }
    removeKeybinding(keybindingItem) {
        return this.queue.queue(() => this.doRemoveKeybinding(keybindingItem)); // queue up writes to prevent race conditions
    }
    async doEditKeybinding(keybindingItem, key, when, add) {
        const reference = await this.resolveAndValidate();
        const model = reference.object.textEditorModel;
        if (add) {
            this.updateKeybinding(keybindingItem, key, when, model, -1);
        }
        else {
            const userKeybindingEntries = json.parse(model.getValue());
            const userKeybindingEntryIndex = this.findUserKeybindingEntryIndex(keybindingItem, userKeybindingEntries);
            this.updateKeybinding(keybindingItem, key, when, model, userKeybindingEntryIndex);
            if (keybindingItem.isDefault && keybindingItem.resolvedKeybinding) {
                this.removeDefaultKeybinding(keybindingItem, model);
            }
        }
        try {
            await this.save();
        }
        finally {
            reference.dispose();
        }
    }
    doRemoveKeybinding(keybindingItem) {
        return this.resolveAndValidate()
            .then(reference => {
            const model = reference.object.textEditorModel;
            if (keybindingItem.isDefault) {
                this.removeDefaultKeybinding(keybindingItem, model);
            }
            else {
                this.removeUserKeybinding(keybindingItem, model);
            }
            return this.save().finally(() => reference.dispose());
        });
    }
    doResetKeybinding(keybindingItem) {
        return this.resolveAndValidate()
            .then(reference => {
            const model = reference.object.textEditorModel;
            if (!keybindingItem.isDefault) {
                this.removeUserKeybinding(keybindingItem, model);
                this.removeUnassignedDefaultKeybinding(keybindingItem, model);
            }
            return this.save().finally(() => reference.dispose());
        });
    }
    save() {
        return this.textFileService.save(this.userDataProfileService.currentProfile.keybindingsResource);
    }
    updateKeybinding(keybindingItem, newKey, when, model, userKeybindingEntryIndex) {
        const { tabSize, insertSpaces } = model.getOptions();
        const eol = model.getEOL();
        if (userKeybindingEntryIndex !== -1) {
            // Update the keybinding with new key
            this.applyEditsToBuffer(setProperty(model.getValue(), [userKeybindingEntryIndex, 'key'], newKey, { tabSize, insertSpaces, eol })[0], model);
            const edits = setProperty(model.getValue(), [userKeybindingEntryIndex, 'when'], when, { tabSize, insertSpaces, eol });
            if (edits.length > 0) {
                this.applyEditsToBuffer(edits[0], model);
            }
        }
        else {
            // Add the new keybinding with new key
            this.applyEditsToBuffer(setProperty(model.getValue(), [-1], this.asObject(newKey, keybindingItem.command, when, false), { tabSize, insertSpaces, eol })[0], model);
        }
    }
    removeUserKeybinding(keybindingItem, model) {
        const { tabSize, insertSpaces } = model.getOptions();
        const eol = model.getEOL();
        const userKeybindingEntries = json.parse(model.getValue());
        const userKeybindingEntryIndex = this.findUserKeybindingEntryIndex(keybindingItem, userKeybindingEntries);
        if (userKeybindingEntryIndex !== -1) {
            this.applyEditsToBuffer(setProperty(model.getValue(), [userKeybindingEntryIndex], undefined, { tabSize, insertSpaces, eol })[0], model);
        }
    }
    removeDefaultKeybinding(keybindingItem, model) {
        const { tabSize, insertSpaces } = model.getOptions();
        const eol = model.getEOL();
        const key = keybindingItem.resolvedKeybinding ? keybindingItem.resolvedKeybinding.getUserSettingsLabel() : null;
        if (key) {
            const entry = this.asObject(key, keybindingItem.command, keybindingItem.when ? keybindingItem.when.serialize() : undefined, true);
            const userKeybindingEntries = json.parse(model.getValue());
            if (userKeybindingEntries.every(e => !this.areSame(e, entry))) {
                this.applyEditsToBuffer(setProperty(model.getValue(), [-1], entry, { tabSize, insertSpaces, eol })[0], model);
            }
        }
    }
    removeUnassignedDefaultKeybinding(keybindingItem, model) {
        const { tabSize, insertSpaces } = model.getOptions();
        const eol = model.getEOL();
        const userKeybindingEntries = json.parse(model.getValue());
        const indices = this.findUnassignedDefaultKeybindingEntryIndex(keybindingItem, userKeybindingEntries).reverse();
        for (const index of indices) {
            this.applyEditsToBuffer(setProperty(model.getValue(), [index], undefined, { tabSize, insertSpaces, eol })[0], model);
        }
    }
    findUserKeybindingEntryIndex(keybindingItem, userKeybindingEntries) {
        for (let index = 0; index < userKeybindingEntries.length; index++) {
            const keybinding = userKeybindingEntries[index];
            if (keybinding.command === keybindingItem.command) {
                if (!keybinding.when && !keybindingItem.when) {
                    return index;
                }
                if (keybinding.when && keybindingItem.when) {
                    const contextKeyExpr = ContextKeyExpr.deserialize(keybinding.when);
                    if (contextKeyExpr && contextKeyExpr.serialize() === keybindingItem.when.serialize()) {
                        return index;
                    }
                }
            }
        }
        return -1;
    }
    findUnassignedDefaultKeybindingEntryIndex(keybindingItem, userKeybindingEntries) {
        const indices = [];
        for (let index = 0; index < userKeybindingEntries.length; index++) {
            if (userKeybindingEntries[index].command === `-${keybindingItem.command}`) {
                indices.push(index);
            }
        }
        return indices;
    }
    asObject(key, command, when, negate) {
        const object = { key };
        if (command) {
            object['command'] = negate ? `-${command}` : command;
        }
        if (when) {
            object['when'] = when;
        }
        return object;
    }
    areSame(a, b) {
        if (a.command !== b.command) {
            return false;
        }
        if (a.key !== b.key) {
            return false;
        }
        const whenA = ContextKeyExpr.deserialize(a.when);
        const whenB = ContextKeyExpr.deserialize(b.when);
        if ((whenA && !whenB) || (!whenA && whenB)) {
            return false;
        }
        if (whenA && whenB && !whenA.equals(whenB)) {
            return false;
        }
        if (!objects.equals(a.args, b.args)) {
            return false;
        }
        return true;
    }
    applyEditsToBuffer(edit, model) {
        const startPosition = model.getPositionAt(edit.offset);
        const endPosition = model.getPositionAt(edit.offset + edit.length);
        const range = new Range(startPosition.lineNumber, startPosition.column, endPosition.lineNumber, endPosition.column);
        const currentText = model.getValueInRange(range);
        const editOperation = currentText ? EditOperation.replace(range, edit.content) : EditOperation.insert(startPosition, edit.content);
        model.pushEditOperations([new Selection(startPosition.lineNumber, startPosition.column, startPosition.lineNumber, startPosition.column)], [editOperation], () => []);
    }
    resolveModelReference() {
        return this.fileService.exists(this.userDataProfileService.currentProfile.keybindingsResource)
            .then(exists => {
            const EOL = this.configurationService.getValue('files', { overrideIdentifier: 'json' })['eol'];
            const result = exists ? Promise.resolve(null) : this.textFileService.write(this.userDataProfileService.currentProfile.keybindingsResource, this.getEmptyContent(EOL), { encoding: 'utf8' });
            return result.then(() => this.textModelResolverService.createModelReference(this.userDataProfileService.currentProfile.keybindingsResource));
        });
    }
    resolveAndValidate() {
        // Target cannot be dirty if not writing into buffer
        if (this.textFileService.isDirty(this.userDataProfileService.currentProfile.keybindingsResource)) {
            return Promise.reject(new Error(localize('errorKeybindingsFileDirty', "Unable to write because the keybindings configuration file has unsaved changes. Please save it first and then try again.")));
        }
        return this.resolveModelReference()
            .then(reference => {
            const model = reference.object.textEditorModel;
            const EOL = model.getEOL();
            if (model.getValue()) {
                const parsed = this.parse(model);
                if (parsed.parseErrors.length) {
                    reference.dispose();
                    return Promise.reject(new Error(localize('parseErrors', "Unable to write to the keybindings configuration file. Please open it to correct errors/warnings in the file and try again.")));
                }
                if (parsed.result) {
                    if (!Array.isArray(parsed.result)) {
                        reference.dispose();
                        return Promise.reject(new Error(localize('errorInvalidConfiguration', "Unable to write to the keybindings configuration file. It has an object which is not of type Array. Please open the file to clean up and try again.")));
                    }
                }
                else {
                    const content = EOL + '[]';
                    this.applyEditsToBuffer({ content, length: content.length, offset: model.getValue().length }, model);
                }
            }
            else {
                const content = this.getEmptyContent(EOL);
                this.applyEditsToBuffer({ content, length: content.length, offset: 0 }, model);
            }
            return reference;
        });
    }
    parse(model) {
        const parseErrors = [];
        const result = json.parse(model.getValue(), parseErrors, { allowTrailingComma: true, allowEmptyContent: true });
        return { result, parseErrors };
    }
    getEmptyContent(EOL) {
        return '// ' + localize('emptyKeybindingsHeader', "Place your key bindings in this file to override the defaults") + EOL + '[]';
    }
};
KeybindingsEditingService = __decorate([
    __param(0, ITextModelService),
    __param(1, ITextFileService),
    __param(2, IFileService),
    __param(3, IConfigurationService),
    __param(4, IUserDataProfileService)
], KeybindingsEditingService);
export { KeybindingsEditingService };
registerSingleton(IKeybindingEditingService, KeybindingsEditingService, 1 /* InstantiationType.Delayed */);

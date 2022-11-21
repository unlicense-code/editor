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
import { Emitter } from 'vs/base/common/event';
import { BinaryEditorModel } from 'vs/workbench/common/editor/binaryEditorModel';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { ByteSize } from 'vs/platform/files/common/files';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { EditorPlaceholder } from 'vs/workbench/browser/parts/editor/editorPlaceholder';
/*
 * This class is only intended to be subclassed and not instantiated.
 */
let BaseBinaryResourceEditor = class BaseBinaryResourceEditor extends EditorPlaceholder {
    callbacks;
    _onDidChangeMetadata = this._register(new Emitter());
    onDidChangeMetadata = this._onDidChangeMetadata.event;
    _onDidOpenInPlace = this._register(new Emitter());
    onDidOpenInPlace = this._onDidOpenInPlace.event;
    metadata;
    constructor(id, callbacks, telemetryService, themeService, storageService, instantiationService) {
        super(id, telemetryService, themeService, storageService, instantiationService);
        this.callbacks = callbacks;
    }
    getTitle() {
        return this.input ? this.input.getName() : localize('binaryEditor', "Binary Viewer");
    }
    async getContents(input, options) {
        const model = await input.resolve();
        // Assert Model instance
        if (!(model instanceof BinaryEditorModel)) {
            throw new Error('Unable to open file as binary');
        }
        // Update metadata
        const size = model.getSize();
        this.handleMetadataChanged(typeof size === 'number' ? ByteSize.formatSize(size) : '');
        return {
            icon: '$(warning)',
            label: localize('binaryError', "The file is not displayed in the editor because it is either binary or uses an unsupported text encoding."),
            actions: [
                {
                    label: localize('openAnyway', "Open Anyway"),
                    run: async () => {
                        // Open in place
                        await this.callbacks.openInternal(input, options);
                        // Signal to listeners that the binary editor has been opened in-place
                        this._onDidOpenInPlace.fire();
                    }
                }
            ]
        };
    }
    handleMetadataChanged(meta) {
        this.metadata = meta;
        this._onDidChangeMetadata.fire();
    }
    getMetadata() {
        return this.metadata;
    }
};
BaseBinaryResourceEditor = __decorate([
    __param(4, IStorageService),
    __param(5, IInstantiationService)
], BaseBinaryResourceEditor);
export { BaseBinaryResourceEditor };

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
import { URI } from 'vs/base/common/uri';
import { ITextEditorService } from 'vs/workbench/services/textfile/common/textEditorService';
import { isEqual } from 'vs/base/common/resources';
import { NO_TYPE_ID } from 'vs/workbench/services/workingCopy/common/workingCopy';
import { IWorkingCopyEditorService } from 'vs/workbench/services/workingCopy/common/workingCopyEditorService';
import { IFileService } from 'vs/platform/files/common/files';
export class FileEditorInputSerializer {
    canSerialize(editorInput) {
        return true;
    }
    serialize(editorInput) {
        const fileEditorInput = editorInput;
        const resource = fileEditorInput.resource;
        const preferredResource = fileEditorInput.preferredResource;
        const serializedFileEditorInput = {
            resourceJSON: resource.toJSON(),
            preferredResourceJSON: isEqual(resource, preferredResource) ? undefined : preferredResource,
            name: fileEditorInput.getPreferredName(),
            description: fileEditorInput.getPreferredDescription(),
            encoding: fileEditorInput.getEncoding(),
            modeId: fileEditorInput.getPreferredLanguageId() // only using the preferred user associated language here if available to not store redundant data
        };
        return JSON.stringify(serializedFileEditorInput);
    }
    deserialize(instantiationService, serializedEditorInput) {
        return instantiationService.invokeFunction(accessor => {
            const serializedFileEditorInput = JSON.parse(serializedEditorInput);
            const resource = URI.revive(serializedFileEditorInput.resourceJSON);
            const preferredResource = URI.revive(serializedFileEditorInput.preferredResourceJSON);
            const name = serializedFileEditorInput.name;
            const description = serializedFileEditorInput.description;
            const encoding = serializedFileEditorInput.encoding;
            const languageId = serializedFileEditorInput.modeId;
            const fileEditorInput = accessor.get(ITextEditorService).createTextEditor({ resource, label: name, description, encoding, languageId, forceFile: true });
            if (preferredResource) {
                fileEditorInput.setPreferredResource(preferredResource);
            }
            return fileEditorInput;
        });
    }
}
let FileEditorWorkingCopyEditorHandler = class FileEditorWorkingCopyEditorHandler extends Disposable {
    workingCopyEditorService;
    textEditorService;
    fileService;
    constructor(workingCopyEditorService, textEditorService, fileService) {
        super();
        this.workingCopyEditorService = workingCopyEditorService;
        this.textEditorService = textEditorService;
        this.fileService = fileService;
        this.installHandler();
    }
    installHandler() {
        this._register(this.workingCopyEditorService.registerHandler({
            handles: workingCopy => workingCopy.typeId === NO_TYPE_ID && this.fileService.hasProvider(workingCopy.resource),
            // Naturally it would make sense here to check for `instanceof FileEditorInput`
            // but because some custom editors also leverage text file based working copies
            // we need to do a weaker check by only comparing for the resource
            isOpen: (workingCopy, editor) => isEqual(workingCopy.resource, editor.resource),
            createEditor: workingCopy => this.textEditorService.createTextEditor({ resource: workingCopy.resource, forceFile: true })
        }));
    }
};
FileEditorWorkingCopyEditorHandler = __decorate([
    __param(0, IWorkingCopyEditorService),
    __param(1, ITextEditorService),
    __param(2, IFileService)
], FileEditorWorkingCopyEditorHandler);
export { FileEditorWorkingCopyEditorHandler };

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
import { Disposable } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
import { isUntitledWithAssociatedResource } from 'vs/workbench/common/editor';
import { ITextEditorService } from 'vs/workbench/services/textfile/common/textEditorService';
import { isEqual, toLocalResource } from 'vs/base/common/resources';
import { PLAINTEXT_LANGUAGE_ID } from 'vs/editor/common/languages/modesRegistry';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { IFilesConfigurationService } from 'vs/workbench/services/filesConfiguration/common/filesConfigurationService';
import { IPathService } from 'vs/workbench/services/path/common/pathService';
import { UntitledTextEditorInput } from 'vs/workbench/services/untitled/common/untitledTextEditorInput';
import { NO_TYPE_ID } from 'vs/workbench/services/workingCopy/common/workingCopy';
import { IWorkingCopyEditorService } from 'vs/workbench/services/workingCopy/common/workingCopyEditorService';
let UntitledTextEditorInputSerializer = class UntitledTextEditorInputSerializer {
    filesConfigurationService;
    environmentService;
    pathService;
    constructor(filesConfigurationService, environmentService, pathService) {
        this.filesConfigurationService = filesConfigurationService;
        this.environmentService = environmentService;
        this.pathService = pathService;
    }
    canSerialize(editorInput) {
        return this.filesConfigurationService.isHotExitEnabled && !editorInput.isDisposed();
    }
    serialize(editorInput) {
        if (!this.filesConfigurationService.isHotExitEnabled || editorInput.isDisposed()) {
            return undefined;
        }
        const untitledTextEditorInput = editorInput;
        let resource = untitledTextEditorInput.resource;
        if (untitledTextEditorInput.model.hasAssociatedFilePath) {
            resource = toLocalResource(resource, this.environmentService.remoteAuthority, this.pathService.defaultUriScheme); // untitled with associated file path use the local schema
        }
        // Language: only remember language if it is either specific (not text)
        // or if the language was explicitly set by the user. We want to preserve
        // this information across restarts and not set the language unless
        // this is the case.
        let languageId;
        const languageIdCandidate = untitledTextEditorInput.getLanguageId();
        if (languageIdCandidate !== PLAINTEXT_LANGUAGE_ID) {
            languageId = languageIdCandidate;
        }
        else if (untitledTextEditorInput.model.hasLanguageSetExplicitly) {
            languageId = languageIdCandidate;
        }
        const serialized = {
            resourceJSON: resource.toJSON(),
            modeId: languageId,
            encoding: untitledTextEditorInput.getEncoding()
        };
        return JSON.stringify(serialized);
    }
    deserialize(instantiationService, serializedEditorInput) {
        return instantiationService.invokeFunction(accessor => {
            const deserialized = JSON.parse(serializedEditorInput);
            const resource = URI.revive(deserialized.resourceJSON);
            const languageId = deserialized.modeId;
            const encoding = deserialized.encoding;
            return accessor.get(ITextEditorService).createTextEditor({ resource, languageId, encoding, forceUntitled: true });
        });
    }
};
UntitledTextEditorInputSerializer = __decorate([
    __param(0, IFilesConfigurationService),
    __param(1, IWorkbenchEnvironmentService),
    __param(2, IPathService)
], UntitledTextEditorInputSerializer);
export { UntitledTextEditorInputSerializer };
let UntitledTextEditorWorkingCopyEditorHandler = class UntitledTextEditorWorkingCopyEditorHandler extends Disposable {
    workingCopyEditorService;
    environmentService;
    pathService;
    textEditorService;
    constructor(workingCopyEditorService, environmentService, pathService, textEditorService) {
        super();
        this.workingCopyEditorService = workingCopyEditorService;
        this.environmentService = environmentService;
        this.pathService = pathService;
        this.textEditorService = textEditorService;
        this.installHandler();
    }
    installHandler() {
        this._register(this.workingCopyEditorService.registerHandler({
            handles: workingCopy => workingCopy.resource.scheme === Schemas.untitled && workingCopy.typeId === NO_TYPE_ID,
            isOpen: (workingCopy, editor) => editor instanceof UntitledTextEditorInput && isEqual(workingCopy.resource, editor.resource),
            createEditor: workingCopy => {
                let editorInputResource;
                // If the untitled has an associated resource,
                // ensure to restore the local resource it had
                if (isUntitledWithAssociatedResource(workingCopy.resource)) {
                    editorInputResource = toLocalResource(workingCopy.resource, this.environmentService.remoteAuthority, this.pathService.defaultUriScheme);
                }
                else {
                    editorInputResource = workingCopy.resource;
                }
                return this.textEditorService.createTextEditor({ resource: editorInputResource, forceUntitled: true });
            }
        }));
    }
};
UntitledTextEditorWorkingCopyEditorHandler = __decorate([
    __param(0, IWorkingCopyEditorService),
    __param(1, IWorkbenchEnvironmentService),
    __param(2, IPathService),
    __param(3, ITextEditorService)
], UntitledTextEditorWorkingCopyEditorHandler);
export { UntitledTextEditorWorkingCopyEditorHandler };

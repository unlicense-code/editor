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
import { dirname, basename } from 'vs/base/common/path';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { ITextResourceConfigurationService } from 'vs/editor/common/services/textResourceConfiguration';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { AbstractTextResourceEditor } from 'vs/workbench/browser/parts/editor/textResourceEditor';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { TextResourceEditorInput } from 'vs/workbench/common/editor/textResourceEditorInput';
import { URI } from 'vs/base/common/uri';
import { ITextModelService } from 'vs/editor/common/services/resolverService';
import { LOG_SCHEME } from 'vs/workbench/services/output/common/output';
import { IEditorGroupsService } from 'vs/workbench/services/editor/common/editorGroupsService';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { ITextFileService } from 'vs/workbench/services/textfile/common/textfiles';
import { IFileService } from 'vs/platform/files/common/files';
import { ILabelService } from 'vs/platform/label/common/label';
let LogViewerInput = class LogViewerInput extends TextResourceEditorInput {
    static ID = 'workbench.editorinputs.output';
    get typeId() {
        return LogViewerInput.ID;
    }
    constructor(outputChannelDescriptor, textModelResolverService, textFileService, editorService, fileService, labelService) {
        super(URI.from({ scheme: LOG_SCHEME, path: outputChannelDescriptor.id }), basename(outputChannelDescriptor.file.path), dirname(outputChannelDescriptor.file.path), undefined, undefined, textModelResolverService, textFileService, editorService, fileService, labelService);
    }
};
LogViewerInput = __decorate([
    __param(1, ITextModelService),
    __param(2, ITextFileService),
    __param(3, IEditorService),
    __param(4, IFileService),
    __param(5, ILabelService)
], LogViewerInput);
export { LogViewerInput };
let LogViewer = class LogViewer extends AbstractTextResourceEditor {
    static LOG_VIEWER_EDITOR_ID = 'workbench.editors.logViewer';
    constructor(telemetryService, instantiationService, storageService, textResourceConfigurationService, themeService, editorGroupService, editorService, fileService) {
        super(LogViewer.LOG_VIEWER_EDITOR_ID, telemetryService, instantiationService, storageService, textResourceConfigurationService, themeService, editorGroupService, editorService, fileService);
    }
    getConfigurationOverrides() {
        const options = super.getConfigurationOverrides();
        options.wordWrap = 'off'; // all log viewers do not wrap
        options.folding = false;
        options.scrollBeyondLastLine = false;
        options.renderValidationDecorations = 'editable';
        return options;
    }
    getAriaLabel() {
        return localize('logViewerAriaLabel', "Log viewer");
    }
};
LogViewer = __decorate([
    __param(0, ITelemetryService),
    __param(1, IInstantiationService),
    __param(2, IStorageService),
    __param(3, ITextResourceConfigurationService),
    __param(4, IThemeService),
    __param(5, IEditorGroupsService),
    __param(6, IEditorService),
    __param(7, IFileService)
], LogViewer);
export { LogViewer };

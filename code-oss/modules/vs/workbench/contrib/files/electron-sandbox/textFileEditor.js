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
import { TextFileEditor } from 'vs/workbench/contrib/files/browser/editors/textFileEditor';
import { IFileService, MIN_MAX_MEMORY_SIZE_MB, FALLBACK_MAX_MEMORY_SIZE_MB } from 'vs/platform/files/common/files';
import { createErrorWithActions } from 'vs/base/common/errorMessage';
import { toAction } from 'vs/base/common/actions';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { ITextResourceConfigurationService } from 'vs/editor/common/services/textResourceConfiguration';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { IEditorGroupsService } from 'vs/workbench/services/editor/common/editorGroupsService';
import { ITextFileService } from 'vs/workbench/services/textfile/common/textfiles';
import { IPreferencesService } from 'vs/workbench/services/preferences/common/preferences';
import { INativeHostService } from 'vs/platform/native/electron-sandbox/native';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
import { IExplorerService } from 'vs/workbench/contrib/files/browser/files';
import { IProductService } from 'vs/platform/product/common/productService';
import { IPaneCompositePartService } from 'vs/workbench/services/panecomposite/browser/panecomposite';
import { IPathService } from 'vs/workbench/services/path/common/pathService';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
/**
 * An implementation of editor for file system resources.
 */
let NativeTextFileEditor = class NativeTextFileEditor extends TextFileEditor {
    nativeHostService;
    preferencesService;
    productService;
    constructor(telemetryService, fileService, paneCompositeService, instantiationService, contextService, storageService, textResourceConfigurationService, editorService, themeService, editorGroupService, textFileService, nativeHostService, preferencesService, explorerService, uriIdentityService, productService, pathService, configurationService) {
        super(telemetryService, fileService, paneCompositeService, instantiationService, contextService, storageService, textResourceConfigurationService, editorService, themeService, editorGroupService, textFileService, explorerService, uriIdentityService, pathService, configurationService);
        this.nativeHostService = nativeHostService;
        this.preferencesService = preferencesService;
        this.productService = productService;
    }
    handleSetInputError(error, input, options) {
        // Allow to restart with higher memory limit if the file is too large
        if (error.fileOperationResult === 9 /* FileOperationResult.FILE_EXCEEDS_MEMORY_LIMIT */) {
            const memoryLimit = Math.max(MIN_MAX_MEMORY_SIZE_MB, +this.textResourceConfigurationService.getValue(undefined, 'files.maxMemoryForLargeFilesMB') || FALLBACK_MAX_MEMORY_SIZE_MB);
            throw createErrorWithActions(localize('fileTooLargeForHeapError', "To open a file of this size, you need to restart and allow {0} to use more memory", this.productService.nameShort), [
                toAction({
                    id: 'workbench.window.action.relaunchWithIncreasedMemoryLimit', label: localize('relaunchWithIncreasedMemoryLimit', "Restart with {0} MB", memoryLimit), run: () => {
                        return this.nativeHostService.relaunch({
                            addArgs: [
                                `--max-memory=${memoryLimit}`
                            ]
                        });
                    }
                }),
                toAction({
                    id: 'workbench.window.action.configureMemoryLimit', label: localize('configureMemoryLimit', 'Configure Memory Limit'), run: () => {
                        return this.preferencesService.openUserSettings({ query: 'files.maxMemoryForLargeFilesMB' });
                    }
                }),
            ]);
        }
        // Fallback to handling in super type
        return super.handleSetInputError(error, input, options);
    }
};
NativeTextFileEditor = __decorate([
    __param(0, ITelemetryService),
    __param(1, IFileService),
    __param(2, IPaneCompositePartService),
    __param(3, IInstantiationService),
    __param(4, IWorkspaceContextService),
    __param(5, IStorageService),
    __param(6, ITextResourceConfigurationService),
    __param(7, IEditorService),
    __param(8, IThemeService),
    __param(9, IEditorGroupsService),
    __param(10, ITextFileService),
    __param(11, INativeHostService),
    __param(12, IPreferencesService),
    __param(13, IExplorerService),
    __param(14, IUriIdentityService),
    __param(15, IProductService),
    __param(16, IPathService),
    __param(17, IConfigurationService)
], NativeTextFileEditor);
export { NativeTextFileEditor };

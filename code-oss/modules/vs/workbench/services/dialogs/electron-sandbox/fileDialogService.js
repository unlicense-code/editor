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
import { IHostService } from 'vs/workbench/services/host/browser/host';
import { IFileDialogService, IDialogService } from 'vs/platform/dialogs/common/dialogs';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { IHistoryService } from 'vs/workbench/services/history/common/history';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { URI } from 'vs/base/common/uri';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { IFileService } from 'vs/platform/files/common/files';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { INativeHostService } from 'vs/platform/native/electron-sandbox/native';
import { AbstractFileDialogService } from 'vs/workbench/services/dialogs/browser/abstractFileDialogService';
import { Schemas } from 'vs/base/common/network';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { IWorkspacesService } from 'vs/platform/workspaces/common/workspaces';
import { ILabelService } from 'vs/platform/label/common/label';
import { IPathService } from 'vs/workbench/services/path/common/pathService';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { ICodeEditorService } from 'vs/editor/browser/services/codeEditorService';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { ILogService } from 'vs/platform/log/common/log';
let FileDialogService = class FileDialogService extends AbstractFileDialogService {
    nativeHostService;
    constructor(hostService, contextService, historyService, environmentService, instantiationService, configurationService, fileService, openerService, nativeHostService, dialogService, languageService, workspacesService, labelService, pathService, commandService, editorService, codeEditorService, logService) {
        super(hostService, contextService, historyService, environmentService, instantiationService, configurationService, fileService, openerService, dialogService, languageService, workspacesService, labelService, pathService, commandService, editorService, codeEditorService, logService);
        this.nativeHostService = nativeHostService;
    }
    toNativeOpenDialogOptions(options) {
        return {
            forceNewWindow: options.forceNewWindow,
            telemetryExtraData: options.telemetryExtraData,
            defaultPath: options.defaultUri?.fsPath
        };
    }
    shouldUseSimplified(schema) {
        const setting = (this.configurationService.getValue('files.simpleDialog.enable') === true);
        const newWindowSetting = (this.configurationService.getValue('window.openFilesInNewWindow') === 'on');
        return {
            useSimplified: ((schema !== Schemas.file) && (schema !== Schemas.vscodeUserData)) || setting,
            isSetting: newWindowSetting
        };
    }
    async pickFileFolderAndOpen(options) {
        const schema = this.getFileSystemSchema(options);
        if (!options.defaultUri) {
            options.defaultUri = await this.defaultFilePath(schema);
        }
        const shouldUseSimplified = this.shouldUseSimplified(schema);
        if (shouldUseSimplified.useSimplified) {
            return this.pickFileFolderAndOpenSimplified(schema, options, shouldUseSimplified.isSetting);
        }
        return this.nativeHostService.pickFileFolderAndOpen(this.toNativeOpenDialogOptions(options));
    }
    async pickFileAndOpen(options) {
        const schema = this.getFileSystemSchema(options);
        if (!options.defaultUri) {
            options.defaultUri = await this.defaultFilePath(schema);
        }
        const shouldUseSimplified = this.shouldUseSimplified(schema);
        if (shouldUseSimplified.useSimplified) {
            return this.pickFileAndOpenSimplified(schema, options, shouldUseSimplified.isSetting);
        }
        return this.nativeHostService.pickFileAndOpen(this.toNativeOpenDialogOptions(options));
    }
    async pickFolderAndOpen(options) {
        const schema = this.getFileSystemSchema(options);
        if (!options.defaultUri) {
            options.defaultUri = await this.defaultFolderPath(schema);
        }
        if (this.shouldUseSimplified(schema).useSimplified) {
            return this.pickFolderAndOpenSimplified(schema, options);
        }
        return this.nativeHostService.pickFolderAndOpen(this.toNativeOpenDialogOptions(options));
    }
    async pickWorkspaceAndOpen(options) {
        options.availableFileSystems = this.getWorkspaceAvailableFileSystems(options);
        const schema = this.getFileSystemSchema(options);
        if (!options.defaultUri) {
            options.defaultUri = await this.defaultWorkspacePath(schema);
        }
        if (this.shouldUseSimplified(schema).useSimplified) {
            return this.pickWorkspaceAndOpenSimplified(schema, options);
        }
        return this.nativeHostService.pickWorkspaceAndOpen(this.toNativeOpenDialogOptions(options));
    }
    async pickFileToSave(defaultUri, availableFileSystems) {
        const schema = this.getFileSystemSchema({ defaultUri, availableFileSystems });
        const options = this.getPickFileToSaveDialogOptions(defaultUri, availableFileSystems);
        if (this.shouldUseSimplified(schema).useSimplified) {
            return this.pickFileToSaveSimplified(schema, options);
        }
        else {
            const result = await this.nativeHostService.showSaveDialog(this.toNativeSaveDialogOptions(options));
            if (result && !result.canceled && result.filePath) {
                const uri = URI.file(result.filePath);
                this.addFileToRecentlyOpened(uri);
                return uri;
            }
        }
        return;
    }
    toNativeSaveDialogOptions(options) {
        options.defaultUri = options.defaultUri ? URI.file(options.defaultUri.path) : undefined;
        return {
            defaultPath: options.defaultUri?.fsPath,
            buttonLabel: options.saveLabel,
            filters: options.filters,
            title: options.title
        };
    }
    async showSaveDialog(options) {
        const schema = this.getFileSystemSchema(options);
        if (this.shouldUseSimplified(schema).useSimplified) {
            return this.showSaveDialogSimplified(schema, options);
        }
        const result = await this.nativeHostService.showSaveDialog(this.toNativeSaveDialogOptions(options));
        if (result && !result.canceled && result.filePath) {
            return URI.file(result.filePath);
        }
        return;
    }
    async showOpenDialog(options) {
        const schema = this.getFileSystemSchema(options);
        if (this.shouldUseSimplified(schema).useSimplified) {
            return this.showOpenDialogSimplified(schema, options);
        }
        const newOptions = {
            title: options.title,
            defaultPath: options.defaultUri?.fsPath,
            buttonLabel: options.openLabel,
            filters: options.filters,
            properties: []
        };
        newOptions.properties.push('createDirectory');
        if (options.canSelectFiles) {
            newOptions.properties.push('openFile');
        }
        if (options.canSelectFolders) {
            newOptions.properties.push('openDirectory');
        }
        if (options.canSelectMany) {
            newOptions.properties.push('multiSelections');
        }
        const result = await this.nativeHostService.showOpenDialog(newOptions);
        return result && Array.isArray(result.filePaths) && result.filePaths.length > 0 ? result.filePaths.map(URI.file) : undefined;
    }
};
FileDialogService = __decorate([
    __param(0, IHostService),
    __param(1, IWorkspaceContextService),
    __param(2, IHistoryService),
    __param(3, IWorkbenchEnvironmentService),
    __param(4, IInstantiationService),
    __param(5, IConfigurationService),
    __param(6, IFileService),
    __param(7, IOpenerService),
    __param(8, INativeHostService),
    __param(9, IDialogService),
    __param(10, ILanguageService),
    __param(11, IWorkspacesService),
    __param(12, ILabelService),
    __param(13, IPathService),
    __param(14, ICommandService),
    __param(15, IEditorService),
    __param(16, ICodeEditorService),
    __param(17, ILogService)
], FileDialogService);
export { FileDialogService };
registerSingleton(IFileDialogService, FileDialogService, 1 /* InstantiationType.Delayed */);

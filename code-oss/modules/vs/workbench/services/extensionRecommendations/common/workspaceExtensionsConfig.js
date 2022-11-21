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
import { distinct, flatten } from 'vs/base/common/arrays';
import { Emitter } from 'vs/base/common/event';
import { parse } from 'vs/base/common/json';
import { Disposable } from 'vs/base/common/lifecycle';
import { getIconClasses } from 'vs/editor/common/services/getIconClasses';
import { FileKind, IFileService } from 'vs/platform/files/common/files';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { isWorkspace, IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { IQuickInputService } from 'vs/platform/quickinput/common/quickInput';
import { IModelService } from 'vs/editor/common/services/model';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { localize } from 'vs/nls';
import { IJSONEditingService } from 'vs/workbench/services/configuration/common/jsonEditing';
import { ResourceMap } from 'vs/base/common/map';
export const EXTENSIONS_CONFIG = '.vscode/extensions.json';
export const IWorkspaceExtensionsConfigService = createDecorator('IWorkspaceExtensionsConfigService');
let WorkspaceExtensionsConfigService = class WorkspaceExtensionsConfigService extends Disposable {
    workspaceContextService;
    fileService;
    quickInputService;
    modelService;
    languageService;
    jsonEditingService;
    _onDidChangeExtensionsConfigs = this._register(new Emitter());
    onDidChangeExtensionsConfigs = this._onDidChangeExtensionsConfigs.event;
    constructor(workspaceContextService, fileService, quickInputService, modelService, languageService, jsonEditingService) {
        super();
        this.workspaceContextService = workspaceContextService;
        this.fileService = fileService;
        this.quickInputService = quickInputService;
        this.modelService = modelService;
        this.languageService = languageService;
        this.jsonEditingService = jsonEditingService;
        this._register(workspaceContextService.onDidChangeWorkspaceFolders(e => this._onDidChangeExtensionsConfigs.fire()));
        this._register(fileService.onDidFilesChange(e => {
            const workspace = workspaceContextService.getWorkspace();
            if ((workspace.configuration && e.affects(workspace.configuration))
                || workspace.folders.some(folder => e.affects(folder.toResource(EXTENSIONS_CONFIG)))) {
                this._onDidChangeExtensionsConfigs.fire();
            }
        }));
    }
    async getExtensionsConfigs() {
        const workspace = this.workspaceContextService.getWorkspace();
        const result = [];
        const workspaceExtensionsConfigContent = workspace.configuration ? await this.resolveWorkspaceExtensionConfig(workspace.configuration) : undefined;
        if (workspaceExtensionsConfigContent) {
            result.push(workspaceExtensionsConfigContent);
        }
        result.push(...await Promise.all(workspace.folders.map(workspaceFolder => this.resolveWorkspaceFolderExtensionConfig(workspaceFolder))));
        return result;
    }
    async getRecommendations() {
        const configs = await this.getExtensionsConfigs();
        return distinct(flatten(configs.map(c => c.recommendations ? c.recommendations.map(c => c.toLowerCase()) : [])));
    }
    async getUnwantedRecommendations() {
        const configs = await this.getExtensionsConfigs();
        return distinct(flatten(configs.map(c => c.unwantedRecommendations ? c.unwantedRecommendations.map(c => c.toLowerCase()) : [])));
    }
    async toggleRecommendation(extensionId) {
        extensionId = extensionId.toLowerCase();
        const workspace = this.workspaceContextService.getWorkspace();
        const workspaceExtensionsConfigContent = workspace.configuration ? await this.resolveWorkspaceExtensionConfig(workspace.configuration) : undefined;
        const workspaceFolderExtensionsConfigContents = new ResourceMap();
        await Promise.all(workspace.folders.map(async (workspaceFolder) => {
            const extensionsConfigContent = await this.resolveWorkspaceFolderExtensionConfig(workspaceFolder);
            workspaceFolderExtensionsConfigContents.set(workspaceFolder.uri, extensionsConfigContent);
        }));
        const isWorkspaceRecommended = workspaceExtensionsConfigContent && workspaceExtensionsConfigContent.recommendations?.some(r => r.toLowerCase() === extensionId);
        const recommendedWorksapceFolders = workspace.folders.filter(workspaceFolder => workspaceFolderExtensionsConfigContents.get(workspaceFolder.uri)?.recommendations?.some(r => r.toLowerCase() === extensionId));
        const isRecommended = isWorkspaceRecommended || recommendedWorksapceFolders.length > 0;
        const workspaceOrFolders = isRecommended
            ? await this.pickWorkspaceOrFolders(recommendedWorksapceFolders, isWorkspaceRecommended ? workspace : undefined, localize('select for remove', "Remove extension recommendation from"))
            : await this.pickWorkspaceOrFolders(workspace.folders, workspace.configuration ? workspace : undefined, localize('select for add', "Add extension recommendation to"));
        for (const workspaceOrWorkspaceFolder of workspaceOrFolders) {
            if (isWorkspace(workspaceOrWorkspaceFolder)) {
                await this.addOrRemoveWorkspaceRecommendation(extensionId, workspaceOrWorkspaceFolder, workspaceExtensionsConfigContent, !isRecommended);
            }
            else {
                await this.addOrRemoveWorkspaceFolderRecommendation(extensionId, workspaceOrWorkspaceFolder, workspaceFolderExtensionsConfigContents.get(workspaceOrWorkspaceFolder.uri), !isRecommended);
            }
        }
    }
    async toggleUnwantedRecommendation(extensionId) {
        const workspace = this.workspaceContextService.getWorkspace();
        const workspaceExtensionsConfigContent = workspace.configuration ? await this.resolveWorkspaceExtensionConfig(workspace.configuration) : undefined;
        const workspaceFolderExtensionsConfigContents = new ResourceMap();
        await Promise.all(workspace.folders.map(async (workspaceFolder) => {
            const extensionsConfigContent = await this.resolveWorkspaceFolderExtensionConfig(workspaceFolder);
            workspaceFolderExtensionsConfigContents.set(workspaceFolder.uri, extensionsConfigContent);
        }));
        const isWorkspaceUnwanted = workspaceExtensionsConfigContent && workspaceExtensionsConfigContent.unwantedRecommendations?.some(r => r === extensionId);
        const unWantedWorksapceFolders = workspace.folders.filter(workspaceFolder => workspaceFolderExtensionsConfigContents.get(workspaceFolder.uri)?.unwantedRecommendations?.some(r => r === extensionId));
        const isUnwanted = isWorkspaceUnwanted || unWantedWorksapceFolders.length > 0;
        const workspaceOrFolders = isUnwanted
            ? await this.pickWorkspaceOrFolders(unWantedWorksapceFolders, isWorkspaceUnwanted ? workspace : undefined, localize('select for remove', "Remove extension recommendation from"))
            : await this.pickWorkspaceOrFolders(workspace.folders, workspace.configuration ? workspace : undefined, localize('select for add', "Add extension recommendation to"));
        for (const workspaceOrWorkspaceFolder of workspaceOrFolders) {
            if (isWorkspace(workspaceOrWorkspaceFolder)) {
                await this.addOrRemoveWorkspaceUnwantedRecommendation(extensionId, workspaceOrWorkspaceFolder, workspaceExtensionsConfigContent, !isUnwanted);
            }
            else {
                await this.addOrRemoveWorkspaceFolderUnwantedRecommendation(extensionId, workspaceOrWorkspaceFolder, workspaceFolderExtensionsConfigContents.get(workspaceOrWorkspaceFolder.uri), !isUnwanted);
            }
        }
    }
    async addOrRemoveWorkspaceFolderRecommendation(extensionId, workspaceFolder, extensionsConfigContent, add) {
        const values = [];
        if (add) {
            values.push({ path: ['recommendations'], value: [...extensionsConfigContent.recommendations || [], extensionId] });
            if (extensionsConfigContent.unwantedRecommendations && extensionsConfigContent.unwantedRecommendations.some(e => e === extensionId)) {
                values.push({ path: ['unwantedRecommendations'], value: extensionsConfigContent.unwantedRecommendations.filter(e => e !== extensionId) });
            }
        }
        else if (extensionsConfigContent.recommendations) {
            values.push({ path: ['recommendations'], value: extensionsConfigContent.recommendations.filter(e => e !== extensionId) });
        }
        if (values.length) {
            return this.jsonEditingService.write(workspaceFolder.toResource(EXTENSIONS_CONFIG), values, true);
        }
    }
    async addOrRemoveWorkspaceRecommendation(extensionId, workspace, extensionsConfigContent, add) {
        const values = [];
        if (extensionsConfigContent) {
            if (add) {
                values.push({ path: ['extensions', 'recommendations'], value: [...extensionsConfigContent.recommendations || [], extensionId] });
                if (extensionsConfigContent.unwantedRecommendations && extensionsConfigContent.unwantedRecommendations.some(e => e === extensionId)) {
                    values.push({ path: ['extensions', 'unwantedRecommendations'], value: extensionsConfigContent.unwantedRecommendations.filter(e => e !== extensionId) });
                }
            }
            else if (extensionsConfigContent.recommendations) {
                values.push({ path: ['extensions', 'recommendations'], value: extensionsConfigContent.recommendations.filter(e => e !== extensionId) });
            }
        }
        else if (add) {
            values.push({ path: ['extensions'], value: { recommendations: [extensionId] } });
        }
        if (values.length) {
            return this.jsonEditingService.write(workspace.configuration, values, true);
        }
    }
    async addOrRemoveWorkspaceFolderUnwantedRecommendation(extensionId, workspaceFolder, extensionsConfigContent, add) {
        const values = [];
        if (add) {
            values.push({ path: ['unwantedRecommendations'], value: [...extensionsConfigContent.unwantedRecommendations || [], extensionId] });
            if (extensionsConfigContent.recommendations && extensionsConfigContent.recommendations.some(e => e === extensionId)) {
                values.push({ path: ['recommendations'], value: extensionsConfigContent.recommendations.filter(e => e !== extensionId) });
            }
        }
        else if (extensionsConfigContent.unwantedRecommendations) {
            values.push({ path: ['unwantedRecommendations'], value: extensionsConfigContent.unwantedRecommendations.filter(e => e !== extensionId) });
        }
        if (values.length) {
            return this.jsonEditingService.write(workspaceFolder.toResource(EXTENSIONS_CONFIG), values, true);
        }
    }
    async addOrRemoveWorkspaceUnwantedRecommendation(extensionId, workspace, extensionsConfigContent, add) {
        const values = [];
        if (extensionsConfigContent) {
            if (add) {
                values.push({ path: ['extensions', 'unwantedRecommendations'], value: [...extensionsConfigContent.unwantedRecommendations || [], extensionId] });
                if (extensionsConfigContent.recommendations && extensionsConfigContent.recommendations.some(e => e === extensionId)) {
                    values.push({ path: ['extensions', 'recommendations'], value: extensionsConfigContent.recommendations.filter(e => e !== extensionId) });
                }
            }
            else if (extensionsConfigContent.unwantedRecommendations) {
                values.push({ path: ['extensions', 'unwantedRecommendations'], value: extensionsConfigContent.unwantedRecommendations.filter(e => e !== extensionId) });
            }
        }
        else if (add) {
            values.push({ path: ['extensions'], value: { unwantedRecommendations: [extensionId] } });
        }
        if (values.length) {
            return this.jsonEditingService.write(workspace.configuration, values, true);
        }
    }
    async pickWorkspaceOrFolders(workspaceFolders, workspace, placeHolder) {
        const workspaceOrFolders = workspace ? [...workspaceFolders, workspace] : [...workspaceFolders];
        if (workspaceOrFolders.length === 1) {
            return workspaceOrFolders;
        }
        const folderPicks = workspaceFolders.map(workspaceFolder => {
            return {
                label: workspaceFolder.name,
                description: localize('workspace folder', "Workspace Folder"),
                workspaceOrFolder: workspaceFolder,
                iconClasses: getIconClasses(this.modelService, this.languageService, workspaceFolder.uri, FileKind.ROOT_FOLDER)
            };
        });
        if (workspace) {
            folderPicks.push({ type: 'separator' });
            folderPicks.push({
                label: localize('workspace', "Workspace"),
                workspaceOrFolder: workspace,
            });
        }
        const result = await this.quickInputService.pick(folderPicks, { placeHolder, canPickMany: true }) || [];
        return result.map(r => r.workspaceOrFolder);
    }
    async resolveWorkspaceExtensionConfig(workspaceConfigurationResource) {
        try {
            const content = await this.fileService.readFile(workspaceConfigurationResource);
            const extensionsConfigContent = parse(content.value.toString())['extensions'];
            return extensionsConfigContent ? this.parseExtensionConfig(extensionsConfigContent) : undefined;
        }
        catch (e) { /* Ignore */ }
        return undefined;
    }
    async resolveWorkspaceFolderExtensionConfig(workspaceFolder) {
        try {
            const content = await this.fileService.readFile(workspaceFolder.toResource(EXTENSIONS_CONFIG));
            const extensionsConfigContent = parse(content.value.toString());
            return this.parseExtensionConfig(extensionsConfigContent);
        }
        catch (e) { /* ignore */ }
        return {};
    }
    parseExtensionConfig(extensionsConfigContent) {
        return {
            recommendations: distinct((extensionsConfigContent.recommendations || []).map(e => e.toLowerCase())),
            unwantedRecommendations: distinct((extensionsConfigContent.unwantedRecommendations || []).map(e => e.toLowerCase()))
        };
    }
};
WorkspaceExtensionsConfigService = __decorate([
    __param(0, IWorkspaceContextService),
    __param(1, IFileService),
    __param(2, IQuickInputService),
    __param(3, IModelService),
    __param(4, ILanguageService),
    __param(5, IJSONEditingService)
], WorkspaceExtensionsConfigService);
export { WorkspaceExtensionsConfigService };
registerSingleton(IWorkspaceExtensionsConfigService, WorkspaceExtensionsConfigService, 1 /* InstantiationType.Delayed */);

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
import { ICommandService } from 'vs/platform/commands/common/commands';
import * as arrays from 'vs/base/common/arrays';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { onUnexpectedError } from 'vs/base/common/errors';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IWorkingCopyBackupService } from 'vs/workbench/services/workingCopy/common/workingCopyBackup';
import { ILifecycleService } from 'vs/workbench/services/lifecycle/common/lifecycle';
import { IFileService } from 'vs/platform/files/common/files';
import { joinPath } from 'vs/base/common/resources';
import { IWorkbenchLayoutService } from 'vs/workbench/services/layout/browser/layoutService';
import { GettingStartedInput, gettingStartedInputTypeId } from 'vs/workbench/contrib/welcomeGettingStarted/browser/gettingStartedInput';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { getTelemetryLevel } from 'vs/platform/telemetry/common/telemetryUtils';
import { IProductService } from 'vs/platform/product/common/productService';
export const restoreWalkthroughsConfigurationKey = 'workbench.welcomePage.restorableWalkthroughs';
const configurationKey = 'workbench.startupEditor';
const oldConfigurationKey = 'workbench.welcome.enabled';
const telemetryOptOutStorageKey = 'workbench.telemetryOptOutShown';
let StartupPageContribution = class StartupPageContribution {
    instantiationService;
    configurationService;
    editorService;
    workingCopyBackupService;
    fileService;
    contextService;
    lifecycleService;
    layoutService;
    productService;
    commandService;
    environmentService;
    storageService;
    constructor(instantiationService, configurationService, editorService, workingCopyBackupService, fileService, contextService, lifecycleService, layoutService, productService, commandService, environmentService, storageService) {
        this.instantiationService = instantiationService;
        this.configurationService = configurationService;
        this.editorService = editorService;
        this.workingCopyBackupService = workingCopyBackupService;
        this.fileService = fileService;
        this.contextService = contextService;
        this.lifecycleService = lifecycleService;
        this.layoutService = layoutService;
        this.productService = productService;
        this.commandService = commandService;
        this.environmentService = environmentService;
        this.storageService = storageService;
        this.run().then(undefined, onUnexpectedError);
    }
    async run() {
        // Always open Welcome page for first-launch, no matter what is open or which startupEditor is set.
        if (this.productService.enableTelemetry
            && this.productService.showTelemetryOptOut
            && getTelemetryLevel(this.configurationService) !== 0 /* TelemetryLevel.NONE */
            && !this.environmentService.skipWelcome
            && !this.storageService.get(telemetryOptOutStorageKey, 0 /* StorageScope.PROFILE */)) {
            this.storageService.store(telemetryOptOutStorageKey, true, 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
            await this.openGettingStarted(true);
            return;
        }
        if (this.tryOpenWalkthroughForFolder()) {
            return;
        }
        const enabled = isStartupPageEnabled(this.configurationService, this.contextService, this.environmentService);
        if (enabled && this.lifecycleService.startupKind !== 3 /* StartupKind.ReloadedWindow */) {
            const hasBackups = await this.workingCopyBackupService.hasBackups();
            if (hasBackups) {
                return;
            }
            // Open the welcome even if we opened a set of default editors
            if (!this.editorService.activeEditor || this.layoutService.openedDefaultEditors) {
                const startupEditorSetting = this.configurationService.inspect(configurationKey);
                // 'readme' should not be set in workspace settings to prevent tracking,
                // but it can be set as a default (as in codespaces) or a user setting
                const openWithReadme = startupEditorSetting.value === 'readme' &&
                    (startupEditorSetting.userValue === 'readme' || startupEditorSetting.defaultValue === 'readme');
                if (openWithReadme) {
                    await this.openReadme();
                }
                else {
                    await this.openGettingStarted();
                }
            }
        }
    }
    tryOpenWalkthroughForFolder() {
        const toRestore = this.storageService.get(restoreWalkthroughsConfigurationKey, 0 /* StorageScope.PROFILE */);
        if (!toRestore) {
            return false;
        }
        else {
            const restoreData = JSON.parse(toRestore);
            const currentWorkspace = this.contextService.getWorkspace();
            if (restoreData.folder === currentWorkspace.folders[0].uri.toString()) {
                this.editorService.openEditor(this.instantiationService.createInstance(GettingStartedInput, { selectedCategory: restoreData.category, selectedStep: restoreData.step }), { pinned: false });
                this.storageService.remove(restoreWalkthroughsConfigurationKey, 0 /* StorageScope.PROFILE */);
                return true;
            }
        }
        return false;
    }
    async openReadme() {
        const readmes = arrays.coalesce(await Promise.all(this.contextService.getWorkspace().folders.map(async (folder) => {
            const folderUri = folder.uri;
            const folderStat = await this.fileService.resolve(folderUri).catch(onUnexpectedError);
            const files = folderStat?.children ? folderStat.children.map(child => child.name).sort() : [];
            const file = files.find(file => file.toLowerCase() === 'readme.md') || files.find(file => file.toLowerCase().startsWith('readme'));
            if (file) {
                return joinPath(folderUri, file);
            }
            else {
                return undefined;
            }
        })));
        if (!this.editorService.activeEditor) {
            if (readmes.length) {
                const isMarkDown = (readme) => readme.path.toLowerCase().endsWith('.md');
                await Promise.all([
                    this.commandService.executeCommand('markdown.showPreview', null, readmes.filter(isMarkDown), { locked: true }),
                    this.editorService.openEditors(readmes.filter(readme => !isMarkDown(readme)).map(readme => ({ resource: readme }))),
                ]);
            }
            else {
                await this.openGettingStarted();
            }
        }
    }
    async openGettingStarted(showTelemetryNotice) {
        const startupEditorTypeID = gettingStartedInputTypeId;
        const editor = this.editorService.activeEditor;
        // Ensure that the welcome editor won't get opened more than once
        if (editor?.typeId === startupEditorTypeID || this.editorService.editors.some(e => e.typeId === startupEditorTypeID)) {
            return;
        }
        const options = editor ? { pinned: false, index: 0 } : { pinned: false };
        if (startupEditorTypeID === gettingStartedInputTypeId) {
            this.editorService.openEditor(this.instantiationService.createInstance(GettingStartedInput, { showTelemetryNotice }), options);
        }
    }
};
StartupPageContribution = __decorate([
    __param(0, IInstantiationService),
    __param(1, IConfigurationService),
    __param(2, IEditorService),
    __param(3, IWorkingCopyBackupService),
    __param(4, IFileService),
    __param(5, IWorkspaceContextService),
    __param(6, ILifecycleService),
    __param(7, IWorkbenchLayoutService),
    __param(8, IProductService),
    __param(9, ICommandService),
    __param(10, IWorkbenchEnvironmentService),
    __param(11, IStorageService)
], StartupPageContribution);
export { StartupPageContribution };
function isStartupPageEnabled(configurationService, contextService, environmentService) {
    if (environmentService.skipWelcome) {
        return false;
    }
    const startupEditor = configurationService.inspect(configurationKey);
    if (!startupEditor.userValue && !startupEditor.workspaceValue) {
        const welcomeEnabled = configurationService.inspect(oldConfigurationKey);
        if (welcomeEnabled.value !== undefined && welcomeEnabled.value !== null) {
            return welcomeEnabled.value;
        }
    }
    if (startupEditor.value === 'readme' && startupEditor.userValue !== 'readme' && startupEditor.defaultValue !== 'readme') {
        console.error(`Warning: 'workbench.startupEditor: readme' setting ignored due to being set somewhere other than user or default settings (user=${startupEditor.userValue}, default=${startupEditor.defaultValue})`);
    }
    return startupEditor.value === 'welcomePage'
        || startupEditor.value === 'readme' && (startupEditor.userValue === 'readme' || startupEditor.defaultValue === 'readme')
        || (contextService.getWorkbenchState() === 1 /* WorkbenchState.EMPTY */ && startupEditor.value === 'welcomePageInEmptyWorkbench');
}

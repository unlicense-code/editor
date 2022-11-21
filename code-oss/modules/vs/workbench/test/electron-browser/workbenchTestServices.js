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
import { workbenchInstantiationService as browserWorkbenchInstantiationService, TestPathService, TestEncodingOracle } from 'vs/workbench/test/browser/workbenchTestServices';
import { Event } from 'vs/base/common/event';
import { NativeTextFileService, } from 'vs/workbench/services/textfile/electron-sandbox/nativeTextFileService';
import { INativeHostService } from 'vs/platform/native/electron-sandbox/native';
import { IFileService } from 'vs/platform/files/common/files';
import { IUntitledTextEditorService } from 'vs/workbench/services/untitled/common/untitledTextEditorService';
import { ILifecycleService } from 'vs/workbench/services/lifecycle/common/lifecycle';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IModelService } from 'vs/editor/common/services/model';
import { INativeWorkbenchEnvironmentService, NativeWorkbenchEnvironmentService } from 'vs/workbench/services/environment/electron-sandbox/environmentService';
import { IDialogService, IFileDialogService } from 'vs/platform/dialogs/common/dialogs';
import { ITextResourceConfigurationService } from 'vs/editor/common/services/textResourceConfiguration';
import { IFilesConfigurationService } from 'vs/workbench/services/filesConfiguration/common/filesConfigurationService';
import { ICodeEditorService } from 'vs/editor/browser/services/codeEditorService';
import { URI } from 'vs/base/common/uri';
import { ITextFileService } from 'vs/workbench/services/textfile/common/textfiles';
import { createTextBufferFactoryFromStream } from 'vs/editor/common/model/textModel';
import { parseArgs, OPTIONS } from 'vs/platform/environment/node/argv';
import { LogLevel, ILogService, NullLogService } from 'vs/platform/log/common/log';
import { IPathService } from 'vs/workbench/services/path/common/pathService';
import { IWorkingCopyFileService } from 'vs/workbench/services/workingCopy/common/workingCopyFileService';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { IWorkingCopyBackupService } from 'vs/workbench/services/workingCopy/common/workingCopyBackup';
import { IWorkingCopyService } from 'vs/workbench/services/workingCopy/common/workingCopyService';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { TestProductService } from 'vs/workbench/test/common/workbenchTestServices';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { homedir, release, tmpdir, hostname } from 'os';
import { IEnvironmentService, INativeEnvironmentService } from 'vs/platform/environment/common/environment';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { getUserDataPath } from 'vs/platform/environment/node/userDataPath';
import product from 'vs/platform/product/common/product';
import { IElevatedFileService } from 'vs/workbench/services/files/common/elevatedFileService';
import { IDecorationsService } from 'vs/workbench/services/decorations/common/decorations';
import { DisposableStore } from 'vs/base/common/lifecycle';
import { IUserDataProfilesService, UserDataProfilesService } from 'vs/platform/userDataProfile/common/userDataProfile';
import { FileService } from 'vs/platform/files/common/fileService';
import { joinPath } from 'vs/base/common/resources';
import { UserDataProfileService } from 'vs/workbench/services/userDataProfile/common/userDataProfileService';
import { IUserDataProfileService } from 'vs/workbench/services/userDataProfile/common/userDataProfile';
import { UriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentityService';
import { VSBuffer } from 'vs/base/common/buffer';
const args = parseArgs(process.argv, OPTIONS);
const homeDir = homedir();
const NULL_PROFILE = {
    name: '',
    id: '',
    shortName: '',
    isDefault: false,
    location: URI.file(homeDir),
    settingsResource: joinPath(URI.file(homeDir), 'settings.json'),
    globalStorageHome: joinPath(URI.file(homeDir), 'globalStorage'),
    keybindingsResource: joinPath(URI.file(homeDir), 'keybindings.json'),
    tasksResource: joinPath(URI.file(homeDir), 'tasks.json'),
    snippetsHome: joinPath(URI.file(homeDir), 'snippets'),
    extensionsResource: joinPath(URI.file(homeDir), 'extensions.json')
};
export const TestNativeWindowConfiguration = {
    windowId: 0,
    machineId: 'testMachineId',
    logLevel: LogLevel.Error,
    mainPid: 0,
    appRoot: '',
    userEnv: {},
    execPath: process.execPath,
    perfMarks: [],
    colorScheme: { dark: true, highContrast: false },
    os: { release: release(), hostname: hostname() },
    product,
    homeDir: homeDir,
    tmpDir: tmpdir(),
    userDataDir: getUserDataPath(args, product.nameShort),
    profiles: { profile: NULL_PROFILE, all: [NULL_PROFILE] },
    ...args
};
export const TestEnvironmentService = new NativeWorkbenchEnvironmentService(TestNativeWindowConfiguration, TestProductService);
let TestTextFileService = class TestTextFileService extends NativeTextFileService {
    resolveTextContentError;
    constructor(fileService, untitledTextEditorService, lifecycleService, instantiationService, modelService, environmentService, dialogService, fileDialogService, textResourceConfigurationService, filesConfigurationService, codeEditorService, pathService, workingCopyFileService, logService, uriIdentityService, languageService, elevatedFileService, decorationsService) {
        super(fileService, untitledTextEditorService, lifecycleService, instantiationService, modelService, environmentService, dialogService, fileDialogService, textResourceConfigurationService, filesConfigurationService, codeEditorService, pathService, workingCopyFileService, uriIdentityService, languageService, elevatedFileService, logService, decorationsService);
    }
    setResolveTextContentErrorOnce(error) {
        this.resolveTextContentError = error;
    }
    async readStream(resource, options) {
        if (this.resolveTextContentError) {
            const error = this.resolveTextContentError;
            this.resolveTextContentError = null;
            throw error;
        }
        const content = await this.fileService.readFileStream(resource, options);
        return {
            resource: content.resource,
            name: content.name,
            mtime: content.mtime,
            ctime: content.ctime,
            etag: content.etag,
            encoding: 'utf8',
            value: await createTextBufferFactoryFromStream(content.value),
            size: 10,
            readonly: false
        };
    }
};
TestTextFileService = __decorate([
    __param(0, IFileService),
    __param(1, IUntitledTextEditorService),
    __param(2, ILifecycleService),
    __param(3, IInstantiationService),
    __param(4, IModelService),
    __param(5, INativeWorkbenchEnvironmentService),
    __param(6, IDialogService),
    __param(7, IFileDialogService),
    __param(8, ITextResourceConfigurationService),
    __param(9, IFilesConfigurationService),
    __param(10, ICodeEditorService),
    __param(11, IPathService),
    __param(12, IWorkingCopyFileService),
    __param(13, ILogService),
    __param(14, IUriIdentityService),
    __param(15, ILanguageService),
    __param(16, IElevatedFileService),
    __param(17, IDecorationsService)
], TestTextFileService);
export { TestTextFileService };
export class TestNativeTextFileServiceWithEncodingOverrides extends NativeTextFileService {
    _testEncoding;
    get encoding() {
        if (!this._testEncoding) {
            this._testEncoding = this._register(this.instantiationService.createInstance(TestEncodingOracle));
        }
        return this._testEncoding;
    }
}
export class TestSharedProcessService {
    getChannel(channelName) { return undefined; }
    registerChannel(channelName, channel) { }
    notifyRestored() { }
}
export class TestNativeHostService {
    windowId = -1;
    onDidOpenWindow = Event.None;
    onDidMaximizeWindow = Event.None;
    onDidUnmaximizeWindow = Event.None;
    onDidFocusWindow = Event.None;
    onDidBlurWindow = Event.None;
    onDidResumeOS = Event.None;
    onDidChangeColorScheme = Event.None;
    onDidChangePassword = Event.None;
    onDidTriggerSystemContextMenu = Event.None;
    onDidChangeDisplay = Event.None;
    windowCount = Promise.resolve(1);
    getWindowCount() { return this.windowCount; }
    async getWindows() { return []; }
    async getActiveWindowId() { return undefined; }
    openWindow(arg1, arg2) {
        throw new Error('Method not implemented.');
    }
    async toggleFullScreen() { }
    async handleTitleDoubleClick() { }
    async isMaximized() { return true; }
    async maximizeWindow() { }
    async unmaximizeWindow() { }
    async minimizeWindow() { }
    async updateWindowControls(options) { }
    async setMinimumSize(width, height) { }
    async saveWindowSplash(value) { }
    async focusWindow(options) { }
    async showMessageBox(options) { throw new Error('Method not implemented.'); }
    async showSaveDialog(options) { throw new Error('Method not implemented.'); }
    async showOpenDialog(options) { throw new Error('Method not implemented.'); }
    async pickFileFolderAndOpen(options) { }
    async pickFileAndOpen(options) { }
    async pickFolderAndOpen(options) { }
    async pickWorkspaceAndOpen(options) { }
    async showItemInFolder(path) { }
    async setRepresentedFilename(path) { }
    async isAdmin() { return false; }
    async writeElevated(source, target) { }
    async getOSProperties() { return Object.create(null); }
    async getOSStatistics() { return Object.create(null); }
    async getOSVirtualMachineHint() { return 0; }
    async getOSColorScheme() { return { dark: true, highContrast: false }; }
    async hasWSLFeatureInstalled() { return false; }
    async killProcess() { }
    async setDocumentEdited(edited) { }
    async openExternal(url) { return false; }
    async updateTouchBar() { }
    async moveItemToTrash() { }
    async newWindowTab() { }
    async showPreviousWindowTab() { }
    async showNextWindowTab() { }
    async moveWindowTabToNewWindow() { }
    async mergeAllWindowTabs() { }
    async toggleWindowTabsBar() { }
    async installShellCommand() { }
    async uninstallShellCommand() { }
    async notifyReady() { }
    async relaunch(options) { }
    async reload() { }
    async closeWindow() { }
    async closeWindowById() { }
    async quit() { }
    async exit(code) { }
    async openDevTools(options) { }
    async toggleDevTools() { }
    async toggleSharedProcessWindow() { }
    async resolveProxy(url) { return undefined; }
    async findFreePort(startPort, giveUpAfter, timeout, stride) { return -1; }
    async readClipboardText(type) { return ''; }
    async writeClipboardText(text, type) { }
    async readClipboardFindText() { return ''; }
    async writeClipboardFindText(text) { }
    async writeClipboardBuffer(format, buffer, type) { }
    async readClipboardBuffer(format) { return VSBuffer.wrap(Uint8Array.from([])); }
    async hasClipboard(format, type) { return false; }
    async sendInputEvent(event) { }
    async windowsGetStringRegKey(hive, path, name) { return undefined; }
    async profileRenderer() { throw new Error(); }
}
export function workbenchInstantiationService(disposables = new DisposableStore()) {
    const instantiationService = browserWorkbenchInstantiationService({
        textFileService: insta => insta.createInstance(TestTextFileService),
        pathService: insta => insta.createInstance(TestNativePathService)
    }, disposables);
    instantiationService.stub(INativeHostService, new TestNativeHostService());
    instantiationService.stub(IEnvironmentService, TestEnvironmentService);
    instantiationService.stub(INativeEnvironmentService, TestEnvironmentService);
    instantiationService.stub(IWorkbenchEnvironmentService, TestEnvironmentService);
    instantiationService.stub(INativeWorkbenchEnvironmentService, TestEnvironmentService);
    const fileService = new FileService(new NullLogService());
    const userDataProfilesService = instantiationService.stub(IUserDataProfilesService, new UserDataProfilesService(TestEnvironmentService, fileService, new UriIdentityService(fileService), new NullLogService()));
    instantiationService.stub(IUserDataProfileService, new UserDataProfileService(userDataProfilesService.defaultProfile, userDataProfilesService));
    return instantiationService;
}
let TestServiceAccessor = class TestServiceAccessor {
    lifecycleService;
    textFileService;
    filesConfigurationService;
    contextService;
    modelService;
    fileService;
    nativeHostService;
    fileDialogService;
    workingCopyBackupService;
    workingCopyService;
    editorService;
    constructor(lifecycleService, textFileService, filesConfigurationService, contextService, modelService, fileService, nativeHostService, fileDialogService, workingCopyBackupService, workingCopyService, editorService) {
        this.lifecycleService = lifecycleService;
        this.textFileService = textFileService;
        this.filesConfigurationService = filesConfigurationService;
        this.contextService = contextService;
        this.modelService = modelService;
        this.fileService = fileService;
        this.nativeHostService = nativeHostService;
        this.fileDialogService = fileDialogService;
        this.workingCopyBackupService = workingCopyBackupService;
        this.workingCopyService = workingCopyService;
        this.editorService = editorService;
    }
};
TestServiceAccessor = __decorate([
    __param(0, ILifecycleService),
    __param(1, ITextFileService),
    __param(2, IFilesConfigurationService),
    __param(3, IWorkspaceContextService),
    __param(4, IModelService),
    __param(5, IFileService),
    __param(6, INativeHostService),
    __param(7, IFileDialogService),
    __param(8, IWorkingCopyBackupService),
    __param(9, IWorkingCopyService),
    __param(10, IEditorService)
], TestServiceAccessor);
export { TestServiceAccessor };
export class TestNativePathService extends TestPathService {
    constructor() {
        super(URI.file(homedir()));
    }
}

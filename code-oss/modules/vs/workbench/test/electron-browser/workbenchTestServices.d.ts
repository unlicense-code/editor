import { ITestInstantiationService, TestLifecycleService, TestFilesConfigurationService, TestFileService, TestFileDialogService, TestPathService, TestEncodingOracle } from 'vs/workbench/test/browser/workbenchTestServices';
import { Event } from 'vs/base/common/event';
import { ISharedProcessService } from 'vs/platform/ipc/electron-sandbox/services';
import { NativeTextFileService } from 'vs/workbench/services/textfile/electron-sandbox/nativeTextFileService';
import { INativeHostService } from 'vs/platform/native/electron-sandbox/native';
import { FileOperationError, IFileService } from 'vs/platform/files/common/files';
import { IUntitledTextEditorService } from 'vs/workbench/services/untitled/common/untitledTextEditorService';
import { ILifecycleService } from 'vs/workbench/services/lifecycle/common/lifecycle';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IModelService } from 'vs/editor/common/services/model';
import { INativeWorkbenchEnvironmentService, NativeWorkbenchEnvironmentService } from 'vs/workbench/services/environment/electron-sandbox/environmentService';
import { IDialogService, IFileDialogService, INativeOpenDialogOptions } from 'vs/platform/dialogs/common/dialogs';
import { ITextResourceConfigurationService } from 'vs/editor/common/services/textResourceConfiguration';
import { IFilesConfigurationService } from 'vs/workbench/services/filesConfiguration/common/filesConfigurationService';
import { ICodeEditorService } from 'vs/editor/browser/services/codeEditorService';
import { URI } from 'vs/base/common/uri';
import { IReadTextFileOptions, ITextFileStreamContent } from 'vs/workbench/services/textfile/common/textfiles';
import { IOpenEmptyWindowOptions, IWindowOpenable, IOpenWindowOptions, IOpenedWindow, IColorScheme, INativeWindowConfiguration } from 'vs/platform/window/common/window';
import { ILogService } from 'vs/platform/log/common/log';
import { IPathService } from 'vs/workbench/services/path/common/pathService';
import { IWorkingCopyFileService } from 'vs/workbench/services/workingCopy/common/workingCopyFileService';
import { ModelService } from 'vs/editor/common/services/modelService';
import { NodeTestWorkingCopyBackupService } from 'vs/workbench/services/workingCopy/test/electron-browser/workingCopyBackupService.test';
import { IWorkingCopyService } from 'vs/workbench/services/workingCopy/common/workingCopyService';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { TestContextService } from 'vs/workbench/test/common/workbenchTestServices';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
import { MouseInputEvent } from 'vs/base/parts/sandbox/common/electronTypes';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { IOSProperties, IOSStatistics } from 'vs/platform/native/common/native';
import { IElevatedFileService } from 'vs/workbench/services/files/common/elevatedFileService';
import { IDecorationsService } from 'vs/workbench/services/decorations/common/decorations';
import { DisposableStore } from 'vs/base/common/lifecycle';
import { IPartsSplash } from 'vs/platform/theme/common/themeService';
import { VSBuffer } from 'vs/base/common/buffer';
export declare const TestNativeWindowConfiguration: INativeWindowConfiguration;
export declare const TestEnvironmentService: NativeWorkbenchEnvironmentService;
export declare class TestTextFileService extends NativeTextFileService {
    private resolveTextContentError;
    constructor(fileService: IFileService, untitledTextEditorService: IUntitledTextEditorService, lifecycleService: ILifecycleService, instantiationService: IInstantiationService, modelService: IModelService, environmentService: INativeWorkbenchEnvironmentService, dialogService: IDialogService, fileDialogService: IFileDialogService, textResourceConfigurationService: ITextResourceConfigurationService, filesConfigurationService: IFilesConfigurationService, codeEditorService: ICodeEditorService, pathService: IPathService, workingCopyFileService: IWorkingCopyFileService, logService: ILogService, uriIdentityService: IUriIdentityService, languageService: ILanguageService, elevatedFileService: IElevatedFileService, decorationsService: IDecorationsService);
    setResolveTextContentErrorOnce(error: FileOperationError): void;
    readStream(resource: URI, options?: IReadTextFileOptions): Promise<ITextFileStreamContent>;
}
export declare class TestNativeTextFileServiceWithEncodingOverrides extends NativeTextFileService {
    private _testEncoding;
    get encoding(): TestEncodingOracle;
}
export declare class TestSharedProcessService implements ISharedProcessService {
    readonly _serviceBrand: undefined;
    getChannel(channelName: string): any;
    registerChannel(channelName: string, channel: any): void;
    notifyRestored(): void;
}
export declare class TestNativeHostService implements INativeHostService {
    readonly _serviceBrand: undefined;
    readonly windowId = -1;
    onDidOpenWindow: Event<number>;
    onDidMaximizeWindow: Event<number>;
    onDidUnmaximizeWindow: Event<number>;
    onDidFocusWindow: Event<number>;
    onDidBlurWindow: Event<number>;
    onDidResumeOS: Event<unknown>;
    onDidChangeColorScheme: Event<any>;
    onDidChangePassword: Event<any>;
    onDidTriggerSystemContextMenu: Event<{
        windowId: number;
        x: number;
        y: number;
    }>;
    onDidChangeDisplay: Event<any>;
    windowCount: Promise<number>;
    getWindowCount(): Promise<number>;
    getWindows(): Promise<IOpenedWindow[]>;
    getActiveWindowId(): Promise<number | undefined>;
    openWindow(options?: IOpenEmptyWindowOptions): Promise<void>;
    openWindow(toOpen: IWindowOpenable[], options?: IOpenWindowOptions): Promise<void>;
    toggleFullScreen(): Promise<void>;
    handleTitleDoubleClick(): Promise<void>;
    isMaximized(): Promise<boolean>;
    maximizeWindow(): Promise<void>;
    unmaximizeWindow(): Promise<void>;
    minimizeWindow(): Promise<void>;
    updateWindowControls(options: {
        height?: number;
        backgroundColor?: string;
        foregroundColor?: string;
    }): Promise<void>;
    setMinimumSize(width: number | undefined, height: number | undefined): Promise<void>;
    saveWindowSplash(value: IPartsSplash): Promise<void>;
    focusWindow(options?: {
        windowId?: number | undefined;
    } | undefined): Promise<void>;
    showMessageBox(options: Electron.MessageBoxOptions): Promise<Electron.MessageBoxReturnValue>;
    showSaveDialog(options: Electron.SaveDialogOptions): Promise<Electron.SaveDialogReturnValue>;
    showOpenDialog(options: Electron.OpenDialogOptions): Promise<Electron.OpenDialogReturnValue>;
    pickFileFolderAndOpen(options: INativeOpenDialogOptions): Promise<void>;
    pickFileAndOpen(options: INativeOpenDialogOptions): Promise<void>;
    pickFolderAndOpen(options: INativeOpenDialogOptions): Promise<void>;
    pickWorkspaceAndOpen(options: INativeOpenDialogOptions): Promise<void>;
    showItemInFolder(path: string): Promise<void>;
    setRepresentedFilename(path: string): Promise<void>;
    isAdmin(): Promise<boolean>;
    writeElevated(source: URI, target: URI): Promise<void>;
    getOSProperties(): Promise<IOSProperties>;
    getOSStatistics(): Promise<IOSStatistics>;
    getOSVirtualMachineHint(): Promise<number>;
    getOSColorScheme(): Promise<IColorScheme>;
    hasWSLFeatureInstalled(): Promise<boolean>;
    killProcess(): Promise<void>;
    setDocumentEdited(edited: boolean): Promise<void>;
    openExternal(url: string): Promise<boolean>;
    updateTouchBar(): Promise<void>;
    moveItemToTrash(): Promise<void>;
    newWindowTab(): Promise<void>;
    showPreviousWindowTab(): Promise<void>;
    showNextWindowTab(): Promise<void>;
    moveWindowTabToNewWindow(): Promise<void>;
    mergeAllWindowTabs(): Promise<void>;
    toggleWindowTabsBar(): Promise<void>;
    installShellCommand(): Promise<void>;
    uninstallShellCommand(): Promise<void>;
    notifyReady(): Promise<void>;
    relaunch(options?: {
        addArgs?: string[] | undefined;
        removeArgs?: string[] | undefined;
    } | undefined): Promise<void>;
    reload(): Promise<void>;
    closeWindow(): Promise<void>;
    closeWindowById(): Promise<void>;
    quit(): Promise<void>;
    exit(code: number): Promise<void>;
    openDevTools(options?: Electron.OpenDevToolsOptions | undefined): Promise<void>;
    toggleDevTools(): Promise<void>;
    toggleSharedProcessWindow(): Promise<void>;
    resolveProxy(url: string): Promise<string | undefined>;
    findFreePort(startPort: number, giveUpAfter: number, timeout: number, stride?: number): Promise<number>;
    readClipboardText(type?: 'selection' | 'clipboard' | undefined): Promise<string>;
    writeClipboardText(text: string, type?: 'selection' | 'clipboard' | undefined): Promise<void>;
    readClipboardFindText(): Promise<string>;
    writeClipboardFindText(text: string): Promise<void>;
    writeClipboardBuffer(format: string, buffer: VSBuffer, type?: 'selection' | 'clipboard' | undefined): Promise<void>;
    readClipboardBuffer(format: string): Promise<VSBuffer>;
    hasClipboard(format: string, type?: 'selection' | 'clipboard' | undefined): Promise<boolean>;
    sendInputEvent(event: MouseInputEvent): Promise<void>;
    windowsGetStringRegKey(hive: 'HKEY_CURRENT_USER' | 'HKEY_LOCAL_MACHINE' | 'HKEY_CLASSES_ROOT' | 'HKEY_USERS' | 'HKEY_CURRENT_CONFIG', path: string, name: string): Promise<string | undefined>;
    profileRenderer(): Promise<any>;
}
export declare function workbenchInstantiationService(disposables?: DisposableStore): ITestInstantiationService;
export declare class TestServiceAccessor {
    lifecycleService: TestLifecycleService;
    textFileService: TestTextFileService;
    filesConfigurationService: TestFilesConfigurationService;
    contextService: TestContextService;
    modelService: ModelService;
    fileService: TestFileService;
    nativeHostService: TestNativeHostService;
    fileDialogService: TestFileDialogService;
    workingCopyBackupService: NodeTestWorkingCopyBackupService;
    workingCopyService: IWorkingCopyService;
    editorService: IEditorService;
    constructor(lifecycleService: TestLifecycleService, textFileService: TestTextFileService, filesConfigurationService: TestFilesConfigurationService, contextService: TestContextService, modelService: ModelService, fileService: TestFileService, nativeHostService: TestNativeHostService, fileDialogService: TestFileDialogService, workingCopyBackupService: NodeTestWorkingCopyBackupService, workingCopyService: IWorkingCopyService, editorService: IEditorService);
}
export declare class TestNativePathService extends TestPathService {
    constructor();
}

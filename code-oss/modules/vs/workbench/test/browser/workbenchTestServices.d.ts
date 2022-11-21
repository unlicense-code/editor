import { FileEditorInput } from 'vs/workbench/contrib/files/browser/editors/fileEditorInput';
import { TestInstantiationService } from 'vs/platform/instantiation/test/common/instantiationServiceMock';
import { URI } from 'vs/base/common/uri';
import { ITelemetryData, TelemetryLevel } from 'vs/platform/telemetry/common/telemetry';
import { EditorInput } from 'vs/workbench/common/editor/editorInput';
import { EditorInputWithOptions, IEditorIdentifier, IUntitledTextResourceEditorInput, IResourceDiffEditorInput, IEditorPane, IEditorCloseEvent, IEditorPartOptions, IRevertOptions, GroupIdentifier, EditorsOrder, IFileEditorInput, ISaveOptions, IMoveResult, ITextDiffEditorPane, IVisibleEditorPane, EditorInputCapabilities, IUntypedEditorInput, IEditorWillMoveEvent, IEditorWillOpenEvent, IActiveEditorChangeEvent, EditorPaneSelectionChangeReason, IEditorPaneSelection } from 'vs/workbench/common/editor';
import { EditorServiceImpl, IEditorGroupView, IEditorGroupsAccessor, IEditorGroupTitleHeight } from 'vs/workbench/browser/parts/editor/editor';
import { Event, Emitter } from 'vs/base/common/event';
import { IResolvedWorkingCopyBackup } from 'vs/workbench/services/workingCopy/common/workingCopyBackup';
import { ConfigurationTarget } from 'vs/platform/configuration/common/configuration';
import { IWorkbenchLayoutService, PanelAlignment, Parts, Position as PartPosition } from 'vs/workbench/services/layout/browser/layoutService';
import { ITextModelService } from 'vs/editor/common/services/resolverService';
import { IEditorOptions, IResourceEditorInput, IEditorModel, IResourceEditorInputIdentifier, ITextResourceEditorInput } from 'vs/platform/editor/common/editor';
import { IUntitledTextEditorService, UntitledTextEditorService } from 'vs/workbench/services/untitled/common/untitledTextEditorService';
import { IWorkspaceIdentifier } from 'vs/platform/workspace/common/workspace';
import { ILifecycleService, ShutdownReason, StartupKind, LifecyclePhase, WillShutdownEvent, BeforeShutdownErrorEvent, InternalBeforeShutdownEvent, IWillShutdownEventJoiner } from 'vs/workbench/services/lifecycle/common/lifecycle';
import { FileOperationEvent, IFileService, IFileStat, IFileStatResult, FileChangesEvent, IResolveFileOptions, ICreateFileOptions, IFileSystemProvider, FileSystemProviderCapabilities, IFileChange, IWatchOptions, IStat, FileType, IFileDeleteOptions, IFileOverwriteOptions, IFileWriteOptions, IFileOpenOptions, IFileStatWithMetadata, IResolveMetadataFileOptions, IWriteFileOptions, IReadFileOptions, IFileContent, IFileStreamContent, FileOperationError, IFileSystemProviderWithFileReadStreamCapability, IFileReadStreamOptions, IReadFileStreamOptions, IFileSystemProviderCapabilitiesChangeEvent, IFileStatWithPartialMetadata } from 'vs/platform/files/common/files';
import { IModelService } from 'vs/editor/common/services/model';
import { ModelService } from 'vs/editor/common/services/modelService';
import { IResourceEncoding, ITextFileService, IReadTextFileOptions, ITextFileStreamContent, IWriteTextFileOptions } from 'vs/workbench/services/textfile/common/textfiles';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { IHistoryService } from 'vs/workbench/services/history/common/history';
import { IInstantiationService, ServiceIdentifier } from 'vs/platform/instantiation/common/instantiation';
import { TestConfigurationService } from 'vs/platform/configuration/test/common/testConfigurationService';
import { MenuBarVisibility, IWindowOpenable, IOpenWindowOptions, IOpenEmptyWindowOptions } from 'vs/platform/window/common/window';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { ThemeIcon } from 'vs/platform/theme/common/themeService';
import { ITextResourceConfigurationService } from 'vs/editor/common/services/textResourceConfiguration';
import { IMenuService, MenuId, IMenu } from 'vs/platform/actions/common/actions';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { ITextBufferFactory, ITextSnapshot } from 'vs/editor/common/model';
import { IDialogService, IPickAndOpenOptions, ISaveDialogOptions, IOpenDialogOptions, IFileDialogService, ConfirmResult } from 'vs/platform/dialogs/common/dialogs';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { IDecorationsService, IResourceDecorationChangeEvent, IDecoration, IDecorationData, IDecorationsProvider } from 'vs/workbench/services/decorations/common/decorations';
import { IDisposable, Disposable, DisposableStore } from 'vs/base/common/lifecycle';
import { IEditorGroupsService, IEditorGroup, GroupsOrder, GroupsArrangement, GroupDirection, IAddGroupOptions, IMergeGroupOptions, IEditorReplacement, IFindGroupScope, EditorGroupLayout, ICloseEditorOptions, GroupOrientation, ICloseAllEditorsOptions, ICloseEditorsFilter } from 'vs/workbench/services/editor/common/editorGroupsService';
import { IEditorService, ISaveEditorsOptions, IRevertAllEditorsOptions, PreferredGroup, IEditorsChangeEvent } from 'vs/workbench/services/editor/common/editorService';
import { ICodeEditorService } from 'vs/editor/browser/services/codeEditorService';
import { Dimension, IDimension } from 'vs/base/browser/dom';
import { ILogService } from 'vs/platform/log/common/log';
import { ILabelService } from 'vs/platform/label/common/label';
import { PaneCompositeDescriptor } from 'vs/workbench/browser/panecomposite';
import { IProcessEnvironment, OperatingSystem } from 'vs/base/common/platform';
import { Part } from 'vs/workbench/browser/part';
import { IBadge } from 'vs/workbench/services/activity/common/activity';
import { VSBuffer, VSBufferReadable, VSBufferReadableStream } from 'vs/base/common/buffer';
import { IProductService } from 'vs/platform/product/common/productService';
import { IHostService } from 'vs/workbench/services/host/browser/host';
import { WorkingCopyService } from 'vs/workbench/services/workingCopy/common/workingCopyService';
import { IWorkingCopy, IWorkingCopyBackupMeta, IWorkingCopyIdentifier } from 'vs/workbench/services/workingCopy/common/workingCopy';
import { IFilesConfigurationService, FilesConfigurationService } from 'vs/workbench/services/filesConfiguration/common/filesConfigurationService';
import { BrowserWorkbenchEnvironmentService } from 'vs/workbench/services/environment/browser/environmentService';
import { BrowserTextFileService } from 'vs/workbench/services/textfile/browser/browserTextFileService';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { IPathService } from 'vs/workbench/services/path/common/pathService';
import { Direction } from 'vs/base/browser/ui/grid/grid';
import { IProgressService, IProgressOptions, IProgressWindowOptions, IProgressNotificationOptions, IProgressCompositeOptions, IProgress, IProgressStep, IProgressDialogOptions, IProgressIndicator } from 'vs/platform/progress/common/progress';
import { IWorkingCopyFileService } from 'vs/workbench/services/workingCopy/common/workingCopyFileService';
import { TextFileEditorModel } from 'vs/workbench/services/textfile/common/textFileEditorModel';
import { CancellationToken } from 'vs/base/common/cancellation';
import { SyncDescriptor } from 'vs/platform/instantiation/common/descriptors';
import { TestDialogService } from 'vs/platform/dialogs/test/common/testDialogService';
import { EditorPart } from 'vs/workbench/browser/parts/editor/editorPart';
import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
import { IDiffEditor } from 'vs/editor/common/editorCommon';
import { IInputBox, IInputOptions, IPickOptions, IQuickInputButton, IQuickInputService, IQuickNavigateConfiguration, IQuickPick, IQuickPickItem, QuickPickInput } from 'vs/platform/quickinput/common/quickInput';
import { IListService } from 'vs/platform/list/browser/listService';
import { TestContextService } from 'vs/workbench/test/common/workbenchTestServices';
import { IViewsService, IView, ViewContainer, ViewContainerLocation } from 'vs/workbench/common/views';
import { IPaneComposite } from 'vs/workbench/common/panecomposite';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
import { TextFileEditorModelManager } from 'vs/workbench/services/textfile/common/textFileEditorModelManager';
import { InMemoryFileSystemProvider } from 'vs/platform/files/common/inMemoryFilesystemProvider';
import { ReadableStreamEvents } from 'vs/base/common/stream';
import { EncodingOracle, IEncodingOverride } from 'vs/workbench/services/textfile/browser/textFileService';
import { ColorScheme } from 'vs/platform/theme/common/theme';
import { InMemoryWorkingCopyBackupService } from 'vs/workbench/services/workingCopy/common/workingCopyBackupService';
import { BrowserWorkingCopyBackupService } from 'vs/workbench/services/workingCopy/browser/workingCopyBackupService';
import { TextResourceEditor } from 'vs/workbench/browser/parts/editor/textResourceEditor';
import { TextFileEditor } from 'vs/workbench/contrib/files/browser/editors/textFileEditor';
import { IEnterWorkspaceResult, IRecent, IRecentlyOpened, IWorkspaceFolderCreationData, IWorkspacesService } from 'vs/platform/workspaces/common/workspaces';
import { TestWorkspaceTrustRequestService } from 'vs/workbench/services/workspaces/test/common/testWorkspaceTrustService';
import { IExtensionTerminalProfile, IShellLaunchConfig, ITerminalProfile, TerminalIcon, TerminalLocation, TerminalShellType } from 'vs/platform/terminal/common/terminal';
import { ICreateTerminalOptions, IDeserializedTerminalEditorInput, ITerminalEditorService, ITerminalGroup, ITerminalGroupService, ITerminalInstance, ITerminalInstanceService, TerminalEditorLocation } from 'vs/workbench/contrib/terminal/browser/terminal';
import { IRegisterContributedProfileArgs, IShellLaunchConfigResolveOptions, ITerminalBackend, ITerminalProfileProvider, ITerminalProfileResolverService, ITerminalProfileService } from 'vs/workbench/contrib/terminal/common/terminal';
import { IEditorResolverService } from 'vs/workbench/services/editor/common/editorResolverService';
import { IWorkingCopyEditorService } from 'vs/workbench/services/workingCopy/common/workingCopyEditorService';
import { IElevatedFileService } from 'vs/workbench/services/files/common/elevatedFileService';
import { ResourceMap } from 'vs/base/common/map';
import { ITextEditorService } from 'vs/workbench/services/textfile/common/textEditorService';
import { IPaneCompositePartService } from 'vs/workbench/services/panecomposite/browser/panecomposite';
import { IPaneCompositePart, IPaneCompositeSelectorPart } from 'vs/workbench/browser/parts/paneCompositePart';
import { TerminalEditorInput } from 'vs/workbench/contrib/terminal/browser/terminalEditorInput';
import { IGroupModelChangeEvent } from 'vs/workbench/common/editor/editorGroupModel';
import { Selection } from 'vs/editor/common/core/selection';
import { IFolderBackupInfo, IWorkspaceBackupInfo } from 'vs/platform/backup/common/backup';
import { IExtensionHostExitInfo, IRemoteAgentConnection, IRemoteAgentService } from 'vs/workbench/services/remote/common/remoteAgentService';
import { IDiagnosticInfoOptions, IDiagnosticInfo } from 'vs/platform/diagnostics/common/diagnostics';
import { ExtensionIdentifier, ExtensionType, IExtension, IExtensionDescription, IRelaxedExtensionManifest, TargetPlatform } from 'vs/platform/extensions/common/extensions';
import { ISocketFactory } from 'vs/platform/remote/common/remoteAgentConnection';
import { IRemoteAgentEnvironment } from 'vs/platform/remote/common/remoteAgentEnvironment';
import { ILayoutOffsetInfo } from 'vs/platform/layout/browser/layoutService';
import { IUserDataProfile } from 'vs/platform/userDataProfile/common/userDataProfile';
import { IUserDataProfileService } from 'vs/workbench/services/userDataProfile/common/userDataProfile';
import { EnablementState, IExtensionManagementServer, IScannedExtension, IWebExtensionsScannerService, IWorkbenchExtensionEnablementService, IWorkbenchExtensionManagementService } from 'vs/workbench/services/extensionManagement/common/extensionManagement';
import { InstallVSIXOptions, ILocalExtension, IGalleryExtension, InstallOptions, IExtensionIdentifier, UninstallOptions, IExtensionsControlManifest, IGalleryMetadata, IExtensionManagementParticipant } from 'vs/platform/extensionManagement/common/extensionManagement';
export declare function createFileEditorInput(instantiationService: IInstantiationService, resource: URI): FileEditorInput;
export declare class TestTextResourceEditor extends TextResourceEditor {
    protected createEditorControl(parent: HTMLElement, configuration: any): void;
}
export declare class TestTextFileEditor extends TextFileEditor {
    protected createEditorControl(parent: HTMLElement, configuration: any): void;
    setSelection(selection: Selection | undefined, reason: EditorPaneSelectionChangeReason): void;
    getSelection(): IEditorPaneSelection | undefined;
}
export interface ITestInstantiationService extends IInstantiationService {
    stub<T>(service: ServiceIdentifier<T>, ctor: any): T;
}
export declare class TestWorkingCopyService extends WorkingCopyService {
    unregisterWorkingCopy(workingCopy: IWorkingCopy): void;
}
export declare function workbenchInstantiationService(overrides?: {
    environmentService?: (instantiationService: IInstantiationService) => IEnvironmentService;
    fileService?: (instantiationService: IInstantiationService) => IFileService;
    configurationService?: (instantiationService: IInstantiationService) => TestConfigurationService;
    textFileService?: (instantiationService: IInstantiationService) => ITextFileService;
    pathService?: (instantiationService: IInstantiationService) => IPathService;
    editorService?: (instantiationService: IInstantiationService) => IEditorService;
    contextKeyService?: (instantiationService: IInstantiationService) => IContextKeyService;
    textEditorService?: (instantiationService: IInstantiationService) => ITextEditorService;
}, disposables?: DisposableStore): TestInstantiationService;
export declare class TestServiceAccessor {
    lifecycleService: TestLifecycleService;
    textFileService: TestTextFileService;
    textEditorService: ITextEditorService;
    workingCopyFileService: IWorkingCopyFileService;
    filesConfigurationService: TestFilesConfigurationService;
    contextService: TestContextService;
    modelService: ModelService;
    fileService: TestFileService;
    fileDialogService: TestFileDialogService;
    dialogService: TestDialogService;
    workingCopyService: TestWorkingCopyService;
    editorService: TestEditorService;
    environmentService: IWorkbenchEnvironmentService;
    pathService: IPathService;
    editorGroupService: IEditorGroupsService;
    editorResolverService: IEditorResolverService;
    languageService: ILanguageService;
    textModelResolverService: ITextModelService;
    untitledTextEditorService: UntitledTextEditorService;
    testConfigurationService: TestConfigurationService;
    workingCopyBackupService: TestWorkingCopyBackupService;
    hostService: TestHostService;
    quickInputService: IQuickInputService;
    labelService: ILabelService;
    logService: ILogService;
    uriIdentityService: IUriIdentityService;
    instantitionService: IInstantiationService;
    notificationService: INotificationService;
    workingCopyEditorService: IWorkingCopyEditorService;
    instantiationService: IInstantiationService;
    elevatedFileService: IElevatedFileService;
    workspaceTrustRequestService: TestWorkspaceTrustRequestService;
    decorationsService: IDecorationsService;
    constructor(lifecycleService: TestLifecycleService, textFileService: TestTextFileService, textEditorService: ITextEditorService, workingCopyFileService: IWorkingCopyFileService, filesConfigurationService: TestFilesConfigurationService, contextService: TestContextService, modelService: ModelService, fileService: TestFileService, fileDialogService: TestFileDialogService, dialogService: TestDialogService, workingCopyService: TestWorkingCopyService, editorService: TestEditorService, environmentService: IWorkbenchEnvironmentService, pathService: IPathService, editorGroupService: IEditorGroupsService, editorResolverService: IEditorResolverService, languageService: ILanguageService, textModelResolverService: ITextModelService, untitledTextEditorService: UntitledTextEditorService, testConfigurationService: TestConfigurationService, workingCopyBackupService: TestWorkingCopyBackupService, hostService: TestHostService, quickInputService: IQuickInputService, labelService: ILabelService, logService: ILogService, uriIdentityService: IUriIdentityService, instantitionService: IInstantiationService, notificationService: INotificationService, workingCopyEditorService: IWorkingCopyEditorService, instantiationService: IInstantiationService, elevatedFileService: IElevatedFileService, workspaceTrustRequestService: TestWorkspaceTrustRequestService, decorationsService: IDecorationsService);
}
export declare class TestTextFileService extends BrowserTextFileService {
    private readStreamError;
    private writeError;
    constructor(fileService: IFileService, untitledTextEditorService: IUntitledTextEditorService, lifecycleService: ILifecycleService, instantiationService: IInstantiationService, modelService: IModelService, environmentService: IWorkbenchEnvironmentService, dialogService: IDialogService, fileDialogService: IFileDialogService, textResourceConfigurationService: ITextResourceConfigurationService, filesConfigurationService: IFilesConfigurationService, codeEditorService: ICodeEditorService, pathService: IPathService, workingCopyFileService: IWorkingCopyFileService, uriIdentityService: IUriIdentityService, languageService: ILanguageService, logService: ILogService, elevatedFileService: IElevatedFileService, decorationsService: IDecorationsService);
    setReadStreamErrorOnce(error: FileOperationError): void;
    readStream(resource: URI, options?: IReadTextFileOptions): Promise<ITextFileStreamContent>;
    setWriteErrorOnce(error: FileOperationError): void;
    write(resource: URI, value: string | ITextSnapshot, options?: IWriteTextFileOptions): Promise<IFileStatWithMetadata>;
}
export declare class TestBrowserTextFileServiceWithEncodingOverrides extends BrowserTextFileService {
    private _testEncoding;
    get encoding(): TestEncodingOracle;
}
export declare class TestEncodingOracle extends EncodingOracle {
    protected get encodingOverrides(): IEncodingOverride[];
    protected set encodingOverrides(overrides: IEncodingOverride[]);
}
declare class TestEnvironmentServiceWithArgs extends BrowserWorkbenchEnvironmentService {
    args: never[];
}
export declare const TestEnvironmentService: TestEnvironmentServiceWithArgs;
export declare class TestProgressService implements IProgressService {
    readonly _serviceBrand: undefined;
    withProgress(options: IProgressOptions | IProgressDialogOptions | IProgressWindowOptions | IProgressNotificationOptions | IProgressCompositeOptions, task: (progress: IProgress<IProgressStep>) => Promise<any>, onDidCancel?: ((choice?: number | undefined) => void) | undefined): Promise<any>;
}
export declare class TestDecorationsService implements IDecorationsService {
    readonly _serviceBrand: undefined;
    onDidChangeDecorations: Event<IResourceDecorationChangeEvent>;
    registerDecorationsProvider(_provider: IDecorationsProvider): IDisposable;
    getDecoration(_uri: URI, _includeChildren: boolean, _overwrite?: IDecorationData): IDecoration | undefined;
}
export declare class TestMenuService implements IMenuService {
    readonly _serviceBrand: undefined;
    createMenu(_id: MenuId, _scopedKeybindingService: IContextKeyService): IMenu;
    resetHiddenStates(): void;
}
export declare class TestHistoryService implements IHistoryService {
    private root?;
    readonly _serviceBrand: undefined;
    constructor(root?: URI | undefined);
    reopenLastClosedEditor(): Promise<void>;
    goForward(): Promise<void>;
    goBack(): Promise<void>;
    goPrevious(): Promise<void>;
    goLast(): Promise<void>;
    removeFromHistory(_input: EditorInput | IResourceEditorInput): void;
    clear(): void;
    clearRecentlyOpened(): void;
    getHistory(): readonly (EditorInput | IResourceEditorInput)[];
    openNextRecentlyUsedEditor(group?: GroupIdentifier): Promise<void>;
    openPreviouslyUsedEditor(group?: GroupIdentifier): Promise<void>;
    getLastActiveWorkspaceRoot(_schemeFilter: string): URI | undefined;
    getLastActiveFile(_schemeFilter: string): URI | undefined;
}
export declare class TestFileDialogService implements IFileDialogService {
    private readonly pathService;
    readonly _serviceBrand: undefined;
    private confirmResult;
    constructor(pathService: IPathService);
    defaultFilePath(_schemeFilter?: string): Promise<URI>;
    defaultFolderPath(_schemeFilter?: string): Promise<URI>;
    defaultWorkspacePath(_schemeFilter?: string): Promise<URI>;
    pickFileFolderAndOpen(_options: IPickAndOpenOptions): Promise<any>;
    pickFileAndOpen(_options: IPickAndOpenOptions): Promise<any>;
    pickFolderAndOpen(_options: IPickAndOpenOptions): Promise<any>;
    pickWorkspaceAndOpen(_options: IPickAndOpenOptions): Promise<any>;
    private fileToSave;
    setPickFileToSave(path: URI): void;
    pickFileToSave(defaultUri: URI, availableFileSystems?: string[]): Promise<URI | undefined>;
    showSaveDialog(_options: ISaveDialogOptions): Promise<URI | undefined>;
    showOpenDialog(_options: IOpenDialogOptions): Promise<URI[] | undefined>;
    setConfirmResult(result: ConfirmResult): void;
    showSaveConfirm(fileNamesOrResources: (string | URI)[]): Promise<ConfirmResult>;
}
export declare class TestLayoutService implements IWorkbenchLayoutService {
    readonly _serviceBrand: undefined;
    openedDefaultEditors: boolean;
    dimension: IDimension;
    offset: ILayoutOffsetInfo;
    hasContainer: boolean;
    container: HTMLElement;
    onDidChangeZenMode: Event<boolean>;
    onDidChangeCenteredLayout: Event<boolean>;
    onDidChangeFullscreen: Event<boolean>;
    onDidChangeWindowMaximized: Event<boolean>;
    onDidChangePanelPosition: Event<string>;
    onDidChangePanelAlignment: Event<PanelAlignment>;
    onDidChangePartVisibility: Event<void>;
    onDidLayout: Event<any>;
    onDidChangeNotificationsVisibility: Event<any>;
    layout(): void;
    isRestored(): boolean;
    whenReady: Promise<void>;
    whenRestored: Promise<void>;
    hasFocus(_part: Parts): boolean;
    focusPart(_part: Parts): void;
    hasWindowBorder(): boolean;
    getWindowBorderWidth(): number;
    getWindowBorderRadius(): string | undefined;
    isVisible(_part: Parts): boolean;
    getDimension(_part: Parts): Dimension;
    getContainer(_part: Parts): HTMLElement;
    isTitleBarHidden(): boolean;
    isStatusBarHidden(): boolean;
    isActivityBarHidden(): boolean;
    setActivityBarHidden(_hidden: boolean): void;
    setBannerHidden(_hidden: boolean): void;
    isSideBarHidden(): boolean;
    setEditorHidden(_hidden: boolean): Promise<void>;
    setSideBarHidden(_hidden: boolean): Promise<void>;
    setAuxiliaryBarHidden(_hidden: boolean): Promise<void>;
    setPartHidden(_hidden: boolean, part: Parts): Promise<void>;
    isPanelHidden(): boolean;
    setPanelHidden(_hidden: boolean): Promise<void>;
    toggleMaximizedPanel(): void;
    isPanelMaximized(): boolean;
    getMenubarVisibility(): MenuBarVisibility;
    toggleMenuBar(): void;
    getSideBarPosition(): number;
    getPanelPosition(): number;
    getPanelAlignment(): PanelAlignment;
    setPanelPosition(_position: PartPosition): Promise<void>;
    setPanelAlignment(_alignment: PanelAlignment): Promise<void>;
    addClass(_clazz: string): void;
    removeClass(_clazz: string): void;
    getMaximumEditorDimensions(): Dimension;
    toggleZenMode(): void;
    isEditorLayoutCentered(): boolean;
    centerEditorLayout(_active: boolean): void;
    resizePart(_part: Parts, _sizeChangeWidth: number, _sizeChangeHeight: number): void;
    registerPart(part: Part): void;
    isWindowMaximized(): boolean;
    updateWindowMaximizedState(maximized: boolean): void;
    getVisibleNeighborPart(part: Parts, direction: Direction): Parts | undefined;
    focus(): void;
}
export declare class TestPaneCompositeService extends Disposable implements IPaneCompositePartService {
    readonly _serviceBrand: undefined;
    onDidPaneCompositeOpen: Event<{
        composite: IPaneComposite;
        viewContainerLocation: ViewContainerLocation;
    }>;
    onDidPaneCompositeClose: Event<{
        composite: IPaneComposite;
        viewContainerLocation: ViewContainerLocation;
    }>;
    private parts;
    constructor();
    openPaneComposite(id: string | undefined, viewContainerLocation: ViewContainerLocation, focus?: boolean): Promise<IPaneComposite | undefined>;
    getActivePaneComposite(viewContainerLocation: ViewContainerLocation): IPaneComposite | undefined;
    getPaneComposite(id: string, viewContainerLocation: ViewContainerLocation): PaneCompositeDescriptor | undefined;
    getPaneComposites(viewContainerLocation: ViewContainerLocation): PaneCompositeDescriptor[];
    getProgressIndicator(id: string, viewContainerLocation: ViewContainerLocation): IProgressIndicator | undefined;
    hideActivePaneComposite(viewContainerLocation: ViewContainerLocation): void;
    getLastActivePaneCompositeId(viewContainerLocation: ViewContainerLocation): string;
    getPinnedPaneCompositeIds(viewContainerLocation: ViewContainerLocation): string[];
    getVisiblePaneCompositeIds(viewContainerLocation: ViewContainerLocation): string[];
    showActivity(id: string, viewContainerLocation: ViewContainerLocation, badge: IBadge, clazz?: string, priority?: number): IDisposable;
    getPartByLocation(viewContainerLocation: ViewContainerLocation): IPaneCompositePart;
}
export declare class TestSideBarPart implements IPaneCompositePart {
    readonly _serviceBrand: undefined;
    onDidViewletRegisterEmitter: Emitter<PaneCompositeDescriptor>;
    onDidViewletDeregisterEmitter: Emitter<PaneCompositeDescriptor>;
    onDidViewletOpenEmitter: Emitter<IPaneComposite>;
    onDidViewletCloseEmitter: Emitter<IPaneComposite>;
    element: HTMLElement;
    minimumWidth: number;
    maximumWidth: number;
    minimumHeight: number;
    maximumHeight: number;
    onDidChange: Event<any>;
    onDidPaneCompositeOpen: Event<IPaneComposite>;
    onDidPaneCompositeClose: Event<IPaneComposite>;
    openPaneComposite(id: string, focus?: boolean): Promise<IPaneComposite | undefined>;
    getPaneComposites(): PaneCompositeDescriptor[];
    getAllViewlets(): PaneCompositeDescriptor[];
    getActivePaneComposite(): IPaneComposite;
    getDefaultViewletId(): string;
    getPaneComposite(id: string): PaneCompositeDescriptor | undefined;
    getProgressIndicator(id: string): undefined;
    hideActivePaneComposite(): void;
    getLastActivePaneCompositeId(): string;
    dispose(): void;
    layout(width: number, height: number, top: number, left: number): void;
}
export declare class TestPanelPart implements IPaneCompositePart, IPaneCompositeSelectorPart {
    readonly _serviceBrand: undefined;
    element: HTMLElement;
    minimumWidth: number;
    maximumWidth: number;
    minimumHeight: number;
    maximumHeight: number;
    onDidChange: Event<any>;
    onDidPaneCompositeOpen: Event<IPaneComposite>;
    onDidPaneCompositeClose: Event<IPaneComposite>;
    openPaneComposite(id?: string, focus?: boolean): Promise<undefined>;
    getPaneComposite(id: string): any;
    getPaneComposites(): never[];
    getPinnedPaneCompositeIds(): never[];
    getVisiblePaneCompositeIds(): never[];
    getActivePaneComposite(): IPaneComposite;
    setPanelEnablement(id: string, enabled: boolean): void;
    dispose(): void;
    showActivity(panelId: string, badge: IBadge, clazz?: string): IDisposable;
    getProgressIndicator(id: string): never;
    hideActivePaneComposite(): void;
    getLastActivePaneCompositeId(): string;
    layout(width: number, height: number, top: number, left: number): void;
}
export declare class TestViewsService implements IViewsService {
    readonly _serviceBrand: undefined;
    onDidChangeViewContainerVisibility: Event<{
        id: string;
        visible: boolean;
        location: ViewContainerLocation;
    }>;
    isViewContainerVisible(id: string): boolean;
    getVisibleViewContainer(): ViewContainer | null;
    openViewContainer(id: string, focus?: boolean): Promise<IPaneComposite | null>;
    closeViewContainer(id: string): void;
    onDidChangeViewVisibilityEmitter: Emitter<{
        id: string;
        visible: boolean;
    }>;
    onDidChangeViewVisibility: Event<{
        id: string;
        visible: boolean;
    }>;
    isViewVisible(id: string): boolean;
    getActiveViewWithId<T extends IView>(id: string): T | null;
    getViewWithId<T extends IView>(id: string): T | null;
    openView<T extends IView>(id: string, focus?: boolean | undefined): Promise<T | null>;
    closeView(id: string): void;
    getViewProgressIndicator(id: string): never;
    getActiveViewPaneContainerWithId(id: string): null;
}
export declare class TestEditorGroupsService implements IEditorGroupsService {
    groups: TestEditorGroupView[];
    readonly _serviceBrand: undefined;
    constructor(groups?: TestEditorGroupView[]);
    onDidChangeActiveGroup: Event<IEditorGroup>;
    onDidActivateGroup: Event<IEditorGroup>;
    onDidAddGroup: Event<IEditorGroup>;
    onDidRemoveGroup: Event<IEditorGroup>;
    onDidMoveGroup: Event<IEditorGroup>;
    onDidChangeGroupIndex: Event<IEditorGroup>;
    onDidChangeGroupLocked: Event<IEditorGroup>;
    onDidLayout: Event<IDimension>;
    onDidChangeEditorPartOptions: Event<any>;
    onDidScroll: Event<any>;
    orientation: GroupOrientation;
    isReady: boolean;
    whenReady: Promise<void>;
    whenRestored: Promise<void>;
    hasRestorableState: boolean;
    contentDimension: {
        width: number;
        height: number;
    };
    get activeGroup(): IEditorGroup;
    get sideGroup(): IEditorGroup;
    get count(): number;
    getGroups(_order?: GroupsOrder): readonly IEditorGroup[];
    getGroup(identifier: number): IEditorGroup | undefined;
    getLabel(_identifier: number): string;
    findGroup(_scope: IFindGroupScope, _source?: number | IEditorGroup, _wrap?: boolean): IEditorGroup;
    activateGroup(_group: number | IEditorGroup): IEditorGroup;
    restoreGroup(_group: number | IEditorGroup): IEditorGroup;
    getSize(_group: number | IEditorGroup): {
        width: number;
        height: number;
    };
    setSize(_group: number | IEditorGroup, _size: {
        width: number;
        height: number;
    }): void;
    arrangeGroups(_arrangement: GroupsArrangement): void;
    applyLayout(_layout: EditorGroupLayout): void;
    setGroupOrientation(_orientation: GroupOrientation): void;
    addGroup(_location: number | IEditorGroup, _direction: GroupDirection, _options?: IAddGroupOptions): IEditorGroup;
    removeGroup(_group: number | IEditorGroup): void;
    moveGroup(_group: number | IEditorGroup, _location: number | IEditorGroup, _direction: GroupDirection): IEditorGroup;
    mergeGroup(_group: number | IEditorGroup, _target: number | IEditorGroup, _options?: IMergeGroupOptions): IEditorGroup;
    mergeAllGroups(): IEditorGroup;
    copyGroup(_group: number | IEditorGroup, _location: number | IEditorGroup, _direction: GroupDirection): IEditorGroup;
    centerLayout(active: boolean): void;
    isLayoutCentered(): boolean;
    partOptions: IEditorPartOptions;
    enforcePartOptions(options: IEditorPartOptions): IDisposable;
}
export declare class TestEditorGroupView implements IEditorGroupView {
    id: number;
    constructor(id: number);
    activeEditorPane: IVisibleEditorPane;
    activeEditor: EditorInput;
    previewEditor: EditorInput;
    count: number;
    stickyCount: number;
    disposed: boolean;
    editors: readonly EditorInput[];
    label: string;
    isLocked: boolean;
    ariaLabel: string;
    index: number;
    whenRestored: Promise<void>;
    element: HTMLElement;
    minimumWidth: number;
    maximumWidth: number;
    minimumHeight: number;
    maximumHeight: number;
    titleHeight: IEditorGroupTitleHeight;
    isEmpty: boolean;
    onWillDispose: Event<void>;
    onDidModelChange: Event<IGroupModelChangeEvent>;
    onWillCloseEditor: Event<IEditorCloseEvent>;
    onDidCloseEditor: Event<IEditorCloseEvent>;
    onDidOpenEditorFail: Event<EditorInput>;
    onDidFocus: Event<void>;
    onDidChange: Event<{
        width: number;
        height: number;
    }>;
    onWillMoveEditor: Event<IEditorWillMoveEvent>;
    onWillOpenEditor: Event<IEditorWillOpenEvent>;
    onDidActiveEditorChange: Event<IActiveEditorChangeEvent>;
    getEditors(_order?: EditorsOrder): readonly EditorInput[];
    findEditors(_resource: URI): readonly EditorInput[];
    getEditorByIndex(_index: number): EditorInput;
    getIndexOfEditor(_editor: EditorInput): number;
    isFirst(editor: EditorInput): boolean;
    isLast(editor: EditorInput): boolean;
    openEditor(_editor: EditorInput, _options?: IEditorOptions): Promise<IEditorPane>;
    openEditors(_editors: EditorInputWithOptions[]): Promise<IEditorPane>;
    isPinned(_editor: EditorInput): boolean;
    isSticky(_editor: EditorInput): boolean;
    isActive(_editor: EditorInput | IUntypedEditorInput): boolean;
    contains(candidate: EditorInput | IUntypedEditorInput): boolean;
    moveEditor(_editor: EditorInput, _target: IEditorGroup, _options?: IEditorOptions): void;
    moveEditors(_editors: EditorInputWithOptions[], _target: IEditorGroup): void;
    copyEditor(_editor: EditorInput, _target: IEditorGroup, _options?: IEditorOptions): void;
    copyEditors(_editors: EditorInputWithOptions[], _target: IEditorGroup): void;
    closeEditor(_editor?: EditorInput, options?: ICloseEditorOptions): Promise<boolean>;
    closeEditors(_editors: EditorInput[] | ICloseEditorsFilter, options?: ICloseEditorOptions): Promise<boolean>;
    closeAllEditors(options?: ICloseAllEditorsOptions): Promise<boolean>;
    replaceEditors(_editors: IEditorReplacement[]): Promise<void>;
    pinEditor(_editor?: EditorInput): void;
    stickEditor(editor?: EditorInput | undefined): void;
    unstickEditor(editor?: EditorInput | undefined): void;
    lock(locked: boolean): void;
    focus(): void;
    get scopedContextKeyService(): IContextKeyService;
    setActive(_isActive: boolean): void;
    notifyIndexChanged(_index: number): void;
    dispose(): void;
    toJSON(): object;
    layout(_width: number, _height: number): void;
    relayout(): void;
}
export declare class TestEditorGroupAccessor implements IEditorGroupsAccessor {
    groups: IEditorGroupView[];
    activeGroup: IEditorGroupView;
    partOptions: IEditorPartOptions;
    onDidChangeEditorPartOptions: Event<any>;
    onDidVisibilityChange: Event<any>;
    getGroup(identifier: number): IEditorGroupView | undefined;
    getGroups(order: GroupsOrder): IEditorGroupView[];
    activateGroup(identifier: number | IEditorGroupView): IEditorGroupView;
    restoreGroup(identifier: number | IEditorGroupView): IEditorGroupView;
    addGroup(location: number | IEditorGroupView, direction: GroupDirection, options?: IAddGroupOptions | undefined): IEditorGroupView;
    mergeGroup(group: number | IEditorGroupView, target: number | IEditorGroupView, options?: IMergeGroupOptions | undefined): IEditorGroupView;
    moveGroup(group: number | IEditorGroupView, location: number | IEditorGroupView, direction: GroupDirection): IEditorGroupView;
    copyGroup(group: number | IEditorGroupView, location: number | IEditorGroupView, direction: GroupDirection): IEditorGroupView;
    removeGroup(group: number | IEditorGroupView): void;
    arrangeGroups(arrangement: GroupsArrangement, target?: number | IEditorGroupView | undefined): void;
}
export declare class TestEditorService implements EditorServiceImpl {
    private editorGroupService?;
    readonly _serviceBrand: undefined;
    onDidActiveEditorChange: Event<void>;
    onDidVisibleEditorsChange: Event<void>;
    onDidEditorsChange: Event<IEditorsChangeEvent>;
    onDidCloseEditor: Event<IEditorCloseEvent>;
    onDidOpenEditorFail: Event<IEditorIdentifier>;
    onDidMostRecentlyActiveEditorsChange: Event<void>;
    private _activeTextEditorControl;
    get activeTextEditorControl(): ICodeEditor | IDiffEditor | undefined;
    set activeTextEditorControl(value: ICodeEditor | IDiffEditor | undefined);
    activeEditorPane: IVisibleEditorPane | undefined;
    activeTextEditorLanguageId: string | undefined;
    private _activeEditor;
    get activeEditor(): EditorInput | undefined;
    set activeEditor(value: EditorInput | undefined);
    editors: readonly EditorInput[];
    mostRecentlyActiveEditors: readonly IEditorIdentifier[];
    visibleEditorPanes: readonly IVisibleEditorPane[];
    visibleTextEditorControls: never[];
    visibleEditors: readonly EditorInput[];
    count: number;
    constructor(editorGroupService?: IEditorGroupsService | undefined);
    getEditors(): never[];
    findEditors(): any;
    openEditor(editor: EditorInput, options?: IEditorOptions, group?: PreferredGroup): Promise<IEditorPane | undefined>;
    openEditor(editor: IResourceEditorInput | IUntitledTextResourceEditorInput, group?: PreferredGroup): Promise<IEditorPane | undefined>;
    openEditor(editor: IResourceDiffEditorInput, group?: PreferredGroup): Promise<ITextDiffEditorPane | undefined>;
    closeEditor(editor: IEditorIdentifier, options?: ICloseEditorOptions): Promise<void>;
    closeEditors(editors: IEditorIdentifier[], options?: ICloseEditorOptions): Promise<void>;
    doResolveEditorOpenRequest(editor: EditorInput | IUntypedEditorInput): [IEditorGroup, EditorInput, IEditorOptions | undefined] | undefined;
    openEditors(_editors: any, _group?: any): Promise<IEditorPane[]>;
    isOpened(_editor: IResourceEditorInputIdentifier): boolean;
    isVisible(_editor: EditorInput): boolean;
    replaceEditors(_editors: any, _group: any): Promise<undefined>;
    save(editors: IEditorIdentifier[], options?: ISaveEditorsOptions): Promise<boolean>;
    saveAll(options?: ISaveEditorsOptions): Promise<boolean>;
    revert(editors: IEditorIdentifier[], options?: IRevertOptions): Promise<boolean>;
    revertAll(options?: IRevertAllEditorsOptions): Promise<boolean>;
}
export declare class TestFileService implements IFileService {
    readonly _serviceBrand: undefined;
    private readonly _onDidFilesChange;
    get onDidFilesChange(): Event<FileChangesEvent>;
    fireFileChanges(event: FileChangesEvent): void;
    private readonly _onDidRunOperation;
    get onDidRunOperation(): Event<FileOperationEvent>;
    fireAfterOperation(event: FileOperationEvent): void;
    private readonly _onDidChangeFileSystemProviderCapabilities;
    get onDidChangeFileSystemProviderCapabilities(): Event<IFileSystemProviderCapabilitiesChangeEvent>;
    fireFileSystemProviderCapabilitiesChangeEvent(event: IFileSystemProviderCapabilitiesChangeEvent): void;
    readonly onWillActivateFileSystemProvider: Event<any>;
    readonly onDidWatchError: Event<any>;
    private content;
    private lastReadFileUri;
    readonly: boolean;
    setContent(content: string): void;
    getContent(): string;
    getLastReadFileUri(): URI;
    resolve(resource: URI, _options: IResolveMetadataFileOptions): Promise<IFileStatWithMetadata>;
    resolve(resource: URI, _options?: IResolveFileOptions): Promise<IFileStat>;
    stat(resource: URI): Promise<IFileStatWithPartialMetadata>;
    resolveAll(toResolve: {
        resource: URI;
        options?: IResolveFileOptions;
    }[]): Promise<IFileStatResult[]>;
    readonly notExistsSet: ResourceMap<boolean>;
    exists(_resource: URI): Promise<boolean>;
    readShouldThrowError: Error | undefined;
    readFile(resource: URI, options?: IReadFileOptions | undefined): Promise<IFileContent>;
    readFileStream(resource: URI, options?: IReadFileStreamOptions | undefined): Promise<IFileStreamContent>;
    writeShouldThrowError: Error | undefined;
    writeFile(resource: URI, bufferOrReadable: VSBuffer | VSBufferReadable, options?: IWriteFileOptions): Promise<IFileStatWithMetadata>;
    move(_source: URI, _target: URI, _overwrite?: boolean): Promise<IFileStatWithMetadata>;
    copy(_source: URI, _target: URI, _overwrite?: boolean): Promise<IFileStatWithMetadata>;
    cloneFile(_source: URI, _target: URI): Promise<void>;
    createFile(_resource: URI, _content?: VSBuffer | VSBufferReadable, _options?: ICreateFileOptions): Promise<IFileStatWithMetadata>;
    createFolder(_resource: URI): Promise<IFileStatWithMetadata>;
    onDidChangeFileSystemProviderRegistrations: Event<any>;
    private providers;
    registerProvider(scheme: string, provider: IFileSystemProvider): IDisposable;
    getProvider(scheme: string): IFileSystemProvider | undefined;
    activateProvider(_scheme: string): Promise<void>;
    canHandleResource(resource: URI): Promise<boolean>;
    hasProvider(resource: URI): boolean;
    listCapabilities(): {
        scheme: string;
        capabilities: FileSystemProviderCapabilities;
    }[];
    hasCapability(resource: URI, capability: FileSystemProviderCapabilities): boolean;
    del(_resource: URI, _options?: {
        useTrash?: boolean;
        recursive?: boolean;
    }): Promise<void>;
    readonly watches: URI[];
    watch(_resource: URI): IDisposable;
    getWriteEncoding(_resource: URI): IResourceEncoding;
    dispose(): void;
    canCreateFile(source: URI, options?: ICreateFileOptions): Promise<Error | true>;
    canMove(source: URI, target: URI, overwrite?: boolean | undefined): Promise<Error | true>;
    canCopy(source: URI, target: URI, overwrite?: boolean | undefined): Promise<Error | true>;
    canDelete(resource: URI, options?: {
        useTrash?: boolean | undefined;
        recursive?: boolean | undefined;
    } | undefined): Promise<Error | true>;
}
export declare class TestWorkingCopyBackupService extends InMemoryWorkingCopyBackupService {
    readonly resolved: Set<IWorkingCopyIdentifier>;
    constructor();
    parseBackupContent(textBufferFactory: ITextBufferFactory): string;
    resolve<T extends IWorkingCopyBackupMeta>(identifier: IWorkingCopyIdentifier): Promise<IResolvedWorkingCopyBackup<T> | undefined>;
}
export declare function toUntypedWorkingCopyId(resource: URI): IWorkingCopyIdentifier;
export declare function toTypedWorkingCopyId(resource: URI, typeId?: string): IWorkingCopyIdentifier;
export declare class InMemoryTestWorkingCopyBackupService extends BrowserWorkingCopyBackupService {
    readonly fileService: IFileService;
    private backupResourceJoiners;
    private discardBackupJoiners;
    discardedBackups: IWorkingCopyIdentifier[];
    constructor();
    joinBackupResource(): Promise<void>;
    joinDiscardBackup(): Promise<void>;
    backup(identifier: IWorkingCopyIdentifier, content?: VSBufferReadableStream | VSBufferReadable, versionId?: number, meta?: any, token?: CancellationToken): Promise<void>;
    discardBackup(identifier: IWorkingCopyIdentifier): Promise<void>;
    getBackupContents(identifier: IWorkingCopyIdentifier): Promise<string>;
}
export declare class TestLifecycleService implements ILifecycleService {
    readonly _serviceBrand: undefined;
    phase: LifecyclePhase;
    startupKind: StartupKind;
    private readonly _onBeforeShutdown;
    get onBeforeShutdown(): Event<InternalBeforeShutdownEvent>;
    private readonly _onBeforeShutdownError;
    get onBeforeShutdownError(): Event<BeforeShutdownErrorEvent>;
    private readonly _onShutdownVeto;
    get onShutdownVeto(): Event<void>;
    private readonly _onWillShutdown;
    get onWillShutdown(): Event<WillShutdownEvent>;
    private readonly _onDidShutdown;
    get onDidShutdown(): Event<void>;
    when(): Promise<void>;
    shutdownJoiners: Promise<void>[];
    fireShutdown(reason?: ShutdownReason): void;
    fireBeforeShutdown(event: InternalBeforeShutdownEvent): void;
    fireWillShutdown(event: WillShutdownEvent): void;
    shutdown(): Promise<void>;
}
export declare class TestBeforeShutdownEvent implements InternalBeforeShutdownEvent {
    value: boolean | Promise<boolean> | undefined;
    finalValue: (() => boolean | Promise<boolean>) | undefined;
    reason: ShutdownReason;
    veto(value: boolean | Promise<boolean>): void;
    finalVeto(vetoFn: () => boolean | Promise<boolean>): void;
}
export declare class TestWillShutdownEvent implements WillShutdownEvent {
    value: Promise<void>[];
    joiners: () => never[];
    reason: ShutdownReason;
    token: Readonly<CancellationToken>;
    join(promise: Promise<void>, joiner: IWillShutdownEventJoiner): void;
    force(): void;
}
export declare class TestTextResourceConfigurationService implements ITextResourceConfigurationService {
    private configurationService;
    readonly _serviceBrand: undefined;
    constructor(configurationService?: TestConfigurationService);
    onDidChangeConfiguration(): {
        dispose(): void;
    };
    getValue<T>(resource: URI, arg2?: any, arg3?: any): T;
    updateValue(resource: URI, key: string, value: any, configurationTarget?: ConfigurationTarget): Promise<void>;
}
export declare class RemoteFileSystemProvider implements IFileSystemProvider {
    private readonly wrappedFsp;
    private readonly remoteAuthority;
    constructor(wrappedFsp: IFileSystemProvider, remoteAuthority: string);
    readonly capabilities: FileSystemProviderCapabilities;
    readonly onDidChangeCapabilities: Event<void>;
    readonly onDidChangeFile: Event<readonly IFileChange[]>;
    watch(resource: URI, opts: IWatchOptions): IDisposable;
    stat(resource: URI): Promise<IStat>;
    mkdir(resource: URI): Promise<void>;
    readdir(resource: URI): Promise<[string, FileType][]>;
    delete(resource: URI, opts: IFileDeleteOptions): Promise<void>;
    rename(from: URI, to: URI, opts: IFileOverwriteOptions): Promise<void>;
    copy(from: URI, to: URI, opts: IFileOverwriteOptions): Promise<void>;
    readFile(resource: URI): Promise<Uint8Array>;
    writeFile(resource: URI, content: Uint8Array, opts: IFileWriteOptions): Promise<void>;
    open(resource: URI, opts: IFileOpenOptions): Promise<number>;
    close(fd: number): Promise<void>;
    read(fd: number, pos: number, data: Uint8Array, offset: number, length: number): Promise<number>;
    write(fd: number, pos: number, data: Uint8Array, offset: number, length: number): Promise<number>;
    readFileStream(resource: URI, opts: IFileReadStreamOptions, token: CancellationToken): ReadableStreamEvents<Uint8Array>;
    private toFileResource;
}
export declare class TestInMemoryFileSystemProvider extends InMemoryFileSystemProvider implements IFileSystemProviderWithFileReadStreamCapability {
    get capabilities(): FileSystemProviderCapabilities;
    readFileStream(resource: URI): ReadableStreamEvents<Uint8Array>;
}
export declare const productService: IProductService;
export declare class TestHostService implements IHostService {
    readonly _serviceBrand: undefined;
    private _hasFocus;
    get hasFocus(): boolean;
    hadLastFocus(): Promise<boolean>;
    private _onDidChangeFocus;
    readonly onDidChangeFocus: Event<boolean>;
    setFocus(focus: boolean): void;
    restart(): Promise<void>;
    reload(): Promise<void>;
    close(): Promise<void>;
    focus(options?: {
        force: boolean;
    }): Promise<void>;
    openWindow(arg1?: IOpenEmptyWindowOptions | IWindowOpenable[], arg2?: IOpenWindowOptions): Promise<void>;
    toggleFullScreen(): Promise<void>;
    readonly colorScheme = ColorScheme.DARK;
    onDidChangeColorScheme: Event<any>;
}
export declare class TestFilesConfigurationService extends FilesConfigurationService {
    onFilesConfigurationChange(configuration: any): void;
}
export declare class TestReadonlyTextFileEditorModel extends TextFileEditorModel {
    isReadonly(): boolean;
}
export declare class TestEditorInput extends EditorInput {
    resource: URI;
    private readonly _typeId;
    constructor(resource: URI, _typeId: string);
    get typeId(): string;
    get editorId(): string;
    resolve(): Promise<IEditorModel | null>;
}
export declare function registerTestEditor(id: string, inputs: SyncDescriptor<EditorInput>[], serializerInputId?: string): IDisposable;
export declare function registerTestFileEditor(): IDisposable;
export declare function registerTestResourceEditor(): IDisposable;
export declare function registerTestSideBySideEditor(): IDisposable;
export declare class TestFileEditorInput extends EditorInput implements IFileEditorInput {
    resource: URI;
    private _typeId;
    readonly preferredResource: URI;
    gotDisposed: boolean;
    gotSaved: boolean;
    gotSavedAs: boolean;
    gotReverted: boolean;
    dirty: boolean;
    private fails;
    disableToUntyped: boolean;
    constructor(resource: URI, _typeId: string);
    get typeId(): string;
    get editorId(): string;
    private _capabilities;
    get capabilities(): EditorInputCapabilities;
    set capabilities(capabilities: EditorInputCapabilities);
    resolve(): Promise<IEditorModel | null>;
    matches(other: EditorInput | IResourceEditorInput | ITextResourceEditorInput | IUntitledTextResourceEditorInput): boolean;
    setPreferredResource(resource: URI): void;
    setEncoding(encoding: string): Promise<void>;
    getEncoding(): undefined;
    setPreferredName(name: string): void;
    setPreferredDescription(description: string): void;
    setPreferredEncoding(encoding: string): void;
    setPreferredContents(contents: string): void;
    setLanguageId(languageId: string, source?: string): void;
    setPreferredLanguageId(languageId: string): void;
    setForceOpenAsBinary(): void;
    setFailToOpen(): void;
    save(groupId: GroupIdentifier, options?: ISaveOptions): Promise<EditorInput | undefined>;
    saveAs(groupId: GroupIdentifier, options?: ISaveOptions): Promise<EditorInput | undefined>;
    revert(group: GroupIdentifier, options?: IRevertOptions): Promise<void>;
    toUntyped(): IUntypedEditorInput | undefined;
    setDirty(): void;
    isDirty(): boolean;
    isResolved(): boolean;
    dispose(): void;
    movedEditor: IMoveResult | undefined;
    rename(): Promise<IMoveResult | undefined>;
}
export declare class TestSingletonFileEditorInput extends TestFileEditorInput {
    get capabilities(): EditorInputCapabilities;
}
export declare class TestEditorPart extends EditorPart {
    saveState(): void;
    clearState(): void;
}
export declare function createEditorPart(instantiationService: IInstantiationService, disposables: DisposableStore): Promise<TestEditorPart>;
export declare class TestListService implements IListService {
    readonly _serviceBrand: undefined;
    lastFocusedList: any | undefined;
    register(): IDisposable;
}
export declare class TestPathService implements IPathService {
    private readonly fallbackUserHome;
    defaultUriScheme: string;
    readonly _serviceBrand: undefined;
    constructor(fallbackUserHome?: URI, defaultUriScheme?: string);
    hasValidBasename(resource: URI, basename?: string): Promise<boolean>;
    hasValidBasename(resource: URI, os: OperatingSystem, basename?: string): boolean;
    get path(): Promise<import("vs/base/common/path").IPath>;
    userHome(options?: {
        preferLocal: boolean;
    }): Promise<URI>;
    userHome(options: {
        preferLocal: true;
    }): URI;
    get resolvedUserHome(): URI;
    fileURI(path: string): Promise<URI>;
}
export declare class TestTextFileEditorModelManager extends TextFileEditorModelManager {
    add(resource: URI, model: TextFileEditorModel): void;
    remove(resource: URI): void;
}
export declare function getLastResolvedFileStat(model: unknown): IFileStatWithMetadata | undefined;
export declare class TestWorkspacesService implements IWorkspacesService {
    _serviceBrand: undefined;
    onDidChangeRecentlyOpened: Event<any>;
    createUntitledWorkspace(folders?: IWorkspaceFolderCreationData[], remoteAuthority?: string): Promise<IWorkspaceIdentifier>;
    deleteUntitledWorkspace(workspace: IWorkspaceIdentifier): Promise<void>;
    addRecentlyOpened(recents: IRecent[]): Promise<void>;
    removeRecentlyOpened(workspaces: URI[]): Promise<void>;
    clearRecentlyOpened(): Promise<void>;
    getRecentlyOpened(): Promise<IRecentlyOpened>;
    getDirtyWorkspaces(): Promise<(IFolderBackupInfo | IWorkspaceBackupInfo)[]>;
    enterWorkspace(path: URI): Promise<IEnterWorkspaceResult | undefined>;
    getWorkspaceIdentifier(workspacePath: URI): Promise<IWorkspaceIdentifier>;
}
export declare class TestTerminalInstanceService implements ITerminalInstanceService {
    onDidCreateInstance: Event<any>;
    readonly _serviceBrand: undefined;
    convertProfileToShellLaunchConfig(shellLaunchConfigOrProfile?: IShellLaunchConfig | ITerminalProfile, cwd?: string | URI): IShellLaunchConfig;
    preparePathForTerminalAsync(path: string, executable: string | undefined, title: string, shellType: TerminalShellType, remoteAuthority: string | undefined): Promise<string>;
    createInstance(options: ICreateTerminalOptions, target?: TerminalLocation): ITerminalInstance;
    getBackend(remoteAuthority?: string): Promise<ITerminalBackend | undefined>;
}
export declare class TestTerminalEditorService implements ITerminalEditorService {
    _serviceBrand: undefined;
    activeInstance: ITerminalInstance | undefined;
    instances: readonly ITerminalInstance[];
    onDidDisposeInstance: Event<any>;
    onDidFocusInstance: Event<any>;
    onDidChangeInstanceCapability: Event<any>;
    onDidChangeActiveInstance: Event<any>;
    onDidChangeInstances: Event<any>;
    openEditor(instance: ITerminalInstance, editorOptions?: TerminalEditorLocation): Promise<void>;
    detachActiveEditorInstance(): ITerminalInstance;
    detachInstance(instance: ITerminalInstance): void;
    splitInstance(instanceToSplit: ITerminalInstance, shellLaunchConfig?: IShellLaunchConfig): ITerminalInstance;
    revealActiveEditor(preserveFocus?: boolean): Promise<void>;
    resolveResource(instance: ITerminalInstance | URI): URI;
    reviveInput(deserializedInput: IDeserializedTerminalEditorInput): TerminalEditorInput;
    getInputFromResource(resource: URI): TerminalEditorInput;
    setActiveInstance(instance: ITerminalInstance): void;
    focusActiveInstance(): Promise<void>;
    getInstanceFromResource(resource: URI | undefined): ITerminalInstance | undefined;
    focusFindWidget(): void;
    hideFindWidget(): void;
    findNext(): void;
    findPrevious(): void;
}
export declare class TestTerminalGroupService implements ITerminalGroupService {
    _serviceBrand: undefined;
    activeInstance: ITerminalInstance | undefined;
    instances: readonly ITerminalInstance[];
    groups: readonly ITerminalGroup[];
    activeGroup: ITerminalGroup | undefined;
    activeGroupIndex: number;
    onDidChangeActiveGroup: Event<any>;
    onDidDisposeGroup: Event<any>;
    onDidShow: Event<any>;
    onDidChangeGroups: Event<any>;
    onDidChangePanelOrientation: Event<any>;
    onDidDisposeInstance: Event<any>;
    onDidFocusInstance: Event<any>;
    onDidChangeInstanceCapability: Event<any>;
    onDidChangeActiveInstance: Event<any>;
    onDidChangeInstances: Event<any>;
    createGroup(instance?: any): ITerminalGroup;
    getGroupForInstance(instance: ITerminalInstance): ITerminalGroup | undefined;
    moveGroup(source: ITerminalInstance, target: ITerminalInstance): void;
    moveGroupToEnd(source: ITerminalInstance): void;
    moveInstance(source: ITerminalInstance, target: ITerminalInstance, side: 'before' | 'after'): void;
    unsplitInstance(instance: ITerminalInstance): void;
    joinInstances(instances: ITerminalInstance[]): void;
    instanceIsSplit(instance: ITerminalInstance): boolean;
    getGroupLabels(): string[];
    setActiveGroupByIndex(index: number): void;
    setActiveGroupToNext(): void;
    setActiveGroupToPrevious(): void;
    setActiveInstanceByIndex(terminalIndex: number): void;
    setContainer(container: HTMLElement): void;
    showPanel(focus?: boolean): Promise<void>;
    hidePanel(): void;
    focusTabs(): void;
    showTabs(): void;
    setActiveInstance(instance: ITerminalInstance): void;
    focusActiveInstance(): Promise<void>;
    getInstanceFromResource(resource: URI | undefined): ITerminalInstance | undefined;
    focusFindWidget(): void;
    hideFindWidget(): void;
    findNext(): void;
    findPrevious(): void;
    updateVisibility(): void;
}
export declare class TestTerminalProfileService implements ITerminalProfileService {
    _serviceBrand: undefined;
    availableProfiles: ITerminalProfile[];
    contributedProfiles: IExtensionTerminalProfile[];
    profilesReady: Promise<void>;
    onDidChangeAvailableProfiles: Event<any>;
    getPlatformKey(): Promise<string>;
    refreshAvailableProfiles(): void;
    getDefaultProfileName(): string | undefined;
    getContributedDefaultProfile(shellLaunchConfig: IShellLaunchConfig): Promise<IExtensionTerminalProfile | undefined>;
    registerContributedProfile(args: IRegisterContributedProfileArgs): Promise<void>;
    getContributedProfileProvider(extensionIdentifier: string, id: string): ITerminalProfileProvider | undefined;
    registerTerminalProfileProvider(extensionIdentifier: string, id: string, profileProvider: ITerminalProfileProvider): IDisposable;
}
export declare class TestTerminalProfileResolverService implements ITerminalProfileResolverService {
    _serviceBrand: undefined;
    defaultProfileName: string;
    resolveIcon(shellLaunchConfig: IShellLaunchConfig): void;
    resolveShellLaunchConfig(shellLaunchConfig: IShellLaunchConfig, options: IShellLaunchConfigResolveOptions): Promise<void>;
    getDefaultProfile(options: IShellLaunchConfigResolveOptions): Promise<ITerminalProfile>;
    getDefaultShell(options: IShellLaunchConfigResolveOptions): Promise<string>;
    getDefaultShellArgs(options: IShellLaunchConfigResolveOptions): Promise<string | string[]>;
    getDefaultIcon(): TerminalIcon & ThemeIcon;
    getEnvironment(): Promise<IProcessEnvironment>;
    getSafeConfigValue(key: string, os: OperatingSystem): unknown | undefined;
    getSafeConfigValueFullKey(key: string): unknown | undefined;
    createProfileFromShellAndShellArgs(shell?: unknown, shellArgs?: unknown): Promise<string | ITerminalProfile>;
}
export declare class TestQuickInputService implements IQuickInputService {
    readonly _serviceBrand: undefined;
    readonly onShow: Event<any>;
    readonly onHide: Event<any>;
    readonly quickAccess: never;
    backButton: IQuickInputButton;
    pick<T extends IQuickPickItem>(picks: Promise<QuickPickInput<T>[]> | QuickPickInput<T>[], options?: IPickOptions<T> & {
        canPickMany: true;
    }, token?: CancellationToken): Promise<T[]>;
    pick<T extends IQuickPickItem>(picks: Promise<QuickPickInput<T>[]> | QuickPickInput<T>[], options?: IPickOptions<T> & {
        canPickMany: false;
    }, token?: CancellationToken): Promise<T>;
    input(options?: IInputOptions, token?: CancellationToken): Promise<string>;
    createQuickPick<T extends IQuickPickItem>(): IQuickPick<T>;
    createInputBox(): IInputBox;
    focus(): void;
    toggle(): void;
    navigate(next: boolean, quickNavigate?: IQuickNavigateConfiguration): void;
    accept(): Promise<void>;
    back(): Promise<void>;
    cancel(): Promise<void>;
}
export declare class TestRemoteAgentService implements IRemoteAgentService {
    readonly _serviceBrand: undefined;
    socketFactory: ISocketFactory;
    getConnection(): IRemoteAgentConnection | null;
    getEnvironment(): Promise<IRemoteAgentEnvironment | null>;
    getRawEnvironment(): Promise<IRemoteAgentEnvironment | null>;
    getExtensionHostExitInfo(reconnectionToken: string): Promise<IExtensionHostExitInfo | null>;
    whenExtensionsReady(): Promise<void>;
    scanExtensions(skipExtensions?: ExtensionIdentifier[]): Promise<IExtensionDescription[]>;
    scanSingleExtension(extensionLocation: URI, isBuiltin: boolean): Promise<IExtensionDescription | null>;
    getDiagnosticInfo(options: IDiagnosticInfoOptions): Promise<IDiagnosticInfo | undefined>;
    updateTelemetryLevel(telemetryLevel: TelemetryLevel): Promise<void>;
    logTelemetry(eventName: string, data?: ITelemetryData): Promise<void>;
    flushTelemetry(): Promise<void>;
    getRoundTripTime(): Promise<number | undefined>;
}
export declare class TestWorkbenchExtensionEnablementService implements IWorkbenchExtensionEnablementService {
    _serviceBrand: undefined;
    onEnablementChanged: Event<any>;
    getEnablementState(extension: IExtension): EnablementState;
    getEnablementStates(extensions: IExtension[], workspaceTypeOverrides?: {
        trusted?: boolean | undefined;
    } | undefined): EnablementState[];
    getDependenciesEnablementStates(extension: IExtension): [IExtension, EnablementState][];
    canChangeEnablement(extension: IExtension): boolean;
    canChangeWorkspaceEnablement(extension: IExtension): boolean;
    isEnabled(extension: IExtension): boolean;
    isEnabledEnablementState(enablementState: EnablementState): boolean;
    isDisabledGlobally(extension: IExtension): boolean;
    setEnablement(extensions: IExtension[], state: EnablementState): Promise<boolean[]>;
    updateExtensionsEnablementsWhenWorkspaceTrustChanges(): Promise<void>;
}
export declare class TestWorkbenchExtensionManagementService implements IWorkbenchExtensionManagementService {
    _serviceBrand: undefined;
    onInstallExtension: Event<any>;
    onDidInstallExtensions: Event<any>;
    onUninstallExtension: Event<any>;
    onDidUninstallExtension: Event<any>;
    onProfileAwareInstallExtension: Event<any>;
    onProfileAwareDidInstallExtensions: Event<any>;
    onProfileAwareUninstallExtension: Event<any>;
    onProfileAwareDidUninstallExtension: Event<any>;
    onDidChangeProfile: Event<any>;
    installVSIX(location: URI, manifest: Readonly<IRelaxedExtensionManifest>, installOptions?: InstallVSIXOptions | undefined): Promise<ILocalExtension>;
    installWebExtension(location: URI): Promise<ILocalExtension>;
    installExtensions(extensions: IGalleryExtension[], installOptions?: InstallOptions | undefined): Promise<ILocalExtension[]>;
    updateFromGallery(gallery: IGalleryExtension, extension: ILocalExtension, installOptions?: InstallOptions | undefined): Promise<ILocalExtension>;
    getExtensionManagementServerToInstall(manifest: Readonly<IRelaxedExtensionManifest>): IExtensionManagementServer | null;
    zip(extension: ILocalExtension): Promise<URI>;
    unzip(zipLocation: URI): Promise<IExtensionIdentifier>;
    getManifest(vsix: URI): Promise<Readonly<IRelaxedExtensionManifest>>;
    install(vsix: URI, options?: InstallVSIXOptions | undefined): Promise<ILocalExtension>;
    canInstall(extension: IGalleryExtension): Promise<boolean>;
    installFromGallery(extension: IGalleryExtension, options?: InstallOptions | undefined): Promise<ILocalExtension>;
    uninstall(extension: ILocalExtension, options?: UninstallOptions | undefined): Promise<void>;
    reinstallFromGallery(extension: ILocalExtension): Promise<void>;
    getInstalled(type?: ExtensionType | undefined): Promise<ILocalExtension[]>;
    getExtensionsControlManifest(): Promise<IExtensionsControlManifest>;
    getMetadata(extension: ILocalExtension): Promise<Partial<IGalleryMetadata & {
        isApplicationScoped: boolean;
        isMachineScoped: boolean;
        isBuiltin: boolean;
        isSystem: boolean;
        updated: boolean;
        preRelease: boolean;
        installedTimestamp: number;
    }> | undefined>;
    updateMetadata(local: ILocalExtension, metadata: IGalleryMetadata): Promise<ILocalExtension>;
    updateExtensionScope(local: ILocalExtension, isMachineScoped: boolean): Promise<ILocalExtension>;
    registerParticipant(pariticipant: IExtensionManagementParticipant): void;
    getTargetPlatform(): Promise<TargetPlatform>;
    download(): Promise<URI>;
}
export declare class TestUserDataProfileService implements IUserDataProfileService {
    readonly _serviceBrand: undefined;
    readonly onDidUpdateCurrentProfile: Event<any>;
    readonly onDidChangeCurrentProfile: Event<any>;
    readonly currentProfile: IUserDataProfile;
    updateCurrentProfile(): Promise<void>;
    getShortName(profile: IUserDataProfile): string;
}
export declare class TestWebExtensionsScannerService implements IWebExtensionsScannerService {
    _serviceBrand: undefined;
    onDidChangeProfile: Event<any>;
    scanSystemExtensions(): Promise<IExtension[]>;
    scanUserExtensions(): Promise<IScannedExtension[]>;
    scanExtensionsUnderDevelopment(): Promise<IExtension[]>;
    copyExtensions(): Promise<void>;
    scanExistingExtension(extensionLocation: URI, extensionType: ExtensionType): Promise<IScannedExtension | null>;
    addExtension(location: URI, metadata?: Partial<IGalleryMetadata & {
        isApplicationScoped: boolean;
        isMachineScoped: boolean;
        isBuiltin: boolean;
        isSystem: boolean;
        updated: boolean;
        preRelease: boolean;
        installedTimestamp: number;
    }> | undefined): Promise<IExtension>;
    addExtensionFromGallery(galleryExtension: IGalleryExtension, metadata?: Partial<IGalleryMetadata & {
        isApplicationScoped: boolean;
        isMachineScoped: boolean;
        isBuiltin: boolean;
        isSystem: boolean;
        updated: boolean;
        preRelease: boolean;
        installedTimestamp: number;
    }> | undefined): Promise<IExtension>;
    removeExtension(): Promise<void>;
    scanMetadata(extensionLocation: URI): Promise<Partial<IGalleryMetadata & {
        isApplicationScoped: boolean;
        isMachineScoped: boolean;
        isBuiltin: boolean;
        isSystem: boolean;
        updated: boolean;
        preRelease: boolean;
        installedTimestamp: number;
    }> | undefined>;
    scanExtensionManifest(extensionLocation: URI): Promise<Readonly<IRelaxedExtensionManifest> | null>;
}
export {};

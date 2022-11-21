import { URI } from 'vs/base/common/uri';
import { Event } from 'vs/base/common/event';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IWorkspaceContextService, IWorkspace, WorkbenchState, IWorkspaceFolder, IWorkspaceFoldersChangeEvent, IWorkspaceFoldersWillChangeEvent, ISingleFolderWorkspaceIdentifier, IWorkspaceIdentifier } from 'vs/platform/workspace/common/workspace';
import { ITextResourcePropertiesService } from 'vs/editor/common/services/textResourceConfiguration';
import { InMemoryStorageService, WillSaveStateReason } from 'vs/platform/storage/common/storage';
import { IWorkingCopy, IWorkingCopyBackup, WorkingCopyCapabilities } from 'vs/workbench/services/workingCopy/common/workingCopy';
import { NullExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { IWorkingCopyFileService, IWorkingCopyFileOperationParticipant, WorkingCopyFileEvent, IDeleteOperation, ICopyOperation, IMoveOperation, IFileOperationUndoRedoInfo, ICreateFileOperation, ICreateOperation, IStoredFileWorkingCopySaveParticipant } from 'vs/workbench/services/workingCopy/common/workingCopyFileService';
import { IDisposable, Disposable } from 'vs/base/common/lifecycle';
import { IFileStatWithMetadata } from 'vs/platform/files/common/files';
import { ISaveOptions, IRevertOptions, SaveReason } from 'vs/workbench/common/editor';
import { CancellationToken } from 'vs/base/common/cancellation';
import { IActivity, IActivityService } from 'vs/workbench/services/activity/common/activity';
import { IStoredFileWorkingCopySaveEvent } from 'vs/workbench/services/workingCopy/common/storedFileWorkingCopy';
export declare class TestTextResourcePropertiesService implements ITextResourcePropertiesService {
    private readonly configurationService;
    readonly _serviceBrand: undefined;
    constructor(configurationService: IConfigurationService);
    getEOL(resource: URI, language?: string): string;
}
export declare class TestContextService implements IWorkspaceContextService {
    readonly _serviceBrand: undefined;
    private workspace;
    private options;
    private readonly _onDidChangeWorkspaceName;
    get onDidChangeWorkspaceName(): Event<void>;
    private readonly _onWillChangeWorkspaceFolders;
    get onWillChangeWorkspaceFolders(): Event<IWorkspaceFoldersWillChangeEvent>;
    private readonly _onDidChangeWorkspaceFolders;
    get onDidChangeWorkspaceFolders(): Event<IWorkspaceFoldersChangeEvent>;
    private readonly _onDidChangeWorkbenchState;
    get onDidChangeWorkbenchState(): Event<WorkbenchState>;
    constructor(workspace?: import("vs/platform/workspace/test/common/testWorkspace").Workspace, options?: null);
    getFolders(): IWorkspaceFolder[];
    getWorkbenchState(): WorkbenchState;
    getCompleteWorkspace(): Promise<IWorkspace>;
    getWorkspace(): IWorkspace;
    getWorkspaceFolder(resource: URI): IWorkspaceFolder | null;
    setWorkspace(workspace: any): void;
    getOptions(): object;
    updateOptions(): void;
    isInsideWorkspace(resource: URI): boolean;
    toResource(workspaceRelativePath: string): URI;
    isCurrentWorkspace(workspaceIdOrFolder: IWorkspaceIdentifier | ISingleFolderWorkspaceIdentifier | URI): boolean;
}
export declare class TestStorageService extends InMemoryStorageService {
    emitWillSaveState(reason: WillSaveStateReason): void;
}
export declare class TestWorkingCopy extends Disposable implements IWorkingCopy {
    readonly resource: URI;
    readonly typeId: string;
    private readonly _onDidChangeDirty;
    readonly onDidChangeDirty: Event<void>;
    private readonly _onDidChangeContent;
    readonly onDidChangeContent: Event<void>;
    private readonly _onDidSave;
    readonly onDidSave: Event<IStoredFileWorkingCopySaveEvent>;
    readonly capabilities: WorkingCopyCapabilities;
    readonly name: string;
    private dirty;
    constructor(resource: URI, isDirty?: boolean, typeId?: string);
    setDirty(dirty: boolean): void;
    setContent(content: string): void;
    isDirty(): boolean;
    save(options?: ISaveOptions, stat?: IFileStatWithMetadata): Promise<boolean>;
    revert(options?: IRevertOptions): Promise<void>;
    backup(token: CancellationToken): Promise<IWorkingCopyBackup>;
}
export declare function createFileStat(resource: URI, readonly?: boolean): IFileStatWithMetadata;
export declare class TestWorkingCopyFileService implements IWorkingCopyFileService {
    readonly _serviceBrand: undefined;
    onWillRunWorkingCopyFileOperation: Event<WorkingCopyFileEvent>;
    onDidFailWorkingCopyFileOperation: Event<WorkingCopyFileEvent>;
    onDidRunWorkingCopyFileOperation: Event<WorkingCopyFileEvent>;
    addFileOperationParticipant(participant: IWorkingCopyFileOperationParticipant): IDisposable;
    readonly hasSaveParticipants = false;
    addSaveParticipant(participant: IStoredFileWorkingCopySaveParticipant): IDisposable;
    runSaveParticipants(workingCopy: IWorkingCopy, context: {
        reason: SaveReason;
    }, token: CancellationToken): Promise<void>;
    delete(operations: IDeleteOperation[], token: CancellationToken, undoInfo?: IFileOperationUndoRedoInfo): Promise<void>;
    registerWorkingCopyProvider(provider: (resourceOrFolder: URI) => IWorkingCopy[]): IDisposable;
    getDirty(resource: URI): IWorkingCopy[];
    create(operations: ICreateFileOperation[], token: CancellationToken, undoInfo?: IFileOperationUndoRedoInfo): Promise<IFileStatWithMetadata[]>;
    createFolder(operations: ICreateOperation[], token: CancellationToken, undoInfo?: IFileOperationUndoRedoInfo): Promise<IFileStatWithMetadata[]>;
    move(operations: IMoveOperation[], token: CancellationToken, undoInfo?: IFileOperationUndoRedoInfo): Promise<IFileStatWithMetadata[]>;
    copy(operations: ICopyOperation[], token: CancellationToken, undoInfo?: IFileOperationUndoRedoInfo): Promise<IFileStatWithMetadata[]>;
}
export declare function mock<T>(): Ctor<T>;
export interface Ctor<T> {
    new (): T;
}
export declare class TestExtensionService extends NullExtensionService {
}
export declare const TestProductService: {
    version: string;
    date?: string | undefined;
    quality?: string | undefined;
    commit?: string | undefined;
    nameShort: string;
    nameLong: string;
    win32AppUserModelId?: string | undefined;
    win32MutexName?: string | undefined;
    win32RegValueName?: string | undefined;
    applicationName: string;
    embedderIdentifier?: string | undefined;
    urlProtocol: string;
    dataFolderName: string;
    builtInExtensions?: import("../../../base/common/product").IBuiltInExtension[] | undefined;
    downloadUrl?: string | undefined;
    updateUrl?: string | undefined;
    webEndpointUrlTemplate?: string | undefined;
    webviewContentExternalBaseUrlTemplate?: string | undefined;
    target?: string | undefined;
    settingsSearchBuildId?: number | undefined;
    settingsSearchUrl?: string | undefined;
    tasConfig?: {
        endpoint: string;
        telemetryEventName: string;
        featuresTelemetryPropertyName: string;
        assignmentContextTelemetryPropertyName: string;
    } | undefined;
    experimentsUrl?: string | undefined;
    extensionsGallery?: {
        readonly serviceUrl: string;
        readonly servicePPEUrl?: string | undefined;
        readonly searchUrl?: string | undefined;
        readonly itemUrl: string;
        readonly publisherUrl: string;
        readonly resourceUrlTemplate: string;
        readonly controlUrl: string;
        readonly recommendationsUrl: string;
        readonly nlsBaseUrl: string;
    } | undefined;
    extensionTips?: {
        [id: string]: string;
    } | undefined;
    extensionImportantTips?: import("../../../base/common/collections").IStringDictionary<import("../../../base/common/product").ImportantExtensionTip> | undefined;
    configBasedExtensionTips?: {
        [id: string]: import("../../../base/common/product").IConfigBasedExtensionTip;
    } | undefined;
    exeBasedExtensionTips?: {
        [id: string]: import("../../../base/common/product").IExeBasedExtensionTip;
    } | undefined;
    remoteExtensionTips?: {
        [remoteName: string]: import("../../../base/common/product").IRemoteExtensionTip;
    } | undefined;
    extensionKeywords?: {
        [extension: string]: readonly string[];
    } | undefined;
    keymapExtensionTips?: readonly string[] | undefined;
    webExtensionTips?: readonly string[] | undefined;
    languageExtensionTips?: readonly string[] | undefined;
    trustedExtensionUrlPublicKeys?: {
        [id: string]: string[];
    } | undefined;
    trustedExtensionAuthAccess?: readonly string[] | undefined;
    crashReporter?: {
        readonly companyName: string;
        readonly productName: string;
    } | undefined;
    removeTelemetryMachineId?: boolean | undefined;
    enabledTelemetryLevels?: {
        error: boolean;
        usage: boolean;
    } | undefined;
    enableTelemetry?: boolean | undefined;
    openToWelcomeMainPage?: boolean | undefined;
    aiConfig?: {
        readonly ariaKey: string;
    } | undefined;
    sendASmile?: {
        readonly reportIssueUrl: string;
        readonly requestFeatureUrl: string;
    } | undefined;
    documentationUrl?: string | undefined;
    releaseNotesUrl?: string | undefined;
    keyboardShortcutsUrlMac?: string | undefined;
    keyboardShortcutsUrlLinux?: string | undefined;
    keyboardShortcutsUrlWin?: string | undefined;
    introductoryVideosUrl?: string | undefined;
    tipsAndTricksUrl?: string | undefined;
    newsletterSignupUrl?: string | undefined;
    twitterUrl?: string | undefined;
    requestFeatureUrl?: string | undefined;
    reportIssueUrl?: string | undefined;
    reportMarketplaceIssueUrl?: string | undefined;
    licenseUrl?: string | undefined;
    privacyStatementUrl?: string | undefined;
    showTelemetryOptOut?: boolean | undefined;
    serverGreeting?: string[] | undefined;
    serverLicense?: string[] | undefined;
    serverLicensePrompt?: string | undefined;
    serverApplicationName: string;
    serverDataFolderName?: string | undefined;
    tunnelApplicationName?: string | undefined;
    tunnelApplicationConfig?: {
        authenticationProviders: import("../../../base/common/collections").IStringDictionary<{
            scopes: string[];
        }>;
    } | undefined;
    npsSurveyUrl?: string | undefined;
    cesSurveyUrl?: string | undefined;
    surveys?: readonly import("../../../base/common/product").ISurveyData[] | undefined;
    checksums?: {
        [path: string]: string;
    } | undefined;
    checksumFailMoreInfoUrl?: string | undefined;
    appCenter?: import("../../../base/common/product").IAppCenterConfiguration | undefined;
    portable?: string | undefined;
    extensionKind?: {
        readonly [extensionId: string]: ("ui" | "workspace" | "web")[];
    } | undefined;
    extensionPointExtensionKind?: {
        readonly [extensionPointId: string]: ("ui" | "workspace" | "web")[];
    } | undefined;
    extensionSyncedKeys?: {
        readonly [extensionId: string]: string[];
    } | undefined;
    extensionEnabledApiProposals?: {
        readonly [extensionId: string]: string[];
    } | undefined;
    extensionUntrustedWorkspaceSupport?: {
        readonly [extensionId: string]: import("../../../base/common/product").ExtensionUntrustedWorkspaceSupport;
    } | undefined;
    extensionVirtualWorkspacesSupport?: {
        readonly [extensionId: string]: import("../../../base/common/product").ExtensionVirtualWorkspaceSupport;
    } | undefined;
    msftInternalDomains?: string[] | undefined;
    linkProtectionTrustedDomains?: readonly string[] | undefined;
    'configurationSync.store'?: import("../../../base/common/product").ConfigurationSyncStore | undefined;
    'editSessions.store'?: Omit<import("../../../base/common/product").ConfigurationSyncStore, "insidersUrl" | "stableUrl"> | undefined;
    darwinUniversalAssetId?: string | undefined;
    enableSyncingProfiles?: boolean | undefined;
    _serviceBrand: undefined;
};
export declare class TestActivityService implements IActivityService {
    _serviceBrand: undefined;
    showViewContainerActivity(viewContainerId: string, badge: IActivity): IDisposable;
    showViewActivity(viewId: string, badge: IActivity): IDisposable;
    showAccountsActivity(activity: IActivity): IDisposable;
    showGlobalActivity(activity: IActivity): IDisposable;
    dispose(): void;
}

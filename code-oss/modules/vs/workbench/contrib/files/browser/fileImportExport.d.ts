import { IConfirmation, IDialogService, IFileDialogService } from 'vs/platform/dialogs/common/dialogs';
import { IFileService } from 'vs/platform/files/common/files';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { IProgressService } from 'vs/platform/progress/common/progress';
import { IExplorerService } from 'vs/workbench/contrib/files/browser/files';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { ExplorerItem } from 'vs/workbench/contrib/files/common/explorerModel';
import { URI } from 'vs/base/common/uri';
import { IHostService } from 'vs/workbench/services/host/browser/host';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { IWorkspaceEditingService } from 'vs/workbench/services/workspaces/common/workspaceEditing';
import { ILogService } from 'vs/platform/log/common/log';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IStorageService } from 'vs/platform/storage/common/storage';
export declare class BrowserFileUpload {
    private readonly progressService;
    private readonly dialogService;
    private readonly explorerService;
    private readonly editorService;
    private readonly fileService;
    private static readonly MAX_PARALLEL_UPLOADS;
    constructor(progressService: IProgressService, dialogService: IDialogService, explorerService: IExplorerService, editorService: IEditorService, fileService: IFileService);
    upload(target: ExplorerItem, source: DragEvent | FileList): Promise<void>;
    private toTransfer;
    private doUpload;
    private doUploadEntry;
    private doUploadFileBuffered;
    private doUploadFileUnbuffered;
}
export declare class ExternalFileImport {
    private readonly fileService;
    private readonly hostService;
    private readonly contextService;
    private readonly configurationService;
    private readonly dialogService;
    private readonly workspaceEditingService;
    private readonly explorerService;
    private readonly editorService;
    private readonly progressService;
    private readonly notificationService;
    private readonly instantiationService;
    constructor(fileService: IFileService, hostService: IHostService, contextService: IWorkspaceContextService, configurationService: IConfigurationService, dialogService: IDialogService, workspaceEditingService: IWorkspaceEditingService, explorerService: IExplorerService, editorService: IEditorService, progressService: IProgressService, notificationService: INotificationService, instantiationService: IInstantiationService);
    import(target: ExplorerItem, source: DragEvent): Promise<void>;
    private doImport;
    private importResources;
}
export declare class FileDownload {
    private readonly fileService;
    private readonly explorerService;
    private readonly progressService;
    private readonly logService;
    private readonly fileDialogService;
    private readonly storageService;
    private static readonly LAST_USED_DOWNLOAD_PATH_STORAGE_KEY;
    constructor(fileService: IFileService, explorerService: IExplorerService, progressService: IProgressService, logService: ILogService, fileDialogService: IFileDialogService, storageService: IStorageService);
    download(source: ExplorerItem[]): Promise<void>;
    private doDownload;
    private doDownloadBrowser;
    private downloadFileBufferedBrowser;
    private downloadFileUnbufferedBrowser;
    private downloadFileBrowser;
    private downloadFolderBrowser;
    private reportProgress;
    private doDownloadNative;
}
export declare function getFileOverwriteConfirm(name: string): IConfirmation;
export declare function getMultipleFilesOverwriteConfirm(files: URI[]): IConfirmation;

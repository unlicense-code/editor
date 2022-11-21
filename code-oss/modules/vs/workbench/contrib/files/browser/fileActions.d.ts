import { OperatingSystem } from 'vs/base/common/platform';
import { URI } from 'vs/base/common/uri';
import { Action } from 'vs/base/common/actions';
import { IFileService } from 'vs/platform/files/common/files';
import { ServicesAccessor } from 'vs/platform/instantiation/common/instantiation';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { RawContextKey } from 'vs/platform/contextkey/common/contextkey';
import { IDialogService } from 'vs/platform/dialogs/common/dialogs';
import { INotificationService, Severity } from 'vs/platform/notification/common/notification';
import { ExplorerItem } from 'vs/workbench/contrib/files/common/explorerModel';
import { IWorkingCopyService } from 'vs/workbench/services/workingCopy/common/workingCopyService';
import { IExplorerService } from 'vs/workbench/contrib/files/browser/files';
import { IPathService } from 'vs/workbench/services/path/common/pathService';
import { Action2 } from 'vs/platform/actions/common/actions';
export declare const NEW_FILE_COMMAND_ID = "explorer.newFile";
export declare const NEW_FILE_LABEL: string;
export declare const NEW_FOLDER_COMMAND_ID = "explorer.newFolder";
export declare const NEW_FOLDER_LABEL: string;
export declare const TRIGGER_RENAME_LABEL: string;
export declare const MOVE_FILE_TO_TRASH_LABEL: string;
export declare const COPY_FILE_LABEL: string;
export declare const PASTE_FILE_LABEL: string;
export declare const FileCopiedContext: RawContextKey<boolean>;
export declare const DOWNLOAD_COMMAND_ID = "explorer.download";
export declare const DOWNLOAD_LABEL: string;
export declare const UPLOAD_COMMAND_ID = "explorer.upload";
export declare const UPLOAD_LABEL: string;
export declare const fileCategory: {
    value: string;
    original: string;
};
export declare function findValidPasteFileTarget(explorerService: IExplorerService, fileService: IFileService, dialogService: IDialogService, targetFolder: ExplorerItem, fileToPaste: {
    resource: URI;
    isDirectory?: boolean;
    allowOverwrite: boolean;
}, incrementalNaming: 'simple' | 'smart' | 'disabled'): Promise<URI | undefined>;
export declare function incrementFileName(name: string, isFolder: boolean, incrementalNaming: 'simple' | 'smart'): string;
export declare class GlobalCompareResourcesAction extends Action2 {
    static readonly ID = "workbench.files.action.compareFileWith";
    static readonly LABEL: string;
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class ToggleAutoSaveAction extends Action2 {
    static readonly ID = "workbench.action.toggleAutoSave";
    static readonly LABEL: string;
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare abstract class BaseSaveAllAction extends Action {
    protected commandService: ICommandService;
    private notificationService;
    private readonly workingCopyService;
    private lastDirtyState;
    constructor(id: string, label: string, commandService: ICommandService, notificationService: INotificationService, workingCopyService: IWorkingCopyService);
    protected abstract doRun(context: unknown): Promise<void>;
    private registerListeners;
    private updateEnablement;
    run(context?: unknown): Promise<void>;
}
export declare class SaveAllInGroupAction extends BaseSaveAllAction {
    static readonly ID = "workbench.files.action.saveAllInGroup";
    static readonly LABEL: string;
    get class(): string;
    protected doRun(context: unknown): Promise<void>;
}
export declare class CloseGroupAction extends Action {
    private readonly commandService;
    static readonly ID = "workbench.files.action.closeGroup";
    static readonly LABEL: string;
    constructor(id: string, label: string, commandService: ICommandService);
    run(context?: unknown): Promise<void>;
}
export declare class FocusFilesExplorer extends Action2 {
    static readonly ID = "workbench.files.action.focusFilesExplorer";
    static readonly LABEL: string;
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class ShowActiveFileInExplorer extends Action2 {
    static readonly ID = "workbench.files.action.showActiveFileInExplorer";
    static readonly LABEL: string;
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class ShowOpenedFileInNewWindow extends Action2 {
    static readonly ID = "workbench.action.files.showOpenedFileInNewWindow";
    static readonly LABEL: string;
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare function validateFileName(pathService: IPathService, item: ExplorerItem, name: string, os: OperatingSystem): {
    content: string;
    severity: Severity;
} | null;
export declare class CompareWithClipboardAction extends Action2 {
    static readonly ID = "workbench.files.action.compareWithClipboard";
    static readonly LABEL: string;
    private registrationDisposal;
    private static SCHEME_COUNTER;
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
    dispose(): void;
}
export declare const renameHandler: (accessor: ServicesAccessor) => Promise<void>;
export declare const moveFileToTrashHandler: (accessor: ServicesAccessor) => Promise<void>;
export declare const deleteFileHandler: (accessor: ServicesAccessor) => Promise<void>;
export declare const copyFileHandler: (accessor: ServicesAccessor) => Promise<void>;
export declare const cutFileHandler: (accessor: ServicesAccessor) => Promise<void>;
export declare const pasteFileHandler: (accessor: ServicesAccessor) => Promise<void>;
export declare const openFilePreserveFocusHandler: (accessor: ServicesAccessor) => Promise<void>;

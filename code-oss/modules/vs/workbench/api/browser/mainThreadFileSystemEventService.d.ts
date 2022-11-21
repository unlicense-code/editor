import { IFileService } from 'vs/platform/files/common/files';
import { IExtHostContext } from 'vs/workbench/services/extensions/common/extHostCustomers';
import { IWorkingCopyFileService } from 'vs/workbench/services/workingCopy/common/workingCopyFileService';
import { IBulkEditService } from 'vs/editor/browser/services/bulkEditService';
import { IProgressService } from 'vs/platform/progress/common/progress';
import { IDialogService } from 'vs/platform/dialogs/common/dialogs';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { ILogService } from 'vs/platform/log/common/log';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
export declare class MainThreadFileSystemEventService {
    static readonly MementoKeyAdditionalEdits = "file.particpants.additionalEdits";
    private readonly _listener;
    constructor(extHostContext: IExtHostContext, fileService: IFileService, workingCopyFileService: IWorkingCopyFileService, bulkEditService: IBulkEditService, progressService: IProgressService, dialogService: IDialogService, storageService: IStorageService, logService: ILogService, envService: IEnvironmentService, uriIdentService: IUriIdentityService);
    dispose(): void;
}

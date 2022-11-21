import { CancellationToken } from 'vs/base/common/cancellation';
import { ILogService } from 'vs/platform/log/common/log';
import { IProgressService } from 'vs/platform/progress/common/progress';
import { SaveReason } from 'vs/workbench/common/editor';
import { IDisposable, Disposable } from 'vs/base/common/lifecycle';
import { IStoredFileWorkingCopySaveParticipant } from 'vs/workbench/services/workingCopy/common/workingCopyFileService';
import { IStoredFileWorkingCopy, IStoredFileWorkingCopyModel } from 'vs/workbench/services/workingCopy/common/storedFileWorkingCopy';
export declare class StoredFileWorkingCopySaveParticipant extends Disposable {
    private readonly progressService;
    private readonly logService;
    private readonly saveParticipants;
    get length(): number;
    constructor(progressService: IProgressService, logService: ILogService);
    addSaveParticipant(participant: IStoredFileWorkingCopySaveParticipant): IDisposable;
    participate(workingCopy: IStoredFileWorkingCopy<IStoredFileWorkingCopyModel>, context: {
        reason: SaveReason;
    }, token: CancellationToken): Promise<void>;
    dispose(): void;
}

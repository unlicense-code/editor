import { CancellationToken } from 'vs/base/common/cancellation';
import { ILogService } from 'vs/platform/log/common/log';
import { IProgressService } from 'vs/platform/progress/common/progress';
import { ITextFileSaveParticipant, ITextFileEditorModel } from 'vs/workbench/services/textfile/common/textfiles';
import { SaveReason } from 'vs/workbench/common/editor';
import { IDisposable, Disposable } from 'vs/base/common/lifecycle';
export declare class TextFileSaveParticipant extends Disposable {
    private readonly progressService;
    private readonly logService;
    private readonly saveParticipants;
    constructor(progressService: IProgressService, logService: ILogService);
    addSaveParticipant(participant: ITextFileSaveParticipant): IDisposable;
    participate(model: ITextFileEditorModel, context: {
        reason: SaveReason;
    }, token: CancellationToken): Promise<void>;
    dispose(): void;
}

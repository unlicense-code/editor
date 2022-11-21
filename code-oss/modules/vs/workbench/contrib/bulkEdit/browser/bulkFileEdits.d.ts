import { IProgress } from 'vs/platform/progress/common/progress';
import { IUndoRedoService, UndoRedoGroup, UndoRedoSource } from 'vs/platform/undoRedo/common/undoRedo';
import { URI } from 'vs/base/common/uri';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ResourceFileEdit } from 'vs/editor/browser/services/bulkEditService';
import { CancellationToken } from 'vs/base/common/cancellation';
export declare class BulkFileEdits {
    private readonly _label;
    private readonly _code;
    private readonly _undoRedoGroup;
    private readonly _undoRedoSource;
    private readonly _confirmBeforeUndo;
    private readonly _progress;
    private readonly _token;
    private readonly _edits;
    private readonly _instaService;
    private readonly _undoRedoService;
    constructor(_label: string, _code: string, _undoRedoGroup: UndoRedoGroup, _undoRedoSource: UndoRedoSource | undefined, _confirmBeforeUndo: boolean, _progress: IProgress<void>, _token: CancellationToken, _edits: ResourceFileEdit[], _instaService: IInstantiationService, _undoRedoService: IUndoRedoService);
    apply(): Promise<readonly URI[]>;
}

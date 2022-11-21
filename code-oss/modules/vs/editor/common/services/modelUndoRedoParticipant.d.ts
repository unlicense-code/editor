import { IModelService } from 'vs/editor/common/services/model';
import { ITextModelService } from 'vs/editor/common/services/resolverService';
import { Disposable, IDisposable } from 'vs/base/common/lifecycle';
import { IUndoRedoService } from 'vs/platform/undoRedo/common/undoRedo';
import { IUndoRedoDelegate, MultiModelEditStackElement } from 'vs/editor/common/model/editStack';
export declare class ModelUndoRedoParticipant extends Disposable implements IUndoRedoDelegate {
    private readonly _modelService;
    private readonly _textModelService;
    private readonly _undoRedoService;
    constructor(_modelService: IModelService, _textModelService: ITextModelService, _undoRedoService: IUndoRedoService);
    prepareUndoRedo(element: MultiModelEditStackElement): IDisposable | Promise<IDisposable>;
}

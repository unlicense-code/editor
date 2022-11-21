import { Disposable } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
import { INotebookDiffResult } from 'vs/workbench/contrib/notebook/common/notebookCommon';
import { INotebookService } from 'vs/workbench/contrib/notebook/common/notebookService';
import { INotebookEditorWorkerService } from 'vs/workbench/contrib/notebook/common/services/notebookWorkerService';
export declare class NotebookEditorWorkerServiceImpl extends Disposable implements INotebookEditorWorkerService {
    readonly _serviceBrand: undefined;
    private readonly _workerManager;
    constructor(notebookService: INotebookService);
    canComputeDiff(original: URI, modified: URI): boolean;
    computeDiff(original: URI, modified: URI): Promise<INotebookDiffResult>;
}

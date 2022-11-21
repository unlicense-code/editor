import { Event } from 'vs/base/common/event';
import { IDisposable } from 'vs/base/common/lifecycle';
import { IDocumentDiff, IDocumentDiffProvider, IDocumentDiffProviderOptions } from 'vs/editor/common/diff/documentDiffProvider';
import { ITextModel } from 'vs/editor/common/model';
import { IEditorWorkerService } from 'vs/editor/common/services/editorWorker';
export declare class WorkerBasedDocumentDiffProvider implements IDocumentDiffProvider, IDisposable {
    private readonly editorWorkerService;
    private onDidChangeEventEmitter;
    readonly onDidChange: Event<void>;
    private diffAlgorithm;
    private diffAlgorithmOnDidChangeSubscription;
    constructor(options: IWorkerBasedDocumentDiffProviderOptions, editorWorkerService: IEditorWorkerService);
    dispose(): void;
    computeDiff(original: ITextModel, modified: ITextModel, options: IDocumentDiffProviderOptions): Promise<IDocumentDiff>;
    setOptions(newOptions: IWorkerBasedDocumentDiffProviderOptions): void;
}
interface IWorkerBasedDocumentDiffProviderOptions {
    readonly diffAlgorithm?: 'smart' | 'experimental' | IDocumentDiffProvider;
}
export {};

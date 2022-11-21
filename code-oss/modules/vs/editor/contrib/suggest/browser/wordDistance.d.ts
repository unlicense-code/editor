import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
import { IPosition } from 'vs/editor/common/core/position';
import { CompletionItem } from 'vs/editor/common/languages';
import { IEditorWorkerService } from 'vs/editor/common/services/editorWorker';
export declare abstract class WordDistance {
    static readonly None: {
        distance(): number;
    };
    static create(service: IEditorWorkerService, editor: ICodeEditor): Promise<WordDistance>;
    abstract distance(anchor: IPosition, suggestion: CompletionItem): number;
}

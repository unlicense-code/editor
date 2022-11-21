import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
import { Position } from 'vs/editor/common/core/position';
import { ITextModel } from 'vs/editor/common/model';
import { ServicesAccessor } from 'vs/platform/instantiation/common/instantiation';
import { SnippetEditorAction } from 'vs/workbench/contrib/snippets/browser/commands/abstractSnippetsActions';
import { Snippet } from 'vs/workbench/contrib/snippets/browser/snippetsFile';
import { ISnippetsService } from '../snippets';
export declare function getSurroundableSnippets(snippetsService: ISnippetsService, model: ITextModel, position: Position, includeDisabledSnippets: boolean): Promise<Snippet[]>;
export declare class SurroundWithSnippetEditorAction extends SnippetEditorAction {
    static readonly options: {
        id: string;
        title: {
            value: string;
            original: string;
        };
    };
    constructor();
    runEditorCommand(accessor: ServicesAccessor, editor: ICodeEditor): Promise<void>;
}

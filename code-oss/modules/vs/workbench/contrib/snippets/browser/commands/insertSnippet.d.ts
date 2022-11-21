import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
import { ServicesAccessor } from 'vs/editor/browser/editorExtensions';
import { SnippetEditorAction } from 'vs/workbench/contrib/snippets/browser/commands/abstractSnippetsActions';
export declare class InsertSnippetAction extends SnippetEditorAction {
    constructor();
    runEditorCommand(accessor: ServicesAccessor, editor: ICodeEditor, args: any[]): Promise<void>;
}

import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
import { EditorAction } from 'vs/editor/browser/editorExtensions';
import { ServicesAccessor } from 'vs/platform/instantiation/common/instantiation';
export declare class RunToCursorAction extends EditorAction {
    static readonly ID = "editor.debug.action.runToCursor";
    static readonly LABEL: string;
    constructor();
    run(accessor: ServicesAccessor, editor: ICodeEditor): Promise<void>;
}
export declare class SelectionToReplAction extends EditorAction {
    static readonly ID = "editor.debug.action.selectionToRepl";
    static readonly LABEL: string;
    constructor();
    run(accessor: ServicesAccessor, editor: ICodeEditor): Promise<void>;
}
export declare class SelectionToWatchExpressionsAction extends EditorAction {
    static readonly ID = "editor.debug.action.selectionToWatch";
    static readonly LABEL: string;
    constructor();
    run(accessor: ServicesAccessor, editor: ICodeEditor): Promise<void>;
}

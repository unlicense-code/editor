import { URI } from 'vs/base/common/uri';
import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
import { EditorAction, ServicesAccessor } from 'vs/editor/browser/editorExtensions';
import { IPosition, Position } from 'vs/editor/common/core/position';
import { ITextModel } from 'vs/editor/common/model';
import { Rejection, RenameProvider, WorkspaceEdit } from 'vs/editor/common/languages';
import { LanguageFeatureRegistry } from 'vs/editor/common/languageFeatureRegistry';
export declare function rename(registry: LanguageFeatureRegistry<RenameProvider>, model: ITextModel, position: Position, newName: string): Promise<WorkspaceEdit & Rejection>;
export declare class RenameAction extends EditorAction {
    constructor();
    runCommand(accessor: ServicesAccessor, args: [URI, IPosition]): void | Promise<void>;
    run(accessor: ServicesAccessor, editor: ICodeEditor): Promise<void>;
}

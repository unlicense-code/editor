import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IEditorSerializer } from 'vs/workbench/common/editor';
import { EditorInput } from 'vs/workbench/common/editor/editorInput';
import { ITerminalEditorService } from 'vs/workbench/contrib/terminal/browser/terminal';
import { TerminalEditorInput } from 'vs/workbench/contrib/terminal/browser/terminalEditorInput';
export declare class TerminalInputSerializer implements IEditorSerializer {
    private readonly _terminalEditorService;
    constructor(_terminalEditorService: ITerminalEditorService);
    canSerialize(editorInput: TerminalEditorInput): boolean;
    serialize(editorInput: TerminalEditorInput): string | undefined;
    deserialize(instantiationService: IInstantiationService, serializedEditorInput: string): EditorInput | undefined;
    private _toJson;
}

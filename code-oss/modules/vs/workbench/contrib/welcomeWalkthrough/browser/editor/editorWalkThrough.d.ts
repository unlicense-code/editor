import 'vs/workbench/contrib/welcomeWalkthrough/browser/editor/vs_code_editor_walkthrough';
import { IInstantiationService, ServicesAccessor } from 'vs/platform/instantiation/common/instantiation';
import { WalkThroughInput } from 'vs/workbench/contrib/welcomeWalkthrough/browser/walkThroughInput';
import { IEditorSerializer } from 'vs/workbench/common/editor';
import { EditorInput } from 'vs/workbench/common/editor/editorInput';
import { Action2 } from 'vs/platform/actions/common/actions';
export declare class EditorWalkThroughAction extends Action2 {
    static readonly ID = "workbench.action.showInteractivePlayground";
    static readonly LABEL: {
        value: string;
        original: string;
    };
    constructor();
    run(serviceAccessor: ServicesAccessor): Promise<void>;
}
export declare class EditorWalkThroughInputSerializer implements IEditorSerializer {
    static readonly ID = "workbench.editors.walkThroughInput";
    canSerialize(editorInput: EditorInput): boolean;
    serialize(editorInput: EditorInput): string;
    deserialize(instantiationService: IInstantiationService): WalkThroughInput;
}

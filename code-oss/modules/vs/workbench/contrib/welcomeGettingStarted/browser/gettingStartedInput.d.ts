import 'vs/css!./media/gettingStarted';
import { EditorInput } from 'vs/workbench/common/editor/editorInput';
import { URI } from 'vs/base/common/uri';
import { IUntypedEditorInput } from 'vs/workbench/common/editor';
export declare const gettingStartedInputTypeId = "workbench.editors.gettingStartedInput";
export declare class GettingStartedInput extends EditorInput {
    static readonly ID = "workbench.editors.gettingStartedInput";
    static readonly RESOURCE: URI;
    get typeId(): string;
    get resource(): URI | undefined;
    matches(other: EditorInput | IUntypedEditorInput): boolean;
    constructor(options: {
        selectedCategory?: string;
        selectedStep?: string;
        showTelemetryNotice?: boolean;
    });
    getName(): string;
    selectedCategory: string | undefined;
    selectedStep: string | undefined;
    showTelemetryNotice: boolean;
}

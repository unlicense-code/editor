import { EditorModel } from 'vs/workbench/common/editor/editorModel';
import { IEditorModel } from 'vs/platform/editor/common/editor';
/**
 * The base editor model for the diff editor. It is made up of two editor models, the original version
 * and the modified version.
 */
export declare class DiffEditorModel extends EditorModel {
    protected readonly _originalModel: IEditorModel | undefined;
    get originalModel(): IEditorModel | undefined;
    protected readonly _modifiedModel: IEditorModel | undefined;
    get modifiedModel(): IEditorModel | undefined;
    constructor(originalModel: IEditorModel | undefined, modifiedModel: IEditorModel | undefined);
    resolve(): Promise<void>;
    isResolved(): boolean;
    dispose(): void;
}

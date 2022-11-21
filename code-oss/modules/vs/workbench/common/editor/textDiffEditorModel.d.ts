import { IDiffEditorModel } from 'vs/editor/common/editorCommon';
import { BaseTextEditorModel } from 'vs/workbench/common/editor/textEditorModel';
import { DiffEditorModel } from 'vs/workbench/common/editor/diffEditorModel';
/**
 * The base text editor model for the diff editor. It is made up of two text editor models, the original version
 * and the modified version.
 */
export declare class TextDiffEditorModel extends DiffEditorModel {
    protected readonly _originalModel: BaseTextEditorModel | undefined;
    get originalModel(): BaseTextEditorModel | undefined;
    protected readonly _modifiedModel: BaseTextEditorModel | undefined;
    get modifiedModel(): BaseTextEditorModel | undefined;
    private _textDiffEditorModel;
    get textDiffEditorModel(): IDiffEditorModel | undefined;
    constructor(originalModel: BaseTextEditorModel, modifiedModel: BaseTextEditorModel);
    resolve(): Promise<void>;
    private updateTextDiffEditorModel;
    isResolved(): boolean;
    isReadonly(): boolean;
    dispose(): void;
}

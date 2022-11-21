import { ICodeEditorService } from 'vs/editor/browser/services/codeEditorService';
import { ITextModel } from 'vs/editor/common/model';
/**
 * State written/read by the toggle word wrap action and associated with a particular model.
 */
export interface IWordWrapTransientState {
    readonly wordWrapOverride: 'on' | 'off';
}
/**
 * Store (in memory) the word wrap state for a particular model.
 */
export declare function writeTransientState(model: ITextModel, state: IWordWrapTransientState | null, codeEditorService: ICodeEditorService): void;
/**
 * Read (in memory) the word wrap state for a particular model.
 */
export declare function readTransientState(model: ITextModel, codeEditorService: ICodeEditorService): IWordWrapTransientState | null;

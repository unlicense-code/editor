import { ISingleEditOperation } from 'vs/editor/common/core/editOperation';
import { TextModel } from 'vs/editor/common/model/textModel';
export declare function testApplyEditsWithSyncedModels(original: string[], edits: ISingleEditOperation[], expected: string[], inputEditsAreInvalid?: boolean): void;
export declare function assertSyncedModels(text: string, callback: (model: TextModel, assertMirrorModels: () => void) => void, setup?: ((model: TextModel) => void) | null): void;

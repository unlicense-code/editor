import { Disposable } from 'vs/base/common/lifecycle';
import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
import { IModelDeltaDecoration } from 'vs/editor/common/model';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IStackFrame } from 'vs/workbench/contrib/debug/common/debug';
export declare const topStackFrameColor: string;
export declare const focusedStackFrameColor: string;
export declare function createDecorationsForStackFrame(stackFrame: IStackFrame, isFocusedSession: boolean, noCharactersBefore: boolean): IModelDeltaDecoration[];
export declare class LazyCallStackEditorContribution extends Disposable {
    constructor(editor: ICodeEditor, instantiationService: IInstantiationService);
}

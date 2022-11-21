import { CancelablePromise } from 'vs/base/common/async';
import { Disposable } from 'vs/base/common/lifecycle';
import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
import { Position } from 'vs/editor/common/core/position';
import { Range } from 'vs/editor/common/core/range';
import { Selection } from 'vs/editor/common/core/selection';
import { LanguageFeatureRegistry } from 'vs/editor/common/languageFeatureRegistry';
import { CodeActionProvider } from 'vs/editor/common/languages';
import { IContextKeyService, RawContextKey } from 'vs/platform/contextkey/common/contextkey';
import { IMarkerService } from 'vs/platform/markers/common/markers';
import { IEditorProgressService } from 'vs/platform/progress/common/progress';
import { CodeActionSet, CodeActionTrigger } from '../common/types';
export declare const SUPPORTED_CODE_ACTIONS: RawContextKey<string>;
export declare namespace CodeActionsState {
    const enum Type {
        Empty = 0,
        Triggered = 1
    }
    const Empty: {
        readonly type: Type.Empty;
    };
    class Triggered {
        readonly trigger: CodeActionTrigger;
        readonly rangeOrSelection: Range | Selection;
        readonly position: Position;
        private readonly _cancellablePromise;
        readonly type = Type.Triggered;
        readonly actions: Promise<CodeActionSet>;
        constructor(trigger: CodeActionTrigger, rangeOrSelection: Range | Selection, position: Position, _cancellablePromise: CancelablePromise<CodeActionSet>);
        cancel(): void;
    }
    type State = typeof Empty | Triggered;
}
export declare class CodeActionModel extends Disposable {
    #private;
    private readonly _editor;
    private readonly _registry;
    private readonly _markerService;
    private readonly _progressService?;
    private readonly _codeActionOracle;
    private _state;
    private readonly _supportedCodeActions;
    private readonly _onDidChangeState;
    readonly onDidChangeState: import("vs/base/common/event").Event<CodeActionsState.State>;
    constructor(_editor: ICodeEditor, _registry: LanguageFeatureRegistry<CodeActionProvider>, _markerService: IMarkerService, contextKeyService: IContextKeyService, _progressService?: IEditorProgressService | undefined);
    dispose(): void;
    private _update;
    trigger(trigger: CodeActionTrigger): void;
    private setState;
}

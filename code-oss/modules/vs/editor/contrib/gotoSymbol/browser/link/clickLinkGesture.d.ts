import { IKeyboardEvent } from 'vs/base/browser/keyboardEvent';
import { Event } from 'vs/base/common/event';
import { KeyCode } from 'vs/base/common/keyCodes';
import { Disposable } from 'vs/base/common/lifecycle';
import { ICodeEditor, IEditorMouseEvent, IMouseTarget } from 'vs/editor/browser/editorBrowser';
/**
 * An event that encapsulates the various trigger modifiers logic needed for go to definition.
 */
export declare class ClickLinkMouseEvent {
    readonly target: IMouseTarget;
    readonly hasTriggerModifier: boolean;
    readonly hasSideBySideModifier: boolean;
    readonly isNoneOrSingleMouseDown: boolean;
    readonly isLeftClick: boolean;
    readonly isMiddleClick: boolean;
    readonly isRightClick: boolean;
    constructor(source: IEditorMouseEvent, opts: ClickLinkOptions);
}
/**
 * An event that encapsulates the various trigger modifiers logic needed for go to definition.
 */
export declare class ClickLinkKeyboardEvent {
    readonly keyCodeIsTriggerKey: boolean;
    readonly keyCodeIsSideBySideKey: boolean;
    readonly hasTriggerModifier: boolean;
    constructor(source: IKeyboardEvent, opts: ClickLinkOptions);
}
export declare type TriggerModifier = 'ctrlKey' | 'shiftKey' | 'altKey' | 'metaKey';
export declare class ClickLinkOptions {
    readonly triggerKey: KeyCode;
    readonly triggerModifier: TriggerModifier;
    readonly triggerSideBySideKey: KeyCode;
    readonly triggerSideBySideModifier: TriggerModifier;
    constructor(triggerKey: KeyCode, triggerModifier: TriggerModifier, triggerSideBySideKey: KeyCode, triggerSideBySideModifier: TriggerModifier);
    equals(other: ClickLinkOptions): boolean;
}
export declare class ClickLinkGesture extends Disposable {
    private readonly _onMouseMoveOrRelevantKeyDown;
    readonly onMouseMoveOrRelevantKeyDown: Event<[ClickLinkMouseEvent, ClickLinkKeyboardEvent | null]>;
    private readonly _onExecute;
    readonly onExecute: Event<ClickLinkMouseEvent>;
    private readonly _onCancel;
    readonly onCancel: Event<void>;
    private readonly _editor;
    private readonly _alwaysFireExecuteOnMouseUp?;
    private _opts;
    private _lastMouseMoveEvent;
    private _hasTriggerKeyOnMouseDown;
    private _lineNumberOnMouseDown;
    constructor(editor: ICodeEditor, alwaysFireOnMouseUp?: boolean);
    private _onDidChangeCursorSelection;
    private _onEditorMouseMove;
    private _onEditorMouseDown;
    private _onEditorMouseUp;
    private _onEditorKeyDown;
    private _onEditorKeyUp;
    private _resetHandler;
}

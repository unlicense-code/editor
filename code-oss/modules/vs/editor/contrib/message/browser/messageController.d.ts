import 'vs/css!./messageController';
import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
import { IPosition } from 'vs/editor/common/core/position';
import { IEditorContribution } from 'vs/editor/common/editorCommon';
import { IContextKeyService, RawContextKey } from 'vs/platform/contextkey/common/contextkey';
export declare class MessageController implements IEditorContribution {
    static readonly ID = "editor.contrib.messageController";
    static readonly MESSAGE_VISIBLE: RawContextKey<boolean>;
    static get(editor: ICodeEditor): MessageController | null;
    private readonly _editor;
    private readonly _visible;
    private readonly _messageWidget;
    private readonly _messageListeners;
    constructor(editor: ICodeEditor, contextKeyService: IContextKeyService);
    dispose(): void;
    isVisible(): boolean | undefined;
    showMessage(message: string, position: IPosition): void;
    closeMessage(): void;
}

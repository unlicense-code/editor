/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Disposable } from 'vs/base/common/lifecycle';
import { registerEditorContribution } from 'vs/editor/browser/editorExtensions';
import { MessageController } from 'vs/editor/contrib/message/browser/messageController';
import * as nls from 'vs/nls';
export class ReadOnlyMessageController extends Disposable {
    editor;
    static ID = 'editor.contrib.readOnlyMessageController';
    constructor(editor) {
        super();
        this.editor = editor;
        this._register(this.editor.onDidAttemptReadOnlyEdit(() => this._onDidAttemptReadOnlyEdit()));
    }
    _onDidAttemptReadOnlyEdit() {
        const messageController = MessageController.get(this.editor);
        if (messageController && this.editor.hasModel()) {
            if (this.editor.isSimpleWidget) {
                messageController.showMessage(nls.localize('editor.simple.readonly', "Cannot edit in read-only input"), this.editor.getPosition());
            }
            else {
                messageController.showMessage(nls.localize('editor.readonly', "Cannot edit in read-only editor"), this.editor.getPosition());
            }
        }
    }
}
registerEditorContribution(ReadOnlyMessageController.ID, ReadOnlyMessageController);

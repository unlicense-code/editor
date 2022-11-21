/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { StopWatch } from 'vs/base/common/stopwatch';
import { EditorAction, registerEditorAction } from 'vs/editor/browser/editorExtensions';
import * as nls from 'vs/nls';
class ForceRetokenizeAction extends EditorAction {
    constructor() {
        super({
            id: 'editor.action.forceRetokenize',
            label: nls.localize('forceRetokenize', "Developer: Force Retokenize"),
            alias: 'Developer: Force Retokenize',
            precondition: undefined
        });
    }
    run(accessor, editor) {
        if (!editor.hasModel()) {
            return;
        }
        const model = editor.getModel();
        model.tokenization.resetTokenization();
        const sw = new StopWatch(true);
        model.tokenization.forceTokenization(model.getLineCount());
        sw.stop();
        console.log(`tokenization took ${sw.elapsed()}`);
    }
}
registerEditorAction(ForceRetokenizeAction);

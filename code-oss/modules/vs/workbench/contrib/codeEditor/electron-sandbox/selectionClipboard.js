/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import * as nls from 'vs/nls';
import { RunOnceScheduler } from 'vs/base/common/async';
import { Disposable } from 'vs/base/common/lifecycle';
import * as platform from 'vs/base/common/platform';
import { registerEditorContribution, EditorAction, registerEditorAction } from 'vs/editor/browser/editorExtensions';
import { Range } from 'vs/editor/common/core/range';
import { IClipboardService } from 'vs/platform/clipboard/common/clipboardService';
import { SelectionClipboardContributionID } from 'vs/workbench/contrib/codeEditor/browser/selectionClipboard';
import { Registry } from 'vs/platform/registry/common/platform';
import { Extensions as WorkbenchExtensions } from 'vs/workbench/common/contributions';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { EditorContextKeys } from 'vs/editor/common/editorContextKeys';
let SelectionClipboard = class SelectionClipboard extends Disposable {
    static SELECTION_LENGTH_LIMIT = 65536;
    constructor(editor, clipboardService) {
        super();
        if (platform.isLinux) {
            let isEnabled = editor.getOption(97 /* EditorOption.selectionClipboard */);
            this._register(editor.onDidChangeConfiguration((e) => {
                if (e.hasChanged(97 /* EditorOption.selectionClipboard */)) {
                    isEnabled = editor.getOption(97 /* EditorOption.selectionClipboard */);
                }
            }));
            const setSelectionToClipboard = this._register(new RunOnceScheduler(() => {
                if (!editor.hasModel()) {
                    return;
                }
                const model = editor.getModel();
                let selections = editor.getSelections();
                selections = selections.slice(0);
                selections.sort(Range.compareRangesUsingStarts);
                let resultLength = 0;
                for (const sel of selections) {
                    if (sel.isEmpty()) {
                        // Only write if all cursors have selection
                        return;
                    }
                    resultLength += model.getValueLengthInRange(sel);
                }
                if (resultLength > SelectionClipboard.SELECTION_LENGTH_LIMIT) {
                    // This is a large selection!
                    // => do not write it to the selection clipboard
                    return;
                }
                const result = [];
                for (const sel of selections) {
                    result.push(model.getValueInRange(sel, 0 /* EndOfLinePreference.TextDefined */));
                }
                const textToCopy = result.join(model.getEOL());
                clipboardService.writeText(textToCopy, 'selection');
            }, 100));
            this._register(editor.onDidChangeCursorSelection((e) => {
                if (!isEnabled) {
                    return;
                }
                if (e.source === 'restoreState') {
                    // do not set selection to clipboard if this selection change
                    // was caused by restoring editors...
                    return;
                }
                setSelectionToClipboard.schedule();
            }));
        }
    }
    dispose() {
        super.dispose();
    }
};
SelectionClipboard = __decorate([
    __param(1, IClipboardService)
], SelectionClipboard);
export { SelectionClipboard };
let SelectionClipboardPastePreventer = class SelectionClipboardPastePreventer {
    constructor(configurationService) {
        if (platform.isLinux) {
            document.addEventListener('mouseup', (e) => {
                if (e.button === 1) {
                    // middle button
                    const config = configurationService.getValue('editor');
                    if (!config.selectionClipboard) {
                        // selection clipboard is disabled
                        // try to stop the upcoming paste
                        e.preventDefault();
                    }
                }
            });
        }
    }
};
SelectionClipboardPastePreventer = __decorate([
    __param(0, IConfigurationService)
], SelectionClipboardPastePreventer);
class PasteSelectionClipboardAction extends EditorAction {
    constructor() {
        super({
            id: 'editor.action.selectionClipboardPaste',
            label: nls.localize('actions.pasteSelectionClipboard', "Paste Selection Clipboard"),
            alias: 'Paste Selection Clipboard',
            precondition: EditorContextKeys.writable
        });
    }
    async run(accessor, editor, args) {
        const clipboardService = accessor.get(IClipboardService);
        // read selection clipboard
        const text = await clipboardService.readText('selection');
        editor.trigger('keyboard', "paste" /* Handler.Paste */, {
            text: text,
            pasteOnNewLine: false,
            multicursorText: null
        });
    }
}
registerEditorContribution(SelectionClipboardContributionID, SelectionClipboard);
Registry.as(WorkbenchExtensions.Workbench).registerWorkbenchContribution(SelectionClipboardPastePreventer, 2 /* LifecyclePhase.Ready */);
if (platform.isLinux) {
    registerEditorAction(PasteSelectionClipboardAction);
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { EditorAction, registerEditorAction } from 'vs/editor/browser/editorExtensions';
import { EditorContextKeys } from 'vs/editor/common/editorContextKeys';
import * as nls from 'vs/nls';
import { ContextKeyExpr } from 'vs/platform/contextkey/common/contextkey';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { INotificationService, Severity } from 'vs/platform/notification/common/notification';
import { VIEWLET_ID } from 'vs/workbench/contrib/extensions/common/extensions';
import { IDialogService } from 'vs/platform/dialogs/common/dialogs';
import { IPaneCompositePartService } from 'vs/workbench/services/panecomposite/browser/panecomposite';
import { ILanguageFeaturesService } from 'vs/editor/common/services/languageFeatures';
async function showExtensionQuery(paneCompositeService, query) {
    const viewlet = await paneCompositeService.openPaneComposite(VIEWLET_ID, 0 /* ViewContainerLocation.Sidebar */, true);
    if (viewlet) {
        (viewlet?.getViewPaneContainer()).search(query);
    }
}
registerEditorAction(class FormatDocumentMultipleAction extends EditorAction {
    constructor() {
        super({
            id: 'editor.action.formatDocument.none',
            label: nls.localize('formatDocument.label.multiple', "Format Document"),
            alias: 'Format Document',
            precondition: ContextKeyExpr.and(EditorContextKeys.writable, EditorContextKeys.hasDocumentFormattingProvider.toNegated()),
            kbOpts: {
                kbExpr: EditorContextKeys.editorTextFocus,
                primary: 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 36 /* KeyCode.KeyF */,
                linux: { primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 39 /* KeyCode.KeyI */ },
                weight: 100 /* KeybindingWeight.EditorContrib */,
            }
        });
    }
    async run(accessor, editor) {
        if (!editor.hasModel()) {
            return;
        }
        const commandService = accessor.get(ICommandService);
        const paneCompositeService = accessor.get(IPaneCompositePartService);
        const notificationService = accessor.get(INotificationService);
        const dialogService = accessor.get(IDialogService);
        const languageFeaturesService = accessor.get(ILanguageFeaturesService);
        const model = editor.getModel();
        const formatterCount = languageFeaturesService.documentFormattingEditProvider.all(model).length;
        if (formatterCount > 1) {
            return commandService.executeCommand('editor.action.formatDocument.multiple');
        }
        else if (formatterCount === 1) {
            return commandService.executeCommand('editor.action.formatDocument');
        }
        else if (model.isTooLargeForSyncing()) {
            notificationService.warn(nls.localize('too.large', "This file cannot be formatted because it is too large"));
        }
        else {
            const langName = model.getLanguageId();
            const message = nls.localize('no.provider', "There is no formatter for '{0}' files installed.", langName);
            const res = await dialogService.show(Severity.Info, message, [nls.localize('install.formatter', "Install Formatter..."), nls.localize('cancel', "Cancel")], { cancelId: 1 });
            if (res.choice !== 1) {
                showExtensionQuery(paneCompositeService, `category:formatters ${langName}`);
            }
        }
    }
});

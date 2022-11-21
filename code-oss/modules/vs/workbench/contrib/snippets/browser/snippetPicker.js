/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as nls from 'vs/nls';
import { ISnippetsService } from 'vs/workbench/contrib/snippets/browser/snippets';
import { IQuickInputService } from 'vs/platform/quickinput/common/quickInput';
import { Codicon } from 'vs/base/common/codicons';
import { Event } from 'vs/base/common/event';
export async function pickSnippet(accessor, languageIdOrSnippets) {
    const snippetService = accessor.get(ISnippetsService);
    const quickInputService = accessor.get(IQuickInputService);
    let snippets;
    if (Array.isArray(languageIdOrSnippets)) {
        snippets = languageIdOrSnippets;
    }
    else {
        snippets = (await snippetService.getSnippets(languageIdOrSnippets, { includeDisabledSnippets: true, includeNoPrefixSnippets: true }));
    }
    snippets.sort((a, b) => a.snippetSource - b.snippetSource);
    const makeSnippetPicks = () => {
        const result = [];
        let prevSnippet;
        for (const snippet of snippets) {
            const pick = {
                label: snippet.prefix || snippet.name,
                detail: snippet.description,
                snippet
            };
            if (!prevSnippet || prevSnippet.snippetSource !== snippet.snippetSource || prevSnippet.source !== snippet.source) {
                let label = '';
                switch (snippet.snippetSource) {
                    case 1 /* SnippetSource.User */:
                        label = nls.localize('sep.userSnippet', "User Snippets");
                        break;
                    case 3 /* SnippetSource.Extension */:
                        label = snippet.source;
                        break;
                    case 2 /* SnippetSource.Workspace */:
                        label = nls.localize('sep.workspaceSnippet', "Workspace Snippets");
                        break;
                }
                result.push({ type: 'separator', label });
            }
            if (snippet.snippetSource === 3 /* SnippetSource.Extension */) {
                const isEnabled = snippetService.isEnabled(snippet);
                if (isEnabled) {
                    pick.buttons = [{
                            iconClass: Codicon.eyeClosed.classNames,
                            tooltip: nls.localize('disableSnippet', 'Hide from IntelliSense')
                        }];
                }
                else {
                    pick.description = nls.localize('isDisabled', "(hidden from IntelliSense)");
                    pick.buttons = [{
                            iconClass: Codicon.eye.classNames,
                            tooltip: nls.localize('enable.snippet', 'Show in IntelliSense')
                        }];
                }
            }
            result.push(pick);
            prevSnippet = snippet;
        }
        return result;
    };
    const picker = quickInputService.createQuickPick();
    picker.placeholder = nls.localize('pick.placeholder', "Select a snippet");
    picker.matchOnDetail = true;
    picker.ignoreFocusOut = false;
    picker.keepScrollPosition = true;
    picker.onDidTriggerItemButton(ctx => {
        const isEnabled = snippetService.isEnabled(ctx.item.snippet);
        snippetService.updateEnablement(ctx.item.snippet, !isEnabled);
        picker.items = makeSnippetPicks();
    });
    picker.items = makeSnippetPicks();
    if (!picker.items.length) {
        picker.validationMessage = nls.localize('pick.noSnippetAvailable', "No snippet available");
    }
    picker.show();
    // wait for an item to be picked or the picker to become hidden
    await Promise.race([Event.toPromise(picker.onDidAccept), Event.toPromise(picker.onDidHide)]);
    const result = picker.selectedItems[0]?.snippet;
    picker.dispose();
    return result;
}

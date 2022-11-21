/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as nls from 'vs/nls';
import * as Constants from 'vs/workbench/contrib/search/common/constants';
import { Action2, MenuId, registerAction2 } from 'vs/platform/actions/common/actions';
import { IQuickInputService } from 'vs/platform/quickinput/common/quickInput';
//#region Actions
registerAction2(class ShowAllSymbolsAction extends Action2 {
    static ID = 'workbench.action.showAllSymbols';
    static LABEL = nls.localize('showTriggerActions', "Go to Symbol in Workspace...");
    static ALL_SYMBOLS_PREFIX = '#';
    constructor() {
        super({
            id: Constants.ShowAllSymbolsActionId,
            title: {
                value: nls.localize('showTriggerActions', "Go to Symbol in Workspace..."),
                original: 'Go to Symbol in Workspace...',
                mnemonicTitle: nls.localize({ key: 'miGotoSymbolInWorkspace', comment: ['&& denotes a mnemonic'] }, "Go to Symbol in &&Workspace...")
            },
            f1: true,
            keybinding: {
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                primary: 2048 /* KeyMod.CtrlCmd */ | 50 /* KeyCode.KeyT */
            },
            menu: {
                id: MenuId.MenubarGoMenu,
                group: '3_global_nav',
                order: 2
            }
        });
    }
    async run(accessor) {
        accessor.get(IQuickInputService).quickAccess.show(ShowAllSymbolsAction.ALL_SYMBOLS_PREFIX);
    }
});
//#endregion

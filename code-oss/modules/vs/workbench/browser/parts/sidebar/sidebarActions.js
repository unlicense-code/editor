/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import 'vs/css!./media/sidebarpart';
import { localize } from 'vs/nls';
import { Action2, registerAction2 } from 'vs/platform/actions/common/actions';
import { IWorkbenchLayoutService } from 'vs/workbench/services/layout/browser/layoutService';
import { Categories } from 'vs/platform/action/common/actionCommonCategories';
import { IPaneCompositePartService } from 'vs/workbench/services/panecomposite/browser/panecomposite';
export class FocusSideBarAction extends Action2 {
    constructor() {
        super({
            id: 'workbench.action.focusSideBar',
            title: { value: localize('focusSideBar', "Focus into Primary Side Bar"), original: 'Focus into Primary Side Bar' },
            category: Categories.View,
            f1: true,
            keybinding: {
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                when: null,
                primary: 2048 /* KeyMod.CtrlCmd */ | 21 /* KeyCode.Digit0 */
            }
        });
    }
    async run(accessor) {
        const layoutService = accessor.get(IWorkbenchLayoutService);
        const paneCompositeService = accessor.get(IPaneCompositePartService);
        // Show side bar
        if (!layoutService.isVisible("workbench.parts.sidebar" /* Parts.SIDEBAR_PART */)) {
            layoutService.setPartHidden(false, "workbench.parts.sidebar" /* Parts.SIDEBAR_PART */);
            return;
        }
        // Focus into active viewlet
        const viewlet = paneCompositeService.getActivePaneComposite(0 /* ViewContainerLocation.Sidebar */);
        viewlet?.focus();
    }
}
registerAction2(FocusSideBarAction);

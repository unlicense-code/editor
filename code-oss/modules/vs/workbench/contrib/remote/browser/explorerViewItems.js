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
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { attachSelectBoxStyler } from 'vs/platform/theme/common/styler';
import { IContextViewService } from 'vs/platform/contextview/browser/contextView';
import { IRemoteExplorerService, REMOTE_EXPLORER_TYPE_KEY } from 'vs/workbench/services/remote/common/remoteExplorerService';
import { isStringArray } from 'vs/base/common/types';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { ContextKeyExpr } from 'vs/platform/contextkey/common/contextkey';
import { SelectActionViewItem } from 'vs/base/browser/ui/actionbar/actionViewItems';
import { Action2, MenuId } from 'vs/platform/actions/common/actions';
import { VIEWLET_ID } from 'vs/workbench/contrib/remote/browser/remoteExplorer';
let SwitchRemoteViewItem = class SwitchRemoteViewItem extends SelectActionViewItem {
    optionsItems;
    remoteExplorerService;
    environmentService;
    storageService;
    constructor(action, optionsItems, themeService, contextViewService, remoteExplorerService, environmentService, storageService) {
        super(null, action, optionsItems, 0, contextViewService, { ariaLabel: nls.localize('remotes', 'Switch Remote') });
        this.optionsItems = optionsItems;
        this.remoteExplorerService = remoteExplorerService;
        this.environmentService = environmentService;
        this.storageService = storageService;
        this._register(attachSelectBoxStyler(this.selectBox, themeService));
    }
    setSelectionForConnection() {
        let isSetForConnection = false;
        if (this.optionsItems.length > 0) {
            let index = 0;
            const remoteAuthority = this.environmentService.remoteAuthority;
            isSetForConnection = true;
            const explorerType = remoteAuthority ? [remoteAuthority.split('+')[0]] :
                this.storageService.get(REMOTE_EXPLORER_TYPE_KEY, 1 /* StorageScope.WORKSPACE */)?.split(',') ?? this.storageService.get(REMOTE_EXPLORER_TYPE_KEY, 0 /* StorageScope.PROFILE */)?.split(',');
            if (explorerType !== undefined) {
                index = this.getOptionIndexForExplorerType(explorerType);
            }
            this.select(index);
            this.remoteExplorerService.targetType = this.optionsItems[index].authority;
        }
        return isSetForConnection;
    }
    setSelection() {
        const index = this.getOptionIndexForExplorerType(this.remoteExplorerService.targetType);
        this.select(index);
    }
    getOptionIndexForExplorerType(explorerType) {
        let index = 0;
        for (let optionIterator = 0; (optionIterator < this.optionsItems.length) && (index === 0); optionIterator++) {
            for (let authorityIterator = 0; authorityIterator < this.optionsItems[optionIterator].authority.length; authorityIterator++) {
                for (let i = 0; i < explorerType.length; i++) {
                    if (this.optionsItems[optionIterator].authority[authorityIterator] === explorerType[i]) {
                        index = optionIterator;
                        break;
                    }
                }
            }
        }
        return index;
    }
    render(container) {
        if (this.optionsItems.length > 1) {
            super.render(container);
            container.classList.add('switch-remote');
        }
    }
    getActionContext(_, index) {
        return this.optionsItems[index];
    }
    static createOptionItems(views, contextKeyService) {
        const options = [];
        views.forEach(view => {
            if (view.group && view.group.startsWith('targets') && view.remoteAuthority && (!view.when || contextKeyService.contextMatchesRules(view.when))) {
                options.push({ text: view.name, authority: isStringArray(view.remoteAuthority) ? view.remoteAuthority : [view.remoteAuthority] });
            }
        });
        return options;
    }
};
SwitchRemoteViewItem = __decorate([
    __param(2, IThemeService),
    __param(3, IContextViewService),
    __param(4, IRemoteExplorerService),
    __param(5, IWorkbenchEnvironmentService),
    __param(6, IStorageService)
], SwitchRemoteViewItem);
export { SwitchRemoteViewItem };
export class SwitchRemoteAction extends Action2 {
    static ID = 'remote.explorer.switch';
    static LABEL = nls.localize('remote.explorer.switch', "Switch Remote");
    constructor() {
        super({
            id: SwitchRemoteAction.ID,
            title: SwitchRemoteAction.LABEL,
            menu: [{
                    id: MenuId.ViewContainerTitle,
                    when: ContextKeyExpr.equals('viewContainer', VIEWLET_ID),
                    group: 'navigation',
                    order: 1
                }],
        });
    }
    async run(accessor, args) {
        accessor.get(IRemoteExplorerService).targetType = args.authority;
    }
}

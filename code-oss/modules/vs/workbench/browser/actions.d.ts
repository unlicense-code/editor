import { IAction } from 'vs/base/common/actions';
import { Disposable } from 'vs/base/common/lifecycle';
import { Event } from 'vs/base/common/event';
import { MenuId, IMenuService, IMenuActionOptions } from 'vs/platform/actions/common/actions';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
export declare class CompositeMenuActions extends Disposable {
    readonly menuId: MenuId;
    private readonly contextMenuId;
    private readonly options;
    private readonly contextKeyService;
    private readonly menuService;
    private readonly menuActions;
    private _onDidChange;
    readonly onDidChange: Event<void>;
    constructor(menuId: MenuId, contextMenuId: MenuId | undefined, options: IMenuActionOptions | undefined, contextKeyService: IContextKeyService, menuService: IMenuService);
    getPrimaryActions(): IAction[];
    getSecondaryActions(): IAction[];
    getContextMenuActions(): IAction[];
}

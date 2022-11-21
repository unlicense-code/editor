import { Action, IAction } from 'vs/base/common/actions';
import { UriComponents } from 'vs/base/common/uri';
import { ActionViewItem } from 'vs/base/browser/ui/actionbar/actionViewItems';
export declare class ToggleReactionsAction extends Action {
    static readonly ID = "toolbar.toggle.pickReactions";
    private _menuActions;
    private toggleDropdownMenu;
    constructor(toggleDropdownMenu: () => void, title?: string);
    run(): Promise<any>;
    get menuActions(): IAction[];
    set menuActions(actions: IAction[]);
}
export declare class ReactionActionViewItem extends ActionViewItem {
    constructor(action: ReactionAction);
    protected updateLabel(): void;
}
export declare class ReactionAction extends Action {
    icon?: UriComponents | undefined;
    count?: number | undefined;
    static readonly ID = "toolbar.toggle.reaction";
    constructor(id: string, label?: string, cssClass?: string, enabled?: boolean, actionCallback?: (event?: any) => Promise<any>, icon?: UriComponents | undefined, count?: number | undefined);
}

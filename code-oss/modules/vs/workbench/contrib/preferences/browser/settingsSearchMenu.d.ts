import { DropdownMenuActionViewItem } from 'vs/base/browser/ui/dropdown/dropdownActionViewItem';
import { IAction, IActionRunner } from 'vs/base/common/actions';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { SuggestEnabledInput } from 'vs/workbench/contrib/codeEditor/browser/suggestEnabledInput/suggestEnabledInput';
export declare class SettingsSearchFilterDropdownMenuActionViewItem extends DropdownMenuActionViewItem {
    private readonly searchWidget;
    private readonly suggestController;
    constructor(action: IAction, actionRunner: IActionRunner | undefined, searchWidget: SuggestEnabledInput, contextMenuService: IContextMenuService);
    render(container: HTMLElement): void;
    private doSearchWidgetAction;
    /**
     * The created action appends a query to the search widget search string. It optionally triggers suggestions.
     */
    private createAction;
    /**
     * The created action appends a query to the search widget search string, if the query does not exist.
     * Otherwise, it removes the query from the search widget search string.
     * The action does not trigger suggestions after adding or removing the query.
     */
    private createToggleAction;
    getActions(): IAction[];
}

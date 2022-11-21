import { CancellationToken } from 'vs/base/common/cancellation';
import { DisposableStore } from 'vs/base/common/lifecycle';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { FastAndSlowPicks, IPickerQuickAccessItem, PickerQuickAccessProvider, Picks } from 'vs/platform/quickinput/browser/pickerQuickAccess';
import { IViewsService } from 'vs/workbench/common/views';
import { IDebugService } from 'vs/workbench/contrib/debug/common/debug';
export declare class DebugConsoleQuickAccess extends PickerQuickAccessProvider<IPickerQuickAccessItem> {
    private readonly _debugService;
    private readonly _viewsService;
    private readonly _commandService;
    constructor(_debugService: IDebugService, _viewsService: IViewsService, _commandService: ICommandService);
    protected _getPicks(filter: string, disposables: DisposableStore, token: CancellationToken): Picks<IPickerQuickAccessItem> | Promise<Picks<IPickerQuickAccessItem>> | FastAndSlowPicks<IPickerQuickAccessItem> | null;
    private _createPick;
}

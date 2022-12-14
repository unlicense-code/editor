import { CancellationToken } from 'vs/base/common/cancellation';
import { Disposable, DisposableStore, IDisposable } from 'vs/base/common/lifecycle';
import { IKeyMods, IQuickPickDidAcceptEvent, IQuickPickSeparator } from 'vs/base/parts/quickinput/common/quickInput';
import { IQuickAccessProvider, IQuickAccessProviderRunOptions } from 'vs/platform/quickinput/common/quickAccess';
import { IQuickPick, IQuickPickItem } from 'vs/platform/quickinput/common/quickInput';
export declare enum TriggerAction {
    /**
     * Do nothing after the button was clicked.
     */
    NO_ACTION = 0,
    /**
     * Close the picker.
     */
    CLOSE_PICKER = 1,
    /**
     * Update the results of the picker.
     */
    REFRESH_PICKER = 2,
    /**
     * Remove the item from the picker.
     */
    REMOVE_ITEM = 3
}
export interface IPickerQuickAccessItem extends IQuickPickItem {
    /**
    * A method that will be executed when the pick item is accepted from
    * the picker. The picker will close automatically before running this.
    *
    * @param keyMods the state of modifier keys when the item was accepted.
    * @param event the underlying event that caused the accept to trigger.
    */
    accept?(keyMods: IKeyMods, event: IQuickPickDidAcceptEvent): void;
    /**
     * A method that will be executed when a button of the pick item was
     * clicked on.
     *
     * @param buttonIndex index of the button of the item that
     * was clicked.
     *
     * @param the state of modifier keys when the button was triggered.
     *
     * @returns a value that indicates what should happen after the trigger
     * which can be a `Promise` for long running operations.
     */
    trigger?(buttonIndex: number, keyMods: IKeyMods): TriggerAction | Promise<TriggerAction>;
}
export interface IPickerQuickAccessProviderOptions<T extends IPickerQuickAccessItem> {
    /**
     * Enables support for opening picks in the background via gesture.
     */
    canAcceptInBackground?: boolean;
    /**
     * Enables to show a pick entry when no results are returned from a search.
     */
    noResultsPick?: T;
}
export declare type Pick<T> = T | IQuickPickSeparator;
export declare type PicksWithActive<T> = {
    items: readonly Pick<T>[];
    active?: T;
};
export declare type Picks<T> = readonly Pick<T>[] | PicksWithActive<T>;
export declare type FastAndSlowPicks<T> = {
    picks: Picks<T>;
    additionalPicks: Promise<Picks<T>>;
};
export declare abstract class PickerQuickAccessProvider<T extends IPickerQuickAccessItem> extends Disposable implements IQuickAccessProvider {
    private prefix;
    protected options?: IPickerQuickAccessProviderOptions<T> | undefined;
    private static FAST_PICKS_RACE_DELAY;
    constructor(prefix: string, options?: IPickerQuickAccessProviderOptions<T> | undefined);
    provide(picker: IQuickPick<T>, token: CancellationToken, runOptions?: IQuickAccessProviderRunOptions): IDisposable;
    /**
     * Returns an array of picks and separators as needed. If the picks are resolved
     * long running, the provided cancellation token should be used to cancel the
     * operation when the token signals this.
     *
     * The implementor is responsible for filtering and sorting the picks given the
     * provided `filter`.
     *
     * @param filter a filter to apply to the picks.
     * @param disposables can be used to register disposables that should be cleaned
     * up when the picker closes.
     * @param token for long running tasks, implementors need to check on cancellation
     * through this token.
     * @returns the picks either directly, as promise or combined fast and slow results.
     * Pickers can return `null` to signal that no change in picks is needed.
     */
    protected abstract _getPicks(filter: string, disposables: DisposableStore, token: CancellationToken, runOptions?: IQuickAccessProviderRunOptions): Picks<T> | Promise<Picks<T>> | FastAndSlowPicks<T> | null;
}

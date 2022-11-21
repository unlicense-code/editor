import { Disposable } from 'vs/base/common/lifecycle';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { Event } from 'vs/base/common/event';
export interface CommentsFiltersChangeEvent {
    showResolved?: boolean;
    showUnresolved?: boolean;
}
interface CommentsFiltersOptions {
    showResolved: boolean;
    showUnresolved: boolean;
}
export declare class CommentsFilters extends Disposable {
    private readonly contextKeyService;
    private readonly _onDidChange;
    readonly onDidChange: Event<CommentsFiltersChangeEvent>;
    constructor(options: CommentsFiltersOptions, contextKeyService: IContextKeyService);
    private readonly _showUnresolved;
    get showUnresolved(): boolean;
    set showUnresolved(showUnresolved: boolean);
    private _showResolved;
    get showResolved(): boolean;
    set showResolved(showResolved: boolean);
}
export {};

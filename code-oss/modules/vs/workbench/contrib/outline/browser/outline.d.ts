import { RawContextKey } from 'vs/platform/contextkey/common/contextkey';
import type { IView } from 'vs/workbench/common/views';
export declare const enum OutlineSortOrder {
    ByPosition = 0,
    ByName = 1,
    ByKind = 2
}
export interface IOutlineViewState {
    followCursor: boolean;
    filterOnType: boolean;
    sortBy: OutlineSortOrder;
}
export declare namespace IOutlinePane {
    const Id = "outline";
}
export interface IOutlinePane extends IView {
    outlineViewState: IOutlineViewState;
    collapseAll(): void;
    expandAll(): void;
}
export declare const ctxFollowsCursor: RawContextKey<boolean>;
export declare const ctxFilterOnType: RawContextKey<boolean>;
export declare const ctxSortMode: RawContextKey<OutlineSortOrder>;
export declare const ctxAllCollapsed: RawContextKey<boolean>;

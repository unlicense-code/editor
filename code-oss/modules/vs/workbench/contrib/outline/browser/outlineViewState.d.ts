import { IStorageService } from 'vs/platform/storage/common/storage';
import { IOutlineViewState, OutlineSortOrder } from 'vs/workbench/contrib/outline/browser/outline';
export declare class OutlineViewState implements IOutlineViewState {
    private _followCursor;
    private _filterOnType;
    private _sortBy;
    private readonly _onDidChange;
    readonly onDidChange: import("vs/base/common/event").Event<{
        followCursor?: boolean | undefined;
        sortBy?: boolean | undefined;
        filterOnType?: boolean | undefined;
    }>;
    dispose(): void;
    set followCursor(value: boolean);
    get followCursor(): boolean;
    get filterOnType(): boolean;
    set filterOnType(value: boolean);
    set sortBy(value: OutlineSortOrder);
    get sortBy(): OutlineSortOrder;
    persist(storageService: IStorageService): void;
    restore(storageService: IStorageService): void;
}

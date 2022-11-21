import { Disposable } from 'vs/base/common/lifecycle';
import { IStatusbarEntryLocation, StatusbarAlignment } from 'vs/workbench/services/statusbar/browser/statusbar';
import { IStorageService } from 'vs/platform/storage/common/storage';
export interface IStatusbarEntryPriority {
    /**
     * The main priority of the entry that
     * defines the order of appearance:
     * either a number or a reference to
     * another status bar entry to position
     * relative to.
     *
     * May not be unique across all entries.
     */
    readonly primary: number | IStatusbarEntryLocation;
    /**
     * The secondary priority of the entry
     * is used in case the main priority
     * matches another one's priority.
     *
     * Should be unique across all entries.
     */
    readonly secondary: number;
}
export interface IStatusbarViewModelEntry {
    readonly id: string;
    readonly name: string;
    readonly hasCommand: boolean;
    readonly alignment: StatusbarAlignment;
    readonly priority: IStatusbarEntryPriority;
    readonly container: HTMLElement;
    readonly labelContainer: HTMLElement;
}
export declare class StatusbarViewModel extends Disposable {
    private readonly storageService;
    private static readonly HIDDEN_ENTRIES_KEY;
    private readonly _onDidChangeEntryVisibility;
    readonly onDidChangeEntryVisibility: import("vs/base/common/event").Event<{
        id: string;
        visible: boolean;
    }>;
    private _entries;
    get entries(): IStatusbarViewModelEntry[];
    private _lastFocusedEntry;
    get lastFocusedEntry(): IStatusbarViewModelEntry | undefined;
    private hidden;
    constructor(storageService: IStorageService);
    private restoreState;
    private registerListeners;
    private onDidStorageValueChange;
    add(entry: IStatusbarViewModelEntry): void;
    remove(entry: IStatusbarViewModelEntry): void;
    isHidden(id: string): boolean;
    hide(id: string): void;
    show(id: string): void;
    findEntry(container: HTMLElement): IStatusbarViewModelEntry | undefined;
    getEntries(alignment: StatusbarAlignment): IStatusbarViewModelEntry[];
    focusNextEntry(): void;
    focusPreviousEntry(): void;
    isEntryFocused(): boolean;
    private getFocusedEntry;
    private focusEntry;
    private updateVisibility;
    private saveState;
    private sort;
    private markFirstLastVisibleEntry;
    private doMarkFirstLastVisibleStatusbarItem;
}

import { IQuickPick, IQuickPickItem } from 'vs/platform/quickinput/common/quickInput';
import { IStorageService } from 'vs/platform/storage/common/storage';
/**
 * Initially, adds pin buttons to all @param quickPick items.
 * When pinned, a copy of the item will be moved to the end of the pinned list and any duplicate within the pinned list will
 * be removed if @param filterDupliates has been provided. Pin and pinned button events trigger updates to the underlying storage.
 * Shows the quickpick once formatted.
 */
export declare function showWithPinnedItems(storageService: IStorageService, storageKey: string, quickPick: IQuickPick<IQuickPickItem>, filterDuplicates?: boolean): Promise<void>;

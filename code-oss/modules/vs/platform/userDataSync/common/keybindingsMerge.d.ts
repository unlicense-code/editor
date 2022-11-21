import { FormattingOptions } from 'vs/base/common/jsonFormatter';
import { IUserFriendlyKeybinding } from 'vs/platform/keybinding/common/keybinding';
import { IUserDataSyncUtilService } from 'vs/platform/userDataSync/common/userDataSync';
export declare function parseKeybindings(content: string): IUserFriendlyKeybinding[];
export declare function merge(localContent: string, remoteContent: string, baseContent: string | null, formattingOptions: FormattingOptions, userDataSyncUtilService: IUserDataSyncUtilService): Promise<{
    mergeContent: string;
    hasChanges: boolean;
    hasConflicts: boolean;
}>;

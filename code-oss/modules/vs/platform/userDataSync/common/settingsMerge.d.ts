import { FormattingOptions } from 'vs/base/common/jsonFormatter';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IConflictSetting } from 'vs/platform/userDataSync/common/userDataSync';
export interface IMergeResult {
    localContent: string | null;
    remoteContent: string | null;
    hasConflicts: boolean;
    conflictsSettings: IConflictSetting[];
}
export declare function getIgnoredSettings(defaultIgnoredSettings: string[], configurationService: IConfigurationService, settingsContent?: string): string[];
export declare function removeComments(content: string, formattingOptions: FormattingOptions): string;
export declare function updateIgnoredSettings(targetContent: string, sourceContent: string, ignoredSettings: string[], formattingOptions: FormattingOptions): string;
export declare function merge(originalLocalContent: string, originalRemoteContent: string, baseContent: string | null, ignoredSettings: string[], resolvedConflicts: {
    key: string;
    value: any | undefined;
}[], formattingOptions: FormattingOptions): IMergeResult;
export declare function areSame(localContent: string, remoteContent: string, ignoredSettings: string[]): boolean;
export declare function isEmpty(content: string): boolean;
export declare function addSetting(key: string, sourceContent: string, targetContent: string, formattingOptions: FormattingOptions): string;

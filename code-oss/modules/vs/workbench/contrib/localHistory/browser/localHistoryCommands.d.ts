import { URI } from 'vs/base/common/uri';
import { IWorkingCopyHistoryEntry, IWorkingCopyHistoryService } from 'vs/workbench/services/workingCopy/common/workingCopyHistory';
export interface ITimelineCommandArgument {
    uri: URI;
    handle: string;
}
export declare const COMPARE_WITH_FILE_LABEL: {
    value: string;
    original: string;
};
export declare function toDiffEditorArguments(entry: IWorkingCopyHistoryEntry, resource: URI): unknown[];
export declare function toDiffEditorArguments(previousEntry: IWorkingCopyHistoryEntry, entry: IWorkingCopyHistoryEntry): unknown[];
export declare function findLocalHistoryEntry(workingCopyHistoryService: IWorkingCopyHistoryService, descriptor: ITimelineCommandArgument): Promise<{
    entry: IWorkingCopyHistoryEntry | undefined;
    previous: IWorkingCopyHistoryEntry | undefined;
}>;

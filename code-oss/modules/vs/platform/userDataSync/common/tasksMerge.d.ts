export interface IMergeResult {
    localContent: string | null;
    remoteContent: string | null;
    hasConflicts: boolean;
}
export declare function merge(originalLocalContent: string, originalRemoteContent: string, baseContent: string | null): IMergeResult;

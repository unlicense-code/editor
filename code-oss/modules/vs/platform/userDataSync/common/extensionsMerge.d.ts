import { IExtensionIdentifier } from 'vs/platform/extensions/common/extensions';
import { ISyncExtension, ISyncExtensionWithVersion } from 'vs/platform/userDataSync/common/userDataSync';
export interface IMergeResult {
    readonly local: {
        added: ISyncExtension[];
        removed: IExtensionIdentifier[];
        updated: ISyncExtension[];
    };
    readonly remote: {
        added: ISyncExtension[];
        removed: ISyncExtension[];
        updated: ISyncExtension[];
        all: ISyncExtension[];
    } | null;
}
export declare function merge(localExtensions: ISyncExtensionWithVersion[], remoteExtensions: ISyncExtension[] | null, lastSyncExtensions: ISyncExtension[] | null, skippedExtensions: ISyncExtension[], ignoredExtensions: string[], lastSyncBuiltinExtensions: IExtensionIdentifier[]): IMergeResult;

import { URI } from 'vs/base/common/uri';
import { IWorkspaceIdentifier } from 'vs/platform/workspace/common/workspace';
export interface IBaseBackupInfo {
    remoteAuthority?: string;
}
export interface IWorkspaceBackupInfo extends IBaseBackupInfo {
    readonly workspace: IWorkspaceIdentifier;
}
export interface IFolderBackupInfo extends IBaseBackupInfo {
    readonly folderUri: URI;
}
export declare function isFolderBackupInfo(curr: IWorkspaceBackupInfo | IFolderBackupInfo): curr is IFolderBackupInfo;
export declare function isWorkspaceBackupInfo(curr: IWorkspaceBackupInfo | IFolderBackupInfo): curr is IWorkspaceBackupInfo;

import { Event } from 'vs/base/common/event';
import { IExtUri } from 'vs/base/common/resources';
import { URI } from 'vs/base/common/uri';
import { IWorkspaceBackupInfo, IFolderBackupInfo } from 'vs/platform/backup/common/backup';
import { ILogService } from 'vs/platform/log/common/log';
import { IBaseWorkspace, IRawFileWorkspaceFolder, IRawUriWorkspaceFolder, IWorkspaceIdentifier, WorkspaceFolder } from 'vs/platform/workspace/common/workspace';
export declare const IWorkspacesService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IWorkspacesService>;
export interface IWorkspacesService {
    readonly _serviceBrand: undefined;
    enterWorkspace(workspaceUri: URI): Promise<IEnterWorkspaceResult | undefined>;
    createUntitledWorkspace(folders?: IWorkspaceFolderCreationData[], remoteAuthority?: string): Promise<IWorkspaceIdentifier>;
    deleteUntitledWorkspace(workspace: IWorkspaceIdentifier): Promise<void>;
    getWorkspaceIdentifier(workspaceUri: URI): Promise<IWorkspaceIdentifier>;
    readonly onDidChangeRecentlyOpened: Event<void>;
    addRecentlyOpened(recents: IRecent[]): Promise<void>;
    removeRecentlyOpened(workspaces: URI[]): Promise<void>;
    clearRecentlyOpened(): Promise<void>;
    getRecentlyOpened(): Promise<IRecentlyOpened>;
    getDirtyWorkspaces(): Promise<Array<IWorkspaceBackupInfo | IFolderBackupInfo>>;
}
export interface IRecentlyOpened {
    workspaces: Array<IRecentWorkspace | IRecentFolder>;
    files: IRecentFile[];
}
export declare type IRecent = IRecentWorkspace | IRecentFolder | IRecentFile;
export interface IRecentWorkspace {
    readonly workspace: IWorkspaceIdentifier;
    label?: string;
    readonly remoteAuthority?: string;
}
export interface IRecentFolder {
    readonly folderUri: URI;
    label?: string;
    readonly remoteAuthority?: string;
}
export interface IRecentFile {
    readonly fileUri: URI;
    label?: string;
    readonly remoteAuthority?: string;
}
export declare function isRecentWorkspace(curr: IRecent): curr is IRecentWorkspace;
export declare function isRecentFolder(curr: IRecent): curr is IRecentFolder;
export declare function isRecentFile(curr: IRecent): curr is IRecentFile;
export declare function isStoredWorkspaceFolder(obj: unknown): obj is IStoredWorkspaceFolder;
export declare type IStoredWorkspaceFolder = IRawFileWorkspaceFolder | IRawUriWorkspaceFolder;
export interface IStoredWorkspace extends IBaseWorkspace {
    folders: IStoredWorkspaceFolder[];
}
export interface IWorkspaceFolderCreationData {
    readonly uri: URI;
    readonly name?: string;
}
export interface IUntitledWorkspaceInfo {
    readonly workspace: IWorkspaceIdentifier;
    readonly remoteAuthority?: string;
}
export interface IEnterWorkspaceResult {
    readonly workspace: IWorkspaceIdentifier;
    readonly backupPath?: string;
}
/**
 * Given a folder URI and the workspace config folder, computes the `IStoredWorkspaceFolder`
 * using a relative or absolute path or a uri.
 * Undefined is returned if the `folderURI` and the `targetConfigFolderURI` don't have the
 * same schema or authority.
 *
 * @param folderURI a workspace folder
 * @param forceAbsolute if set, keep the path absolute
 * @param folderName a workspace name
 * @param targetConfigFolderURI the folder where the workspace is living in
 */
export declare function getStoredWorkspaceFolder(folderURI: URI, forceAbsolute: boolean, folderName: string | undefined, targetConfigFolderURI: URI, extUri: IExtUri): IStoredWorkspaceFolder;
export declare function toWorkspaceFolders(configuredFolders: IStoredWorkspaceFolder[], workspaceConfigFile: URI, extUri: IExtUri): WorkspaceFolder[];
/**
 * Rewrites the content of a workspace file to be saved at a new location.
 * Throws an exception if file is not a valid workspace file
 */
export declare function rewriteWorkspaceFileForNewLocation(rawWorkspaceContents: string, configPathURI: URI, isFromUntitledWorkspace: boolean, targetConfigPathURI: URI, extUri: IExtUri): string;
export declare type RecentlyOpenedStorageData = object;
export declare function restoreRecentlyOpened(data: RecentlyOpenedStorageData | undefined, logService: ILogService): IRecentlyOpened;
export declare function toStoreData(recents: IRecentlyOpened): RecentlyOpenedStorageData;

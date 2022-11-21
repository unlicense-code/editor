/// <reference types="node" />
import { Stats } from 'fs';
import { URI } from 'vs/base/common/uri';
import { IEmptyWorkspaceIdentifier, ISingleFolderWorkspaceIdentifier, IWorkspaceIdentifier } from 'vs/platform/workspace/common/workspace';
/**
 * Length of workspace identifiers that are not empty. Those are
 * MD5 hashes (128bits / 4 due to hex presentation).
 */
export declare const NON_EMPTY_WORKSPACE_ID_LENGTH: number;
export declare function getWorkspaceIdentifier(configPath: URI): IWorkspaceIdentifier;
export declare function getSingleFolderWorkspaceIdentifier(folderUri: URI): ISingleFolderWorkspaceIdentifier | undefined;
export declare function getSingleFolderWorkspaceIdentifier(folderUri: URI, folderStat: Stats): ISingleFolderWorkspaceIdentifier;
export declare function createEmptyWorkspaceIdentifier(): IEmptyWorkspaceIdentifier;

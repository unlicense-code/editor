import { WorkbenchState, IWorkspace } from 'vs/platform/workspace/common/workspace';
import { URI } from 'vs/base/common/uri';
export declare type Tags = {
    [index: string]: boolean | number | string | undefined;
};
export declare const IWorkspaceTagsService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IWorkspaceTagsService>;
export interface IWorkspaceTagsService {
    readonly _serviceBrand: undefined;
    getTags(): Promise<Tags>;
    /**
     * Returns an id for the workspace, different from the id returned by the context service. A hash based
     * on the folder uri or workspace configuration, not time-based, and undefined for empty workspaces.
     */
    getTelemetryWorkspaceId(workspace: IWorkspace, state: WorkbenchState): Promise<string | undefined>;
    getHashedRemotesFromUri(workspaceUri: URI, stripEndingDotGit?: boolean): Promise<string[]>;
}

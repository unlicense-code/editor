import { WorkbenchState, IWorkspace } from 'vs/platform/workspace/common/workspace';
import { URI } from 'vs/base/common/uri';
import { IWorkspaceTagsService, Tags } from 'vs/workbench/contrib/tags/common/workspaceTags';
export declare class NoOpWorkspaceTagsService implements IWorkspaceTagsService {
    readonly _serviceBrand: undefined;
    getTags(): Promise<Tags>;
    getTelemetryWorkspaceId(workspace: IWorkspace, state: WorkbenchState): Promise<string | undefined>;
    getHashedRemotesFromUri(workspaceUri: URI, stripEndingDotGit?: boolean): Promise<string[]>;
}

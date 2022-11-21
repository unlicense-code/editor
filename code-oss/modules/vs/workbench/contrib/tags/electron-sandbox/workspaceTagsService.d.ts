import { IFileService } from 'vs/platform/files/common/files';
import { IWorkspaceContextService, WorkbenchState, IWorkspace } from 'vs/platform/workspace/common/workspace';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { ITextFileService } from 'vs/workbench/services/textfile/common/textfiles';
import { URI } from 'vs/base/common/uri';
import { IWorkspaceTagsService, Tags } from 'vs/workbench/contrib/tags/common/workspaceTags';
export declare class WorkspaceTagsService implements IWorkspaceTagsService {
    private readonly fileService;
    private readonly contextService;
    private readonly environmentService;
    private readonly textFileService;
    readonly _serviceBrand: undefined;
    private _tags;
    constructor(fileService: IFileService, contextService: IWorkspaceContextService, environmentService: IWorkbenchEnvironmentService, textFileService: ITextFileService);
    getTags(): Promise<Tags>;
    getTelemetryWorkspaceId(workspace: IWorkspace, state: WorkbenchState): Promise<string | undefined>;
    getHashedRemotesFromUri(workspaceUri: URI, stripEndingDotGit?: boolean): Promise<string[]>;
    private resolveWorkspaceTags;
    private processGradleDependencies;
    private tagJavaDependency;
    private searchArray;
}

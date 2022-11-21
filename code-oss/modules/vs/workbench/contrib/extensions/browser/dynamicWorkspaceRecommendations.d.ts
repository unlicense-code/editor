import { IExtensionTipsService } from 'vs/platform/extensionManagement/common/extensionManagement';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { IFileService } from 'vs/platform/files/common/files';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IWorkspaceTagsService } from 'vs/workbench/contrib/tags/common/workspaceTags';
import { ExtensionRecommendations, ExtensionRecommendation } from 'vs/workbench/contrib/extensions/browser/extensionRecommendations';
export declare class DynamicWorkspaceRecommendations extends ExtensionRecommendations {
    private readonly extensionTipsService;
    private readonly workspaceTagsService;
    private readonly contextService;
    private readonly fileService;
    private readonly telemetryService;
    private readonly storageService;
    private _recommendations;
    get recommendations(): ReadonlyArray<ExtensionRecommendation>;
    constructor(extensionTipsService: IExtensionTipsService, workspaceTagsService: IWorkspaceTagsService, contextService: IWorkspaceContextService, fileService: IFileService, telemetryService: ITelemetryService, storageService: IStorageService);
    protected doActivate(): Promise<void>;
    /**
     * Fetch extensions used by others on the same workspace as recommendations
     */
    private fetch;
    private getCachedDynamicWorkspaceRecommendations;
    private toExtensionRecommendation;
}

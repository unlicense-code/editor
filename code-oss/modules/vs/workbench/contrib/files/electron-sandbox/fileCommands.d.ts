import { URI } from 'vs/base/common/uri';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { INativeHostService } from 'vs/platform/native/electron-sandbox/native';
export declare function revealResourcesInOS(resources: URI[], nativeHostService: INativeHostService, workspaceContextService: IWorkspaceContextService): void;

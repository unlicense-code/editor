import { URI } from 'vs/base/common/uri';
import { IWorkspace } from 'vs/platform/workspace/common/workspace';
export declare function isVirtualResource(resource: URI): boolean;
export declare function getVirtualWorkspaceLocation(workspace: IWorkspace): {
    scheme: string;
    authority: string;
} | undefined;
export declare function getVirtualWorkspaceScheme(workspace: IWorkspace): string | undefined;
export declare function getVirtualWorkspaceAuthority(workspace: IWorkspace): string | undefined;
export declare function isVirtualWorkspace(workspace: IWorkspace): boolean;

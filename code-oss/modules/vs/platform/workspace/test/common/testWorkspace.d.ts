import { URI } from 'vs/base/common/uri';
import { Workspace as BaseWorkspace, WorkspaceFolder } from 'vs/platform/workspace/common/workspace';
export declare class Workspace extends BaseWorkspace {
    constructor(id: string, folders?: WorkspaceFolder[], configuration?: URI | null, ignorePathCasing?: (key: URI) => boolean);
}
export declare const TestWorkspace: Workspace;
export declare function testWorkspace(resource: URI): Workspace;

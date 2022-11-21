import { URI } from 'vs/base/common/uri';
import { ICodeWindow } from 'vs/platform/window/electron-main/window';
import { IResolvedWorkspace, IWorkspaceIdentifier } from 'vs/platform/workspace/common/workspace';
export declare function findWindowOnFile(windows: ICodeWindow[], fileUri: URI, localWorkspaceResolver: (workspace: IWorkspaceIdentifier) => Promise<IResolvedWorkspace | undefined>): Promise<ICodeWindow | undefined>;
export declare function findWindowOnWorkspaceOrFolder(windows: ICodeWindow[], folderOrWorkspaceConfigUri: URI): ICodeWindow | undefined;
export declare function findWindowOnExtensionDevelopmentPath(windows: ICodeWindow[], extensionDevelopmentPaths: string[]): ICodeWindow | undefined;

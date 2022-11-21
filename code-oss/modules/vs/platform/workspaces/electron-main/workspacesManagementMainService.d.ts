import { Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
import { IBackupMainService } from 'vs/platform/backup/electron-main/backup';
import { IDialogMainService } from 'vs/platform/dialogs/electron-main/dialogMainService';
import { IEnvironmentMainService } from 'vs/platform/environment/electron-main/environmentMainService';
import { ILogService } from 'vs/platform/log/common/log';
import { IProductService } from 'vs/platform/product/common/productService';
import { IUserDataProfilesMainService } from 'vs/platform/userDataProfile/electron-main/userDataProfile';
import { ICodeWindow } from 'vs/platform/window/electron-main/window';
import { IWorkspaceIdentifier, IResolvedWorkspace } from 'vs/platform/workspace/common/workspace';
import { IEnterWorkspaceResult, IUntitledWorkspaceInfo, IWorkspaceFolderCreationData } from 'vs/platform/workspaces/common/workspaces';
export declare const IWorkspacesManagementMainService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IWorkspacesManagementMainService>;
export interface IWorkspaceEnteredEvent {
    window: ICodeWindow;
    workspace: IWorkspaceIdentifier;
}
export interface IWorkspacesManagementMainService {
    readonly _serviceBrand: undefined;
    readonly onDidDeleteUntitledWorkspace: Event<IWorkspaceIdentifier>;
    readonly onDidEnterWorkspace: Event<IWorkspaceEnteredEvent>;
    enterWorkspace(intoWindow: ICodeWindow, openedWindows: ICodeWindow[], path: URI): Promise<IEnterWorkspaceResult | undefined>;
    createUntitledWorkspace(folders?: IWorkspaceFolderCreationData[], remoteAuthority?: string): Promise<IWorkspaceIdentifier>;
    deleteUntitledWorkspace(workspace: IWorkspaceIdentifier): Promise<void>;
    getUntitledWorkspaces(): IUntitledWorkspaceInfo[];
    isUntitledWorkspace(workspace: IWorkspaceIdentifier): boolean;
    resolveLocalWorkspace(path: URI): Promise<IResolvedWorkspace | undefined>;
    getWorkspaceIdentifier(workspacePath: URI): Promise<IWorkspaceIdentifier>;
}
export declare class WorkspacesManagementMainService extends Disposable implements IWorkspacesManagementMainService {
    private readonly environmentMainService;
    private readonly logService;
    private readonly userDataProfilesMainService;
    private readonly backupMainService;
    private readonly dialogMainService;
    private readonly productService;
    readonly _serviceBrand: undefined;
    private readonly _onDidDeleteUntitledWorkspace;
    readonly onDidDeleteUntitledWorkspace: Event<IWorkspaceIdentifier>;
    private readonly _onDidEnterWorkspace;
    readonly onDidEnterWorkspace: Event<IWorkspaceEnteredEvent>;
    private readonly untitledWorkspacesHome;
    private untitledWorkspaces;
    constructor(environmentMainService: IEnvironmentMainService, logService: ILogService, userDataProfilesMainService: IUserDataProfilesMainService, backupMainService: IBackupMainService, dialogMainService: IDialogMainService, productService: IProductService);
    initialize(): Promise<void>;
    resolveLocalWorkspace(uri: URI): Promise<IResolvedWorkspace | undefined>;
    private doResolveLocalWorkspace;
    private isWorkspacePath;
    private doResolveWorkspace;
    private doParseStoredWorkspace;
    createUntitledWorkspace(folders?: IWorkspaceFolderCreationData[], remoteAuthority?: string): Promise<IWorkspaceIdentifier>;
    private newUntitledWorkspace;
    getWorkspaceIdentifier(configPath: URI): Promise<IWorkspaceIdentifier>;
    isUntitledWorkspace(workspace: IWorkspaceIdentifier): boolean;
    deleteUntitledWorkspace(workspace: IWorkspaceIdentifier): Promise<void>;
    private doDeleteUntitledWorkspace;
    getUntitledWorkspaces(): IUntitledWorkspaceInfo[];
    enterWorkspace(window: ICodeWindow, windows: ICodeWindow[], path: URI): Promise<IEnterWorkspaceResult | undefined>;
    private isValidTargetWorkspacePath;
    private doEnterWorkspace;
}

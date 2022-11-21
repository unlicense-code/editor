import { IDisposable } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
import { IWorkspaceTrustEnablementService, IWorkspaceTrustManagementService, IWorkspaceTrustRequestService, IWorkspaceTrustTransitionParticipant, IWorkspaceTrustUriInfo, WorkspaceTrustRequestOptions, WorkspaceTrustUriResponse } from 'vs/platform/workspace/common/workspaceTrust';
export declare class TestWorkspaceTrustEnablementService implements IWorkspaceTrustEnablementService {
    private isEnabled;
    _serviceBrand: undefined;
    constructor(isEnabled?: boolean);
    isWorkspaceTrustEnabled(): boolean;
}
export declare class TestWorkspaceTrustManagementService implements IWorkspaceTrustManagementService {
    private trusted;
    _serviceBrand: undefined;
    private _onDidChangeTrust;
    onDidChangeTrust: import("vs/base/common/event").Event<boolean>;
    private _onDidChangeTrustedFolders;
    onDidChangeTrustedFolders: import("vs/base/common/event").Event<void>;
    private _onDidInitiateWorkspaceTrustRequestOnStartup;
    onDidInitiateWorkspaceTrustRequestOnStartup: import("vs/base/common/event").Event<void>;
    constructor(trusted?: boolean);
    get acceptsOutOfWorkspaceFiles(): boolean;
    set acceptsOutOfWorkspaceFiles(value: boolean);
    addWorkspaceTrustTransitionParticipant(participant: IWorkspaceTrustTransitionParticipant): IDisposable;
    getTrustedUris(): URI[];
    setParentFolderTrust(trusted: boolean): Promise<void>;
    getUriTrustInfo(uri: URI): Promise<IWorkspaceTrustUriInfo>;
    setTrustedUris(folders: URI[]): Promise<void>;
    setUrisTrust(uris: URI[], trusted: boolean): Promise<void>;
    canSetParentFolderTrust(): boolean;
    canSetWorkspaceTrust(): boolean;
    isWorkspaceTrusted(): boolean;
    isWorkspaceTrustForced(): boolean;
    get workspaceTrustInitialized(): Promise<void>;
    get workspaceResolved(): Promise<void>;
    setWorkspaceTrust(trusted: boolean): Promise<void>;
}
export declare class TestWorkspaceTrustRequestService implements IWorkspaceTrustRequestService {
    private readonly _trusted;
    _serviceBrand: any;
    private readonly _onDidInitiateOpenFilesTrustRequest;
    readonly onDidInitiateOpenFilesTrustRequest: import("vs/base/common/event").Event<void>;
    private readonly _onDidInitiateWorkspaceTrustRequest;
    readonly onDidInitiateWorkspaceTrustRequest: import("vs/base/common/event").Event<WorkspaceTrustRequestOptions>;
    private readonly _onDidInitiateWorkspaceTrustRequestOnStartup;
    readonly onDidInitiateWorkspaceTrustRequestOnStartup: import("vs/base/common/event").Event<void>;
    constructor(_trusted: boolean);
    requestOpenUrisHandler: (uris: URI[]) => Promise<WorkspaceTrustUriResponse>;
    requestOpenFilesTrust(uris: URI[]): Promise<WorkspaceTrustUriResponse>;
    completeOpenFilesTrustRequest(result: WorkspaceTrustUriResponse, saveResponse: boolean): Promise<void>;
    cancelWorkspaceTrustRequest(): void;
    completeWorkspaceTrustRequest(trusted?: boolean): Promise<void>;
    requestWorkspaceTrust(options?: WorkspaceTrustRequestOptions): Promise<boolean>;
    requestWorkspaceTrustOnStartup(): void;
}

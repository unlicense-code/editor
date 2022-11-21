import { CancellationToken, CancellationTokenSource } from 'vs/base/common/cancellation';
import { IDisposable } from 'vs/base/common/lifecycle';
import { IWorkspaceFolder } from 'vs/platform/workspace/common/workspace';
export interface IEditSessionIdentityProvider {
    readonly scheme: string;
    getEditSessionIdentifier(workspaceFolder: IWorkspaceFolder, token: CancellationToken): Promise<string | undefined>;
    provideEditSessionIdentityMatch(workspaceFolder: IWorkspaceFolder, identity1: string, identity2: string, token: CancellationToken): Promise<EditSessionIdentityMatch | undefined>;
}
export declare const IEditSessionIdentityService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IEditSessionIdentityService>;
export interface IEditSessionIdentityService {
    readonly _serviceBrand: undefined;
    registerEditSessionIdentityProvider(provider: IEditSessionIdentityProvider): IDisposable;
    getEditSessionIdentifier(workspaceFolder: IWorkspaceFolder, cancellationTokenSource: CancellationTokenSource): Promise<string | undefined>;
    provideEditSessionIdentityMatch(workspaceFolder: IWorkspaceFolder, identity1: string, identity2: string, cancellationTokenSource: CancellationTokenSource): Promise<EditSessionIdentityMatch | undefined>;
}
export declare enum EditSessionIdentityMatch {
    Complete = 100,
    Partial = 50,
    None = 0
}

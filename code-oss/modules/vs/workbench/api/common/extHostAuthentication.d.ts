import type * as vscode from 'vscode';
import { Event } from 'vs/base/common/event';
import { IMainContext, ExtHostAuthenticationShape } from 'vs/workbench/api/common/extHost.protocol';
import { IExtensionDescription } from 'vs/platform/extensions/common/extensions';
export declare class ExtHostAuthentication implements ExtHostAuthenticationShape {
    private _proxy;
    private _authenticationProviders;
    private _providers;
    private _onDidChangeSessions;
    readonly onDidChangeSessions: Event<vscode.AuthenticationSessionsChangeEvent>;
    private _inFlightRequests;
    constructor(mainContext: IMainContext);
    $setProviders(providers: vscode.AuthenticationProviderInformation[]): Promise<void>;
    getSession(requestingExtension: IExtensionDescription, providerId: string, scopes: readonly string[], options: vscode.AuthenticationGetSessionOptions & ({
        createIfNone: true;
    } | {
        forceNewSession: true;
    } | {
        forceNewSession: {
            detail: string;
        };
    })): Promise<vscode.AuthenticationSession>;
    getSession(requestingExtension: IExtensionDescription, providerId: string, scopes: readonly string[], options: vscode.AuthenticationGetSessionOptions & {
        forceNewSession: true;
    }): Promise<vscode.AuthenticationSession>;
    getSession(requestingExtension: IExtensionDescription, providerId: string, scopes: readonly string[], options: vscode.AuthenticationGetSessionOptions & {
        forceNewSession: {
            detail: string;
        };
    }): Promise<vscode.AuthenticationSession>;
    getSession(requestingExtension: IExtensionDescription, providerId: string, scopes: readonly string[], options: vscode.AuthenticationGetSessionOptions): Promise<vscode.AuthenticationSession | undefined>;
    private _getSession;
    removeSession(providerId: string, sessionId: string): Promise<void>;
    registerAuthenticationProvider(id: string, label: string, provider: vscode.AuthenticationProvider, options?: vscode.AuthenticationProviderOptions): vscode.Disposable;
    $createSession(providerId: string, scopes: string[]): Promise<vscode.AuthenticationSession>;
    $removeSession(providerId: string, sessionId: string): Promise<void>;
    $getSessions(providerId: string, scopes?: string[]): Promise<ReadonlyArray<vscode.AuthenticationSession>>;
    $onDidChangeAuthenticationSessions(id: string, label: string): Promise<void>;
}

import { Event } from 'vs/base/common/event';
export interface AuthenticationSession {
    id: string;
    accessToken: string;
    account: {
        label: string;
        id: string;
    };
    scopes: ReadonlyArray<string>;
    idToken?: string;
}
export interface AuthenticationSessionsChangeEvent {
    added: ReadonlyArray<AuthenticationSession>;
    removed: ReadonlyArray<AuthenticationSession>;
    changed: ReadonlyArray<AuthenticationSession>;
}
export interface AuthenticationProviderInformation {
    id: string;
    label: string;
}
export declare const IAuthenticationService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IAuthenticationService>;
export interface IAuthenticationService {
    readonly _serviceBrand: undefined;
    isAuthenticationProviderRegistered(id: string): boolean;
    getProviderIds(): string[];
    registerAuthenticationProvider(id: string, provider: IAuthenticationProvider): void;
    unregisterAuthenticationProvider(id: string): void;
    isAccessAllowed(providerId: string, accountName: string, extensionId: string): boolean | undefined;
    updateAllowedExtension(providerId: string, accountName: string, extensionId: string, extensionName: string, isAllowed: boolean): void;
    updateSessionPreference(providerId: string, extensionId: string, session: AuthenticationSession): void;
    getSessionPreference(providerId: string, extensionId: string, scopes: string[]): string | undefined;
    removeSessionPreference(providerId: string, extensionId: string, scopes: string[]): void;
    showGetSessionPrompt(providerId: string, accountName: string, extensionId: string, extensionName: string): Promise<boolean>;
    selectSession(providerId: string, extensionId: string, extensionName: string, scopes: string[], possibleSessions: readonly AuthenticationSession[]): Promise<AuthenticationSession>;
    requestSessionAccess(providerId: string, extensionId: string, extensionName: string, scopes: string[], possibleSessions: readonly AuthenticationSession[]): void;
    completeSessionAccessRequest(providerId: string, extensionId: string, extensionName: string, scopes: string[]): Promise<void>;
    requestNewSession(providerId: string, scopes: string[], extensionId: string, extensionName: string): Promise<void>;
    sessionsUpdate(providerId: string, event: AuthenticationSessionsChangeEvent): void;
    readonly onDidRegisterAuthenticationProvider: Event<AuthenticationProviderInformation>;
    readonly onDidUnregisterAuthenticationProvider: Event<AuthenticationProviderInformation>;
    readonly onDidChangeSessions: Event<{
        providerId: string;
        label: string;
        event: AuthenticationSessionsChangeEvent;
    }>;
    declaredProviders: AuthenticationProviderInformation[];
    readonly onDidChangeDeclaredProviders: Event<AuthenticationProviderInformation[]>;
    getSessions(id: string, scopes?: string[], activateImmediate?: boolean): Promise<ReadonlyArray<AuthenticationSession>>;
    getLabel(providerId: string): string;
    supportsMultipleAccounts(providerId: string): boolean;
    createSession(providerId: string, scopes: string[], activateImmediate?: boolean): Promise<AuthenticationSession>;
    removeSession(providerId: string, sessionId: string): Promise<void>;
    manageTrustedExtensionsForAccount(providerId: string, accountName: string): Promise<void>;
    removeAccountSessions(providerId: string, accountName: string, sessions: AuthenticationSession[]): Promise<void>;
}
export interface IAuthenticationProvider {
    readonly id: string;
    readonly label: string;
    readonly supportsMultipleAccounts: boolean;
    dispose(): void;
    manageTrustedExtensions(accountName: string): void;
    removeAccountSessions(accountName: string, sessions: AuthenticationSession[]): Promise<void>;
    getSessions(scopes?: string[]): Promise<readonly AuthenticationSession[]>;
    createSession(scopes: string[]): Promise<AuthenticationSession>;
    removeSession(sessionId: string): Promise<void>;
}

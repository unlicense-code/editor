import { Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { ICredentialsService } from 'vs/platform/credentials/common/credentials';
import { IDialogService } from 'vs/platform/dialogs/common/dialogs';
import { IProductService } from 'vs/platform/product/common/productService';
import { IQuickInputService } from 'vs/platform/quickinput/common/quickInput';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IActivityService } from 'vs/workbench/services/activity/common/activity';
import { AuthenticationProviderInformation, AuthenticationSession, AuthenticationSessionsChangeEvent, IAuthenticationProvider, IAuthenticationService } from 'vs/workbench/services/authentication/common/authentication';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
export declare function getAuthenticationProviderActivationEvent(id: string): string;
interface IAccountUsage {
    extensionId: string;
    extensionName: string;
    lastUsed: number;
}
export declare function readAccountUsages(storageService: IStorageService, providerId: string, accountName: string): IAccountUsage[];
export declare function removeAccountUsage(storageService: IStorageService, providerId: string, accountName: string): void;
export declare function addAccountUsage(storageService: IStorageService, providerId: string, accountName: string, extensionId: string, extensionName: string): void;
export declare type AuthenticationSessionInfo = {
    readonly id: string;
    readonly accessToken: string;
    readonly providerId: string;
    readonly canSignOut?: boolean;
};
export declare function getCurrentAuthenticationSessionInfo(credentialsService: ICredentialsService, productService: IProductService): Promise<AuthenticationSessionInfo | undefined>;
export interface AllowedExtension {
    id: string;
    name: string;
    allowed?: boolean;
}
export declare function readAllowedExtensions(storageService: IStorageService, providerId: string, accountName: string): AllowedExtension[];
export declare class AuthenticationService extends Disposable implements IAuthenticationService {
    private readonly activityService;
    private readonly extensionService;
    private readonly storageService;
    private readonly dialogService;
    private readonly quickInputService;
    private readonly productService;
    readonly _serviceBrand: undefined;
    private _signInRequestItems;
    private _sessionAccessRequestItems;
    private _accountBadgeDisposable;
    private _authenticationProviders;
    /**
     * All providers that have been statically declared by extensions. These may not be registered.
     */
    declaredProviders: AuthenticationProviderInformation[];
    private _onDidRegisterAuthenticationProvider;
    readonly onDidRegisterAuthenticationProvider: Event<AuthenticationProviderInformation>;
    private _onDidUnregisterAuthenticationProvider;
    readonly onDidUnregisterAuthenticationProvider: Event<AuthenticationProviderInformation>;
    private _onDidChangeSessions;
    readonly onDidChangeSessions: Event<{
        providerId: string;
        label: string;
        event: AuthenticationSessionsChangeEvent;
    }>;
    private _onDidChangeDeclaredProviders;
    readonly onDidChangeDeclaredProviders: Event<AuthenticationProviderInformation[]>;
    constructor(activityService: IActivityService, extensionService: IExtensionService, storageService: IStorageService, dialogService: IDialogService, quickInputService: IQuickInputService, productService: IProductService);
    getProviderIds(): string[];
    isAuthenticationProviderRegistered(id: string): boolean;
    registerAuthenticationProvider(id: string, authenticationProvider: IAuthenticationProvider): void;
    unregisterAuthenticationProvider(id: string): void;
    sessionsUpdate(id: string, event: AuthenticationSessionsChangeEvent): Promise<void>;
    private updateNewSessionRequests;
    private updateAccessRequests;
    private updateBadgeCount;
    private removeAccessRequest;
    /**
     * Check extension access to an account
     * @param providerId The id of the authentication provider
     * @param accountName The account name that access is checked for
     * @param extensionId The id of the extension requesting access
     * @returns Returns true or false if the user has opted to permanently grant or disallow access, and undefined
     * if they haven't made a choice yet
     */
    isAccessAllowed(providerId: string, accountName: string, extensionId: string): boolean | undefined;
    updateAllowedExtension(providerId: string, accountName: string, extensionId: string, extensionName: string, isAllowed: boolean): void;
    updateSessionPreference(providerId: string, extensionId: string, session: AuthenticationSession): void;
    getSessionPreference(providerId: string, extensionId: string, scopes: string[]): string | undefined;
    removeSessionPreference(providerId: string, extensionId: string, scopes: string[]): void;
    showGetSessionPrompt(providerId: string, accountName: string, extensionId: string, extensionName: string): Promise<boolean>;
    selectSession(providerId: string, extensionId: string, extensionName: string, scopes: string[], availableSessions: AuthenticationSession[]): Promise<AuthenticationSession>;
    completeSessionAccessRequest(providerId: string, extensionId: string, extensionName: string, scopes: string[]): Promise<void>;
    requestSessionAccess(providerId: string, extensionId: string, extensionName: string, scopes: string[], possibleSessions: AuthenticationSession[]): void;
    requestNewSession(providerId: string, scopes: string[], extensionId: string, extensionName: string): Promise<void>;
    getLabel(id: string): string;
    supportsMultipleAccounts(id: string): boolean;
    private tryActivateProvider;
    getSessions(id: string, scopes?: string[], activateImmediate?: boolean): Promise<ReadonlyArray<AuthenticationSession>>;
    createSession(id: string, scopes: string[], activateImmediate?: boolean): Promise<AuthenticationSession>;
    removeSession(id: string, sessionId: string): Promise<void>;
    manageTrustedExtensionsForAccount(id: string, accountName: string): Promise<void>;
    removeAccountSessions(id: string, accountName: string, sessions: AuthenticationSession[]): Promise<void>;
}
export {};

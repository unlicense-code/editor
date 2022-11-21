import { Disposable } from 'vs/base/common/lifecycle';
import { IExtHostContext } from 'vs/workbench/services/extensions/common/extHostCustomers';
import { AuthenticationSession, AuthenticationSessionsChangeEvent, IAuthenticationProvider, IAuthenticationService } from 'vs/workbench/services/authentication/common/authentication';
import { ExtHostAuthenticationShape, MainThreadAuthenticationShape } from '../common/extHost.protocol';
import { IDialogService } from 'vs/platform/dialogs/common/dialogs';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IQuickInputService } from 'vs/platform/quickinput/common/quickInput';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import type { AuthenticationGetSessionOptions } from 'vscode';
export declare class MainThreadAuthenticationProvider extends Disposable implements IAuthenticationProvider {
    private readonly _proxy;
    readonly id: string;
    readonly label: string;
    readonly supportsMultipleAccounts: boolean;
    private readonly notificationService;
    private readonly storageService;
    private readonly quickInputService;
    private readonly dialogService;
    constructor(_proxy: ExtHostAuthenticationShape, id: string, label: string, supportsMultipleAccounts: boolean, notificationService: INotificationService, storageService: IStorageService, quickInputService: IQuickInputService, dialogService: IDialogService);
    manageTrustedExtensions(accountName: string): void;
    removeAccountSessions(accountName: string, sessions: AuthenticationSession[]): Promise<void>;
    getSessions(scopes?: string[]): Promise<readonly AuthenticationSession[]>;
    createSession(scopes: string[]): Promise<AuthenticationSession>;
    removeSession(sessionId: string): Promise<void>;
}
export declare class MainThreadAuthentication extends Disposable implements MainThreadAuthenticationShape {
    private readonly authenticationService;
    private readonly dialogService;
    private readonly storageService;
    private readonly notificationService;
    private readonly quickInputService;
    private readonly extensionService;
    private readonly telemetryService;
    private readonly _proxy;
    constructor(extHostContext: IExtHostContext, authenticationService: IAuthenticationService, dialogService: IDialogService, storageService: IStorageService, notificationService: INotificationService, quickInputService: IQuickInputService, extensionService: IExtensionService, telemetryService: ITelemetryService);
    $registerAuthenticationProvider(id: string, label: string, supportsMultipleAccounts: boolean): Promise<void>;
    $unregisterAuthenticationProvider(id: string): void;
    $ensureProvider(id: string): Promise<void>;
    $sendDidChangeSessions(id: string, event: AuthenticationSessionsChangeEvent): void;
    $removeSession(providerId: string, sessionId: string): Promise<void>;
    private loginPrompt;
    private doGetSession;
    $getSession(providerId: string, scopes: string[], extensionId: string, extensionName: string, options: AuthenticationGetSessionOptions): Promise<AuthenticationSession | undefined>;
}

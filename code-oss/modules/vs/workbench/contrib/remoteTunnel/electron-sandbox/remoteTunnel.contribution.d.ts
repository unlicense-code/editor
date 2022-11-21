import { Disposable } from 'vs/base/common/lifecycle';
import { IProductService } from 'vs/platform/product/common/productService';
import { IRemoteTunnelService } from 'vs/platform/remoteTunnel/common/remoteTunnel';
import { IAuthenticationService } from 'vs/workbench/services/authentication/common/authentication';
import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
import { IContextKeyService, RawContextKey } from 'vs/platform/contextkey/common/contextkey';
import { ILocalizedString } from 'vs/platform/action/common/action';
import { IDialogService } from 'vs/platform/dialogs/common/dialogs';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { ILoggerService, ILogService } from 'vs/platform/log/common/log';
import { INativeEnvironmentService } from 'vs/platform/environment/common/environment';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { IQuickInputService } from 'vs/platform/quickinput/common/quickInput';
import { IFileService } from 'vs/platform/files/common/files';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
export declare const REMOTE_TUNNEL_CATEGORY: ILocalizedString;
declare type CONTEXT_KEY_STATES = 'connected' | 'connecting' | 'disconnected';
export declare const REMOTE_TUNNEL_CONNECTION_STATE_KEY = "remoteTunnelConnection";
export declare const REMOTE_TUNNEL_CONNECTION_STATE: RawContextKey<CONTEXT_KEY_STATES>;
export declare class RemoteTunnelWorkbenchContribution extends Disposable implements IWorkbenchContribution {
    #private;
    private readonly authenticationService;
    private readonly dialogService;
    private readonly extensionService;
    private readonly contextKeyService;
    private readonly storageService;
    private readonly quickInputService;
    private environmentService;
    private remoteTunnelService;
    private commandService;
    private workspaceContextService;
    private readonly connectionStateContext;
    private readonly serverConfiguration;
    private initialized;
    private connectionInfo;
    private readonly logger;
    constructor(authenticationService: IAuthenticationService, dialogService: IDialogService, extensionService: IExtensionService, contextKeyService: IContextKeyService, productService: IProductService, storageService: IStorageService, loggerService: ILoggerService, logService: ILogService, quickInputService: IQuickInputService, environmentService: INativeEnvironmentService, fileService: IFileService, remoteTunnelService: IRemoteTunnelService, commandService: ICommandService, workspaceContextService: IWorkspaceContextService);
    private get existingSessionId();
    private set existingSessionId(value);
    initialize(silent?: boolean): Promise<boolean>;
    /**
     *
     * Ensures that the store client is initialized,
     * meaning that authentication is configured and it
     * can be used to communicate with the remote storage service
     */
    private doInitialize;
    private trackServerStart;
    private getAuthenticationSession;
    private getAccountPreference;
    private createExistingSessionItem;
    private createQuickpickItems;
    private getExistingSession;
    private onDidChangeStorage;
    private clearAuthenticationPreference;
    private onDidChangeSessions;
    /**
     * Returns all authentication sessions available from {@link getAuthenticationProviders}.
     */
    private getAllSessions;
    /**
     * Returns all authentication providers which can be used to authenticate
     * to the remote storage service, based on product.json configuration
     * and registered authentication providers.
     */
    private getAuthenticationProviders;
    private registerCommands;
    private getLinkToOpen;
    private showManageOptions;
}
export {};

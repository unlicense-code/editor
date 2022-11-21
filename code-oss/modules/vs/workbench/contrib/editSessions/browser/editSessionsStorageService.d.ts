import { Disposable } from 'vs/base/common/lifecycle';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { IFileService } from 'vs/platform/files/common/files';
import { IProductService } from 'vs/platform/product/common/productService';
import { IQuickInputService } from 'vs/platform/quickinput/common/quickInput';
import { IRequestService } from 'vs/platform/request/common/request';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IResourceRefHandle } from 'vs/platform/userDataSync/common/userDataSync';
import { IAuthenticationService } from 'vs/workbench/services/authentication/common/authentication';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { EditSession, IEditSessionsStorageService, IEditSessionsLogService } from 'vs/workbench/contrib/editSessions/common/editSessions';
import { IDialogService } from 'vs/platform/dialogs/common/dialogs';
import { ICredentialsService } from 'vs/platform/credentials/common/credentials';
import { ICommandService } from 'vs/platform/commands/common/commands';
export declare class EditSessionsWorkbenchService extends Disposable implements IEditSessionsStorageService {
    #private;
    private readonly fileService;
    private readonly storageService;
    private readonly quickInputService;
    private readonly authenticationService;
    private readonly extensionService;
    private readonly environmentService;
    private readonly logService;
    private readonly productService;
    private readonly contextKeyService;
    private readonly requestService;
    private readonly dialogService;
    private readonly credentialsService;
    private readonly commandService;
    _serviceBrand: undefined;
    private serverConfiguration;
    private storeClient;
    private machineClient;
    private static CACHED_SESSION_STORAGE_KEY;
    private initialized;
    private readonly signedInContext;
    get isSignedIn(): boolean;
    private _didSignIn;
    get onDidSignIn(): import("vs/base/common/event").Event<void>;
    private _didSignOut;
    get onDidSignOut(): import("vs/base/common/event").Event<void>;
    constructor(fileService: IFileService, storageService: IStorageService, quickInputService: IQuickInputService, authenticationService: IAuthenticationService, extensionService: IExtensionService, environmentService: IEnvironmentService, logService: IEditSessionsLogService, productService: IProductService, contextKeyService: IContextKeyService, requestService: IRequestService, dialogService: IDialogService, credentialsService: ICredentialsService, commandService: ICommandService);
    /**
     *
     * @param editSession An object representing edit session state to be restored.
     * @returns The ref of the stored edit session state.
     */
    write(editSession: EditSession): Promise<string>;
    /**
     * @param ref: A specific content ref to retrieve content for, if it exists.
     * If undefined, this method will return the latest saved edit session, if any.
     *
     * @returns An object representing the requested or latest edit session state, if any.
     */
    read(ref: string | undefined): Promise<{
        ref: string;
        editSession: EditSession;
    } | undefined>;
    delete(ref: string | null): Promise<void>;
    list(): Promise<IResourceRefHandle[]>;
    initialize(fromContinueOn: boolean, silent?: boolean): Promise<boolean>;
    /**
     *
     * Ensures that the store client is initialized,
     * meaning that authentication is configured and it
     * can be used to communicate with the remote storage service
     */
    private doInitialize;
    private cachedMachines;
    getMachineById(machineId: string): Promise<string | undefined>;
    private getOrCreateCurrentMachineId;
    private getAuthenticationSession;
    private shouldAttemptEditSessionInit;
    /**
     *
     * Prompts the user to pick an authentication option for storing and getting edit sessions.
     */
    private getAccountPreference;
    private createQuickpickItems;
    /**
     *
     * Returns all authentication sessions available from {@link getAuthenticationProviders}.
     */
    private getAllSessions;
    /**
     *
     * Returns all authentication providers which can be used to authenticate
     * to the remote storage service, based on product.json configuration
     * and registered authentication providers.
     */
    private getAuthenticationProviders;
    private get existingSessionId();
    private set existingSessionId(value);
    private getExistingSession;
    private onDidChangeStorage;
    private clearAuthenticationPreference;
    private onDidChangeSessions;
    private registerSignInAction;
    private registerResetAuthenticationAction;
}

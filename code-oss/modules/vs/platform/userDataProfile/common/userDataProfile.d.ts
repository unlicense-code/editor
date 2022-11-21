import { Emitter, Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { URI, UriDto } from 'vs/base/common/uri';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { IFileService } from 'vs/platform/files/common/files';
import { ILogService } from 'vs/platform/log/common/log';
import { ISingleFolderWorkspaceIdentifier, IWorkspaceIdentifier } from 'vs/platform/workspace/common/workspace';
import { ResourceMap } from 'vs/base/common/map';
import { IStringDictionary } from 'vs/base/common/collections';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
/**
 * Flags to indicate whether to use the default profile or not.
 */
export declare type UseDefaultProfileFlags = {
    settings?: boolean;
    keybindings?: boolean;
    tasks?: boolean;
    snippets?: boolean;
    extensions?: boolean;
    uiState?: boolean;
};
export interface IUserDataProfile {
    readonly id: string;
    readonly isDefault: boolean;
    readonly name: string;
    readonly shortName?: string;
    readonly location: URI;
    readonly globalStorageHome: URI;
    readonly settingsResource: URI;
    readonly keybindingsResource: URI;
    readonly tasksResource: URI;
    readonly snippetsHome: URI;
    readonly extensionsResource: URI;
    readonly useDefaultFlags?: UseDefaultProfileFlags;
    readonly isTransient?: boolean;
}
export declare function isUserDataProfile(thing: unknown): thing is IUserDataProfile;
export declare const PROFILES_ENABLEMENT_CONFIG = "workbench.experimental.settingsProfiles.enabled";
export declare type EmptyWindowWorkspaceIdentifier = 'empty-window';
export declare type WorkspaceIdentifier = ISingleFolderWorkspaceIdentifier | IWorkspaceIdentifier | EmptyWindowWorkspaceIdentifier;
export declare type DidChangeProfilesEvent = {
    readonly added: readonly IUserDataProfile[];
    readonly removed: readonly IUserDataProfile[];
    readonly updated: readonly IUserDataProfile[];
    readonly all: readonly IUserDataProfile[];
};
export declare type WillCreateProfileEvent = {
    profile: IUserDataProfile;
    join(promise: Promise<void>): void;
};
export declare type WillRemoveProfileEvent = {
    profile: IUserDataProfile;
    join(promise: Promise<void>): void;
};
export interface IUserDataProfileOptions {
    readonly shortName?: string;
    readonly useDefaultFlags?: UseDefaultProfileFlags;
    readonly transient?: boolean;
}
export interface IUserDataProfileUpdateOptions extends IUserDataProfileOptions {
    readonly name?: string;
}
export declare const IUserDataProfilesService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IUserDataProfilesService>;
export interface IUserDataProfilesService {
    readonly _serviceBrand: undefined;
    readonly profilesHome: URI;
    readonly defaultProfile: IUserDataProfile;
    readonly onDidChangeProfiles: Event<DidChangeProfilesEvent>;
    readonly profiles: readonly IUserDataProfile[];
    readonly onDidResetWorkspaces: Event<void>;
    isEnabled(): boolean;
    createNamedProfile(name: string, options?: IUserDataProfileOptions, workspaceIdentifier?: WorkspaceIdentifier): Promise<IUserDataProfile>;
    createTransientProfile(workspaceIdentifier?: WorkspaceIdentifier): Promise<IUserDataProfile>;
    createProfile(id: string, name: string, options?: IUserDataProfileOptions, workspaceIdentifier?: WorkspaceIdentifier): Promise<IUserDataProfile>;
    updateProfile(profile: IUserDataProfile, options?: IUserDataProfileUpdateOptions): Promise<IUserDataProfile>;
    removeProfile(profile: IUserDataProfile): Promise<void>;
    setProfileForWorkspace(workspaceIdentifier: WorkspaceIdentifier, profile: IUserDataProfile): Promise<void>;
    resetWorkspaces(): Promise<void>;
    cleanUp(): Promise<void>;
    cleanUpTransientProfiles(): Promise<void>;
}
export declare function reviveProfile(profile: UriDto<IUserDataProfile>, scheme: string): IUserDataProfile;
export declare function toUserDataProfile(id: string, name: string, location: URI, options?: IUserDataProfileOptions): IUserDataProfile;
export declare type UserDataProfilesObject = {
    profiles: IUserDataProfile[];
    workspaces: ResourceMap<IUserDataProfile>;
    emptyWindow?: IUserDataProfile;
};
export declare type StoredUserDataProfile = {
    name: string;
    location: URI;
    shortName?: string;
    useDefaultFlags?: UseDefaultProfileFlags;
};
export declare type StoredProfileAssociations = {
    workspaces?: IStringDictionary<string>;
    emptyWindow?: string;
};
export declare class UserDataProfilesService extends Disposable implements IUserDataProfilesService {
    protected readonly environmentService: IEnvironmentService;
    protected readonly fileService: IFileService;
    protected readonly uriIdentityService: IUriIdentityService;
    protected readonly logService: ILogService;
    protected static readonly PROFILES_KEY = "userDataProfiles";
    protected static readonly PROFILE_ASSOCIATIONS_KEY = "profileAssociations";
    readonly _serviceBrand: undefined;
    protected enabled: boolean;
    readonly profilesHome: URI;
    get defaultProfile(): IUserDataProfile;
    get profiles(): IUserDataProfile[];
    protected readonly _onDidChangeProfiles: Emitter<DidChangeProfilesEvent>;
    readonly onDidChangeProfiles: Event<DidChangeProfilesEvent>;
    protected readonly _onWillCreateProfile: Emitter<WillCreateProfileEvent>;
    readonly onWillCreateProfile: Event<WillCreateProfileEvent>;
    protected readonly _onWillRemoveProfile: Emitter<WillRemoveProfileEvent>;
    readonly onWillRemoveProfile: Event<WillRemoveProfileEvent>;
    private readonly _onDidResetWorkspaces;
    readonly onDidResetWorkspaces: Event<void>;
    private profileCreationPromises;
    protected readonly transientProfilesObject: UserDataProfilesObject;
    constructor(environmentService: IEnvironmentService, fileService: IFileService, uriIdentityService: IUriIdentityService, logService: ILogService);
    setEnablement(enabled: boolean): void;
    isEnabled(): boolean;
    protected _profilesObject: UserDataProfilesObject | undefined;
    protected get profilesObject(): UserDataProfilesObject;
    createTransientProfile(workspaceIdentifier?: WorkspaceIdentifier): Promise<IUserDataProfile>;
    createNamedProfile(name: string, options?: IUserDataProfileOptions, workspaceIdentifier?: WorkspaceIdentifier): Promise<IUserDataProfile>;
    createProfile(id: string, name: string, options?: IUserDataProfileOptions, workspaceIdentifier?: WorkspaceIdentifier): Promise<IUserDataProfile>;
    private doCreateProfile;
    updateProfile(profileToUpdate: IUserDataProfile, options: IUserDataProfileUpdateOptions): Promise<IUserDataProfile>;
    removeProfile(profileToRemove: IUserDataProfile): Promise<void>;
    getOrSetProfileForWorkspace(workspaceIdentifier: WorkspaceIdentifier, profileToSet?: IUserDataProfile): IUserDataProfile;
    setProfileForWorkspace(workspaceIdentifier: WorkspaceIdentifier, profileToSet: IUserDataProfile): Promise<void>;
    setProfileForWorkspaceSync(workspaceIdentifier: WorkspaceIdentifier, profileToSet: IUserDataProfile): void;
    unsetWorkspace(workspaceIdentifier: WorkspaceIdentifier, transient?: boolean): void;
    resetWorkspaces(): Promise<void>;
    cleanUp(): Promise<void>;
    cleanUpTransientProfiles(): Promise<void>;
    private getProfileForWorkspace;
    protected getWorkspace(workspaceIdentifier: WorkspaceIdentifier): URI | EmptyWindowWorkspaceIdentifier;
    private isProfileAssociatedToWorkspace;
    private updateProfiles;
    protected triggerProfilesChanges(added: IUserDataProfile[], removed: IUserDataProfile[], updated: IUserDataProfile[]): void;
    private updateWorkspaceAssociation;
    private updateStoredProfileAssociations;
    protected getStoredProfiles(): StoredUserDataProfile[];
    protected saveStoredProfiles(storedProfiles: StoredUserDataProfile[]): void;
    protected getStoredProfileAssociations(): StoredProfileAssociations;
    protected saveStoredProfileAssociations(storedProfileAssociations: StoredProfileAssociations): void;
}
export declare class InMemoryUserDataProfilesService extends UserDataProfilesService {
    private storedProfiles;
    protected getStoredProfiles(): StoredUserDataProfile[];
    protected saveStoredProfiles(storedProfiles: StoredUserDataProfile[]): void;
    private storedProfileAssociations;
    protected getStoredProfileAssociations(): StoredProfileAssociations;
    protected saveStoredProfileAssociations(storedProfileAssociations: StoredProfileAssociations): void;
}

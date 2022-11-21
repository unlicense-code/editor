import { Event } from 'vs/base/common/event';
import { MenuId } from 'vs/platform/actions/common/actions';
import { IUserDataProfile, IUserDataProfileOptions, IUserDataProfileUpdateOptions } from 'vs/platform/userDataProfile/common/userDataProfile';
import { RawContextKey } from 'vs/platform/contextkey/common/contextkey';
import { URI } from 'vs/base/common/uri';
import { ITreeItem } from 'vs/workbench/common/views';
export interface DidChangeUserDataProfileEvent {
    readonly preserveData: boolean;
    readonly previous: IUserDataProfile;
    readonly profile: IUserDataProfile;
    join(promise: Promise<void>): void;
}
export declare const IUserDataProfileService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IUserDataProfileService>;
export interface IUserDataProfileService {
    readonly _serviceBrand: undefined;
    readonly onDidUpdateCurrentProfile: Event<void>;
    readonly onDidChangeCurrentProfile: Event<DidChangeUserDataProfileEvent>;
    readonly currentProfile: IUserDataProfile;
    updateCurrentProfile(currentProfile: IUserDataProfile, preserveData: boolean): Promise<void>;
    getShortName(profile: IUserDataProfile): string;
}
export declare const IUserDataProfileManagementService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IUserDataProfileManagementService>;
export interface IUserDataProfileManagementService {
    readonly _serviceBrand: undefined;
    createAndEnterProfile(name: string, options?: IUserDataProfileOptions, fromExisting?: boolean): Promise<IUserDataProfile>;
    createAndEnterTransientProfile(): Promise<IUserDataProfile>;
    removeProfile(profile: IUserDataProfile): Promise<void>;
    updateProfile(profile: IUserDataProfile, updateOptions: IUserDataProfileUpdateOptions): Promise<void>;
    switchProfile(profile: IUserDataProfile): Promise<void>;
}
export interface IUserDataProfileTemplate {
    readonly settings?: string;
    readonly keybindings?: string;
    readonly tasks?: string;
    readonly snippets?: string;
    readonly globalState?: string;
    readonly extensions?: string;
}
export declare function isUserDataProfileTemplate(thing: unknown): thing is IUserDataProfileTemplate;
export declare type ProfileCreationOptions = {
    readonly skipComments: boolean;
};
export declare const IUserDataProfileImportExportService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IUserDataProfileImportExportService>;
export interface IUserDataProfileImportExportService {
    readonly _serviceBrand: undefined;
    registerProfileContentHandler(profileContentHandler: IUserDataProfileContentHandler): void;
    exportProfile(): Promise<void>;
    importProfile(uri: URI): Promise<void>;
    setProfile(profile: IUserDataProfileTemplate): Promise<void>;
}
export interface IProfileResource {
    getContent(profile: IUserDataProfile): Promise<string>;
    apply(content: string, profile: IUserDataProfile): Promise<void>;
}
export interface IProfileResourceTreeItem extends ITreeItem {
    getChildren(): Promise<IProfileResourceChildTreeItem[] | undefined>;
}
export interface IProfileResourceChildTreeItem extends ITreeItem {
    parent: IProfileResourceTreeItem;
}
export interface IUserDataProfileContentHandler {
    readonly id: string;
    readonly name: string;
    readonly description?: string;
    saveProfile(content: string): Promise<URI | null>;
    readProfile(uri: URI): Promise<string>;
}
export declare const defaultUserDataProfileIcon: import("../../../../platform/theme/common/themeService").ThemeIcon;
export declare const ManageProfilesSubMenu: MenuId;
export declare const MANAGE_PROFILES_ACTION_ID = "workbench.profiles.actions.manage";
export declare const PROFILES_TTILE: {
    value: string;
    original: string;
};
export declare const PROFILES_CATEGORY: {
    value: string;
    original: string;
};
export declare const PROFILE_EXTENSION = "code-profile";
export declare const PROFILE_FILTER: {
    name: string;
    extensions: string[];
}[];
export declare const PROFILES_ENABLEMENT_CONTEXT: RawContextKey<boolean>;
export declare const CURRENT_PROFILE_CONTEXT: RawContextKey<string>;
export declare const IS_CURRENT_PROFILE_TRANSIENT_CONTEXT: RawContextKey<boolean>;
export declare const HAS_PROFILES_CONTEXT: RawContextKey<boolean>;
export declare const IS_PROFILE_IMPORT_EXPORT_IN_PROGRESS_CONTEXT: RawContextKey<boolean>;

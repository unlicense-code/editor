import { IChannel } from 'vs/base/parts/ipc/common/ipc';
import { Event } from 'vs/base/common/event';
import { ILocalExtension, IGalleryExtension, InstallOptions, InstallVSIXOptions, UninstallOptions } from 'vs/platform/extensionManagement/common/extensionManagement';
import { URI } from 'vs/base/common/uri';
import { ExtensionType } from 'vs/platform/extensions/common/extensions';
import { IProfileAwareExtensionManagementService } from 'vs/workbench/services/extensionManagement/common/extensionManagement';
import { ExtensionManagementChannelClient } from 'vs/platform/extensionManagement/common/extensionManagementIpc';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
import { IUserDataProfilesService } from 'vs/platform/userDataProfile/common/userDataProfile';
export declare class RemoteExtensionManagementService extends ExtensionManagementChannelClient implements IProfileAwareExtensionManagementService {
    private readonly userDataProfileService;
    private readonly uriIdentityService;
    readonly onDidChangeProfile: Event<any>;
    get onProfileAwareInstallExtension(): Event<import("vs/platform/extensionManagement/common/extensionManagement").InstallExtensionEvent>;
    get onProfileAwareDidInstallExtensions(): Event<readonly import("vs/platform/extensionManagement/common/extensionManagement").InstallExtensionResult[]>;
    get onProfileAwareUninstallExtension(): Event<import("vs/platform/extensionManagement/common/extensionManagement").UninstallExtensionEvent>;
    get onProfileAwareDidUninstallExtension(): Event<import("vs/platform/extensionManagement/common/extensionManagement").DidUninstallExtensionEvent>;
    constructor(channel: IChannel, userDataProfileService: IUserDataProfilesService, uriIdentityService: IUriIdentityService);
    getInstalled(type?: ExtensionType | null, profileLocation?: URI): Promise<ILocalExtension[]>;
    uninstall(extension: ILocalExtension, options?: UninstallOptions): Promise<void>;
    install(vsix: URI, options?: InstallVSIXOptions): Promise<ILocalExtension>;
    installFromGallery(extension: IGalleryExtension, options?: InstallOptions): Promise<ILocalExtension>;
    private validateProfileLocation;
}

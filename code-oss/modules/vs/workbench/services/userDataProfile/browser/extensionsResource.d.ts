import { IExtensionGalleryService, IExtensionIdentifier, IExtensionManagementService } from 'vs/platform/extensionManagement/common/extensionManagement';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ILogService } from 'vs/platform/log/common/log';
import { IUserDataProfile } from 'vs/platform/userDataProfile/common/userDataProfile';
import { IUserDataProfileStorageService } from 'vs/platform/userDataProfile/common/userDataProfileStorageService';
import { ITreeItemCheckboxState, TreeItemCollapsibleState } from 'vs/workbench/common/views';
import { IProfileResource, IProfileResourceChildTreeItem, IProfileResourceTreeItem } from 'vs/workbench/services/userDataProfile/common/userDataProfile';
interface IProfileExtension {
    identifier: IExtensionIdentifier;
    displayName?: string;
    preRelease?: boolean;
    disabled?: boolean;
}
export declare class ExtensionsResource implements IProfileResource {
    private readonly extensionManagementService;
    private readonly extensionGalleryService;
    private readonly userDataProfileStorageService;
    private readonly instantiationService;
    private readonly logService;
    constructor(extensionManagementService: IExtensionManagementService, extensionGalleryService: IExtensionGalleryService, userDataProfileStorageService: IUserDataProfileStorageService, instantiationService: IInstantiationService, logService: ILogService);
    getContent(profile: IUserDataProfile, exclude?: string[]): Promise<string>;
    apply(content: string, profile: IUserDataProfile): Promise<void>;
    getLocalExtensions(profile: IUserDataProfile): Promise<IProfileExtension[]>;
    getProfileExtensions(content: string): Promise<IProfileExtension[]>;
    private withProfileScopedServices;
}
export declare class ExtensionsResourceExportTreeItem implements IProfileResourceTreeItem {
    private readonly profile;
    private readonly instantiationService;
    readonly handle: string;
    readonly label: {
        label: string;
    };
    readonly collapsibleState = TreeItemCollapsibleState.Expanded;
    checkbox: ITreeItemCheckboxState;
    private readonly excludedExtensions;
    constructor(profile: IUserDataProfile, instantiationService: IInstantiationService);
    getChildren(): Promise<IProfileResourceChildTreeItem[]>;
    hasContent(): Promise<boolean>;
    getContent(): Promise<string>;
}
export declare class ExtensionsResourceImportTreeItem implements IProfileResourceTreeItem {
    private readonly content;
    private readonly instantiationService;
    readonly handle = "extensions";
    readonly label: {
        label: string;
    };
    readonly collapsibleState = TreeItemCollapsibleState.Expanded;
    constructor(content: string, instantiationService: IInstantiationService);
    getChildren(): Promise<IProfileResourceChildTreeItem[]>;
}
export {};

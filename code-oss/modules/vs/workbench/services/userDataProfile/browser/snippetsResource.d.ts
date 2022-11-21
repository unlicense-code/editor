import { ResourceSet } from 'vs/base/common/map';
import { URI } from 'vs/base/common/uri';
import { IFileService } from 'vs/platform/files/common/files';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
import { IUserDataProfile } from 'vs/platform/userDataProfile/common/userDataProfile';
import { ITreeItemCheckboxState, TreeItemCollapsibleState } from 'vs/workbench/common/views';
import { IProfileResource, IProfileResourceChildTreeItem, IProfileResourceTreeItem } from 'vs/workbench/services/userDataProfile/common/userDataProfile';
export declare class SnippetsResource implements IProfileResource {
    private readonly fileService;
    private readonly uriIdentityService;
    constructor(fileService: IFileService, uriIdentityService: IUriIdentityService);
    getContent(profile: IUserDataProfile, excluded?: ResourceSet): Promise<string>;
    apply(content: string, profile: IUserDataProfile): Promise<void>;
    private getSnippets;
    getSnippetsResources(profile: IUserDataProfile, excluded?: ResourceSet): Promise<URI[]>;
}
export declare class SnippetsResourceTreeItem implements IProfileResourceTreeItem {
    private readonly profile;
    private readonly instantiationService;
    readonly handle: string;
    readonly label: {
        label: string;
    };
    readonly collapsibleState = TreeItemCollapsibleState.Collapsed;
    checkbox: ITreeItemCheckboxState | undefined;
    private readonly excludedSnippets;
    constructor(profile: IUserDataProfile, instantiationService: IInstantiationService);
    getChildren(): Promise<IProfileResourceChildTreeItem[] | undefined>;
    hasContent(): Promise<boolean>;
    getContent(): Promise<string>;
}

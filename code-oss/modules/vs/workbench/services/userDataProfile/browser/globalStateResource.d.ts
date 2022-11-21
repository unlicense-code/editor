import { IStringDictionary } from 'vs/base/common/collections';
import { URI } from 'vs/base/common/uri';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ILogService } from 'vs/platform/log/common/log';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IUserDataProfile } from 'vs/platform/userDataProfile/common/userDataProfile';
import { IUserDataProfileStorageService } from 'vs/platform/userDataProfile/common/userDataProfileStorageService';
import { ITreeItemCheckboxState, TreeItemCollapsibleState } from 'vs/workbench/common/views';
import { IProfileResource, IProfileResourceTreeItem } from 'vs/workbench/services/userDataProfile/common/userDataProfile';
interface IGlobalState {
    storage: IStringDictionary<string>;
}
export declare class GlobalStateResource implements IProfileResource {
    private readonly storageService;
    private readonly userDataProfileStorageService;
    private readonly logService;
    constructor(storageService: IStorageService, userDataProfileStorageService: IUserDataProfileStorageService, logService: ILogService);
    getContent(profile: IUserDataProfile): Promise<string>;
    apply(content: string, profile: IUserDataProfile): Promise<void>;
    getGlobalState(profile: IUserDataProfile): Promise<IGlobalState>;
    private writeGlobalState;
}
export declare class GlobalStateResourceExportTreeItem implements IProfileResourceTreeItem {
    private readonly profile;
    private readonly instantiationService;
    readonly handle: string;
    readonly label: {
        label: string;
    };
    readonly collapsibleState = TreeItemCollapsibleState.None;
    checkbox: ITreeItemCheckboxState;
    constructor(profile: IUserDataProfile, instantiationService: IInstantiationService);
    getChildren(): Promise<undefined>;
    hasContent(): Promise<boolean>;
    getContent(): Promise<string>;
}
export declare class GlobalStateResourceImportTreeItem implements IProfileResourceTreeItem {
    private readonly resource;
    readonly handle = "globalState";
    readonly label: {
        label: string;
    };
    readonly collapsibleState = TreeItemCollapsibleState.None;
    readonly command: {
        id: string;
        title: string;
        arguments: (URI | undefined)[];
    };
    constructor(resource: URI);
    getChildren(): Promise<undefined>;
}
export {};

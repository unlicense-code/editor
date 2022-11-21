import { IFileService } from 'vs/platform/files/common/files';
import { ILogService } from 'vs/platform/log/common/log';
import { IProfileResource, IProfileResourceTreeItem } from 'vs/workbench/services/userDataProfile/common/userDataProfile';
import { IUserDataSyncUtilService } from 'vs/platform/userDataSync/common/userDataSync';
import { ITreeItemCheckboxState, TreeItemCollapsibleState } from 'vs/workbench/common/views';
import { IUserDataProfile } from 'vs/platform/userDataProfile/common/userDataProfile';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
interface ISettingsContent {
    settings: string | null;
}
export declare class SettingsResource implements IProfileResource {
    private readonly fileService;
    private readonly userDataSyncUtilService;
    private readonly logService;
    constructor(fileService: IFileService, userDataSyncUtilService: IUserDataSyncUtilService, logService: ILogService);
    getContent(profile: IUserDataProfile): Promise<string>;
    getSettingsContent(profile: IUserDataProfile): Promise<ISettingsContent>;
    apply(content: string, profile: IUserDataProfile): Promise<void>;
    private getIgnoredSettings;
    private getLocalFileContent;
}
export declare class SettingsResourceTreeItem implements IProfileResourceTreeItem {
    private readonly profile;
    private readonly instantiationService;
    readonly handle: string;
    readonly label: {
        label: string;
    };
    readonly collapsibleState = TreeItemCollapsibleState.None;
    checkbox: ITreeItemCheckboxState | undefined;
    readonly command: {
        id: string;
        title: string;
        arguments: (import("../../../workbench.web.main").URI | undefined)[];
    };
    constructor(profile: IUserDataProfile, instantiationService: IInstantiationService);
    getChildren(): Promise<undefined>;
    hasContent(): Promise<boolean>;
    getContent(): Promise<string>;
}
export {};

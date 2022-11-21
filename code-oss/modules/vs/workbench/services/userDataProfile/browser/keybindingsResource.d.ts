import { IFileService } from 'vs/platform/files/common/files';
import { ILogService } from 'vs/platform/log/common/log';
import { IProfileResource, IProfileResourceTreeItem } from 'vs/workbench/services/userDataProfile/common/userDataProfile';
import { Platform } from 'vs/base/common/platform';
import { ITreeItemCheckboxState, TreeItemCollapsibleState } from 'vs/workbench/common/views';
import { IUserDataProfile } from 'vs/platform/userDataProfile/common/userDataProfile';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
interface IKeybindingsResourceContent {
    platform: Platform;
    keybindings: string | null;
}
export declare class KeybindingsResource implements IProfileResource {
    private readonly fileService;
    private readonly logService;
    constructor(fileService: IFileService, logService: ILogService);
    getContent(profile: IUserDataProfile): Promise<string>;
    getKeybindingsResourceContent(profile: IUserDataProfile): Promise<IKeybindingsResourceContent>;
    apply(content: string, profile: IUserDataProfile): Promise<void>;
    private getKeybindingsContent;
}
export declare class KeybindingsResourceTreeItem implements IProfileResourceTreeItem {
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

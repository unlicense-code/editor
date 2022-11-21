import { IFileService } from 'vs/platform/files/common/files';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ILogService } from 'vs/platform/log/common/log';
import { IUserDataProfile } from 'vs/platform/userDataProfile/common/userDataProfile';
import { ITreeItemCheckboxState, TreeItemCollapsibleState } from 'vs/workbench/common/views';
import { IProfileResource, IProfileResourceTreeItem } from 'vs/workbench/services/userDataProfile/common/userDataProfile';
interface ITasksResourceContent {
    tasks: string | null;
}
export declare class TasksResource implements IProfileResource {
    private readonly fileService;
    private readonly logService;
    constructor(fileService: IFileService, logService: ILogService);
    getContent(profile: IUserDataProfile): Promise<string>;
    getTasksResourceContent(profile: IUserDataProfile): Promise<ITasksResourceContent>;
    apply(content: string, profile: IUserDataProfile): Promise<void>;
    private getTasksContent;
}
export declare class TasksResourceTreeItem implements IProfileResourceTreeItem {
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

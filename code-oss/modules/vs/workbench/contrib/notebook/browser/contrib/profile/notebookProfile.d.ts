import { Disposable } from 'vs/base/common/lifecycle';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IWorkbenchAssignmentService } from 'vs/workbench/services/assignment/common/assignmentService';
export declare enum NotebookProfileType {
    default = "default",
    jupyter = "jupyter",
    colab = "colab"
}
export interface ISetProfileArgs {
    profile: NotebookProfileType;
}
export declare class NotebookProfileContribution extends Disposable {
    private readonly experimentService;
    constructor(configService: IConfigurationService, experimentService: IWorkbenchAssignmentService);
}

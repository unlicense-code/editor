import { ITelemetryData } from 'vs/platform/telemetry/common/telemetry';
import { Action2 } from 'vs/platform/actions/common/actions';
import { ServicesAccessor } from 'vs/platform/instantiation/common/instantiation';
import { ILocalizedString } from 'vs/platform/action/common/action';
export declare class OpenFileAction extends Action2 {
    static readonly ID = "workbench.action.files.openFile";
    constructor();
    run(accessor: ServicesAccessor, data?: ITelemetryData): Promise<void>;
}
export declare class OpenFolderAction extends Action2 {
    static readonly ID = "workbench.action.files.openFolder";
    constructor();
    run(accessor: ServicesAccessor, data?: ITelemetryData): Promise<void>;
}
export declare class OpenFolderViaWorkspaceAction extends Action2 {
    static readonly ID = "workbench.action.files.openFolderViaWorkspace";
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class OpenFileFolderAction extends Action2 {
    static readonly ID = "workbench.action.files.openFileFolder";
    static readonly LABEL: ILocalizedString;
    constructor();
    run(accessor: ServicesAccessor, data?: ITelemetryData): Promise<void>;
}
export declare class AddRootFolderAction extends Action2 {
    static readonly ID = "workbench.action.addRootFolder";
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}

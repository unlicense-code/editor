import { Action2 } from 'vs/platform/actions/common/actions';
import { IWorkbenchLayoutService } from 'vs/workbench/services/layout/browser/layoutService';
import { ServicesAccessor } from 'vs/platform/instantiation/common/instantiation';
export declare class ToggleActivityBarVisibilityAction extends Action2 {
    static readonly ID = "workbench.action.toggleActivityBarVisibility";
    private static readonly activityBarVisibleKey;
    constructor();
    run(accessor: ServicesAccessor): void;
}
export declare class ToggleSidebarPositionAction extends Action2 {
    static readonly ID = "workbench.action.toggleSidebarPosition";
    static readonly LABEL: string;
    static getLabel(layoutService: IWorkbenchLayoutService): string;
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class ToggleStatusbarVisibilityAction extends Action2 {
    static readonly ID = "workbench.action.toggleStatusbarVisibility";
    private static readonly statusbarVisibleKey;
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}

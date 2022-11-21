import { Action2 } from 'vs/platform/actions/common/actions';
import { ServicesAccessor } from 'vs/platform/instantiation/common/instantiation';
export declare class ToggleMultiCursorModifierAction extends Action2 {
    static readonly ID = "workbench.action.toggleMultiCursorModifier";
    private static readonly multiCursorModifierConfigurationKey;
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}

import { Action2 } from 'vs/platform/actions/common/actions';
import { ServicesAccessor } from 'vs/platform/instantiation/common/instantiation';
export declare class ToggleMinimapAction extends Action2 {
    static readonly ID = "editor.action.toggleMinimap";
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}

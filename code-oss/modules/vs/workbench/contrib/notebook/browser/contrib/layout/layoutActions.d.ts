import { Action2 } from 'vs/platform/actions/common/actions';
import { ServicesAccessor } from 'vs/platform/instantiation/common/instantiation';
export declare class ToggleCellToolbarPositionAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor, context: any): Promise<void>;
    togglePosition(viewType: string, toolbarPosition: string | {
        [key: string]: string;
    }): {
        [key: string]: string;
    };
}

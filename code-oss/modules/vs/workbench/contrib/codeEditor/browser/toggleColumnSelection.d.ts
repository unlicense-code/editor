import { Action2 } from 'vs/platform/actions/common/actions';
import { ServicesAccessor } from 'vs/platform/instantiation/common/instantiation';
export declare class ToggleColumnSelectionAction extends Action2 {
    static readonly ID = "editor.action.toggleColumnSelection";
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
    private _getCodeEditor;
}

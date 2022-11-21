import { Action2 } from 'vs/platform/actions/common/actions';
import { ServicesAccessor } from 'vs/platform/instantiation/common/instantiation';
export declare class ToggleRenderControlCharacterAction extends Action2 {
    static readonly ID = "editor.action.toggleRenderControlCharacter";
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}

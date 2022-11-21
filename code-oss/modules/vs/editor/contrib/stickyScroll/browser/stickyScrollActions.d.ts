import { ServicesAccessor } from 'vs/editor/browser/editorExtensions';
import { Action2 } from 'vs/platform/actions/common/actions';
export declare class ToggleStickyScroll extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}

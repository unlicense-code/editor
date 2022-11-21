import { Action } from 'vs/base/common/actions';
import { StatusbarViewModel } from 'vs/workbench/browser/parts/statusbar/statusbarModel';
export declare class ToggleStatusbarEntryVisibilityAction extends Action {
    private model;
    constructor(id: string, label: string, model: StatusbarViewModel);
    run(): Promise<void>;
}
export declare class HideStatusbarEntryAction extends Action {
    private model;
    constructor(id: string, name: string, model: StatusbarViewModel);
    run(): Promise<void>;
}

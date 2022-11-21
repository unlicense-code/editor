import { Action } from 'vs/base/common/actions';
import { IWorkbenchLayoutService } from 'vs/workbench/services/layout/browser/layoutService';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
export declare class FocusNextPart extends Action {
    private readonly layoutService;
    private readonly editorService;
    static readonly ID = "workbench.action.focusNextPart";
    static readonly LABEL: string;
    constructor(id: string, label: string, layoutService: IWorkbenchLayoutService, editorService: IEditorService);
    run(): Promise<void>;
}
export declare class FocusPreviousPart extends Action {
    private readonly layoutService;
    private readonly editorService;
    static readonly ID = "workbench.action.focusPreviousPart";
    static readonly LABEL: string;
    constructor(id: string, label: string, layoutService: IWorkbenchLayoutService, editorService: IEditorService);
    run(): Promise<void>;
}

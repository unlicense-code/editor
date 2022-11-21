import { UriComponents } from 'vs/base/common/uri';
import { Action2, IAction2Options } from 'vs/platform/actions/common/actions';
import { ServicesAccessor } from 'vs/platform/instantiation/common/instantiation';
import { KeybindingWeight } from 'vs/platform/keybinding/common/keybindingsRegistry';
import { IActiveNotebookEditor, ICellViewModel } from 'vs/workbench/contrib/notebook/browser/notebookBrowser';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { TypeConstraint } from 'vs/base/common/types';
import { IJSONSchema } from 'vs/base/common/jsonSchema';
export declare const SELECT_KERNEL_ID = "_notebook.selectKernel";
export declare const NOTEBOOK_ACTIONS_CATEGORY: {
    value: string;
    original: string;
};
export declare const CELL_TITLE_CELL_GROUP_ID = "inline/cell";
export declare const CELL_TITLE_OUTPUT_GROUP_ID = "inline/output";
export declare const NOTEBOOK_EDITOR_WIDGET_ACTION_WEIGHT = KeybindingWeight.EditorContrib;
export declare const enum CellToolbarOrder {
    EditCell = 0,
    ExecuteAboveCells = 1,
    ExecuteCellAndBelow = 2,
    SaveCell = 3,
    SplitCell = 4,
    ClearCellOutput = 5
}
export declare const enum CellOverflowToolbarGroups {
    Copy = "1_copy",
    Insert = "2_insert",
    Edit = "3_edit",
    Share = "4_share"
}
export interface INotebookActionContext {
    readonly cell?: ICellViewModel;
    readonly notebookEditor: IActiveNotebookEditor;
    readonly ui?: boolean;
    readonly selectedCells?: readonly ICellViewModel[];
    readonly autoReveal?: boolean;
}
export interface INotebookCellToolbarActionContext extends INotebookActionContext {
    readonly ui: true;
    readonly cell: ICellViewModel;
}
export interface INotebookCommandContext extends INotebookActionContext {
    readonly ui: false;
    readonly selectedCells: readonly ICellViewModel[];
}
export interface INotebookCellActionContext extends INotebookActionContext {
    cell: ICellViewModel;
}
export declare function getContextFromActiveEditor(editorService: IEditorService): INotebookActionContext | undefined;
export declare function getContextFromUri(accessor: ServicesAccessor, context?: any): {
    notebookEditor: IActiveNotebookEditor;
} | undefined;
export declare abstract class NotebookAction extends Action2 {
    constructor(desc: IAction2Options);
    run(accessor: ServicesAccessor, context?: any, ...additionalArgs: any[]): Promise<void>;
    abstract runWithContext(accessor: ServicesAccessor, context: INotebookActionContext): Promise<void>;
    private isNotebookActionContext;
    protected getEditorContextFromArgsOrActive(accessor: ServicesAccessor, context?: any, ...additionalArgs: any[]): INotebookActionContext | undefined;
}
export declare abstract class NotebookMultiCellAction extends Action2 {
    constructor(desc: IAction2Options);
    parseArgs(accessor: ServicesAccessor, ...args: any[]): INotebookCommandContext | undefined;
    abstract runWithContext(accessor: ServicesAccessor, context: INotebookCommandContext | INotebookCellToolbarActionContext): Promise<void>;
    private isCellToolbarContext;
    private isEditorContext;
    /**
     * The action/command args are resolved in following order
     * `run(accessor, cellToolbarContext)` from cell toolbar
     * `run(accessor, ...args)` from command service with arguments
     * `run(accessor, undefined)` from keyboard shortcuts, command palatte, etc
     */
    run(accessor: ServicesAccessor, ...additionalArgs: any[]): Promise<void>;
}
export declare abstract class NotebookCellAction<T = INotebookCellActionContext> extends NotebookAction {
    protected isCellActionContext(context?: unknown): context is INotebookCellActionContext;
    protected getCellContextFromArgs(accessor: ServicesAccessor, context?: T, ...additionalArgs: any[]): INotebookCellActionContext | undefined;
    run(accessor: ServicesAccessor, context?: INotebookCellActionContext, ...additionalArgs: any[]): Promise<void>;
    abstract runWithContext(accessor: ServicesAccessor, context: INotebookCellActionContext): Promise<void>;
}
export declare const executeNotebookCondition: import("vs/platform/contextkey/common/contextkey").ContextKeyExpression | undefined;
export declare function getEditorFromArgsOrActivePane(accessor: ServicesAccessor, context?: UriComponents): IActiveNotebookEditor | undefined;
export declare function parseMultiCellExecutionArgs(accessor: ServicesAccessor, ...args: any[]): INotebookCommandContext | undefined;
export declare const cellExecutionArgs: ReadonlyArray<{
    readonly name: string;
    readonly isOptional?: boolean;
    readonly description?: string;
    readonly constraint?: TypeConstraint;
    readonly schema?: IJSONSchema;
}>;

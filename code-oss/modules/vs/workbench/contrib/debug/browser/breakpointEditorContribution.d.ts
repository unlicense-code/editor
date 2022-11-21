import { IAction } from 'vs/base/common/actions';
import { Disposable } from 'vs/base/common/lifecycle';
import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
import { Range } from 'vs/editor/common/core/range';
import { IModelDecorationOptions, ITextModel } from 'vs/editor/common/model';
import { IInstantiationService, ServicesAccessor } from 'vs/platform/instantiation/common/instantiation';
import { BreakpointWidgetContext, IBreakpoint, IBreakpointEditorContribution, State } from 'vs/workbench/contrib/debug/common/debug';
export declare function createBreakpointDecorations(accessor: ServicesAccessor, model: ITextModel, breakpoints: ReadonlyArray<IBreakpoint>, state: State, breakpointsActivated: boolean, showBreakpointsInOverviewRuler: boolean): {
    range: Range;
    options: IModelDecorationOptions;
}[];
export declare class LazyBreakpointEditorContribution extends Disposable implements IBreakpointEditorContribution {
    private _contrib;
    constructor(editor: ICodeEditor, instantiationService: IInstantiationService);
    showBreakpointWidget(lineNumber: number, column: number | undefined, context?: BreakpointWidgetContext | undefined): void;
    closeBreakpointWidget(): void;
    getContextMenuActionsAtPosition(lineNumber: number, model: ITextModel): IAction[];
}

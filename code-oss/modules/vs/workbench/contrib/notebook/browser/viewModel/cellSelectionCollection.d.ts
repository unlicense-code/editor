import { Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { ICellRange } from 'vs/workbench/contrib/notebook/common/notebookRange';
export declare class NotebookCellSelectionCollection extends Disposable {
    private readonly _onDidChangeSelection;
    get onDidChangeSelection(): Event<string>;
    private _primary;
    private _selections;
    get selections(): ICellRange[];
    get focus(): ICellRange;
    setState(primary: ICellRange | null, selections: ICellRange[], forceEventEmit: boolean, source: 'view' | 'model'): void;
    setSelections(selections: ICellRange[], forceEventEmit: boolean, source: 'view' | 'model'): void;
}

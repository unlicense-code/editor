import { Disposable } from 'vs/base/common/lifecycle';
import { Event } from 'vs/base/common/event';
export interface INotebookFindFiltersChangeEvent {
    markupInput?: boolean;
    markupPreview?: boolean;
    codeInput?: boolean;
    codeOutput?: boolean;
}
export declare class NotebookFindFilters extends Disposable {
    private readonly _onDidChange;
    readonly onDidChange: Event<INotebookFindFiltersChangeEvent>;
    private _markupInput;
    get markupInput(): boolean;
    set markupInput(value: boolean);
    private _markupPreview;
    get markupPreview(): boolean;
    set markupPreview(value: boolean);
    private _codeInput;
    get codeInput(): boolean;
    set codeInput(value: boolean);
    private _codeOutput;
    get codeOutput(): boolean;
    set codeOutput(value: boolean);
    constructor(markupInput: boolean, markupPreview: boolean, codeInput: boolean, codeOutput: boolean);
    update(v: NotebookFindFilters): void;
}

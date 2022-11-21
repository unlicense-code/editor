import { Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { IEditorOptions } from 'vs/editor/common/config/editorOptions';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IBaseCellEditorOptions, INotebookEditorDelegate } from 'vs/workbench/contrib/notebook/browser/notebookBrowser';
import { NotebookOptions } from 'vs/workbench/contrib/notebook/common/notebookOptions';
export declare class BaseCellEditorOptions extends Disposable implements IBaseCellEditorOptions {
    readonly notebookEditor: INotebookEditorDelegate;
    readonly notebookOptions: NotebookOptions;
    readonly configurationService: IConfigurationService;
    readonly language: string;
    private static fixedEditorOptions;
    private _localDisposableStore;
    private readonly _onDidChange;
    readonly onDidChange: Event<void>;
    private _value;
    get value(): Readonly<IEditorOptions>;
    constructor(notebookEditor: INotebookEditorDelegate, notebookOptions: NotebookOptions, configurationService: IConfigurationService, language: string);
    private _recomputeOptions;
    private _computeEditorOptions;
}

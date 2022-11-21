import * as DOM from 'vs/base/browser/dom';
import { IActionViewItem } from 'vs/base/browser/ui/actionbar/actionbar';
import { IAction } from 'vs/base/common/actions';
import { CancellationToken } from 'vs/base/common/cancellation';
import { Event } from 'vs/base/common/event';
import { ITextResourceConfigurationService } from 'vs/editor/common/services/textResourceConfiguration';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IFileService } from 'vs/platform/files/common/files';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { EditorPane } from 'vs/workbench/browser/parts/editor/editorPane';
import { IEditorOpenContext, IEditorPaneSelection, IEditorPaneSelectionChangeEvent } from 'vs/workbench/common/editor';
import { INotebookEditorOptions, INotebookEditorPane, INotebookEditorViewState } from 'vs/workbench/contrib/notebook/browser/notebookBrowser';
import { INotebookEditorService } from 'vs/workbench/contrib/notebook/browser/services/notebookEditorService';
import { NotebookEditorWidget } from 'vs/workbench/contrib/notebook/browser/notebookEditorWidget';
import { NotebookTextModel } from 'vs/workbench/contrib/notebook/common/model/notebookTextModel';
import { NotebookEditorInput } from 'vs/workbench/contrib/notebook/common/notebookEditorInput';
import { IEditorDropService } from 'vs/workbench/services/editor/browser/editorDropService';
import { IEditorGroup, IEditorGroupsService } from 'vs/workbench/services/editor/common/editorGroupsService';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
export declare class NotebookEditor extends EditorPane implements INotebookEditorPane {
    private readonly _instantiationService;
    private readonly _editorService;
    private readonly _editorGroupService;
    private readonly _editorDropService;
    private readonly _notebookWidgetService;
    private readonly _contextKeyService;
    private readonly _fileService;
    static readonly ID: string;
    private readonly _editorMemento;
    private readonly _groupListener;
    private readonly _widgetDisposableStore;
    private _widget;
    private _rootElement;
    private _pagePosition?;
    private readonly _inputListener;
    private readonly _onDidFocusWidget;
    get onDidFocus(): Event<void>;
    private readonly _onDidBlurWidget;
    get onDidBlur(): Event<void>;
    private readonly _onDidChangeModel;
    readonly onDidChangeModel: Event<void>;
    private readonly _onDidChangeSelection;
    readonly onDidChangeSelection: Event<IEditorPaneSelectionChangeEvent>;
    constructor(telemetryService: ITelemetryService, themeService: IThemeService, _instantiationService: IInstantiationService, storageService: IStorageService, _editorService: IEditorService, _editorGroupService: IEditorGroupsService, _editorDropService: IEditorDropService, _notebookWidgetService: INotebookEditorService, _contextKeyService: IContextKeyService, _fileService: IFileService, configurationService: ITextResourceConfigurationService);
    private _onDidChangeFileSystemProvider;
    private _onDidChangeInputCapabilities;
    private _updateReadonly;
    get textModel(): NotebookTextModel | undefined;
    get minimumWidth(): number;
    get maximumWidth(): number;
    set minimumWidth(value: number);
    set maximumWidth(value: number);
    get scopedContextKeyService(): IContextKeyService | undefined;
    protected createEditor(parent: HTMLElement): void;
    getActionViewItem(action: IAction): IActionViewItem | undefined;
    getControl(): NotebookEditorWidget | undefined;
    protected setEditorVisible(visible: boolean, group: IEditorGroup | undefined): void;
    focus(): void;
    hasFocus(): boolean;
    setInput(input: NotebookEditorInput, options: INotebookEditorOptions | undefined, context: IEditorOpenContext, token: CancellationToken, noRetry?: boolean): Promise<void>;
    clearInput(): void;
    setOptions(options: INotebookEditorOptions | undefined): void;
    protected saveState(): void;
    getViewState(): INotebookEditorViewState | undefined;
    getSelection(): IEditorPaneSelection | undefined;
    private _saveEditorViewState;
    private _loadNotebookEditorViewState;
    layout(dimension: DOM.Dimension, position: DOM.IDomPosition): void;
}
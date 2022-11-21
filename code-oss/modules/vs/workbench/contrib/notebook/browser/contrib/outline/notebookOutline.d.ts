import 'vs/css!./notebookOutline';
import { Event } from 'vs/base/common/event';
import { IDisposable } from 'vs/base/common/lifecycle';
import { IThemeService, ThemeIcon } from 'vs/platform/theme/common/themeService';
import { ICellViewModel, INotebookEditorPane } from 'vs/workbench/contrib/notebook/browser/notebookBrowser';
import { IOutline, IOutlineListConfig, OutlineChangeEvent, OutlineTarget } from 'vs/workbench/services/outline/browser/outline';
import { IEditorOptions } from 'vs/platform/editor/common/editor';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IMarkerService, MarkerSeverity } from 'vs/platform/markers/common/markers';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { INotebookExecutionStateService } from 'vs/workbench/contrib/notebook/common/notebookExecutionStateService';
import { URI } from 'vs/base/common/uri';
export interface IOutlineMarkerInfo {
    readonly count: number;
    readonly topSev: MarkerSeverity;
}
export declare class OutlineEntry {
    readonly index: number;
    readonly level: number;
    readonly cell: ICellViewModel;
    readonly label: string;
    readonly isExecuting: boolean;
    readonly isPaused: boolean;
    private _children;
    private _parent;
    private _markerInfo;
    get icon(): ThemeIcon;
    constructor(index: number, level: number, cell: ICellViewModel, label: string, isExecuting: boolean, isPaused: boolean);
    addChild(entry: OutlineEntry): void;
    get parent(): OutlineEntry | undefined;
    get children(): Iterable<OutlineEntry>;
    get markerInfo(): IOutlineMarkerInfo | undefined;
    updateMarkers(markerService: IMarkerService): void;
    clearMarkers(): void;
    find(cell: ICellViewModel, parents: OutlineEntry[]): OutlineEntry | undefined;
    asFlatList(bucket: OutlineEntry[]): void;
}
export declare class NotebookCellOutline implements IOutline<OutlineEntry> {
    private readonly _editor;
    private readonly _target;
    private readonly _editorService;
    private readonly _markerService;
    private readonly _configurationService;
    private readonly _notebookExecutionStateService;
    private readonly _dispoables;
    private readonly _onDidChange;
    readonly onDidChange: Event<OutlineChangeEvent>;
    private _uri;
    private _entries;
    private _activeEntry?;
    private readonly _entriesDisposables;
    readonly config: IOutlineListConfig<OutlineEntry>;
    readonly outlineKind = "notebookCells";
    get activeElement(): OutlineEntry | undefined;
    constructor(_editor: INotebookEditorPane, _target: OutlineTarget, instantiationService: IInstantiationService, themeService: IThemeService, _editorService: IEditorService, _markerService: IMarkerService, _configurationService: IConfigurationService, _notebookExecutionStateService: INotebookExecutionStateService);
    dispose(): void;
    private _recomputeState;
    private _recomputeActive;
    private _getCellFirstNonEmptyLine;
    get isEmpty(): boolean;
    get uri(): URI | undefined;
    reveal(entry: OutlineEntry, options: IEditorOptions, sideBySide: boolean): Promise<void>;
    preview(entry: OutlineEntry): IDisposable;
    captureViewState(): IDisposable;
}

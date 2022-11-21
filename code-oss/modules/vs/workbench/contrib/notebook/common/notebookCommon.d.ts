import { VSBuffer } from 'vs/base/common/buffer';
import { CancellationToken } from 'vs/base/common/cancellation';
import { IDiffResult } from 'vs/base/common/diff/diff';
import { Event } from 'vs/base/common/event';
import * as glob from 'vs/base/common/glob';
import { ISplice } from 'vs/base/common/sequence';
import { URI, UriComponents } from 'vs/base/common/uri';
import { ILineChange } from 'vs/editor/common/diff/smartLinesDiffComputer';
import * as editorCommon from 'vs/editor/common/editorCommon';
import { Command, WorkspaceEditMetadata } from 'vs/editor/common/languages';
import { IReadonlyTextBuffer } from 'vs/editor/common/model';
import { IAccessibilityInformation } from 'vs/platform/accessibility/common/accessibility';
import { RawContextKey } from 'vs/platform/contextkey/common/contextkey';
import { IEditorModel } from 'vs/platform/editor/common/editor';
import { ExtensionIdentifier } from 'vs/platform/extensions/common/extensions';
import { ThemeColor } from 'vs/platform/theme/common/themeService';
import { UndoRedoGroup } from 'vs/platform/undoRedo/common/undoRedo';
import { IRevertOptions, ISaveOptions, IUntypedEditorInput } from 'vs/workbench/common/editor';
import { NotebookTextModel } from 'vs/workbench/contrib/notebook/common/model/notebookTextModel';
import { ICellRange } from 'vs/workbench/contrib/notebook/common/notebookRange';
import { IWorkingCopyBackupMeta, IWorkingCopySaveEvent } from 'vs/workbench/services/workingCopy/common/workingCopy';
export declare const NOTEBOOK_EDITOR_ID = "workbench.editor.notebook";
export declare const NOTEBOOK_DIFF_EDITOR_ID = "workbench.editor.notebookTextDiffEditor";
export declare const INTERACTIVE_WINDOW_EDITOR_ID = "workbench.editor.interactive";
export declare enum CellKind {
    Markup = 1,
    Code = 2
}
export declare const NOTEBOOK_DISPLAY_ORDER: readonly string[];
export declare const ACCESSIBLE_NOTEBOOK_DISPLAY_ORDER: readonly string[];
/**
 * A mapping of extension IDs who contain renderers, to notebook ids who they
 * should be treated as the same in the renderer selection logic. This is used
 * to prefer the 1st party Jupyter renderers even though they're in a separate
 * extension, for instance. See #136247.
 */
export declare const RENDERER_EQUIVALENT_EXTENSIONS: ReadonlyMap<string, ReadonlySet<string>>;
export declare const RENDERER_NOT_AVAILABLE = "_notAvailable";
export declare type ContributedNotebookRendererEntrypoint = string | {
    readonly extends: string;
    readonly path: string;
};
export declare enum NotebookRunState {
    Running = 1,
    Idle = 2
}
export declare type NotebookDocumentMetadata = Record<string, unknown>;
export declare enum NotebookCellExecutionState {
    Unconfirmed = 1,
    Pending = 2,
    Executing = 3
}
export interface INotebookCellPreviousExecutionResult {
    executionOrder?: number;
    success?: boolean;
    duration?: number;
}
export interface NotebookCellMetadata {
    /**
     * custom metadata
     */
    [key: string]: unknown;
}
export interface NotebookCellInternalMetadata {
    executionOrder?: number;
    lastRunSuccess?: boolean;
    runStartTime?: number;
    runStartTimeAdjustment?: number;
    runEndTime?: number;
}
export interface NotebookCellCollapseState {
    inputCollapsed?: boolean;
    outputCollapsed?: boolean;
}
export interface NotebookCellDefaultCollapseConfig {
    codeCell?: NotebookCellCollapseState;
    markupCell?: NotebookCellCollapseState;
}
export declare type InteractiveWindowCollapseCodeCells = 'always' | 'never' | 'fromEditor';
export declare type TransientCellMetadata = {
    readonly [K in keyof NotebookCellMetadata]?: boolean;
};
export declare type CellContentMetadata = {
    readonly [K in keyof NotebookCellMetadata]?: boolean;
};
export declare type TransientDocumentMetadata = {
    readonly [K in keyof NotebookDocumentMetadata]?: boolean;
};
export interface TransientOptions {
    readonly transientOutputs: boolean;
    readonly transientCellMetadata: TransientCellMetadata;
    readonly transientDocumentMetadata: TransientDocumentMetadata;
    readonly cellContentMetadata: CellContentMetadata;
}
/** Note: enum values are used for sorting */
export declare const enum NotebookRendererMatch {
    /** Renderer has a hard dependency on an available kernel */
    WithHardKernelDependency = 0,
    /** Renderer works better with an available kernel */
    WithOptionalKernelDependency = 1,
    /** Renderer is kernel-agnostic */
    Pure = 2,
    /** Renderer is for a different mimeType or has a hard dependency which is unsatisfied */
    Never = 3
}
/**
 * Renderer messaging requirement. While this allows for 'optional' messaging,
 * VS Code effectively treats it the same as true right now. "Partial
 * activation" of extensions is a very tricky problem, which could allow
 * solving this. But for now, optional is mostly only honored for aznb.
 */
export declare const enum RendererMessagingSpec {
    Always = "always",
    Never = "never",
    Optional = "optional"
}
export declare type NotebookRendererEntrypoint = {
    readonly extends: string | undefined;
    readonly path: URI;
};
export interface INotebookRendererInfo {
    readonly id: string;
    readonly displayName: string;
    readonly entrypoint: NotebookRendererEntrypoint;
    readonly extensionLocation: URI;
    readonly extensionId: ExtensionIdentifier;
    readonly messaging: RendererMessagingSpec;
    readonly mimeTypes: readonly string[];
    readonly isBuiltin: boolean;
    matchesWithoutKernel(mimeType: string): NotebookRendererMatch;
    matches(mimeType: string, kernelProvides: ReadonlyArray<string>): NotebookRendererMatch;
}
export interface INotebookStaticPreloadInfo {
    readonly type: string;
    readonly entrypoint: URI;
    readonly extensionLocation: URI;
}
export interface IOrderedMimeType {
    mimeType: string;
    rendererId: string;
    isTrusted: boolean;
}
export interface IOutputItemDto {
    readonly mime: string;
    readonly data: VSBuffer;
}
export interface IOutputDto {
    outputs: IOutputItemDto[];
    outputId: string;
    metadata?: Record<string, any>;
}
export interface ICellOutput {
    outputs: IOutputItemDto[];
    metadata?: Record<string, any>;
    outputId: string;
    onDidChangeData: Event<void>;
    replaceData(items: IOutputItemDto[]): void;
    appendData(items: IOutputItemDto[]): void;
}
export interface CellInternalMetadataChangedEvent {
    readonly lastRunSuccessChanged?: boolean;
}
export interface ICell {
    readonly uri: URI;
    handle: number;
    language: string;
    cellKind: CellKind;
    outputs: ICellOutput[];
    metadata: NotebookCellMetadata;
    internalMetadata: NotebookCellInternalMetadata;
    getHashValue(): number;
    textBuffer: IReadonlyTextBuffer;
    onDidChangeOutputs?: Event<NotebookCellOutputsSplice>;
    onDidChangeOutputItems?: Event<void>;
    onDidChangeLanguage: Event<string>;
    onDidChangeMetadata: Event<void>;
    onDidChangeInternalMetadata: Event<CellInternalMetadataChangedEvent>;
}
export interface INotebookTextModel {
    readonly viewType: string;
    metadata: NotebookDocumentMetadata;
    readonly transientOptions: TransientOptions;
    readonly uri: URI;
    readonly versionId: number;
    readonly length: number;
    readonly cells: readonly ICell[];
    reset(cells: ICellDto2[], metadata: NotebookDocumentMetadata, transientOptions: TransientOptions): void;
    applyEdits(rawEdits: ICellEditOperation[], synchronous: boolean, beginSelectionState: ISelectionState | undefined, endSelectionsComputer: () => ISelectionState | undefined, undoRedoGroup: UndoRedoGroup | undefined, computeUndoRedo?: boolean): boolean;
    onDidChangeContent: Event<NotebookTextModelChangedEvent>;
    onWillDispose: Event<void>;
}
export declare type NotebookCellTextModelSplice<T> = [
    start: number,
    deleteCount: number,
    newItems: T[]
];
export declare type NotebookCellOutputsSplice = {
    start: number;
    deleteCount: number;
    newOutputs: ICellOutput[];
};
export interface IMainCellDto {
    handle: number;
    uri: UriComponents;
    source: string[];
    eol: string;
    language: string;
    cellKind: CellKind;
    outputs: IOutputDto[];
    metadata?: NotebookCellMetadata;
    internalMetadata?: NotebookCellInternalMetadata;
}
export declare enum NotebookCellsChangeType {
    ModelChange = 1,
    Move = 2,
    ChangeCellLanguage = 5,
    Initialize = 6,
    ChangeCellMetadata = 7,
    Output = 8,
    OutputItem = 9,
    ChangeCellContent = 10,
    ChangeDocumentMetadata = 11,
    ChangeCellInternalMetadata = 12,
    ChangeCellMime = 13,
    Unknown = 100
}
export interface NotebookCellsInitializeEvent<T> {
    readonly kind: NotebookCellsChangeType.Initialize;
    readonly changes: NotebookCellTextModelSplice<T>[];
}
export interface NotebookCellContentChangeEvent {
    readonly kind: NotebookCellsChangeType.ChangeCellContent;
    readonly index: number;
}
export interface NotebookCellsModelChangedEvent<T> {
    readonly kind: NotebookCellsChangeType.ModelChange;
    readonly changes: NotebookCellTextModelSplice<T>[];
}
export interface NotebookCellsModelMoveEvent<T> {
    readonly kind: NotebookCellsChangeType.Move;
    readonly index: number;
    readonly length: number;
    readonly newIdx: number;
    readonly cells: T[];
}
export interface NotebookOutputChangedEvent {
    readonly kind: NotebookCellsChangeType.Output;
    readonly index: number;
    readonly outputs: IOutputDto[];
    readonly append: boolean;
}
export interface NotebookOutputItemChangedEvent {
    readonly kind: NotebookCellsChangeType.OutputItem;
    readonly index: number;
    readonly outputId: string;
    readonly outputItems: IOutputItemDto[];
    readonly append: boolean;
}
export interface NotebookCellsChangeLanguageEvent {
    readonly kind: NotebookCellsChangeType.ChangeCellLanguage;
    readonly index: number;
    readonly language: string;
}
export interface NotebookCellsChangeMimeEvent {
    readonly kind: NotebookCellsChangeType.ChangeCellMime;
    readonly index: number;
    readonly mime: string | undefined;
}
export interface NotebookCellsChangeMetadataEvent {
    readonly kind: NotebookCellsChangeType.ChangeCellMetadata;
    readonly index: number;
    readonly metadata: NotebookCellMetadata;
}
export interface NotebookCellsChangeInternalMetadataEvent {
    readonly kind: NotebookCellsChangeType.ChangeCellInternalMetadata;
    readonly index: number;
    readonly internalMetadata: NotebookCellInternalMetadata;
}
export interface NotebookDocumentChangeMetadataEvent {
    readonly kind: NotebookCellsChangeType.ChangeDocumentMetadata;
    readonly metadata: NotebookDocumentMetadata;
}
export interface NotebookDocumentUnknownChangeEvent {
    readonly kind: NotebookCellsChangeType.Unknown;
}
export declare type NotebookRawContentEventDto = NotebookCellsInitializeEvent<IMainCellDto> | NotebookDocumentChangeMetadataEvent | NotebookCellContentChangeEvent | NotebookCellsModelChangedEvent<IMainCellDto> | NotebookCellsModelMoveEvent<IMainCellDto> | NotebookOutputChangedEvent | NotebookOutputItemChangedEvent | NotebookCellsChangeLanguageEvent | NotebookCellsChangeMimeEvent | NotebookCellsChangeMetadataEvent | NotebookCellsChangeInternalMetadataEvent | NotebookDocumentUnknownChangeEvent;
export declare type NotebookCellsChangedEventDto = {
    readonly rawEvents: NotebookRawContentEventDto[];
    readonly versionId: number;
};
export declare type NotebookRawContentEvent = (NotebookCellsInitializeEvent<ICell> | NotebookDocumentChangeMetadataEvent | NotebookCellContentChangeEvent | NotebookCellsModelChangedEvent<ICell> | NotebookCellsModelMoveEvent<ICell> | NotebookOutputChangedEvent | NotebookOutputItemChangedEvent | NotebookCellsChangeLanguageEvent | NotebookCellsChangeMimeEvent | NotebookCellsChangeMetadataEvent | NotebookCellsChangeInternalMetadataEvent | NotebookDocumentUnknownChangeEvent) & {
    transient: boolean;
};
export declare enum SelectionStateType {
    Handle = 0,
    Index = 1
}
export interface ISelectionHandleState {
    kind: SelectionStateType.Handle;
    primary: number | null;
    selections: number[];
}
export interface ISelectionIndexState {
    kind: SelectionStateType.Index;
    focus: ICellRange;
    selections: ICellRange[];
}
export declare type ISelectionState = ISelectionHandleState | ISelectionIndexState;
export declare type NotebookTextModelChangedEvent = {
    readonly rawEvents: NotebookRawContentEvent[];
    readonly versionId: number;
    readonly synchronous: boolean | undefined;
    readonly endSelectionState: ISelectionState | undefined;
};
export declare type NotebookTextModelWillAddRemoveEvent = {
    readonly rawEvent: NotebookCellsModelChangedEvent<ICell>;
};
export declare const enum CellEditType {
    Replace = 1,
    Output = 2,
    Metadata = 3,
    CellLanguage = 4,
    DocumentMetadata = 5,
    Move = 6,
    OutputItems = 7,
    PartialMetadata = 8,
    PartialInternalMetadata = 9
}
export interface ICellDto2 {
    source: string;
    language: string;
    mime: string | undefined;
    cellKind: CellKind;
    outputs: IOutputDto[];
    metadata?: NotebookCellMetadata;
    internalMetadata?: NotebookCellInternalMetadata;
    collapseState?: NotebookCellCollapseState;
}
export interface ICellReplaceEdit {
    editType: CellEditType.Replace;
    index: number;
    count: number;
    cells: ICellDto2[];
}
export interface ICellOutputEdit {
    editType: CellEditType.Output;
    index: number;
    outputs: IOutputDto[];
    append?: boolean;
}
export interface ICellOutputEditByHandle {
    editType: CellEditType.Output;
    handle: number;
    outputs: IOutputDto[];
    append?: boolean;
}
export interface ICellOutputItemEdit {
    editType: CellEditType.OutputItems;
    outputId: string;
    items: IOutputItemDto[];
    append?: boolean;
}
export interface ICellMetadataEdit {
    editType: CellEditType.Metadata;
    index: number;
    metadata: NotebookCellMetadata;
}
export declare type NullablePartialNotebookCellMetadata = {
    [Key in keyof Partial<NotebookCellMetadata>]: NotebookCellMetadata[Key] | null;
};
export interface ICellPartialMetadataEdit {
    editType: CellEditType.PartialMetadata;
    index: number;
    metadata: NullablePartialNotebookCellMetadata;
}
export interface ICellPartialMetadataEditByHandle {
    editType: CellEditType.PartialMetadata;
    handle: number;
    metadata: NullablePartialNotebookCellMetadata;
}
export declare type NullablePartialNotebookCellInternalMetadata = {
    [Key in keyof Partial<NotebookCellInternalMetadata>]: NotebookCellInternalMetadata[Key] | null;
};
export interface ICellPartialInternalMetadataEdit {
    editType: CellEditType.PartialInternalMetadata;
    index: number;
    internalMetadata: NullablePartialNotebookCellInternalMetadata;
}
export interface ICellPartialInternalMetadataEditByHandle {
    editType: CellEditType.PartialInternalMetadata;
    handle: number;
    internalMetadata: NullablePartialNotebookCellInternalMetadata;
}
export interface ICellLanguageEdit {
    editType: CellEditType.CellLanguage;
    index: number;
    language: string;
}
export interface IDocumentMetadataEdit {
    editType: CellEditType.DocumentMetadata;
    metadata: NotebookDocumentMetadata;
}
export interface ICellMoveEdit {
    editType: CellEditType.Move;
    index: number;
    length: number;
    newIdx: number;
}
export declare type IImmediateCellEditOperation = ICellOutputEditByHandle | ICellPartialMetadataEditByHandle | ICellOutputItemEdit | ICellPartialInternalMetadataEdit | ICellPartialInternalMetadataEditByHandle | ICellPartialMetadataEdit;
export declare type ICellEditOperation = IImmediateCellEditOperation | ICellReplaceEdit | ICellOutputEdit | ICellMetadataEdit | ICellPartialMetadataEdit | ICellPartialInternalMetadataEdit | IDocumentMetadataEdit | ICellMoveEdit | ICellOutputItemEdit | ICellLanguageEdit;
export interface IWorkspaceNotebookCellEdit {
    metadata?: WorkspaceEditMetadata;
    resource: URI;
    notebookVersionId: number | undefined;
    cellEdit: ICellPartialMetadataEdit | IDocumentMetadataEdit | ICellReplaceEdit;
}
export interface NotebookData {
    readonly cells: ICellDto2[];
    readonly metadata: NotebookDocumentMetadata;
}
export interface INotebookContributionData {
    extension?: ExtensionIdentifier;
    providerDisplayName: string;
    displayName: string;
    filenamePattern: (string | glob.IRelativePattern | INotebookExclusiveDocumentFilter)[];
    exclusive: boolean;
}
export declare namespace CellUri {
    const scheme = "vscode-notebook-cell";
    function generate(notebook: URI, handle: number): URI;
    function parse(cell: URI): {
        notebook: URI;
        handle: number;
    } | undefined;
    function generateCellOutputUri(notebook: URI, outputId?: string): URI;
    function parseCellOutputUri(uri: URI): {
        notebook: URI;
        outputId?: string;
    } | undefined;
    function generateCellPropertyUri(notebook: URI, handle: number, scheme: string): URI;
    function parseCellPropertyUri(uri: URI, propertyScheme: string): {
        notebook: URI;
        handle: number;
    } | undefined;
}
export declare class MimeTypeDisplayOrder {
    private readonly defaultOrder;
    private readonly order;
    constructor(initialValue?: readonly string[], defaultOrder?: readonly string[]);
    /**
     * Returns a sorted array of the input mimetypes.
     */
    sort(mimetypes: Iterable<string>): string[];
    /**
     * Records that the user selected the given mimetype over the other
     * possible mimetypes, prioritizing it for future reference.
     */
    prioritize(chosenMimetype: string, otherMimetypes: readonly string[]): void;
    /**
     * Gets an array of in-order mimetype preferences.
     */
    toArray(): string[];
    private findIndex;
}
export declare function diff<T>(before: T[], after: T[], contains: (a: T) => boolean, equal?: (a: T, b: T) => boolean): ISplice<T>[];
export interface ICellEditorViewState {
    selections: editorCommon.ICursorState[];
}
export declare const NOTEBOOK_EDITOR_CURSOR_BOUNDARY: RawContextKey<"none" | "top" | "bottom" | "both">;
export interface INotebookLoadOptions {
    /**
     * Go to disk bypassing any cache of the model if any.
     */
    forceReadFromFile?: boolean;
}
export interface IResolvedNotebookEditorModel extends INotebookEditorModel {
    notebook: NotebookTextModel;
}
export interface INotebookEditorModel extends IEditorModel {
    readonly onDidChangeDirty: Event<void>;
    readonly onDidSave: Event<IWorkingCopySaveEvent>;
    readonly onDidChangeOrphaned: Event<void>;
    readonly onDidChangeReadonly: Event<void>;
    readonly resource: URI;
    readonly viewType: string;
    readonly notebook: INotebookTextModel | undefined;
    isResolved(): this is IResolvedNotebookEditorModel;
    isDirty(): boolean;
    isReadonly(): boolean;
    isOrphaned(): boolean;
    hasAssociatedFilePath(): boolean;
    load(options?: INotebookLoadOptions): Promise<IResolvedNotebookEditorModel>;
    save(options?: ISaveOptions): Promise<boolean>;
    saveAs(target: URI): Promise<IUntypedEditorInput | undefined>;
    revert(options?: IRevertOptions): Promise<void>;
}
export interface INotebookDiffEditorModel extends IEditorModel {
    original: IResolvedNotebookEditorModel;
    modified: IResolvedNotebookEditorModel;
}
export interface NotebookDocumentBackupData extends IWorkingCopyBackupMeta {
    readonly viewType: string;
    readonly backupId?: string;
    readonly mtime?: number;
}
export declare enum NotebookEditorPriority {
    default = "default",
    option = "option"
}
export interface INotebookSearchOptions {
    regex?: boolean;
    wholeWord?: boolean;
    caseSensitive?: boolean;
    wordSeparators?: string;
    includeMarkupInput?: boolean;
    includeMarkupPreview?: boolean;
    includeCodeInput?: boolean;
    includeOutput?: boolean;
}
export interface INotebookExclusiveDocumentFilter {
    include?: string | glob.IRelativePattern;
    exclude?: string | glob.IRelativePattern;
}
export interface INotebookDocumentFilter {
    viewType?: string | string[];
    filenamePattern?: string | glob.IRelativePattern | INotebookExclusiveDocumentFilter;
}
export declare function isDocumentExcludePattern(filenamePattern: string | glob.IRelativePattern | INotebookExclusiveDocumentFilter): filenamePattern is {
    include: string | glob.IRelativePattern;
    exclude: string | glob.IRelativePattern;
};
export declare function notebookDocumentFilterMatch(filter: INotebookDocumentFilter, viewType: string, resource: URI): boolean;
export interface INotebookCellStatusBarItemProvider {
    viewType: string;
    onDidChangeStatusBarItems?: Event<void>;
    provideCellStatusBarItems(uri: URI, index: number, token: CancellationToken): Promise<INotebookCellStatusBarItemList | undefined>;
}
export interface INotebookDiffResult {
    cellsDiff: IDiffResult;
    linesDiff?: {
        originalCellhandle: number;
        modifiedCellhandle: number;
        lineChanges: ILineChange[];
    }[];
}
export interface INotebookCellStatusBarItem {
    readonly alignment: CellStatusbarAlignment;
    readonly priority?: number;
    readonly text: string;
    readonly color?: string | ThemeColor;
    readonly backgroundColor?: string | ThemeColor;
    readonly tooltip?: string;
    readonly command?: string | Command;
    readonly accessibilityInformation?: IAccessibilityInformation;
    readonly opacity?: string;
    readonly onlyShowWhenActive?: boolean;
}
export interface INotebookCellStatusBarItemList {
    items: INotebookCellStatusBarItem[];
    dispose?(): void;
}
export declare type ShowCellStatusBarType = 'hidden' | 'visible' | 'visibleAfterExecute';
export declare const NotebookSetting: {
    readonly displayOrder: "notebook.displayOrder";
    readonly cellToolbarLocation: "notebook.cellToolbarLocation";
    readonly cellToolbarVisibility: "notebook.cellToolbarVisibility";
    readonly showCellStatusBar: "notebook.showCellStatusBar";
    readonly textDiffEditorPreview: "notebook.diff.enablePreview";
    readonly experimentalInsertToolbarAlignment: "notebook.experimental.insertToolbarAlignment";
    readonly compactView: "notebook.compactView";
    readonly focusIndicator: "notebook.cellFocusIndicator";
    readonly insertToolbarLocation: "notebook.insertToolbarLocation";
    readonly globalToolbar: "notebook.globalToolbar";
    readonly undoRedoPerCell: "notebook.undoRedoPerCell";
    readonly consolidatedOutputButton: "notebook.consolidatedOutputButton";
    readonly showFoldingControls: "notebook.showFoldingControls";
    readonly dragAndDropEnabled: "notebook.dragAndDropEnabled";
    readonly cellEditorOptionsCustomizations: "notebook.editorOptionsCustomizations";
    readonly consolidatedRunButton: "notebook.consolidatedRunButton";
    readonly openGettingStarted: "notebook.experimental.openGettingStarted";
    readonly textOutputLineLimit: "notebook.output.textLineLimit";
    readonly globalToolbarShowLabel: "notebook.globalToolbarShowLabel";
    readonly markupFontSize: "notebook.markup.fontSize";
    readonly interactiveWindowCollapseCodeCells: "interactiveWindow.collapseCellInputCode";
    readonly outputLineHeight: "notebook.outputLineHeight";
    readonly outputFontSize: "notebook.outputFontSize";
    readonly outputFontFamily: "notebook.outputFontFamily";
    readonly kernelPickerType: "notebook.kernelPicker.type";
};
export declare const enum CellStatusbarAlignment {
    Left = 1,
    Right = 2
}
export declare class NotebookWorkingCopyTypeIdentifier {
    private static _prefix;
    static create(viewType: string): string;
    static parse(candidate: string): string | undefined;
}
export interface NotebookExtensionDescription {
    readonly id: ExtensionIdentifier;
    readonly location: UriComponents | undefined;
}
/**
 * Whether the provided mime type is a text stream like `stdout`, `stderr`.
 */
export declare function isTextStreamMime(mimeType: string): boolean;
/**
 * Given a stream of individual stdout outputs, this function will return the compressed lines, escaping some of the common terminal escape codes.
 * E.g. some terminal escape codes would result in the previous line getting cleared, such if we had 3 lines and
 * last line contained such a code, then the result string would be just the first two lines.
 */
export declare function compressOutputItemStreams(outputs: Uint8Array[]): VSBuffer;
export interface INotebookKernelSourceAction {
    readonly label: string;
    readonly description?: string;
    readonly detail?: string;
    readonly command?: string | Command;
}

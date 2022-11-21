import { IRelativePattern } from 'vs/base/common/glob';
import { MarkdownStringTrustedOptions } from 'vs/base/common/htmlContent';
import { URI } from 'vs/base/common/uri';
import { IExtensionDescription } from 'vs/platform/extensions/common/extensions';
import { FileSystemProviderErrorCode } from 'vs/platform/files/common/files';
import { RemoteAuthorityResolverErrorCode } from 'vs/platform/remote/common/remoteAuthorityResolver';
import { IRelativePatternDto } from 'vs/workbench/api/common/extHost.protocol';
import { ICellPartialMetadataEdit, IDocumentMetadataEdit } from 'vs/workbench/contrib/notebook/common/notebookCommon';
import type * as vscode from 'vscode';
export declare class Disposable {
    #private;
    static from(...inDisposables: {
        dispose(): any;
    }[]): Disposable;
    constructor(callOnDispose: () => any);
    dispose(): any;
}
export declare class Position {
    static Min(...positions: Position[]): Position;
    static Max(...positions: Position[]): Position;
    static isPosition(other: any): other is Position;
    static of(obj: vscode.Position): Position;
    private _line;
    private _character;
    get line(): number;
    get character(): number;
    constructor(line: number, character: number);
    isBefore(other: Position): boolean;
    isBeforeOrEqual(other: Position): boolean;
    isAfter(other: Position): boolean;
    isAfterOrEqual(other: Position): boolean;
    isEqual(other: Position): boolean;
    compareTo(other: Position): number;
    translate(change: {
        lineDelta?: number;
        characterDelta?: number;
    }): Position;
    translate(lineDelta?: number, characterDelta?: number): Position;
    with(change: {
        line?: number;
        character?: number;
    }): Position;
    with(line?: number, character?: number): Position;
    toJSON(): any;
}
export declare class Range {
    static isRange(thing: any): thing is vscode.Range;
    static of(obj: vscode.Range): Range;
    protected _start: Position;
    protected _end: Position;
    get start(): Position;
    get end(): Position;
    constructor(start: vscode.Position, end: vscode.Position);
    constructor(start: Position, end: Position);
    constructor(startLine: number, startColumn: number, endLine: number, endColumn: number);
    contains(positionOrRange: Position | Range): boolean;
    isEqual(other: Range): boolean;
    intersection(other: Range): Range | undefined;
    union(other: Range): Range;
    get isEmpty(): boolean;
    get isSingleLine(): boolean;
    with(change: {
        start?: Position;
        end?: Position;
    }): Range;
    with(start?: Position, end?: Position): Range;
    toJSON(): any;
}
export declare class Selection extends Range {
    static isSelection(thing: any): thing is Selection;
    private _anchor;
    get anchor(): Position;
    private _active;
    get active(): Position;
    constructor(anchor: Position, active: Position);
    constructor(anchorLine: number, anchorColumn: number, activeLine: number, activeColumn: number);
    get isReversed(): boolean;
    toJSON(): {
        start: Position;
        end: Position;
        active: Position;
        anchor: Position;
    };
}
export declare class ResolvedAuthority {
    readonly host: string;
    readonly port: number;
    readonly connectionToken: string | undefined;
    constructor(host: string, port: number, connectionToken?: string);
}
export declare class RemoteAuthorityResolverError extends Error {
    static NotAvailable(message?: string, handled?: boolean): RemoteAuthorityResolverError;
    static TemporarilyNotAvailable(message?: string): RemoteAuthorityResolverError;
    readonly _message: string | undefined;
    readonly _code: RemoteAuthorityResolverErrorCode;
    readonly _detail: any;
    constructor(message?: string, code?: RemoteAuthorityResolverErrorCode, detail?: any);
}
export declare enum EndOfLine {
    LF = 1,
    CRLF = 2
}
export declare enum EnvironmentVariableMutatorType {
    Replace = 1,
    Append = 2,
    Prepend = 3
}
export declare class TextEdit {
    static isTextEdit(thing: any): thing is TextEdit;
    static replace(range: Range, newText: string): TextEdit;
    static insert(position: Position, newText: string): TextEdit;
    static delete(range: Range): TextEdit;
    static setEndOfLine(eol: EndOfLine): TextEdit;
    protected _range: Range;
    protected _newText: string | null;
    protected _newEol?: EndOfLine;
    get range(): Range;
    set range(value: Range);
    get newText(): string;
    set newText(value: string);
    get newEol(): EndOfLine | undefined;
    set newEol(value: EndOfLine | undefined);
    constructor(range: Range, newText: string | null);
    toJSON(): any;
}
export declare class NotebookEdit implements vscode.NotebookEdit {
    static isNotebookCellEdit(thing: any): thing is NotebookEdit;
    static replaceCells(range: NotebookRange, newCells: NotebookCellData[]): NotebookEdit;
    static insertCells(index: number, newCells: vscode.NotebookCellData[]): vscode.NotebookEdit;
    static deleteCells(range: NotebookRange): NotebookEdit;
    static updateCellMetadata(index: number, newMetadata: {
        [key: string]: any;
    }): NotebookEdit;
    static updateNotebookMetadata(newMetadata: {
        [key: string]: any;
    }): NotebookEdit;
    range: NotebookRange;
    newCells: NotebookCellData[];
    newCellMetadata?: {
        [key: string]: any;
    };
    newNotebookMetadata?: {
        [key: string]: any;
    };
    constructor(range: NotebookRange, newCells: NotebookCellData[]);
}
export declare class SnippetTextEdit implements vscode.SnippetTextEdit {
    static isSnippetTextEdit(thing: any): thing is SnippetTextEdit;
    static replace(range: Range, snippet: SnippetString): SnippetTextEdit;
    static insert(position: Position, snippet: SnippetString): SnippetTextEdit;
    range: Range;
    snippet: SnippetString;
    constructor(range: Range, snippet: SnippetString);
}
export interface IFileOperationOptions {
    readonly overwrite?: boolean;
    readonly ignoreIfExists?: boolean;
    readonly ignoreIfNotExists?: boolean;
    readonly recursive?: boolean;
    readonly contents?: Uint8Array;
}
export declare const enum FileEditType {
    File = 1,
    Text = 2,
    Cell = 3,
    CellReplace = 5,
    Snippet = 6
}
export interface IFileOperation {
    readonly _type: FileEditType.File;
    readonly from?: URI;
    readonly to?: URI;
    readonly options?: IFileOperationOptions;
    readonly metadata?: vscode.WorkspaceEditEntryMetadata;
}
export interface IFileTextEdit {
    readonly _type: FileEditType.Text;
    readonly uri: URI;
    readonly edit: TextEdit;
    readonly metadata?: vscode.WorkspaceEditEntryMetadata;
}
export interface IFileSnippetTextEdit {
    readonly _type: FileEditType.Snippet;
    readonly uri: URI;
    readonly range: vscode.Range;
    readonly edit: vscode.SnippetString;
    readonly metadata?: vscode.WorkspaceEditEntryMetadata;
}
export interface IFileCellEdit {
    readonly _type: FileEditType.Cell;
    readonly uri: URI;
    readonly edit?: ICellPartialMetadataEdit | IDocumentMetadataEdit;
    readonly notebookMetadata?: Record<string, any>;
    readonly metadata?: vscode.WorkspaceEditEntryMetadata;
}
export interface ICellEdit {
    readonly _type: FileEditType.CellReplace;
    readonly metadata?: vscode.WorkspaceEditEntryMetadata;
    readonly uri: URI;
    readonly index: number;
    readonly count: number;
    readonly cells: vscode.NotebookCellData[];
}
declare type WorkspaceEditEntry = IFileOperation | IFileTextEdit | IFileSnippetTextEdit | IFileCellEdit | ICellEdit;
export declare class WorkspaceEdit implements vscode.WorkspaceEdit {
    private readonly _edits;
    _allEntries(): ReadonlyArray<WorkspaceEditEntry>;
    renameFile(from: vscode.Uri, to: vscode.Uri, options?: {
        readonly overwrite?: boolean;
        readonly ignoreIfExists?: boolean;
    }, metadata?: vscode.WorkspaceEditEntryMetadata): void;
    createFile(uri: vscode.Uri, options?: {
        readonly overwrite?: boolean;
        readonly ignoreIfExists?: boolean;
        readonly contents?: Uint8Array;
    }, metadata?: vscode.WorkspaceEditEntryMetadata): void;
    deleteFile(uri: vscode.Uri, options?: {
        readonly recursive?: boolean;
        readonly ignoreIfNotExists?: boolean;
    }, metadata?: vscode.WorkspaceEditEntryMetadata): void;
    private replaceNotebookMetadata;
    private replaceNotebookCells;
    private replaceNotebookCellMetadata;
    replace(uri: URI, range: Range, newText: string, metadata?: vscode.WorkspaceEditEntryMetadata): void;
    insert(resource: URI, position: Position, newText: string, metadata?: vscode.WorkspaceEditEntryMetadata): void;
    delete(resource: URI, range: Range, metadata?: vscode.WorkspaceEditEntryMetadata): void;
    has(uri: URI): boolean;
    set(uri: URI, edits: ReadonlyArray<TextEdit | SnippetTextEdit>): void;
    set(uri: URI, edits: ReadonlyArray<[TextEdit | SnippetTextEdit, vscode.WorkspaceEditEntryMetadata]>): void;
    set(uri: URI, edits: readonly NotebookEdit[]): void;
    set(uri: URI, edits: ReadonlyArray<[NotebookEdit, vscode.WorkspaceEditEntryMetadata]>): void;
    get(uri: URI): TextEdit[];
    entries(): [URI, TextEdit[]][];
    get size(): number;
    toJSON(): any;
}
export declare class SnippetString {
    static isSnippetString(thing: any): thing is SnippetString;
    private static _escape;
    private _tabstop;
    value: string;
    constructor(value?: string);
    appendText(string: string): SnippetString;
    appendTabstop(number?: number): SnippetString;
    appendPlaceholder(value: string | ((snippet: SnippetString) => any), number?: number): SnippetString;
    appendChoice(values: string[], number?: number): SnippetString;
    appendVariable(name: string, defaultValue?: string | ((snippet: SnippetString) => any)): SnippetString;
}
export declare enum DiagnosticTag {
    Unnecessary = 1,
    Deprecated = 2
}
export declare enum DiagnosticSeverity {
    Hint = 3,
    Information = 2,
    Warning = 1,
    Error = 0
}
export declare class Location {
    static isLocation(thing: any): thing is vscode.Location;
    uri: URI;
    range: Range;
    constructor(uri: URI, rangeOrPosition: Range | Position);
    toJSON(): any;
}
export declare class DiagnosticRelatedInformation {
    static is(thing: any): thing is DiagnosticRelatedInformation;
    location: Location;
    message: string;
    constructor(location: Location, message: string);
    static isEqual(a: DiagnosticRelatedInformation, b: DiagnosticRelatedInformation): boolean;
}
export declare class Diagnostic {
    range: Range;
    message: string;
    severity: DiagnosticSeverity;
    source?: string;
    code?: string | number;
    relatedInformation?: DiagnosticRelatedInformation[];
    tags?: DiagnosticTag[];
    constructor(range: Range, message: string, severity?: DiagnosticSeverity);
    toJSON(): any;
    static isEqual(a: Diagnostic | undefined, b: Diagnostic | undefined): boolean;
}
export declare class Hover {
    contents: (vscode.MarkdownString | vscode.MarkedString)[];
    range: Range | undefined;
    constructor(contents: vscode.MarkdownString | vscode.MarkedString | (vscode.MarkdownString | vscode.MarkedString)[], range?: Range);
}
export declare enum DocumentHighlightKind {
    Text = 0,
    Read = 1,
    Write = 2
}
export declare class DocumentHighlight {
    range: Range;
    kind: DocumentHighlightKind;
    constructor(range: Range, kind?: DocumentHighlightKind);
    toJSON(): any;
}
export declare enum SymbolKind {
    File = 0,
    Module = 1,
    Namespace = 2,
    Package = 3,
    Class = 4,
    Method = 5,
    Property = 6,
    Field = 7,
    Constructor = 8,
    Enum = 9,
    Interface = 10,
    Function = 11,
    Variable = 12,
    Constant = 13,
    String = 14,
    Number = 15,
    Boolean = 16,
    Array = 17,
    Object = 18,
    Key = 19,
    Null = 20,
    EnumMember = 21,
    Struct = 22,
    Event = 23,
    Operator = 24,
    TypeParameter = 25
}
export declare enum SymbolTag {
    Deprecated = 1
}
export declare class SymbolInformation {
    static validate(candidate: SymbolInformation): void;
    name: string;
    location: Location;
    kind: SymbolKind;
    tags?: SymbolTag[];
    containerName: string | undefined;
    constructor(name: string, kind: SymbolKind, containerName: string | undefined, location: Location);
    constructor(name: string, kind: SymbolKind, range: Range, uri?: URI, containerName?: string);
    toJSON(): any;
}
export declare class DocumentSymbol {
    static validate(candidate: DocumentSymbol): void;
    name: string;
    detail: string;
    kind: SymbolKind;
    tags?: SymbolTag[];
    range: Range;
    selectionRange: Range;
    children: DocumentSymbol[];
    constructor(name: string, detail: string, kind: SymbolKind, range: Range, selectionRange: Range);
}
export declare enum CodeActionTriggerKind {
    Invoke = 1,
    Automatic = 2
}
export declare class CodeAction {
    title: string;
    command?: vscode.Command;
    edit?: WorkspaceEdit;
    diagnostics?: Diagnostic[];
    kind?: CodeActionKind;
    isPreferred?: boolean;
    constructor(title: string, kind?: CodeActionKind);
}
export declare class CodeActionKind {
    readonly value: string;
    private static readonly sep;
    static Empty: CodeActionKind;
    static QuickFix: CodeActionKind;
    static Refactor: CodeActionKind;
    static RefactorExtract: CodeActionKind;
    static RefactorInline: CodeActionKind;
    static RefactorMove: CodeActionKind;
    static RefactorRewrite: CodeActionKind;
    static Source: CodeActionKind;
    static SourceOrganizeImports: CodeActionKind;
    static SourceFixAll: CodeActionKind;
    constructor(value: string);
    append(parts: string): CodeActionKind;
    intersects(other: CodeActionKind): boolean;
    contains(other: CodeActionKind): boolean;
}
export declare class SelectionRange {
    range: Range;
    parent?: SelectionRange;
    constructor(range: Range, parent?: SelectionRange);
}
export declare class CallHierarchyItem {
    _sessionId?: string;
    _itemId?: string;
    kind: SymbolKind;
    tags?: SymbolTag[];
    name: string;
    detail?: string;
    uri: URI;
    range: Range;
    selectionRange: Range;
    constructor(kind: SymbolKind, name: string, detail: string, uri: URI, range: Range, selectionRange: Range);
}
export declare class CallHierarchyIncomingCall {
    from: vscode.CallHierarchyItem;
    fromRanges: vscode.Range[];
    constructor(item: vscode.CallHierarchyItem, fromRanges: vscode.Range[]);
}
export declare class CallHierarchyOutgoingCall {
    to: vscode.CallHierarchyItem;
    fromRanges: vscode.Range[];
    constructor(item: vscode.CallHierarchyItem, fromRanges: vscode.Range[]);
}
export declare enum LanguageStatusSeverity {
    Information = 0,
    Warning = 1,
    Error = 2
}
export declare class CodeLens {
    range: Range;
    command: vscode.Command | undefined;
    constructor(range: Range, command?: vscode.Command);
    get isResolved(): boolean;
}
export declare class MarkdownString implements vscode.MarkdownString {
    #private;
    static isMarkdownString(thing: any): thing is vscode.MarkdownString;
    constructor(value?: string, supportThemeIcons?: boolean);
    get value(): string;
    set value(value: string);
    get isTrusted(): boolean | MarkdownStringTrustedOptions | undefined;
    set isTrusted(value: boolean | MarkdownStringTrustedOptions | undefined);
    get supportThemeIcons(): boolean | undefined;
    set supportThemeIcons(value: boolean | undefined);
    get supportHtml(): boolean | undefined;
    set supportHtml(value: boolean | undefined);
    get baseUri(): vscode.Uri | undefined;
    set baseUri(value: vscode.Uri | undefined);
    appendText(value: string): vscode.MarkdownString;
    appendMarkdown(value: string): vscode.MarkdownString;
    appendCodeblock(value: string, language?: string): vscode.MarkdownString;
}
export declare class ParameterInformation {
    label: string | [number, number];
    documentation?: string | vscode.MarkdownString;
    constructor(label: string | [number, number], documentation?: string | vscode.MarkdownString);
}
export declare class SignatureInformation {
    label: string;
    documentation?: string | vscode.MarkdownString;
    parameters: ParameterInformation[];
    activeParameter?: number;
    constructor(label: string, documentation?: string | vscode.MarkdownString);
}
export declare class SignatureHelp {
    signatures: SignatureInformation[];
    activeSignature: number;
    activeParameter: number;
    constructor();
}
export declare enum SignatureHelpTriggerKind {
    Invoke = 1,
    TriggerCharacter = 2,
    ContentChange = 3
}
export declare enum InlayHintKind {
    Type = 1,
    Parameter = 2
}
export declare class InlayHintLabelPart {
    value: string;
    tooltip?: string | vscode.MarkdownString;
    location?: Location;
    command?: vscode.Command;
    constructor(value: string);
}
export declare class InlayHint implements vscode.InlayHint {
    label: string | InlayHintLabelPart[];
    tooltip?: string | vscode.MarkdownString;
    position: Position;
    textEdits?: TextEdit[];
    kind?: vscode.InlayHintKind;
    paddingLeft?: boolean;
    paddingRight?: boolean;
    constructor(position: Position, label: string | InlayHintLabelPart[], kind?: vscode.InlayHintKind);
}
export declare enum CompletionTriggerKind {
    Invoke = 0,
    TriggerCharacter = 1,
    TriggerForIncompleteCompletions = 2
}
export interface CompletionContext {
    readonly triggerKind: CompletionTriggerKind;
    readonly triggerCharacter: string | undefined;
}
export declare enum CompletionItemKind {
    Text = 0,
    Method = 1,
    Function = 2,
    Constructor = 3,
    Field = 4,
    Variable = 5,
    Class = 6,
    Interface = 7,
    Module = 8,
    Property = 9,
    Unit = 10,
    Value = 11,
    Enum = 12,
    Keyword = 13,
    Snippet = 14,
    Color = 15,
    File = 16,
    Reference = 17,
    Folder = 18,
    EnumMember = 19,
    Constant = 20,
    Struct = 21,
    Event = 22,
    Operator = 23,
    TypeParameter = 24,
    User = 25,
    Issue = 26
}
export declare enum CompletionItemTag {
    Deprecated = 1
}
export interface CompletionItemLabel {
    label: string;
    detail?: string;
    description?: string;
}
export declare class CompletionItem implements vscode.CompletionItem {
    label: string | CompletionItemLabel;
    kind?: CompletionItemKind;
    tags?: CompletionItemTag[];
    detail?: string;
    documentation?: string | vscode.MarkdownString;
    sortText?: string;
    filterText?: string;
    preselect?: boolean;
    insertText?: string | SnippetString;
    keepWhitespace?: boolean;
    range?: Range | {
        inserting: Range;
        replacing: Range;
    };
    commitCharacters?: string[];
    textEdit?: TextEdit;
    additionalTextEdits?: TextEdit[];
    command?: vscode.Command;
    constructor(label: string | CompletionItemLabel, kind?: CompletionItemKind);
    toJSON(): any;
}
export declare class CompletionList {
    isIncomplete?: boolean;
    items: vscode.CompletionItem[];
    constructor(items?: vscode.CompletionItem[], isIncomplete?: boolean);
}
export declare class InlineSuggestion implements vscode.InlineCompletionItem {
    filterText?: string;
    insertText: string;
    range?: Range;
    command?: vscode.Command;
    constructor(insertText: string, range?: Range, command?: vscode.Command);
}
export declare class InlineSuggestionList implements vscode.InlineCompletionList {
    items: vscode.InlineCompletionItem[];
    commands: vscode.Command[] | undefined;
    constructor(items: vscode.InlineCompletionItem[]);
}
export declare enum ViewColumn {
    Active = -1,
    Beside = -2,
    One = 1,
    Two = 2,
    Three = 3,
    Four = 4,
    Five = 5,
    Six = 6,
    Seven = 7,
    Eight = 8,
    Nine = 9
}
export declare enum StatusBarAlignment {
    Left = 1,
    Right = 2
}
export declare enum TextEditorLineNumbersStyle {
    Off = 0,
    On = 1,
    Relative = 2
}
export declare enum TextDocumentSaveReason {
    Manual = 1,
    AfterDelay = 2,
    FocusOut = 3
}
export declare enum TextEditorRevealType {
    Default = 0,
    InCenter = 1,
    InCenterIfOutsideViewport = 2,
    AtTop = 3
}
export declare enum TextEditorSelectionChangeKind {
    Keyboard = 1,
    Mouse = 2,
    Command = 3
}
export declare enum TextDocumentChangeReason {
    Undo = 1,
    Redo = 2
}
/**
 * These values match very carefully the values of `TrackedRangeStickiness`
 */
export declare enum DecorationRangeBehavior {
    /**
     * TrackedRangeStickiness.AlwaysGrowsWhenTypingAtEdges
     */
    OpenOpen = 0,
    /**
     * TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges
     */
    ClosedClosed = 1,
    /**
     * TrackedRangeStickiness.GrowsOnlyWhenTypingBefore
     */
    OpenClosed = 2,
    /**
     * TrackedRangeStickiness.GrowsOnlyWhenTypingAfter
     */
    ClosedOpen = 3
}
export declare namespace TextEditorSelectionChangeKind {
    function fromValue(s: string | undefined): TextEditorSelectionChangeKind | undefined;
}
export declare class DocumentLink {
    range: Range;
    target?: URI;
    tooltip?: string;
    constructor(range: Range, target: URI | undefined);
}
export declare class Color {
    readonly red: number;
    readonly green: number;
    readonly blue: number;
    readonly alpha: number;
    constructor(red: number, green: number, blue: number, alpha: number);
}
export declare type IColorFormat = string | {
    opaque: string;
    transparent: string;
};
export declare class ColorInformation {
    range: Range;
    color: Color;
    constructor(range: Range, color: Color);
}
export declare class ColorPresentation {
    label: string;
    textEdit?: TextEdit;
    additionalTextEdits?: TextEdit[];
    constructor(label: string);
}
export declare enum ColorFormat {
    RGB = 0,
    HEX = 1,
    HSL = 2
}
export declare enum SourceControlInputBoxValidationType {
    Error = 0,
    Warning = 1,
    Information = 2
}
export declare enum TerminalExitReason {
    Unknown = 0,
    Shutdown = 1,
    Process = 2,
    User = 3,
    Extension = 4
}
export declare class TerminalLink implements vscode.TerminalLink {
    startIndex: number;
    length: number;
    tooltip?: string | undefined;
    constructor(startIndex: number, length: number, tooltip?: string | undefined);
}
export declare enum TerminalLocation {
    Panel = 1,
    Editor = 2
}
export declare class TerminalProfile implements vscode.TerminalProfile {
    options: vscode.TerminalOptions | vscode.ExtensionTerminalOptions;
    constructor(options: vscode.TerminalOptions | vscode.ExtensionTerminalOptions);
}
export declare enum TaskRevealKind {
    Always = 1,
    Silent = 2,
    Never = 3
}
export declare enum TaskPanelKind {
    Shared = 1,
    Dedicated = 2,
    New = 3
}
export declare class TaskGroup implements vscode.TaskGroup {
    readonly label: string;
    isDefault: boolean | undefined;
    private _id;
    static Clean: TaskGroup;
    static Build: TaskGroup;
    static Rebuild: TaskGroup;
    static Test: TaskGroup;
    static from(value: string): TaskGroup | undefined;
    constructor(id: string, label: string);
    get id(): string;
}
export declare class ProcessExecution implements vscode.ProcessExecution {
    private _process;
    private _args;
    private _options;
    constructor(process: string, options?: vscode.ProcessExecutionOptions);
    constructor(process: string, args: string[], options?: vscode.ProcessExecutionOptions);
    get process(): string;
    set process(value: string);
    get args(): string[];
    set args(value: string[]);
    get options(): vscode.ProcessExecutionOptions | undefined;
    set options(value: vscode.ProcessExecutionOptions | undefined);
    computeId(): string;
}
export declare class ShellExecution implements vscode.ShellExecution {
    private _commandLine;
    private _command;
    private _args;
    private _options;
    constructor(commandLine: string, options?: vscode.ShellExecutionOptions);
    constructor(command: string | vscode.ShellQuotedString, args: (string | vscode.ShellQuotedString)[], options?: vscode.ShellExecutionOptions);
    get commandLine(): string | undefined;
    set commandLine(value: string | undefined);
    get command(): string | vscode.ShellQuotedString;
    set command(value: string | vscode.ShellQuotedString);
    get args(): (string | vscode.ShellQuotedString)[];
    set args(value: (string | vscode.ShellQuotedString)[]);
    get options(): vscode.ShellExecutionOptions | undefined;
    set options(value: vscode.ShellExecutionOptions | undefined);
    computeId(): string;
}
export declare enum ShellQuoting {
    Escape = 1,
    Strong = 2,
    Weak = 3
}
export declare enum TaskScope {
    Global = 1,
    Workspace = 2
}
export declare class CustomExecution implements vscode.CustomExecution {
    private _callback;
    constructor(callback: (resolvedDefinition: vscode.TaskDefinition) => Thenable<vscode.Pseudoterminal>);
    computeId(): string;
    set callback(value: (resolvedDefinition: vscode.TaskDefinition) => Thenable<vscode.Pseudoterminal>);
    get callback(): ((resolvedDefinition: vscode.TaskDefinition) => Thenable<vscode.Pseudoterminal>);
}
export declare class Task implements vscode.Task {
    private static ExtensionCallbackType;
    private static ProcessType;
    private static ShellType;
    private static EmptyType;
    private __id;
    private __deprecated;
    private _definition;
    private _scope;
    private _name;
    private _execution;
    private _problemMatchers;
    private _hasDefinedMatchers;
    private _isBackground;
    private _source;
    private _group;
    private _presentationOptions;
    private _runOptions;
    private _detail;
    constructor(definition: vscode.TaskDefinition, name: string, source: string, execution?: ProcessExecution | ShellExecution | CustomExecution, problemMatchers?: string | string[]);
    constructor(definition: vscode.TaskDefinition, scope: vscode.TaskScope.Global | vscode.TaskScope.Workspace | vscode.WorkspaceFolder, name: string, source: string, execution?: ProcessExecution | ShellExecution | CustomExecution, problemMatchers?: string | string[]);
    get _id(): string | undefined;
    set _id(value: string | undefined);
    get _deprecated(): boolean;
    private clear;
    private computeDefinitionBasedOnExecution;
    get definition(): vscode.TaskDefinition;
    set definition(value: vscode.TaskDefinition);
    get scope(): vscode.TaskScope.Global | vscode.TaskScope.Workspace | vscode.WorkspaceFolder | undefined;
    set target(value: vscode.TaskScope.Global | vscode.TaskScope.Workspace | vscode.WorkspaceFolder);
    get name(): string;
    set name(value: string);
    get execution(): ProcessExecution | ShellExecution | CustomExecution | undefined;
    set execution(value: ProcessExecution | ShellExecution | CustomExecution | undefined);
    get problemMatchers(): string[];
    set problemMatchers(value: string[]);
    get hasDefinedMatchers(): boolean;
    get isBackground(): boolean;
    set isBackground(value: boolean);
    get source(): string;
    set source(value: string);
    get group(): TaskGroup | undefined;
    set group(value: TaskGroup | undefined);
    get detail(): string | undefined;
    set detail(value: string | undefined);
    get presentationOptions(): vscode.TaskPresentationOptions;
    set presentationOptions(value: vscode.TaskPresentationOptions);
    get runOptions(): vscode.RunOptions;
    set runOptions(value: vscode.RunOptions);
}
export declare enum ProgressLocation {
    SourceControl = 1,
    Window = 10,
    Notification = 15
}
export declare namespace ViewBadge {
    function isViewBadge(thing: any): thing is vscode.ViewBadge;
}
export declare class TreeItem {
    collapsibleState: vscode.TreeItemCollapsibleState;
    label?: string | vscode.TreeItemLabel;
    resourceUri?: URI;
    iconPath?: string | URI | {
        light: string | URI;
        dark: string | URI;
    } | ThemeIcon;
    command?: vscode.Command;
    contextValue?: string;
    tooltip?: string | vscode.MarkdownString;
    checkboxState?: vscode.TreeItemCheckboxState;
    static isTreeItem(thing: any, extension: IExtensionDescription): thing is TreeItem;
    constructor(label: string | vscode.TreeItemLabel, collapsibleState?: vscode.TreeItemCollapsibleState);
    constructor(resourceUri: URI, collapsibleState?: vscode.TreeItemCollapsibleState);
}
export declare enum TreeItemCollapsibleState {
    None = 0,
    Collapsed = 1,
    Expanded = 2
}
export declare enum TreeItemCheckboxState {
    Unchecked = 0,
    Checked = 1
}
export declare class DataTransferItem {
    readonly value: any;
    asString(): Promise<string>;
    asFile(): undefined | vscode.DataTransferFile;
    readonly id: string;
    constructor(value: any, id?: string);
}
export declare class DataTransfer implements vscode.DataTransfer {
    #private;
    constructor(init?: Iterable<readonly [string, DataTransferItem]>);
    get(mimeType: string): DataTransferItem | undefined;
    set(mimeType: string, value: DataTransferItem): void;
    forEach(callbackfn: (value: DataTransferItem, key: string, dataTransfer: DataTransfer) => void, thisArg?: unknown): void;
    [Symbol.iterator](): IterableIterator<[mimeType: string, item: vscode.DataTransferItem]>;
}
export declare class DocumentDropEdit {
    insertText: string | SnippetString;
    additionalEdit?: WorkspaceEdit;
    constructor(insertText: string | SnippetString);
}
export declare class DocumentPasteEdit {
    insertText: string | SnippetString;
    additionalEdit?: WorkspaceEdit;
    constructor(insertText: string | SnippetString);
}
export declare class ThemeIcon {
    static File: ThemeIcon;
    static Folder: ThemeIcon;
    readonly id: string;
    readonly color?: ThemeColor;
    constructor(id: string, color?: ThemeColor);
    static isThemeIcon(thing: any): boolean;
}
export declare class ThemeColor {
    id: string;
    constructor(id: string);
}
export declare enum ConfigurationTarget {
    Global = 1,
    Workspace = 2,
    WorkspaceFolder = 3
}
export declare class RelativePattern implements IRelativePattern {
    pattern: string;
    private _base;
    get base(): string;
    set base(base: string);
    private _baseUri;
    get baseUri(): URI;
    set baseUri(baseUri: URI);
    constructor(base: vscode.WorkspaceFolder | URI | string, pattern: string);
    toJSON(): IRelativePatternDto;
}
export declare class Breakpoint {
    private _id;
    readonly enabled: boolean;
    readonly condition?: string;
    readonly hitCondition?: string;
    readonly logMessage?: string;
    protected constructor(enabled?: boolean, condition?: string, hitCondition?: string, logMessage?: string);
    get id(): string;
}
export declare class SourceBreakpoint extends Breakpoint {
    readonly location: Location;
    constructor(location: Location, enabled?: boolean, condition?: string, hitCondition?: string, logMessage?: string);
}
export declare class FunctionBreakpoint extends Breakpoint {
    readonly functionName: string;
    constructor(functionName: string, enabled?: boolean, condition?: string, hitCondition?: string, logMessage?: string);
}
export declare class DataBreakpoint extends Breakpoint {
    readonly label: string;
    readonly dataId: string;
    readonly canPersist: boolean;
    constructor(label: string, dataId: string, canPersist: boolean, enabled?: boolean, condition?: string, hitCondition?: string, logMessage?: string);
}
export declare class DebugAdapterExecutable implements vscode.DebugAdapterExecutable {
    readonly command: string;
    readonly args: string[];
    readonly options?: vscode.DebugAdapterExecutableOptions;
    constructor(command: string, args: string[], options?: vscode.DebugAdapterExecutableOptions);
}
export declare class DebugAdapterServer implements vscode.DebugAdapterServer {
    readonly port: number;
    readonly host?: string;
    constructor(port: number, host?: string);
}
export declare class DebugAdapterNamedPipeServer implements vscode.DebugAdapterNamedPipeServer {
    readonly path: string;
    constructor(path: string);
}
export declare class DebugAdapterInlineImplementation implements vscode.DebugAdapterInlineImplementation {
    readonly implementation: vscode.DebugAdapter;
    constructor(impl: vscode.DebugAdapter);
}
export declare class EvaluatableExpression implements vscode.EvaluatableExpression {
    readonly range: vscode.Range;
    readonly expression?: string;
    constructor(range: vscode.Range, expression?: string);
}
export declare enum InlineCompletionTriggerKind {
    Invoke = 0,
    Automatic = 1
}
export declare class InlineValueText implements vscode.InlineValueText {
    readonly range: Range;
    readonly text: string;
    constructor(range: Range, text: string);
}
export declare class InlineValueVariableLookup implements vscode.InlineValueVariableLookup {
    readonly range: Range;
    readonly variableName?: string;
    readonly caseSensitiveLookup: boolean;
    constructor(range: Range, variableName?: string, caseSensitiveLookup?: boolean);
}
export declare class InlineValueEvaluatableExpression implements vscode.InlineValueEvaluatableExpression {
    readonly range: Range;
    readonly expression?: string;
    constructor(range: Range, expression?: string);
}
export declare class InlineValueContext implements vscode.InlineValueContext {
    readonly frameId: number;
    readonly stoppedLocation: vscode.Range;
    constructor(frameId: number, range: vscode.Range);
}
export declare enum FileChangeType {
    Changed = 1,
    Created = 2,
    Deleted = 3
}
export declare class FileSystemError extends Error {
    static FileExists(messageOrUri?: string | URI): FileSystemError;
    static FileNotFound(messageOrUri?: string | URI): FileSystemError;
    static FileNotADirectory(messageOrUri?: string | URI): FileSystemError;
    static FileIsADirectory(messageOrUri?: string | URI): FileSystemError;
    static NoPermissions(messageOrUri?: string | URI): FileSystemError;
    static Unavailable(messageOrUri?: string | URI): FileSystemError;
    readonly code: string;
    constructor(uriOrMessage?: string | URI, code?: FileSystemProviderErrorCode, terminator?: Function);
}
export declare class FoldingRange {
    start: number;
    end: number;
    kind?: FoldingRangeKind;
    constructor(start: number, end: number, kind?: FoldingRangeKind);
}
export declare enum FoldingRangeKind {
    Comment = 1,
    Imports = 2,
    Region = 3
}
export declare enum CommentThreadCollapsibleState {
    /**
     * Determines an item is collapsed
     */
    Collapsed = 0,
    /**
     * Determines an item is expanded
     */
    Expanded = 1
}
export declare enum CommentMode {
    Editing = 0,
    Preview = 1
}
export declare enum CommentThreadState {
    Unresolved = 0,
    Resolved = 1
}
export declare class SemanticTokensLegend {
    readonly tokenTypes: string[];
    readonly tokenModifiers: string[];
    constructor(tokenTypes: string[], tokenModifiers?: string[]);
}
export declare class SemanticTokensBuilder {
    private _prevLine;
    private _prevChar;
    private _dataIsSortedAndDeltaEncoded;
    private _data;
    private _dataLen;
    private _tokenTypeStrToInt;
    private _tokenModifierStrToInt;
    private _hasLegend;
    constructor(legend?: vscode.SemanticTokensLegend);
    push(line: number, char: number, length: number, tokenType: number, tokenModifiers?: number): void;
    push(range: Range, tokenType: string, tokenModifiers?: string[]): void;
    private _push;
    private _pushEncoded;
    private static _sortAndDeltaEncode;
    build(resultId?: string): SemanticTokens;
}
export declare class SemanticTokens {
    readonly resultId: string | undefined;
    readonly data: Uint32Array;
    constructor(data: Uint32Array, resultId?: string);
}
export declare class SemanticTokensEdit {
    readonly start: number;
    readonly deleteCount: number;
    readonly data: Uint32Array | undefined;
    constructor(start: number, deleteCount: number, data?: Uint32Array);
}
export declare class SemanticTokensEdits {
    readonly resultId: string | undefined;
    readonly edits: SemanticTokensEdit[];
    constructor(edits: SemanticTokensEdit[], resultId?: string);
}
export declare enum DebugConsoleMode {
    /**
     * Debug session should have a separate debug console.
     */
    Separate = 0,
    /**
     * Debug session should share debug console with its parent session.
     * This value has no effect for sessions which do not have a parent session.
     */
    MergeWithParent = 1
}
export declare class QuickInputButtons {
    static readonly Back: vscode.QuickInputButton;
    private constructor();
}
export declare enum QuickPickItemKind {
    Separator = -1,
    Default = 0
}
export declare enum InputBoxValidationSeverity {
    Info = 1,
    Warning = 2,
    Error = 3
}
export declare enum ExtensionKind {
    UI = 1,
    Workspace = 2
}
export declare class FileDecoration {
    static validate(d: FileDecoration): boolean;
    badge?: string | vscode.ThemeIcon;
    tooltip?: string;
    color?: vscode.ThemeColor;
    propagate?: boolean;
    constructor(badge?: string | ThemeIcon, tooltip?: string, color?: ThemeColor);
}
export declare class ColorTheme implements vscode.ColorTheme {
    readonly kind: ColorThemeKind;
    constructor(kind: ColorThemeKind);
}
export declare enum ColorThemeKind {
    Light = 1,
    Dark = 2,
    HighContrast = 3,
    HighContrastLight = 4
}
export declare class NotebookRange {
    static isNotebookRange(thing: any): thing is vscode.NotebookRange;
    private _start;
    private _end;
    get start(): number;
    get end(): number;
    get isEmpty(): boolean;
    constructor(start: number, end: number);
    with(change: {
        start?: number;
        end?: number;
    }): NotebookRange;
}
export declare class NotebookCellData {
    static validate(data: NotebookCellData): void;
    static isNotebookCellDataArray(value: unknown): value is vscode.NotebookCellData[];
    static isNotebookCellData(value: unknown): value is vscode.NotebookCellData;
    kind: NotebookCellKind;
    value: string;
    languageId: string;
    mime?: string;
    outputs?: vscode.NotebookCellOutput[];
    metadata?: Record<string, any>;
    executionSummary?: vscode.NotebookCellExecutionSummary;
    constructor(kind: NotebookCellKind, value: string, languageId: string, mime?: string, outputs?: vscode.NotebookCellOutput[], metadata?: Record<string, any>, executionSummary?: vscode.NotebookCellExecutionSummary);
}
export declare class NotebookData {
    cells: NotebookCellData[];
    metadata?: {
        [key: string]: any;
    };
    constructor(cells: NotebookCellData[]);
}
export declare class NotebookCellOutputItem {
    #private;
    data: Uint8Array;
    mime: string;
    static isNotebookCellOutputItem(obj: unknown): obj is vscode.NotebookCellOutputItem;
    static error(err: Error | {
        name: string;
        message?: string;
        stack?: string;
    }): NotebookCellOutputItem;
    static stdout(value: string): NotebookCellOutputItem;
    static stderr(value: string): NotebookCellOutputItem;
    static bytes(value: Uint8Array, mime?: string): NotebookCellOutputItem;
    static text(value: string, mime?: string): NotebookCellOutputItem;
    static json(value: any, mime?: string): NotebookCellOutputItem;
    constructor(data: Uint8Array, mime: string);
}
export declare class NotebookCellOutput {
    static isNotebookCellOutput(candidate: any): candidate is vscode.NotebookCellOutput;
    static ensureUniqueMimeTypes(items: NotebookCellOutputItem[], warn?: boolean): NotebookCellOutputItem[];
    id: string;
    items: NotebookCellOutputItem[];
    metadata?: Record<string, any>;
    constructor(items: NotebookCellOutputItem[], idOrMetadata?: string | Record<string, any>, metadata?: Record<string, any>);
}
export declare enum NotebookCellKind {
    Markup = 1,
    Code = 2
}
export declare enum NotebookCellExecutionState {
    Idle = 1,
    Pending = 2,
    Executing = 3
}
export declare enum NotebookCellStatusBarAlignment {
    Left = 1,
    Right = 2
}
export declare enum NotebookEditorRevealType {
    Default = 0,
    InCenter = 1,
    InCenterIfOutsideViewport = 2,
    AtTop = 3
}
export declare class NotebookCellStatusBarItem {
    text: string;
    alignment: NotebookCellStatusBarAlignment;
    constructor(text: string, alignment: NotebookCellStatusBarAlignment);
}
export declare enum NotebookControllerAffinity {
    Default = 1,
    Preferred = 2
}
export declare enum NotebookControllerAffinity2 {
    Default = 1,
    Preferred = 2,
    Hidden = -1
}
export declare class NotebookRendererScript {
    uri: vscode.Uri;
    provides: readonly string[];
    constructor(uri: vscode.Uri, provides?: string | readonly string[]);
}
export declare class NotebookKernelSourceAction {
    label: string;
    description?: string;
    detail?: string;
    command?: vscode.Command;
    constructor(label: string);
}
export declare class TimelineItem implements vscode.TimelineItem {
    label: string;
    timestamp: number;
    constructor(label: string, timestamp: number);
}
export declare enum ExtensionMode {
    /**
     * The extension is installed normally (for example, from the marketplace
     * or VSIX) in VS Code.
     */
    Production = 1,
    /**
     * The extension is running from an `--extensionDevelopmentPath` provided
     * when launching VS Code.
     */
    Development = 2,
    /**
     * The extension is running from an `--extensionDevelopmentPath` and
     * the extension host is running unit tests.
     */
    Test = 3
}
export declare enum ExtensionRuntime {
    /**
     * The extension is running in a NodeJS extension host. Runtime access to NodeJS APIs is available.
     */
    Node = 1,
    /**
     * The extension is running in a Webworker extension host. Runtime access is limited to Webworker APIs.
     */
    Webworker = 2
}
export declare enum StandardTokenType {
    Other = 0,
    Comment = 1,
    String = 2,
    RegEx = 3
}
export declare class LinkedEditingRanges {
    readonly ranges: Range[];
    readonly wordPattern?: RegExp | undefined;
    constructor(ranges: Range[], wordPattern?: RegExp | undefined);
}
export declare class PortAttributes {
    private _port;
    private _autoForwardAction;
    constructor(port: number, autoForwardAction: PortAutoForwardAction);
    get port(): number;
    get autoForwardAction(): PortAutoForwardAction;
}
export declare enum TestResultState {
    Queued = 1,
    Running = 2,
    Passed = 3,
    Failed = 4,
    Skipped = 5,
    Errored = 6
}
export declare enum TestRunProfileKind {
    Run = 1,
    Debug = 2,
    Coverage = 3
}
export declare class TestRunRequest implements vscode.TestRunRequest {
    readonly include: vscode.TestItem[] | undefined;
    readonly exclude: vscode.TestItem[] | undefined;
    readonly profile: vscode.TestRunProfile | undefined;
    constructor(include?: vscode.TestItem[] | undefined, exclude?: vscode.TestItem[] | undefined, profile?: vscode.TestRunProfile | undefined);
}
export declare class TestMessage implements vscode.TestMessage {
    message: string | vscode.MarkdownString;
    expectedOutput?: string;
    actualOutput?: string;
    location?: vscode.Location;
    static diff(message: string | vscode.MarkdownString, expected: string, actual: string): TestMessage;
    constructor(message: string | vscode.MarkdownString);
}
export declare class TestTag implements vscode.TestTag {
    readonly id: string;
    constructor(id: string);
}
export declare class CoveredCount implements vscode.CoveredCount {
    covered: number;
    total: number;
    constructor(covered: number, total: number);
}
export declare class FileCoverage implements vscode.FileCoverage {
    readonly uri: vscode.Uri;
    statementCoverage: vscode.CoveredCount;
    branchCoverage?: vscode.CoveredCount | undefined;
    functionCoverage?: vscode.CoveredCount | undefined;
    static fromDetails(uri: vscode.Uri, details: vscode.DetailedCoverage[]): vscode.FileCoverage;
    detailedCoverage?: vscode.DetailedCoverage[];
    constructor(uri: vscode.Uri, statementCoverage: vscode.CoveredCount, branchCoverage?: vscode.CoveredCount | undefined, functionCoverage?: vscode.CoveredCount | undefined);
}
export declare class StatementCoverage implements vscode.StatementCoverage {
    executionCount: number;
    location: Position | Range;
    branches: vscode.BranchCoverage[];
    constructor(executionCount: number, location: Position | Range, branches?: vscode.BranchCoverage[]);
}
export declare class BranchCoverage implements vscode.BranchCoverage {
    executionCount: number;
    location: Position | Range;
    constructor(executionCount: number, location: Position | Range);
}
export declare class FunctionCoverage implements vscode.FunctionCoverage {
    executionCount: number;
    location: Position | Range;
    constructor(executionCount: number, location: Position | Range);
}
export declare enum ExternalUriOpenerPriority {
    None = 0,
    Option = 1,
    Default = 2,
    Preferred = 3
}
export declare enum WorkspaceTrustState {
    Untrusted = 0,
    Trusted = 1,
    Unspecified = 2
}
export declare enum PortAutoForwardAction {
    Notify = 1,
    OpenBrowser = 2,
    OpenPreview = 3,
    Silent = 4,
    Ignore = 5,
    OpenBrowserOnce = 6
}
export declare class TypeHierarchyItem {
    _sessionId?: string;
    _itemId?: string;
    kind: SymbolKind;
    tags?: SymbolTag[];
    name: string;
    detail?: string;
    uri: URI;
    range: Range;
    selectionRange: Range;
    constructor(kind: SymbolKind, name: string, detail: string, uri: URI, range: Range, selectionRange: Range);
}
export declare class TextTabInput {
    readonly uri: URI;
    constructor(uri: URI);
}
export declare class TextDiffTabInput {
    readonly original: URI;
    readonly modified: URI;
    constructor(original: URI, modified: URI);
}
export declare class TextMergeTabInput {
    readonly base: URI;
    readonly input1: URI;
    readonly input2: URI;
    readonly result: URI;
    constructor(base: URI, input1: URI, input2: URI, result: URI);
}
export declare class CustomEditorTabInput {
    readonly uri: URI;
    readonly viewType: string;
    constructor(uri: URI, viewType: string);
}
export declare class WebviewEditorTabInput {
    readonly viewType: string;
    constructor(viewType: string);
}
export declare class NotebookEditorTabInput {
    readonly uri: URI;
    readonly notebookType: string;
    constructor(uri: URI, notebookType: string);
}
export declare class NotebookDiffEditorTabInput {
    readonly original: URI;
    readonly modified: URI;
    readonly notebookType: string;
    constructor(original: URI, modified: URI, notebookType: string);
}
export declare class TerminalEditorTabInput {
    constructor();
}
export declare class InteractiveWindowInput {
    readonly uri: URI;
    readonly inputBoxUri: URI;
    constructor(uri: URI, inputBoxUri: URI);
}
export {};

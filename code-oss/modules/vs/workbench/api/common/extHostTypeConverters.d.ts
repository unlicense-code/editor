import { IDataTransferItem, VSDataTransfer } from 'vs/base/common/dataTransfer';
import * as htmlContent from 'vs/base/common/htmlContent';
import { DisposableStore } from 'vs/base/common/lifecycle';
import { URI, UriComponents } from 'vs/base/common/uri';
import { IURITransformer } from 'vs/base/common/uriIpc';
import { RenderLineNumbersType } from 'vs/editor/common/config/editorOptions';
import { IPosition } from 'vs/editor/common/core/position';
import * as editorRange from 'vs/editor/common/core/range';
import { ISelection } from 'vs/editor/common/core/selection';
import { IContentDecorationRenderOptions, IDecorationOptions, IDecorationRenderOptions, IThemeDecorationRenderOptions } from 'vs/editor/common/editorCommon';
import * as encodedTokenAttributes from 'vs/editor/common/encodedTokenAttributes';
import * as languages from 'vs/editor/common/languages';
import * as languageSelector from 'vs/editor/common/languageSelector';
import { EndOfLineSequence, TrackedRangeStickiness } from 'vs/editor/common/model';
import { ITextEditorOptions } from 'vs/platform/editor/common/editor';
import { IMarkerData, IRelatedInformation, MarkerSeverity, MarkerTag } from 'vs/platform/markers/common/markers';
import { ProgressLocation as MainProgressLocation } from 'vs/platform/progress/common/progress';
import * as extHostProtocol from 'vs/workbench/api/common/extHost.protocol';
import { SaveReason } from 'vs/workbench/common/editor';
import { IViewBadge } from 'vs/workbench/common/views';
import * as notebooks from 'vs/workbench/contrib/notebook/common/notebookCommon';
import { ICellRange } from 'vs/workbench/contrib/notebook/common/notebookRange';
import * as search from 'vs/workbench/contrib/search/common/search';
import { CoverageDetails, IFileCoverage, ISerializedTestResults, ITestErrorMessage, ITestItem, ITestTag } from 'vs/workbench/contrib/testing/common/testTypes';
import { EditorGroupColumn } from 'vs/workbench/services/editor/common/editorGroupColumn';
import type * as vscode from 'vscode';
import * as types from './extHostTypes';
export declare namespace Command {
    interface ICommandsConverter {
        fromInternal(command: extHostProtocol.ICommandDto): vscode.Command | undefined;
        toInternal(command: vscode.Command | undefined, disposables: DisposableStore): extHostProtocol.ICommandDto | undefined;
    }
}
export interface PositionLike {
    line: number;
    character: number;
}
export interface RangeLike {
    start: PositionLike;
    end: PositionLike;
}
export interface SelectionLike extends RangeLike {
    anchor: PositionLike;
    active: PositionLike;
}
export declare namespace Selection {
    function to(selection: ISelection): types.Selection;
    function from(selection: SelectionLike): ISelection;
}
export declare namespace Range {
    function from(range: undefined): undefined;
    function from(range: RangeLike): editorRange.IRange;
    function from(range: RangeLike | undefined): editorRange.IRange | undefined;
    function to(range: undefined): types.Range;
    function to(range: editorRange.IRange): types.Range;
    function to(range: editorRange.IRange | undefined): types.Range | undefined;
}
export declare namespace TokenType {
    function to(type: encodedTokenAttributes.StandardTokenType): types.StandardTokenType;
}
export declare namespace Position {
    function to(position: IPosition): types.Position;
    function from(position: types.Position | vscode.Position): IPosition;
}
export declare namespace DocumentSelector {
    function from(value: vscode.DocumentSelector, uriTransformer?: IURITransformer): extHostProtocol.IDocumentFilterDto[];
}
export declare namespace DiagnosticTag {
    function from(value: vscode.DiagnosticTag): MarkerTag | undefined;
    function to(value: MarkerTag): vscode.DiagnosticTag | undefined;
}
export declare namespace Diagnostic {
    function from(value: vscode.Diagnostic): IMarkerData;
    function to(value: IMarkerData): vscode.Diagnostic;
}
export declare namespace DiagnosticRelatedInformation {
    function from(value: vscode.DiagnosticRelatedInformation): IRelatedInformation;
    function to(value: IRelatedInformation): types.DiagnosticRelatedInformation;
}
export declare namespace DiagnosticSeverity {
    function from(value: number): MarkerSeverity;
    function to(value: MarkerSeverity): types.DiagnosticSeverity;
}
export declare namespace ViewColumn {
    function from(column?: vscode.ViewColumn): EditorGroupColumn;
    function to(position: EditorGroupColumn): vscode.ViewColumn;
}
export declare function isDecorationOptionsArr(something: vscode.Range[] | vscode.DecorationOptions[]): something is vscode.DecorationOptions[];
export declare namespace MarkdownString {
    function fromMany(markup: (vscode.MarkdownString | vscode.MarkedString)[]): htmlContent.IMarkdownString[];
    function from(markup: vscode.MarkdownString | vscode.MarkedString): htmlContent.IMarkdownString;
    function to(value: htmlContent.IMarkdownString): vscode.MarkdownString;
    function fromStrict(value: string | vscode.MarkdownString | undefined | null): undefined | string | htmlContent.IMarkdownString;
}
export declare function fromRangeOrRangeWithMessage(ranges: vscode.Range[] | vscode.DecorationOptions[]): IDecorationOptions[];
export declare function pathOrURIToURI(value: string | URI): URI;
export declare namespace ThemableDecorationAttachmentRenderOptions {
    function from(options: vscode.ThemableDecorationAttachmentRenderOptions): IContentDecorationRenderOptions;
}
export declare namespace ThemableDecorationRenderOptions {
    function from(options: vscode.ThemableDecorationRenderOptions): IThemeDecorationRenderOptions;
}
export declare namespace DecorationRangeBehavior {
    function from(value: types.DecorationRangeBehavior): TrackedRangeStickiness;
}
export declare namespace DecorationRenderOptions {
    function from(options: vscode.DecorationRenderOptions): IDecorationRenderOptions;
}
export declare namespace TextEdit {
    function from(edit: vscode.TextEdit): languages.TextEdit;
    function to(edit: languages.TextEdit): types.TextEdit;
}
export declare namespace WorkspaceEdit {
    interface IVersionInformationProvider {
        getTextDocumentVersion(uri: URI): number | undefined;
        getNotebookDocumentVersion(uri: URI): number | undefined;
    }
    function from(value: vscode.WorkspaceEdit, versionInfo?: IVersionInformationProvider): extHostProtocol.IWorkspaceEditDto;
    function to(value: extHostProtocol.IWorkspaceEditDto): types.WorkspaceEdit;
}
export declare namespace SymbolKind {
    function from(kind: vscode.SymbolKind): languages.SymbolKind;
    function to(kind: languages.SymbolKind): vscode.SymbolKind;
}
export declare namespace SymbolTag {
    function from(kind: types.SymbolTag): languages.SymbolTag;
    function to(kind: languages.SymbolTag): types.SymbolTag;
}
export declare namespace WorkspaceSymbol {
    function from(info: vscode.SymbolInformation): search.IWorkspaceSymbol;
    function to(info: search.IWorkspaceSymbol): types.SymbolInformation;
}
export declare namespace DocumentSymbol {
    function from(info: vscode.DocumentSymbol): languages.DocumentSymbol;
    function to(info: languages.DocumentSymbol): vscode.DocumentSymbol;
}
export declare namespace CallHierarchyItem {
    function to(item: extHostProtocol.ICallHierarchyItemDto): types.CallHierarchyItem;
    function from(item: vscode.CallHierarchyItem, sessionId?: string, itemId?: string): extHostProtocol.ICallHierarchyItemDto;
}
export declare namespace CallHierarchyIncomingCall {
    function to(item: extHostProtocol.IIncomingCallDto): types.CallHierarchyIncomingCall;
}
export declare namespace CallHierarchyOutgoingCall {
    function to(item: extHostProtocol.IOutgoingCallDto): types.CallHierarchyOutgoingCall;
}
export declare namespace location {
    function from(value: vscode.Location): languages.Location;
    function to(value: extHostProtocol.ILocationDto): types.Location;
}
export declare namespace DefinitionLink {
    function from(value: vscode.Location | vscode.DefinitionLink): languages.LocationLink;
    function to(value: extHostProtocol.ILocationLinkDto): vscode.LocationLink;
}
export declare namespace Hover {
    function from(hover: vscode.Hover): languages.Hover;
    function to(info: languages.Hover): types.Hover;
}
export declare namespace EvaluatableExpression {
    function from(expression: vscode.EvaluatableExpression): languages.EvaluatableExpression;
    function to(info: languages.EvaluatableExpression): types.EvaluatableExpression;
}
export declare namespace InlineValue {
    function from(inlineValue: vscode.InlineValue): languages.InlineValue;
    function to(inlineValue: languages.InlineValue): vscode.InlineValue;
}
export declare namespace InlineValueContext {
    function from(inlineValueContext: vscode.InlineValueContext): extHostProtocol.IInlineValueContextDto;
    function to(inlineValueContext: extHostProtocol.IInlineValueContextDto): types.InlineValueContext;
}
export declare namespace DocumentHighlight {
    function from(documentHighlight: vscode.DocumentHighlight): languages.DocumentHighlight;
    function to(occurrence: languages.DocumentHighlight): types.DocumentHighlight;
}
export declare namespace CompletionTriggerKind {
    function to(kind: languages.CompletionTriggerKind): types.CompletionTriggerKind;
}
export declare namespace CompletionContext {
    function to(context: languages.CompletionContext): types.CompletionContext;
}
export declare namespace CompletionItemTag {
    function from(kind: types.CompletionItemTag): languages.CompletionItemTag;
    function to(kind: languages.CompletionItemTag): types.CompletionItemTag;
}
export declare namespace CompletionItemKind {
    function from(kind: types.CompletionItemKind): languages.CompletionItemKind;
    function to(kind: languages.CompletionItemKind): types.CompletionItemKind;
}
export declare namespace CompletionItem {
    function to(suggestion: languages.CompletionItem, converter?: Command.ICommandsConverter): types.CompletionItem;
}
export declare namespace ParameterInformation {
    function from(info: types.ParameterInformation): languages.ParameterInformation;
    function to(info: languages.ParameterInformation): types.ParameterInformation;
}
export declare namespace SignatureInformation {
    function from(info: types.SignatureInformation): languages.SignatureInformation;
    function to(info: languages.SignatureInformation): types.SignatureInformation;
}
export declare namespace SignatureHelp {
    function from(help: types.SignatureHelp): languages.SignatureHelp;
    function to(help: languages.SignatureHelp): types.SignatureHelp;
}
export declare namespace InlayHint {
    function to(converter: Command.ICommandsConverter, hint: languages.InlayHint): vscode.InlayHint;
}
export declare namespace InlayHintLabelPart {
    function to(converter: Command.ICommandsConverter, part: languages.InlayHintLabelPart): types.InlayHintLabelPart;
}
export declare namespace InlayHintKind {
    function from(kind: vscode.InlayHintKind): languages.InlayHintKind;
    function to(kind: languages.InlayHintKind): vscode.InlayHintKind;
}
export declare namespace DocumentLink {
    function from(link: vscode.DocumentLink): languages.ILink;
    function to(link: languages.ILink): vscode.DocumentLink;
}
export declare namespace ColorPresentation {
    function to(colorPresentation: languages.IColorPresentation): types.ColorPresentation;
    function from(colorPresentation: vscode.ColorPresentation): languages.IColorPresentation;
}
export declare namespace Color {
    function to(c: [number, number, number, number]): types.Color;
    function from(color: types.Color): [number, number, number, number];
}
export declare namespace SelectionRange {
    function from(obj: vscode.SelectionRange): languages.SelectionRange;
    function to(obj: languages.SelectionRange): vscode.SelectionRange;
}
export declare namespace TextDocumentSaveReason {
    function to(reason: SaveReason): vscode.TextDocumentSaveReason;
}
export declare namespace TextEditorLineNumbersStyle {
    function from(style: vscode.TextEditorLineNumbersStyle): RenderLineNumbersType;
    function to(style: RenderLineNumbersType): vscode.TextEditorLineNumbersStyle;
}
export declare namespace EndOfLine {
    function from(eol: vscode.EndOfLine): EndOfLineSequence | undefined;
    function to(eol: EndOfLineSequence): vscode.EndOfLine | undefined;
}
export declare namespace ProgressLocation {
    function from(loc: vscode.ProgressLocation | {
        viewId: string;
    }): MainProgressLocation | string;
}
export declare namespace FoldingRange {
    function from(r: vscode.FoldingRange): languages.FoldingRange;
}
export declare namespace FoldingRangeKind {
    function from(kind: vscode.FoldingRangeKind | undefined): languages.FoldingRangeKind | undefined;
}
export interface TextEditorOpenOptions extends vscode.TextDocumentShowOptions {
    background?: boolean;
    override?: boolean;
}
export declare namespace TextEditorOpenOptions {
    function from(options?: TextEditorOpenOptions): ITextEditorOptions | undefined;
}
export declare namespace GlobPattern {
    function from(pattern: vscode.GlobPattern): string | extHostProtocol.IRelativePatternDto;
    function from(pattern: undefined): undefined;
    function from(pattern: null): null;
    function from(pattern: vscode.GlobPattern | undefined | null): string | extHostProtocol.IRelativePatternDto | undefined | null;
    function to(pattern: string | extHostProtocol.IRelativePatternDto): vscode.GlobPattern;
}
export declare namespace LanguageSelector {
    function from(selector: undefined): undefined;
    function from(selector: vscode.DocumentSelector): languageSelector.LanguageSelector;
    function from(selector: vscode.DocumentSelector | undefined): languageSelector.LanguageSelector | undefined;
}
export declare namespace NotebookRange {
    function from(range: vscode.NotebookRange): ICellRange;
    function to(range: ICellRange): types.NotebookRange;
}
export declare namespace NotebookCellExecutionSummary {
    function to(data: notebooks.NotebookCellInternalMetadata): vscode.NotebookCellExecutionSummary;
    function from(data: vscode.NotebookCellExecutionSummary): Partial<notebooks.NotebookCellInternalMetadata>;
}
export declare namespace NotebookCellExecutionState {
    function to(state: notebooks.NotebookCellExecutionState): vscode.NotebookCellExecutionState | undefined;
}
export declare namespace NotebookCellKind {
    function from(data: vscode.NotebookCellKind): notebooks.CellKind;
    function to(data: notebooks.CellKind): vscode.NotebookCellKind;
}
export declare namespace NotebookData {
    function from(data: vscode.NotebookData): extHostProtocol.NotebookDataDto;
    function to(data: extHostProtocol.NotebookDataDto): vscode.NotebookData;
}
export declare namespace NotebookCellData {
    function from(data: vscode.NotebookCellData): extHostProtocol.NotebookCellDataDto;
    function to(data: extHostProtocol.NotebookCellDataDto): vscode.NotebookCellData;
}
export declare namespace NotebookCellOutputItem {
    function from(item: types.NotebookCellOutputItem): extHostProtocol.NotebookOutputItemDto;
    function to(item: extHostProtocol.NotebookOutputItemDto): types.NotebookCellOutputItem;
}
export declare namespace NotebookCellOutput {
    function from(output: vscode.NotebookCellOutput): extHostProtocol.NotebookOutputDto;
    function to(output: extHostProtocol.NotebookOutputDto): vscode.NotebookCellOutput;
}
export declare namespace NotebookExclusiveDocumentPattern {
    function from(pattern: {
        include: vscode.GlobPattern | undefined;
        exclude: vscode.GlobPattern | undefined;
    }): {
        include: string | extHostProtocol.IRelativePatternDto | undefined;
        exclude: string | extHostProtocol.IRelativePatternDto | undefined;
    };
    function from(pattern: vscode.GlobPattern): string | extHostProtocol.IRelativePatternDto;
    function from(pattern: undefined): undefined;
    function from(pattern: {
        include: vscode.GlobPattern | undefined | null;
        exclude: vscode.GlobPattern | undefined;
    } | vscode.GlobPattern | undefined): string | extHostProtocol.IRelativePatternDto | {
        include: string | extHostProtocol.IRelativePatternDto | undefined;
        exclude: string | extHostProtocol.IRelativePatternDto | undefined;
    } | undefined;
    function to(pattern: string | extHostProtocol.IRelativePatternDto | {
        include: string | extHostProtocol.IRelativePatternDto;
        exclude: string | extHostProtocol.IRelativePatternDto;
    }): {
        include: vscode.GlobPattern;
        exclude: vscode.GlobPattern;
    } | vscode.GlobPattern;
}
export declare namespace NotebookStatusBarItem {
    function from(item: vscode.NotebookCellStatusBarItem, commandsConverter: Command.ICommandsConverter, disposables: DisposableStore): notebooks.INotebookCellStatusBarItem;
}
export declare namespace NotebookKernelSourceAction {
    function from(item: vscode.NotebookKernelSourceAction, commandsConverter: Command.ICommandsConverter, disposables: DisposableStore): notebooks.INotebookKernelSourceAction;
}
export declare namespace NotebookDocumentContentOptions {
    function from(options: vscode.NotebookDocumentContentOptions | undefined): notebooks.TransientOptions;
}
export declare namespace NotebookRendererScript {
    function from(preload: vscode.NotebookRendererScript): {
        uri: UriComponents;
        provides: readonly string[];
    };
    function to(preload: {
        uri: UriComponents;
        provides: readonly string[];
    }): vscode.NotebookRendererScript;
}
export declare namespace TestMessage {
    function from(message: vscode.TestMessage): ITestErrorMessage.Serialized;
    function to(item: ITestErrorMessage.Serialized): vscode.TestMessage;
}
export declare namespace TestTag {
    const namespace: (ctrlId: string, tagId: string) => string;
    const denamespace: (namespaced: string) => {
        ctrlId: string;
        tagId: string;
    };
}
export declare namespace TestItem {
    type Raw = vscode.TestItem;
    function from(item: vscode.TestItem): ITestItem;
    function toPlain(item: ITestItem.Serialized): vscode.TestItem;
}
export declare namespace TestTag {
    function from(tag: vscode.TestTag): ITestTag;
    function to(tag: ITestTag): vscode.TestTag;
}
export declare namespace TestResults {
    function to(serialized: ISerializedTestResults): vscode.TestRunResult;
}
export declare namespace TestCoverage {
    function fromDetailed(coverage: vscode.DetailedCoverage): CoverageDetails;
    function fromFile(coverage: vscode.FileCoverage): IFileCoverage;
}
export declare namespace CodeActionTriggerKind {
    function to(value: languages.CodeActionTriggerType): types.CodeActionTriggerKind;
}
export declare namespace TypeHierarchyItem {
    function to(item: extHostProtocol.ITypeHierarchyItemDto): types.TypeHierarchyItem;
    function from(item: vscode.TypeHierarchyItem, sessionId?: string, itemId?: string): extHostProtocol.ITypeHierarchyItemDto;
}
export declare namespace ViewBadge {
    function from(badge: vscode.ViewBadge | undefined): IViewBadge | undefined;
}
export declare namespace DataTransferItem {
    function to(mime: string, item: extHostProtocol.DataTransferItemDTO, resolveFileData: () => Promise<Uint8Array>): types.DataTransferItem;
    function from(mime: string, item: vscode.DataTransferItem | IDataTransferItem): Promise<extHostProtocol.DataTransferItemDTO>;
}
export declare namespace DataTransfer {
    function toDataTransfer(value: extHostProtocol.DataTransferDTO, resolveFileData: (itemId: string) => Promise<Uint8Array>): types.DataTransfer;
    function toDataTransferDTO(value: vscode.DataTransfer | VSDataTransfer): Promise<extHostProtocol.DataTransferDTO>;
}

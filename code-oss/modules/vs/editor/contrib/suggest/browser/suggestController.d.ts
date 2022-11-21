import { IdleValue } from 'vs/base/common/async';
import { IDisposable } from 'vs/base/common/lifecycle';
import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
import { EditorAction, ServicesAccessor } from 'vs/editor/browser/editorExtensions';
import { IEditorContribution } from 'vs/editor/common/editorCommon';
import { CompletionItemProvider } from 'vs/editor/common/languages';
import { ISuggestMemoryService } from 'vs/editor/contrib/suggest/browser/suggestMemory';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ILogService } from 'vs/platform/log/common/log';
import { CompletionItem, ISuggestItemPreselector } from './suggest';
import { SuggestModel } from './suggestModel';
import { ISelectedSuggestion, SuggestWidget } from './suggestWidget';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
declare const enum InsertFlags {
    NoBeforeUndoStop = 1,
    NoAfterUndoStop = 2,
    KeepAlternativeSuggestions = 4,
    AlternativeOverwriteConfig = 8
}
export declare class SuggestController implements IEditorContribution {
    private readonly _memoryService;
    private readonly _commandService;
    private readonly _contextKeyService;
    private readonly _instantiationService;
    private readonly _logService;
    private readonly _telemetryService;
    static readonly ID: string;
    static get(editor: ICodeEditor): SuggestController | null;
    readonly editor: ICodeEditor;
    readonly model: SuggestModel;
    readonly widget: IdleValue<SuggestWidget>;
    private readonly _alternatives;
    private readonly _lineSuffix;
    private readonly _toDispose;
    private readonly _overtypingCapturer;
    private readonly _selectors;
    constructor(editor: ICodeEditor, _memoryService: ISuggestMemoryService, _commandService: ICommandService, _contextKeyService: IContextKeyService, _instantiationService: IInstantiationService, _logService: ILogService, _telemetryService: ITelemetryService);
    dispose(): void;
    protected _insertSuggestion(event: ISelectedSuggestion | undefined, flags: InsertFlags): void;
    private _telemetryGate;
    private _reportSuggestionAcceptedTelemetry;
    getOverwriteInfo(item: CompletionItem, toggleMode: boolean): {
        overwriteBefore: number;
        overwriteAfter: number;
    };
    private _alertCompletionItem;
    triggerSuggest(onlyFrom?: Set<CompletionItemProvider>, auto?: boolean, noFilter?: boolean): void;
    triggerSuggestAndAcceptBest(arg: {
        fallback: string;
    }): void;
    acceptSelectedSuggestion(keepAlternativeSuggestions: boolean, alternativeOverwriteConfig: boolean): void;
    acceptNextSuggestion(): void;
    acceptPrevSuggestion(): void;
    cancelSuggestWidget(): void;
    focusSuggestion(): void;
    selectNextSuggestion(): void;
    selectNextPageSuggestion(): void;
    selectLastSuggestion(): void;
    selectPrevSuggestion(): void;
    selectPrevPageSuggestion(): void;
    selectFirstSuggestion(): void;
    toggleSuggestionDetails(): void;
    toggleExplainMode(): void;
    toggleSuggestionFocus(): void;
    resetWidgetSize(): void;
    forceRenderingAbove(): void;
    stopForceRenderingAbove(): void;
    registerSelector(selector: ISuggestItemPreselector): IDisposable;
}
export declare class TriggerSuggestAction extends EditorAction {
    static readonly id = "editor.action.triggerSuggest";
    constructor();
    run(_accessor: ServicesAccessor, editor: ICodeEditor, args: any): void;
}
export {};

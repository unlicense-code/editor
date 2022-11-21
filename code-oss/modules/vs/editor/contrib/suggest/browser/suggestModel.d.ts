import { Event } from 'vs/base/common/event';
import { IDisposable } from 'vs/base/common/lifecycle';
import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
import { IPosition, Position } from 'vs/editor/common/core/position';
import { ITextModel } from 'vs/editor/common/model';
import { CompletionItemProvider, CompletionTriggerKind } from 'vs/editor/common/languages';
import { IEditorWorkerService } from 'vs/editor/common/services/editorWorker';
import { IClipboardService } from 'vs/platform/clipboard/common/clipboardService';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { ILogService } from 'vs/platform/log/common/log';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { CompletionModel } from './completionModel';
import { CompletionItem } from './suggest';
import { IWordAtPosition } from 'vs/editor/common/core/wordHelper';
import { ILanguageFeaturesService } from 'vs/editor/common/services/languageFeatures';
export interface ICancelEvent {
    readonly retrigger: boolean;
}
export interface ITriggerEvent {
    readonly auto: boolean;
    readonly shy: boolean;
    readonly position: IPosition;
}
export interface ISuggestEvent {
    readonly completionModel: CompletionModel;
    readonly isFrozen: boolean;
    readonly auto: boolean;
    readonly shy: boolean;
}
export interface SuggestTriggerContext {
    readonly auto: boolean;
    readonly shy: boolean;
    readonly triggerKind?: CompletionTriggerKind;
    readonly triggerCharacter?: string;
}
export declare class LineContext {
    static shouldAutoTrigger(editor: ICodeEditor): boolean;
    readonly lineNumber: number;
    readonly column: number;
    readonly leadingLineContent: string;
    readonly leadingWord: IWordAtPosition;
    readonly auto: boolean;
    readonly shy: boolean;
    constructor(model: ITextModel, position: Position, auto: boolean, shy: boolean);
}
export declare const enum State {
    Idle = 0,
    Manual = 1,
    Auto = 2
}
export declare class SuggestModel implements IDisposable {
    private readonly _editor;
    private readonly _editorWorkerService;
    private readonly _clipboardService;
    private readonly _telemetryService;
    private readonly _logService;
    private readonly _contextKeyService;
    private readonly _configurationService;
    private readonly _languageFeaturesService;
    private readonly _toDispose;
    private readonly _triggerCharacterListener;
    private readonly _triggerQuickSuggest;
    private _state;
    private _requestToken?;
    private _context?;
    private _currentSelection;
    private _completionModel;
    private readonly _completionDisposables;
    private readonly _onDidCancel;
    private readonly _onDidTrigger;
    private readonly _onDidSuggest;
    readonly onDidCancel: Event<ICancelEvent>;
    readonly onDidTrigger: Event<ITriggerEvent>;
    readonly onDidSuggest: Event<ISuggestEvent>;
    constructor(_editor: ICodeEditor, _editorWorkerService: IEditorWorkerService, _clipboardService: IClipboardService, _telemetryService: ITelemetryService, _logService: ILogService, _contextKeyService: IContextKeyService, _configurationService: IConfigurationService, _languageFeaturesService: ILanguageFeaturesService);
    dispose(): void;
    private _updateTriggerCharacters;
    get state(): State;
    cancel(retrigger?: boolean): void;
    clear(): void;
    private _updateActiveSuggestSession;
    private _onCursorChange;
    private _onCompositionEnd;
    private _doTriggerQuickSuggest;
    private _refilterCompletionItems;
    trigger(context: SuggestTriggerContext, retrigger?: boolean, onlyFrom?: Set<CompletionItemProvider>, existing?: {
        items: CompletionItem[];
        clipboardText: string | undefined;
    }, noFilter?: boolean): void;
    private _telemetryGate;
    private _reportDurationsTelemetry;
    private static _createSuggestFilter;
    private _onNewContext;
}

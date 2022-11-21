import { Disposable } from 'vs/base/common/lifecycle';
import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
import { LanguageFeatureRegistry } from 'vs/editor/common/languageFeatureRegistry';
import * as languages from 'vs/editor/common/languages';
export interface TriggerContext {
    readonly triggerKind: languages.SignatureHelpTriggerKind;
    readonly triggerCharacter?: string;
}
export declare class ParameterHintsModel extends Disposable {
    private static readonly DEFAULT_DELAY;
    private readonly _onChangedHints;
    readonly onChangedHints: import("vs/base/common/event").Event<languages.SignatureHelp | undefined>;
    private readonly editor;
    private readonly providers;
    private triggerOnType;
    private _state;
    private _pendingTriggers;
    private readonly _lastSignatureHelpResult;
    private readonly triggerChars;
    private readonly retriggerChars;
    private readonly throttledDelayer;
    private triggerId;
    constructor(editor: ICodeEditor, providers: LanguageFeatureRegistry<languages.SignatureHelpProvider>, delay?: number);
    private get state();
    private set state(value);
    cancel(silent?: boolean): void;
    trigger(context: TriggerContext, delay?: number): void;
    next(): void;
    previous(): void;
    private updateActiveSignature;
    private doTrigger;
    private getLastActiveHints;
    private get isTriggered();
    private onModelChanged;
    private onDidType;
    private onCursorChange;
    private onModelContentChange;
    private onEditorConfigurationChange;
    dispose(): void;
}

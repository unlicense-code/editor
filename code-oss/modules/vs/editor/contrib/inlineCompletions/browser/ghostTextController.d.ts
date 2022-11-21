import { Disposable, MutableDisposable } from 'vs/base/common/lifecycle';
import { IActiveCodeEditor, ICodeEditor } from 'vs/editor/browser/editorBrowser';
import { EditorAction, ServicesAccessor } from 'vs/editor/browser/editorExtensions';
import { Range } from 'vs/editor/common/core/range';
import { GhostTextModel } from 'vs/editor/contrib/inlineCompletions/browser/ghostTextModel';
import { GhostTextWidget } from 'vs/editor/contrib/inlineCompletions/browser/ghostTextWidget';
import { IContextKeyService, RawContextKey } from 'vs/platform/contextkey/common/contextkey';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
export declare class GhostTextController extends Disposable {
    readonly editor: ICodeEditor;
    private readonly instantiationService;
    static readonly inlineSuggestionVisible: RawContextKey<boolean>;
    static readonly inlineSuggestionHasIndentation: RawContextKey<boolean>;
    static readonly inlineSuggestionHasIndentationLessThanTabSize: RawContextKey<boolean>;
    static ID: string;
    static get(editor: ICodeEditor): GhostTextController | null;
    private triggeredExplicitly;
    protected readonly activeController: MutableDisposable<ActiveGhostTextController>;
    get activeModel(): GhostTextModel | undefined;
    private readonly activeModelDidChangeEmitter;
    readonly onActiveModelDidChange: import("vs/base/common/event").Event<void>;
    constructor(editor: ICodeEditor, instantiationService: IInstantiationService);
    private updateModelController;
    shouldShowHoverAt(hoverRange: Range): boolean;
    shouldShowHoverAtViewZone(viewZoneId: string): boolean;
    trigger(): void;
    commit(): void;
    hide(): void;
    showNextInlineCompletion(): void;
    showPreviousInlineCompletion(): void;
    hasMultipleInlineCompletions(): Promise<boolean>;
}
/**
 * The controller for a text editor with an initialized text model.
 * Must be disposed as soon as the model detaches from the editor.
*/
export declare class ActiveGhostTextController extends Disposable {
    private readonly editor;
    private readonly instantiationService;
    private readonly contextKeyService;
    private readonly contextKeys;
    readonly model: GhostTextModel;
    readonly widget: GhostTextWidget;
    constructor(editor: IActiveCodeEditor, instantiationService: IInstantiationService, contextKeyService: IContextKeyService);
    private updateContextKeys;
}
export declare class ShowNextInlineSuggestionAction extends EditorAction {
    static ID: string;
    constructor();
    run(accessor: ServicesAccessor | undefined, editor: ICodeEditor): Promise<void>;
}
export declare class ShowPreviousInlineSuggestionAction extends EditorAction {
    static ID: string;
    constructor();
    run(accessor: ServicesAccessor | undefined, editor: ICodeEditor): Promise<void>;
}
export declare class TriggerInlineSuggestionAction extends EditorAction {
    constructor();
    run(accessor: ServicesAccessor | undefined, editor: ICodeEditor): Promise<void>;
}

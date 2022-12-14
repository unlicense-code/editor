import { CancellationToken } from 'vs/base/common/cancellation';
import { Event } from 'vs/base/common/event';
import { IDisposable } from 'vs/base/common/lifecycle';
import { IRange } from 'vs/editor/common/core/range';
import { IDiffEditor, IEditor } from 'vs/editor/common/editorCommon';
import { ITextModel } from 'vs/editor/common/model';
import { IQuickAccessProvider } from 'vs/platform/quickinput/common/quickAccess';
import { IKeyMods, IQuickPick, IQuickPickItem } from 'vs/platform/quickinput/common/quickInput';
export interface IEditorNavigationQuickAccessOptions {
    canAcceptInBackground?: boolean;
}
export interface IQuickAccessTextEditorContext {
    /**
     * The current active editor.
     */
    readonly editor: IEditor;
    /**
     * If defined, allows to restore the original view state
     * the text editor had before quick access opened.
     */
    restoreViewState?: () => void;
}
/**
 * A reusable quick access provider for the editor with support
 * for adding decorations for navigating in the currently active file
 * (for example "Go to line", "Go to symbol").
 */
export declare abstract class AbstractEditorNavigationQuickAccessProvider implements IQuickAccessProvider {
    protected options?: IEditorNavigationQuickAccessOptions | undefined;
    constructor(options?: IEditorNavigationQuickAccessOptions | undefined);
    provide(picker: IQuickPick<IQuickPickItem>, token: CancellationToken): IDisposable;
    private doProvide;
    /**
     * Subclasses to implement if they can operate on the text editor.
     */
    protected canProvideWithTextEditor(editor: IEditor): boolean;
    /**
     * Subclasses to implement to provide picks for the picker when an editor is active.
     */
    protected abstract provideWithTextEditor(context: IQuickAccessTextEditorContext, picker: IQuickPick<IQuickPickItem>, token: CancellationToken): IDisposable;
    /**
     * Subclasses to implement to provide picks for the picker when no editor is active.
     */
    protected abstract provideWithoutTextEditor(picker: IQuickPick<IQuickPickItem>, token: CancellationToken): IDisposable;
    protected gotoLocation({ editor }: IQuickAccessTextEditorContext, options: {
        range: IRange;
        keyMods: IKeyMods;
        forceSideBySide?: boolean;
        preserveFocus?: boolean;
    }): void;
    protected getModel(editor: IEditor | IDiffEditor): ITextModel | undefined;
    /**
     * Subclasses to provide an event when the active editor control changes.
     */
    protected abstract readonly onDidActiveTextEditorControlChange: Event<void>;
    /**
     * Subclasses to provide the current active editor control.
     */
    protected abstract activeTextEditorControl: IEditor | undefined;
    private rangeHighlightDecorationId;
    protected addDecorations(editor: IEditor, range: IRange): void;
    protected clearDecorations(editor: IEditor): void;
}

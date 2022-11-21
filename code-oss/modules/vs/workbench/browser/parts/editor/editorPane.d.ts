import { Composite } from 'vs/workbench/browser/composite';
import { IEditorPane, IEditorMemento, IEditorOpenContext } from 'vs/workbench/common/editor';
import { EditorInput } from 'vs/workbench/common/editor/editorInput';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { CancellationToken } from 'vs/base/common/cancellation';
import { IEditorGroup, IEditorGroupsService } from 'vs/workbench/services/editor/common/editorGroupsService';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { URI } from 'vs/base/common/uri';
import { Emitter, Event } from 'vs/base/common/event';
import { MementoObject } from 'vs/workbench/common/memento';
import { IExtUri } from 'vs/base/common/resources';
import { Disposable } from 'vs/base/common/lifecycle';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IEditorOptions } from 'vs/platform/editor/common/editor';
import { ITextResourceConfigurationService } from 'vs/editor/common/services/textResourceConfiguration';
/**
 * The base class of editors in the workbench. Editors register themselves for specific editor inputs.
 * Editors are layed out in the editor part of the workbench in editor groups. Multiple editors can be
 * open at the same time. Each editor has a minimized representation that is good enough to provide some
 * information about the state of the editor data.
 *
 * The workbench will keep an editor alive after it has been created and show/hide it based on
 * user interaction. The lifecycle of a editor goes in the order:
 *
 * - `createEditor()`
 * - `setEditorVisible()`
 * - `layout()`
 * - `setInput()`
 * - `focus()`
 * - `dispose()`: when the editor group the editor is in closes
 *
 * During use of the workbench, a editor will often receive a `clearInput()`, `setEditorVisible()`, `layout()` and
 * `focus()` calls, but only one `create()` and `dispose()` call.
 *
 * This class is only intended to be subclassed and not instantiated.
 */
export declare abstract class EditorPane extends Composite implements IEditorPane {
    readonly onDidChangeSizeConstraints: Event<any>;
    protected readonly _onDidChangeControl: Emitter<void>;
    readonly onDidChangeControl: Event<void>;
    private static readonly EDITOR_MEMENTOS;
    get minimumWidth(): number;
    get maximumWidth(): number;
    get minimumHeight(): number;
    get maximumHeight(): number;
    protected _input: EditorInput | undefined;
    get input(): EditorInput | undefined;
    protected _options: IEditorOptions | undefined;
    get options(): IEditorOptions | undefined;
    private _group;
    get group(): IEditorGroup | undefined;
    /**
     * Should be overridden by editors that have their own ScopedContextKeyService
     */
    get scopedContextKeyService(): IContextKeyService | undefined;
    constructor(id: string, telemetryService: ITelemetryService, themeService: IThemeService, storageService: IStorageService);
    create(parent: HTMLElement): void;
    /**
     * Called to create the editor in the parent HTMLElement. Subclasses implement
     * this method to construct the editor widget.
     */
    protected abstract createEditor(parent: HTMLElement): void;
    /**
     * Note: Clients should not call this method, the workbench calls this
     * method. Calling it otherwise may result in unexpected behavior.
     *
     * Sets the given input with the options to the editor. The input is guaranteed
     * to be different from the previous input that was set using the `input.matches()`
     * method.
     *
     * The provided context gives more information around how the editor was opened.
     *
     * The provided cancellation token should be used to test if the operation
     * was cancelled.
     */
    setInput(input: EditorInput, options: IEditorOptions | undefined, context: IEditorOpenContext, token: CancellationToken): Promise<void>;
    /**
     * Called to indicate to the editor that the input should be cleared and
     * resources associated with the input should be freed.
     *
     * This method can be called based on different contexts, e.g. when opening
     * a different input or different editor control or when closing all editors
     * in a group.
     *
     * To monitor the lifecycle of editor inputs, you should not rely on this
     * method, rather refer to the listeners on `IEditorGroup` via `IEditorGroupService`.
     */
    clearInput(): void;
    /**
     * Note: Clients should not call this method, the workbench calls this
     * method. Calling it otherwise may result in unexpected behavior.
     *
     * Sets the given options to the editor. Clients should apply the options
     * to the current input.
     */
    setOptions(options: IEditorOptions | undefined): void;
    setVisible(visible: boolean, group?: IEditorGroup): void;
    /**
     * Indicates that the editor control got visible or hidden in a specific group. A
     * editor instance will only ever be visible in one editor group.
     *
     * @param visible the state of visibility of this editor
     * @param group the editor group this editor is in.
     */
    protected setEditorVisible(visible: boolean, group: IEditorGroup | undefined): void;
    protected getEditorMemento<T>(editorGroupService: IEditorGroupsService, configurationService: ITextResourceConfigurationService, key: string, limit?: number): IEditorMemento<T>;
    getViewState(): object | undefined;
    protected saveState(): void;
    dispose(): void;
}
export declare class EditorMemento<T> extends Disposable implements IEditorMemento<T> {
    readonly id: string;
    private key;
    private memento;
    private limit;
    private editorGroupService;
    private configurationService;
    private static readonly SHARED_EDITOR_STATE;
    private cache;
    private cleanedUp;
    private editorDisposables;
    private shareEditorState;
    constructor(id: string, key: string, memento: MementoObject, limit: number, editorGroupService: IEditorGroupsService, configurationService: ITextResourceConfigurationService);
    private registerListeners;
    private updateConfiguration;
    saveEditorState(group: IEditorGroup, resource: URI, state: T): void;
    saveEditorState(group: IEditorGroup, editor: EditorInput, state: T): void;
    loadEditorState(group: IEditorGroup, resource: URI): T | undefined;
    loadEditorState(group: IEditorGroup, editor: EditorInput): T | undefined;
    clearEditorState(resource: URI, group?: IEditorGroup): void;
    clearEditorState(editor: EditorInput, group?: IEditorGroup): void;
    clearEditorStateOnDispose(resource: URI, editor: EditorInput): void;
    moveEditorState(source: URI, target: URI, comparer: IExtUri): void;
    private doGetResource;
    private doLoad;
    saveState(): void;
    private cleanUp;
}

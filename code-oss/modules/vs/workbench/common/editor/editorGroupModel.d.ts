import { Event } from 'vs/base/common/event';
import { GroupIdentifier, EditorsOrder, IUntypedEditorInput, SideBySideEditor, EditorCloseContext, IMatchEditorOptions, GroupModelChangeKind } from 'vs/workbench/common/editor';
import { EditorInput } from 'vs/workbench/common/editor/editorInput';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { Disposable } from 'vs/base/common/lifecycle';
export interface IEditorOpenOptions {
    readonly pinned?: boolean;
    sticky?: boolean;
    active?: boolean;
    readonly index?: number;
    readonly supportSideBySide?: SideBySideEditor.ANY | SideBySideEditor.BOTH;
}
export interface IEditorOpenResult {
    readonly editor: EditorInput;
    readonly isNew: boolean;
}
export interface ISerializedEditorInput {
    readonly id: string;
    readonly value: string;
}
export interface ISerializedEditorGroupModel {
    readonly id: number;
    readonly locked?: boolean;
    readonly editors: ISerializedEditorInput[];
    readonly mru: number[];
    readonly preview?: number;
    sticky?: number;
}
export declare function isSerializedEditorGroupModel(group?: unknown): group is ISerializedEditorGroupModel;
export interface IMatchOptions {
    /**
     * Whether to consider a side by side editor as matching.
     * By default, side by side editors will not be considered
     * as matching, even if the editor is opened in one of the sides.
     */
    readonly supportSideBySide?: SideBySideEditor.ANY | SideBySideEditor.BOTH;
    /**
     * Only consider an editor to match when the
     * `candidate === editor` but not when
     * `candidate.matches(editor)`.
     */
    readonly strictEquals?: boolean;
}
export interface IGroupModelChangeEvent {
    /**
     * The kind of change that occurred in the group model.
     */
    readonly kind: GroupModelChangeKind;
    /**
     * Only applies when editors change providing
     * access to the editor the event is about.
     */
    readonly editor?: EditorInput;
    /**
     * Only applies when editors change providing
     * access to the index of the editor the event
     * is about.
     */
    readonly editorIndex?: number;
}
export interface IGroupEditorChangeEvent extends IGroupModelChangeEvent {
    readonly editor: EditorInput;
    readonly editorIndex: number;
}
export declare function isGroupEditorChangeEvent(e: IGroupModelChangeEvent): e is IGroupEditorChangeEvent;
export interface IGroupEditorOpenEvent extends IGroupEditorChangeEvent {
    readonly kind: GroupModelChangeKind.EDITOR_OPEN;
}
export declare function isGroupEditorOpenEvent(e: IGroupModelChangeEvent): e is IGroupEditorOpenEvent;
export interface IGroupEditorMoveEvent extends IGroupEditorChangeEvent {
    readonly kind: GroupModelChangeKind.EDITOR_MOVE;
    /**
     * Signifies the index the editor is moving from.
     * `editorIndex` will contain the index the editor
     * is moving to.
     */
    readonly oldEditorIndex: number;
}
export declare function isGroupEditorMoveEvent(e: IGroupModelChangeEvent): e is IGroupEditorMoveEvent;
export interface IGroupEditorCloseEvent extends IGroupEditorChangeEvent {
    readonly kind: GroupModelChangeKind.EDITOR_CLOSE;
    /**
     * Signifies the context in which the editor
     * is being closed. This allows for understanding
     * if a replace or reopen is occurring
     */
    readonly context: EditorCloseContext;
    /**
     * Signifies whether or not the closed editor was
     * sticky. This is necessary becasue state is lost
     * after closing.
     */
    readonly sticky: boolean;
}
export declare function isGroupEditorCloseEvent(e: IGroupModelChangeEvent): e is IGroupEditorCloseEvent;
interface IEditorCloseResult {
    readonly editor: EditorInput;
    readonly context: EditorCloseContext;
    readonly editorIndex: number;
    readonly sticky: boolean;
}
export declare class EditorGroupModel extends Disposable {
    private readonly instantiationService;
    private readonly configurationService;
    private static IDS;
    private readonly _onDidModelChange;
    readonly onDidModelChange: Event<IGroupModelChangeEvent>;
    private _id;
    get id(): GroupIdentifier;
    private editors;
    private mru;
    private locked;
    private preview;
    private active;
    private sticky;
    private editorOpenPositioning;
    private focusRecentEditorAfterClose;
    constructor(labelOrSerializedGroup: ISerializedEditorGroupModel | undefined, instantiationService: IInstantiationService, configurationService: IConfigurationService);
    private registerListeners;
    private onConfigurationUpdated;
    get count(): number;
    get stickyCount(): number;
    getEditors(order: EditorsOrder, options?: {
        excludeSticky?: boolean;
    }): EditorInput[];
    getEditorByIndex(index: number): EditorInput | undefined;
    get activeEditor(): EditorInput | null;
    isActive(editor: EditorInput | IUntypedEditorInput): boolean;
    get previewEditor(): EditorInput | null;
    openEditor(candidate: EditorInput, options?: IEditorOpenOptions): IEditorOpenResult;
    private registerEditorListeners;
    private replaceEditor;
    closeEditor(candidate: EditorInput, context?: EditorCloseContext, openNext?: boolean): IEditorCloseResult | undefined;
    private doCloseEditor;
    moveEditor(candidate: EditorInput, toIndex: number): EditorInput | undefined;
    setActive(candidate: EditorInput | undefined): EditorInput | undefined;
    private setGroupActive;
    private setEditorActive;
    private doSetActive;
    setIndex(index: number): void;
    pin(candidate: EditorInput): EditorInput | undefined;
    private doPin;
    unpin(candidate: EditorInput): EditorInput | undefined;
    private doUnpin;
    isPinned(editorOrIndex: EditorInput | number): boolean;
    stick(candidate: EditorInput): EditorInput | undefined;
    private doStick;
    unstick(candidate: EditorInput): EditorInput | undefined;
    private doUnstick;
    isSticky(candidateOrIndex: EditorInput | number): boolean;
    private splice;
    indexOf(candidate: EditorInput | null, editors?: EditorInput[], options?: IMatchEditorOptions): number;
    private findEditor;
    isFirst(candidate: EditorInput | null): boolean;
    isLast(candidate: EditorInput | null): boolean;
    contains(candidate: EditorInput | IUntypedEditorInput, options?: IMatchEditorOptions): boolean;
    private matches;
    get isLocked(): boolean;
    lock(locked: boolean): void;
    clone(): EditorGroupModel;
    serialize(): ISerializedEditorGroupModel;
    private deserialize;
}
export {};

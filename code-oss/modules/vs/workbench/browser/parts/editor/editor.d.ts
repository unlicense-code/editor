import { GroupIdentifier, IEditorIdentifier, IEditorCloseEvent, IEditorPartOptions, IEditorPartOptionsChangeEvent, SideBySideEditor, EditorCloseContext } from 'vs/workbench/common/editor';
import { EditorInput } from 'vs/workbench/common/editor/editorInput';
import { IEditorGroup, GroupDirection, IAddGroupOptions, IMergeGroupOptions, GroupsOrder, GroupsArrangement } from 'vs/workbench/services/editor/common/editorGroupsService';
import { IDisposable } from 'vs/base/common/lifecycle';
import { Dimension } from 'vs/base/browser/dom';
import { Event } from 'vs/base/common/event';
import { IConfigurationChangeEvent, IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { ISerializableView } from 'vs/base/browser/ui/grid/grid';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IEditorOptions } from 'vs/platform/editor/common/editor';
export interface IEditorPartCreationOptions {
    restorePreviousState: boolean;
}
export declare const DEFAULT_EDITOR_MIN_DIMENSIONS: Dimension;
export declare const DEFAULT_EDITOR_MAX_DIMENSIONS: Dimension;
export declare const DEFAULT_EDITOR_PART_OPTIONS: IEditorPartOptions;
export declare function impactsEditorPartOptions(event: IConfigurationChangeEvent): boolean;
export declare function getEditorPartOptions(configurationService: IConfigurationService, themeService: IThemeService): IEditorPartOptions;
export interface IEditorGroupsAccessor {
    readonly groups: IEditorGroupView[];
    readonly activeGroup: IEditorGroupView;
    readonly partOptions: IEditorPartOptions;
    readonly onDidChangeEditorPartOptions: Event<IEditorPartOptionsChangeEvent>;
    readonly onDidVisibilityChange: Event<boolean>;
    getGroup(identifier: GroupIdentifier): IEditorGroupView | undefined;
    getGroups(order: GroupsOrder): IEditorGroupView[];
    activateGroup(identifier: IEditorGroupView | GroupIdentifier): IEditorGroupView;
    restoreGroup(identifier: IEditorGroupView | GroupIdentifier): IEditorGroupView;
    addGroup(location: IEditorGroupView | GroupIdentifier, direction: GroupDirection, options?: IAddGroupOptions): IEditorGroupView;
    mergeGroup(group: IEditorGroupView | GroupIdentifier, target: IEditorGroupView | GroupIdentifier, options?: IMergeGroupOptions): IEditorGroupView;
    moveGroup(group: IEditorGroupView | GroupIdentifier, location: IEditorGroupView | GroupIdentifier, direction: GroupDirection): IEditorGroupView;
    copyGroup(group: IEditorGroupView | GroupIdentifier, location: IEditorGroupView | GroupIdentifier, direction: GroupDirection): IEditorGroupView;
    removeGroup(group: IEditorGroupView | GroupIdentifier): void;
    arrangeGroups(arrangement: GroupsArrangement, target?: IEditorGroupView | GroupIdentifier): void;
}
export interface IEditorGroupTitleHeight {
    /**
     * The overall height of the editor group title control.
     */
    total: number;
    /**
     * The height offset to e.g. use when drawing drop overlays.
     * This number may be smaller than `height` if the title control
     * decides to have an `offset` that is within the title area
     * (e.g. when breadcrumbs are enabled).
     */
    offset: number;
}
export interface IEditorGroupView extends IDisposable, ISerializableView, IEditorGroup {
    readonly onDidFocus: Event<void>;
    readonly onDidOpenEditorFail: Event<EditorInput>;
    readonly onDidCloseEditor: Event<IEditorCloseEvent>;
    /**
     * A promise that resolves when the group has been restored.
     *
     * For a group with active editor, the promise will resolve
     * when the active editor has finished to resolve.
     */
    readonly whenRestored: Promise<void>;
    readonly titleHeight: IEditorGroupTitleHeight;
    readonly disposed: boolean;
    setActive(isActive: boolean): void;
    notifyIndexChanged(newIndex: number): void;
    relayout(): void;
}
export declare function fillActiveEditorViewState(group: IEditorGroup, expectedActiveEditor?: EditorInput, presetOptions?: IEditorOptions): IEditorOptions;
/**
 * A sub-interface of IEditorService to hide some workbench-core specific
 * events from clients.
 */
export interface EditorServiceImpl extends IEditorService {
    /**
     * Emitted when an editor failed to open.
     */
    readonly onDidOpenEditorFail: Event<IEditorIdentifier>;
    /**
     * Emitted when the list of most recently active editors change.
     */
    readonly onDidMostRecentlyActiveEditorsChange: Event<void>;
}
export interface IInternalEditorTitleControlOptions {
    /**
     * A hint to defer updating the title control for perf reasons.
     * The caller must ensure to update the title control then.
     */
    skipTitleUpdate?: boolean;
}
export interface IInternalEditorOpenOptions extends IInternalEditorTitleControlOptions {
    /**
     * Whether to consider a side by side editor as matching
     * when figuring out if the editor to open is already
     * opened or not. By default, side by side editors will
     * not be considered as matching, even if the editor is
     * opened in one of the sides.
     */
    supportSideBySide?: SideBySideEditor.ANY | SideBySideEditor.BOTH;
}
export interface IInternalEditorCloseOptions extends IInternalEditorTitleControlOptions {
    /**
     * A hint that the editor is closed due to an error opening. This can be
     * used to optimize how error toasts are appearing if any.
     */
    fromError?: boolean;
    /**
     * Additional context as to why an editor is closed.
     */
    context?: EditorCloseContext;
}
export interface IInternalMoveCopyOptions extends IInternalEditorTitleControlOptions {
    /**
     * Whether to close the editor at the source or keep it.
     */
    keepCopy?: boolean;
}

import { URI } from 'vs/base/common/uri';
import { IListService } from 'vs/platform/list/browser/listService';
import { ISortOrderConfiguration } from 'vs/workbench/contrib/files/common/files';
import { IEditorIdentifier } from 'vs/workbench/common/editor';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { ExplorerItem } from 'vs/workbench/contrib/files/common/explorerModel';
import { IEditorGroupsService } from 'vs/workbench/services/editor/common/editorGroupsService';
import { IEditableData } from 'vs/workbench/common/views';
import { ResourceFileEdit } from 'vs/editor/browser/services/bulkEditService';
import { ProgressLocation } from 'vs/platform/progress/common/progress';
export interface IExplorerService {
    readonly _serviceBrand: undefined;
    readonly roots: ExplorerItem[];
    readonly sortOrderConfiguration: ISortOrderConfiguration;
    getContext(respectMultiSelection: boolean, ignoreNestedChildren?: boolean): ExplorerItem[];
    hasViewFocus(): boolean;
    setEditable(stat: ExplorerItem, data: IEditableData | null): Promise<void>;
    getEditable(): {
        stat: ExplorerItem;
        data: IEditableData;
    } | undefined;
    getEditableData(stat: ExplorerItem): IEditableData | undefined;
    isEditable(stat: ExplorerItem | undefined): boolean;
    findClosest(resource: URI): ExplorerItem | null;
    findClosestRoot(resource: URI): ExplorerItem | null;
    refresh(): Promise<void>;
    setToCopy(stats: ExplorerItem[], cut: boolean): Promise<void>;
    isCut(stat: ExplorerItem): boolean;
    applyBulkEdit(edit: ResourceFileEdit[], options: {
        undoLabel: string;
        progressLabel: string;
        confirmBeforeUndo?: boolean;
        progressLocation?: ProgressLocation.Explorer | ProgressLocation.Window;
    }): Promise<void>;
    /**
     * Selects and reveal the file element provided by the given resource if its found in the explorer.
     * Will try to resolve the path in case the explorer is not yet expanded to the file yet.
     */
    select(resource: URI, reveal?: boolean | string): Promise<void>;
    registerView(contextAndRefreshProvider: IExplorerView): void;
}
export declare const IExplorerService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IExplorerService>;
export interface IExplorerView {
    getContext(respectMultiSelection: boolean): ExplorerItem[];
    refresh(recursive: boolean, item?: ExplorerItem): Promise<void>;
    selectResource(resource: URI | undefined, reveal?: boolean | string): Promise<void>;
    setTreeInput(): Promise<void>;
    itemsCopied(tats: ExplorerItem[], cut: boolean, previousCut: ExplorerItem[] | undefined): void;
    setEditable(stat: ExplorerItem, isEditing: boolean): Promise<void>;
    isItemVisible(item: ExplorerItem): boolean;
    isItemCollapsed(item: ExplorerItem): boolean;
    hasFocus(): boolean;
}
export declare function getResourceForCommand(resource: URI | object | undefined, listService: IListService, editorService: IEditorService): URI | undefined;
export declare function getMultiSelectedResources(resource: URI | object | undefined, listService: IListService, editorService: IEditorService, explorerService: IExplorerService): Array<URI>;
export declare function getOpenEditorsViewMultiSelection(listService: IListService, editorGroupService: IEditorGroupsService): Array<IEditorIdentifier> | undefined;

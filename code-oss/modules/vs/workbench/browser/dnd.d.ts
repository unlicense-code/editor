import { IDragAndDropData } from 'vs/base/browser/dnd';
import { DragMouseEvent } from 'vs/base/browser/mouseEvent';
import { IListDragAndDrop } from 'vs/base/browser/ui/list/list';
import { ITreeDragOverReaction } from 'vs/base/browser/ui/tree/tree';
import { VSDataTransfer } from 'vs/base/common/dataTransfer';
import { Disposable, IDisposable } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
import { IDraggedResourceEditorInput, IResourceStat } from 'vs/platform/dnd/browser/dnd';
import { IFileService } from 'vs/platform/files/common/files';
import { IInstantiationService, ServicesAccessor } from 'vs/platform/instantiation/common/instantiation';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { IWorkspacesService } from 'vs/platform/workspaces/common/workspaces';
import { GroupIdentifier, IEditorIdentifier } from 'vs/workbench/common/editor';
import { IEditorGroup } from 'vs/workbench/services/editor/common/editorGroupsService';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IHostService } from 'vs/workbench/services/host/browser/host';
import { IWorkspaceEditingService } from 'vs/workbench/services/workspaces/common/workspaceEditing';
export declare class DraggedEditorIdentifier {
    readonly identifier: IEditorIdentifier;
    constructor(identifier: IEditorIdentifier);
}
export declare class DraggedEditorGroupIdentifier {
    readonly identifier: GroupIdentifier;
    constructor(identifier: GroupIdentifier);
}
export declare class DraggedTreeItemsIdentifier {
    readonly identifier: string;
    constructor(identifier: string);
}
export declare function extractTreeDropData(dataTransfer: VSDataTransfer): Promise<Array<IDraggedResourceEditorInput>>;
export interface IResourcesDropHandlerOptions {
    /**
     * Whether we probe for the dropped resource to be a workspace
     * (i.e. code-workspace file or even a folder), allowing to
     * open it as workspace instead of opening as editor.
     */
    readonly allowWorkspaceOpen: boolean;
}
/**
 * Shared function across some components to handle drag & drop of resources.
 * E.g. of folders and workspace files to open them in the window instead of
 * the editor or to handle dirty editors being dropped between instances of Code.
 */
export declare class ResourcesDropHandler {
    private readonly options;
    private readonly fileService;
    private readonly workspacesService;
    private readonly editorService;
    private readonly workspaceEditingService;
    private readonly hostService;
    private readonly contextService;
    private readonly instantiationService;
    constructor(options: IResourcesDropHandlerOptions, fileService: IFileService, workspacesService: IWorkspacesService, editorService: IEditorService, workspaceEditingService: IWorkspaceEditingService, hostService: IHostService, contextService: IWorkspaceContextService, instantiationService: IInstantiationService);
    handleDrop(event: DragEvent, resolveTargetGroup: () => IEditorGroup | undefined, afterDrop: (targetGroup: IEditorGroup | undefined) => void, targetIndex?: number): Promise<void>;
    private handleWorkspaceDrop;
}
export declare function fillEditorsDragData(accessor: ServicesAccessor, resources: URI[], event: DragMouseEvent | DragEvent): void;
export declare function fillEditorsDragData(accessor: ServicesAccessor, resources: IResourceStat[], event: DragMouseEvent | DragEvent): void;
export declare function fillEditorsDragData(accessor: ServicesAccessor, editors: IEditorIdentifier[], event: DragMouseEvent | DragEvent): void;
/**
 * A singleton to store transfer data during drag & drop operations that are only valid within the application.
 */
export declare class LocalSelectionTransfer<T> {
    private static readonly INSTANCE;
    private data?;
    private proto?;
    private constructor();
    static getInstance<T>(): LocalSelectionTransfer<T>;
    hasData(proto: T): boolean;
    clearData(proto: T): void;
    getData(proto: T): T[] | undefined;
    setData(data: T[], proto: T): void;
}
export declare type Before2D = {
    readonly verticallyBefore: boolean;
    readonly horizontallyBefore: boolean;
};
export interface ICompositeDragAndDrop {
    drop(data: IDragAndDropData, target: string | undefined, originalEvent: DragEvent, before?: Before2D): void;
    onDragOver(data: IDragAndDropData, target: string | undefined, originalEvent: DragEvent): boolean;
    onDragEnter(data: IDragAndDropData, target: string | undefined, originalEvent: DragEvent): boolean;
}
export interface ICompositeDragAndDropObserverCallbacks {
    onDragEnter?: (e: IDraggedCompositeData) => void;
    onDragLeave?: (e: IDraggedCompositeData) => void;
    onDrop?: (e: IDraggedCompositeData) => void;
    onDragOver?: (e: IDraggedCompositeData) => void;
    onDragStart?: (e: IDraggedCompositeData) => void;
    onDragEnd?: (e: IDraggedCompositeData) => void;
}
export declare class CompositeDragAndDropData implements IDragAndDropData {
    private type;
    private id;
    constructor(type: 'view' | 'composite', id: string);
    update(dataTransfer: DataTransfer): void;
    getData(): {
        type: 'view' | 'composite';
        id: string;
    };
}
export interface IDraggedCompositeData {
    readonly eventData: DragEvent;
    readonly dragAndDropData: CompositeDragAndDropData;
}
export declare class DraggedCompositeIdentifier {
    private compositeId;
    constructor(compositeId: string);
    get id(): string;
}
export declare class DraggedViewIdentifier {
    private viewId;
    constructor(viewId: string);
    get id(): string;
}
export declare type ViewType = 'composite' | 'view';
export declare class CompositeDragAndDropObserver extends Disposable {
    private static instance;
    static get INSTANCE(): CompositeDragAndDropObserver;
    private readonly transferData;
    private readonly onDragStart;
    private readonly onDragEnd;
    private constructor();
    private readDragData;
    private writeDragData;
    registerTarget(element: HTMLElement, callbacks: ICompositeDragAndDropObserverCallbacks): IDisposable;
    registerDraggable(element: HTMLElement, draggedItemProvider: () => {
        type: ViewType;
        id: string;
    }, callbacks: ICompositeDragAndDropObserverCallbacks): IDisposable;
}
export declare function toggleDropEffect(dataTransfer: DataTransfer | null, dropEffect: 'none' | 'copy' | 'link' | 'move', shouldHaveIt: boolean): void;
export declare class ResourceListDnDHandler<T> implements IListDragAndDrop<T> {
    private readonly toResource;
    private readonly instantiationService;
    constructor(toResource: (e: T) => URI | null, instantiationService: IInstantiationService);
    getDragURI(element: T): string | null;
    getDragLabel(elements: T[]): string | undefined;
    onDragStart(data: IDragAndDropData, originalEvent: DragEvent): void;
    onDragOver(data: IDragAndDropData, targetElement: T, targetIndex: number, originalEvent: DragEvent): boolean | ITreeDragOverReaction;
    drop(data: IDragAndDropData, targetElement: T, targetIndex: number, originalEvent: DragEvent): void;
}

export interface ITreeViewsService<T, U, V> {
    readonly _serviceBrand: undefined;
    removeDragOperationTransfer(uuid: string | undefined): Promise<T | undefined> | undefined;
    addDragOperationTransfer(uuid: string, transferPromise: Promise<T | undefined>): void;
    getRenderedTreeElement(node: U): V | undefined;
    addRenderedTreeItemElement(node: U, element: V): void;
    removeRenderedTreeItemElement(node: U): void;
}
export declare class TreeviewsService<T, U, V> implements ITreeViewsService<T, U, V> {
    _serviceBrand: undefined;
    private _dragOperations;
    private _renderedElements;
    removeDragOperationTransfer(uuid: string | undefined): Promise<T | undefined> | undefined;
    addDragOperationTransfer(uuid: string, transferPromise: Promise<T | undefined>): void;
    getRenderedTreeElement(node: U): V | undefined;
    addRenderedTreeItemElement(node: U, element: V): void;
    removeRenderedTreeItemElement(node: U): void;
}

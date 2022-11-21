/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
export class TreeviewsService {
    _serviceBrand;
    _dragOperations = new Map();
    _renderedElements = new Map();
    removeDragOperationTransfer(uuid) {
        if ((uuid && this._dragOperations.has(uuid))) {
            const operation = this._dragOperations.get(uuid);
            this._dragOperations.delete(uuid);
            return operation;
        }
        return undefined;
    }
    addDragOperationTransfer(uuid, transferPromise) {
        this._dragOperations.set(uuid, transferPromise);
    }
    getRenderedTreeElement(node) {
        if (this._renderedElements.has(node)) {
            return this._renderedElements.get(node);
        }
        return undefined;
    }
    addRenderedTreeItemElement(node, element) {
        this._renderedElements.set(node, element);
    }
    removeRenderedTreeItemElement(node) {
        if (this._renderedElements.has(node)) {
            this._renderedElements.delete(node);
        }
    }
}

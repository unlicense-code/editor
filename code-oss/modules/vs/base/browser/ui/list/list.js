/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
export var ListDragOverEffect;
(function (ListDragOverEffect) {
    ListDragOverEffect[ListDragOverEffect["Copy"] = 0] = "Copy";
    ListDragOverEffect[ListDragOverEffect["Move"] = 1] = "Move";
})(ListDragOverEffect || (ListDragOverEffect = {}));
export const ListDragOverReactions = {
    reject() { return { accept: false }; },
    accept() { return { accept: true }; },
};
export class ListError extends Error {
    constructor(user, message) {
        super(`ListError [${user}] ${message}`);
    }
}
export class CachedListVirtualDelegate {
    cache = new WeakMap();
    getHeight(element) {
        return this.cache.get(element) ?? this.estimateHeight(element);
    }
    setDynamicHeight(element, height) {
        if (height > 0) {
            this.cache.set(element, height);
        }
    }
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
// This file is shared between the renderer and extension host
export function serializeEnvironmentVariableCollection(collection) {
    return [...collection.entries()];
}
export function deserializeEnvironmentVariableCollection(serializedCollection) {
    return new Map(serializedCollection);
}
export function serializeEnvironmentVariableCollections(collections) {
    return Array.from(collections.entries()).map(e => {
        return [e[0], serializeEnvironmentVariableCollection(e[1].map)];
    });
}
export function deserializeEnvironmentVariableCollections(serializedCollection) {
    return new Map(serializedCollection.map(e => {
        return [e[0], { map: deserializeEnvironmentVariableCollection(e[1]) }];
    }));
}

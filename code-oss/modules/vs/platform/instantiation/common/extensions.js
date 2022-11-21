/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { SyncDescriptor } from './descriptors';
const _registry = [];
export var InstantiationType;
(function (InstantiationType) {
    /**
     * Instantiate this service as soon as a consumer depdends on it. _Note_ that this
     * is more costly as some upfront work is done that is likely not needed
     */
    InstantiationType[InstantiationType["Eager"] = 0] = "Eager";
    /**
     * Instantiate this service as soon as a consumer uses it. This is the _better_
     * way of registering a service.
     */
    InstantiationType[InstantiationType["Delayed"] = 1] = "Delayed";
})(InstantiationType || (InstantiationType = {}));
export function registerSingleton(id, ctorOrDescriptor, supportsDelayedInstantiation) {
    if (!(ctorOrDescriptor instanceof SyncDescriptor)) {
        ctorOrDescriptor = new SyncDescriptor(ctorOrDescriptor, [], Boolean(supportsDelayedInstantiation));
    }
    _registry.push([id, ctorOrDescriptor]);
}
export function getSingletonServiceDescriptors() {
    return _registry;
}

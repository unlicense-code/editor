/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { ExtensionIdentifier } from 'vs/platform/extensions/common/extensions';
import { Emitter } from 'vs/base/common/event';
import * as path from 'vs/base/common/path';
export class DeltaExtensionsResult {
    removedDueToLooping;
    constructor(removedDueToLooping) {
        this.removedDueToLooping = removedDueToLooping;
    }
}
export class ExtensionDescriptionRegistry {
    _onDidChange = new Emitter();
    onDidChange = this._onDidChange.event;
    _extensionDescriptions;
    _extensionsMap;
    _extensionsArr;
    _activationMap;
    constructor(extensionDescriptions) {
        this._extensionDescriptions = extensionDescriptions;
        this._initialize();
    }
    _initialize() {
        // Ensure extensions are stored in the order: builtin, user, under development
        this._extensionDescriptions.sort(extensionCmp);
        this._extensionsMap = new Map();
        this._extensionsArr = [];
        this._activationMap = new Map();
        for (const extensionDescription of this._extensionDescriptions) {
            if (this._extensionsMap.has(ExtensionIdentifier.toKey(extensionDescription.identifier))) {
                // No overwriting allowed!
                console.error('Extension `' + extensionDescription.identifier.value + '` is already registered');
                continue;
            }
            this._extensionsMap.set(ExtensionIdentifier.toKey(extensionDescription.identifier), extensionDescription);
            this._extensionsArr.push(extensionDescription);
            if (Array.isArray(extensionDescription.activationEvents)) {
                for (let activationEvent of extensionDescription.activationEvents) {
                    // TODO@joao: there's no easy way to contribute this
                    if (activationEvent === 'onUri') {
                        activationEvent = `onUri:${ExtensionIdentifier.toKey(extensionDescription.identifier)}`;
                    }
                    if (!this._activationMap.has(activationEvent)) {
                        this._activationMap.set(activationEvent, []);
                    }
                    this._activationMap.get(activationEvent).push(extensionDescription);
                }
            }
        }
    }
    set(extensionDescriptions) {
        this._extensionDescriptions = extensionDescriptions;
        this._initialize();
        this._onDidChange.fire(undefined);
    }
    deltaExtensions(toAdd, toRemove) {
        // It is possible that an extension is removed, only to be added again at a different version
        // so we will first handle removals
        this._extensionDescriptions = removeExtensions(this._extensionDescriptions, toRemove);
        // Then, handle the extensions to add
        this._extensionDescriptions = this._extensionDescriptions.concat(toAdd);
        // Immediately remove looping extensions!
        const looping = ExtensionDescriptionRegistry._findLoopingExtensions(this._extensionDescriptions);
        this._extensionDescriptions = removeExtensions(this._extensionDescriptions, looping.map(ext => ext.identifier));
        this._initialize();
        this._onDidChange.fire(undefined);
        return new DeltaExtensionsResult(looping);
    }
    static _findLoopingExtensions(extensionDescriptions) {
        const G = new class {
            _arcs = new Map();
            _nodesSet = new Set();
            _nodesArr = [];
            addNode(id) {
                if (!this._nodesSet.has(id)) {
                    this._nodesSet.add(id);
                    this._nodesArr.push(id);
                }
            }
            addArc(from, to) {
                this.addNode(from);
                this.addNode(to);
                if (this._arcs.has(from)) {
                    this._arcs.get(from).push(to);
                }
                else {
                    this._arcs.set(from, [to]);
                }
            }
            getArcs(id) {
                if (this._arcs.has(id)) {
                    return this._arcs.get(id);
                }
                return [];
            }
            hasOnlyGoodArcs(id, good) {
                const dependencies = G.getArcs(id);
                for (let i = 0; i < dependencies.length; i++) {
                    if (!good.has(dependencies[i])) {
                        return false;
                    }
                }
                return true;
            }
            getNodes() {
                return this._nodesArr;
            }
        };
        const descs = new Map();
        for (const extensionDescription of extensionDescriptions) {
            const extensionId = ExtensionIdentifier.toKey(extensionDescription.identifier);
            descs.set(extensionId, extensionDescription);
            if (extensionDescription.extensionDependencies) {
                for (const _depId of extensionDescription.extensionDependencies) {
                    const depId = ExtensionIdentifier.toKey(_depId);
                    G.addArc(extensionId, depId);
                }
            }
        }
        // initialize with all extensions with no dependencies.
        const good = new Set();
        G.getNodes().filter(id => G.getArcs(id).length === 0).forEach(id => good.add(id));
        // all other extensions will be processed below.
        const nodes = G.getNodes().filter(id => !good.has(id));
        let madeProgress;
        do {
            madeProgress = false;
            // find one extension which has only good deps
            for (let i = 0; i < nodes.length; i++) {
                const id = nodes[i];
                if (G.hasOnlyGoodArcs(id, good)) {
                    nodes.splice(i, 1);
                    i--;
                    good.add(id);
                    madeProgress = true;
                }
            }
        } while (madeProgress);
        // The remaining nodes are bad and have loops
        return nodes.map(id => descs.get(id));
    }
    containsActivationEvent(activationEvent) {
        return this._activationMap.has(activationEvent);
    }
    containsExtension(extensionId) {
        return this._extensionsMap.has(ExtensionIdentifier.toKey(extensionId));
    }
    getExtensionDescriptionsForActivationEvent(activationEvent) {
        const extensions = this._activationMap.get(activationEvent);
        return extensions ? extensions.slice(0) : [];
    }
    getAllExtensionDescriptions() {
        return this._extensionsArr.slice(0);
    }
    getExtensionDescription(extensionId) {
        const extension = this._extensionsMap.get(ExtensionIdentifier.toKey(extensionId));
        return extension ? extension : undefined;
    }
    getExtensionDescriptionByUUID(uuid) {
        for (const extensionDescription of this._extensionsArr) {
            if (extensionDescription.uuid === uuid) {
                return extensionDescription;
            }
        }
        return undefined;
    }
    getExtensionDescriptionByIdOrUUID(extensionId, uuid) {
        return (this.getExtensionDescription(extensionId)
            ?? (uuid ? this.getExtensionDescriptionByUUID(uuid) : undefined));
    }
}
var SortBucket;
(function (SortBucket) {
    SortBucket[SortBucket["Builtin"] = 0] = "Builtin";
    SortBucket[SortBucket["User"] = 1] = "User";
    SortBucket[SortBucket["Dev"] = 2] = "Dev";
})(SortBucket || (SortBucket = {}));
/**
 * Ensure that:
 * - first are builtin extensions
 * - second are user extensions
 * - third are extensions under development
 *
 * In each bucket, extensions must be sorted alphabetically by their folder name.
 */
function extensionCmp(a, b) {
    const aSortBucket = (a.isBuiltin ? 0 /* SortBucket.Builtin */ : a.isUnderDevelopment ? 2 /* SortBucket.Dev */ : 1 /* SortBucket.User */);
    const bSortBucket = (b.isBuiltin ? 0 /* SortBucket.Builtin */ : b.isUnderDevelopment ? 2 /* SortBucket.Dev */ : 1 /* SortBucket.User */);
    if (aSortBucket !== bSortBucket) {
        return aSortBucket - bSortBucket;
    }
    const aLastSegment = path.posix.basename(a.extensionLocation.path);
    const bLastSegment = path.posix.basename(b.extensionLocation.path);
    if (aLastSegment < bLastSegment) {
        return -1;
    }
    if (aLastSegment > bLastSegment) {
        return 1;
    }
    return 0;
}
function removeExtensions(arr, toRemove) {
    const toRemoveSet = new Set();
    toRemove.forEach(extensionId => toRemoveSet.add(ExtensionIdentifier.toKey(extensionId)));
    return arr.filter(extension => !toRemoveSet.has(ExtensionIdentifier.toKey(extension.identifier)));
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Event } from 'vs/base/common/event';
import { URI } from 'vs/base/common/uri';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { ExtensionIdentifier } from 'vs/platform/extensions/common/extensions';
import { getExtensionId, getGalleryExtensionId } from 'vs/platform/extensionManagement/common/extensionManagementUtil';
export const nullExtensionDescription = Object.freeze({
    identifier: new ExtensionIdentifier('nullExtensionDescription'),
    name: 'Null Extension Description',
    version: '0.0.0',
    publisher: 'vscode',
    engines: { vscode: '' },
    extensionLocation: URI.parse('void:location'),
    isBuiltin: false,
    targetPlatform: "undefined" /* TargetPlatform.UNDEFINED */,
    isUserBuiltin: false,
    isUnderDevelopment: false,
});
export const webWorkerExtHostConfig = 'extensions.webWorker';
export const IExtensionService = createDecorator('extensionService');
export class LocalProcessRunningLocation {
    affinity;
    kind = 1 /* ExtensionHostKind.LocalProcess */;
    constructor(affinity) {
        this.affinity = affinity;
    }
    equals(other) {
        return (this.kind === other.kind && this.affinity === other.affinity);
    }
    asString() {
        if (this.affinity === 0) {
            return 'LocalProcess';
        }
        return `LocalProcess${this.affinity}`;
    }
}
export class LocalWebWorkerRunningLocation {
    affinity;
    kind = 2 /* ExtensionHostKind.LocalWebWorker */;
    constructor(affinity) {
        this.affinity = affinity;
    }
    equals(other) {
        return (this.kind === other.kind && this.affinity === other.affinity);
    }
    asString() {
        if (this.affinity === 0) {
            return 'LocalWebWorker';
        }
        return `LocalWebWorker${this.affinity}`;
    }
}
export class RemoteRunningLocation {
    kind = 3 /* ExtensionHostKind.Remote */;
    affinity = 0;
    equals(other) {
        return (this.kind === other.kind);
    }
    asString() {
        return 'Remote';
    }
}
export class MissingExtensionDependency {
    dependency;
    constructor(dependency) {
        this.dependency = dependency;
    }
}
export var ExtensionHostKind;
(function (ExtensionHostKind) {
    ExtensionHostKind[ExtensionHostKind["LocalProcess"] = 1] = "LocalProcess";
    ExtensionHostKind[ExtensionHostKind["LocalWebWorker"] = 2] = "LocalWebWorker";
    ExtensionHostKind[ExtensionHostKind["Remote"] = 3] = "Remote";
})(ExtensionHostKind || (ExtensionHostKind = {}));
export function extensionHostKindToString(kind) {
    if (kind === null) {
        return 'None';
    }
    switch (kind) {
        case 1 /* ExtensionHostKind.LocalProcess */: return 'LocalProcess';
        case 2 /* ExtensionHostKind.LocalWebWorker */: return 'LocalWebWorker';
        case 3 /* ExtensionHostKind.Remote */: return 'Remote';
    }
}
export class ExtensionHostExtensions {
    _allExtensions;
    _myExtensions;
    constructor() {
        this._allExtensions = [];
        this._myExtensions = [];
    }
    toDelta() {
        return {
            toRemove: [],
            toAdd: this._allExtensions,
            myToRemove: [],
            myToAdd: this._myExtensions
        };
    }
    set(allExtensions, myExtensions) {
        const toRemove = [];
        const toAdd = [];
        const myToRemove = [];
        const myToAdd = [];
        const oldExtensionsMap = extensionDescriptionArrayToMap(this._allExtensions);
        const newExtensionsMap = extensionDescriptionArrayToMap(allExtensions);
        const extensionsAreTheSame = (a, b) => {
            return ((a.extensionLocation.toString() === b.extensionLocation.toString())
                || (a.isBuiltin === b.isBuiltin)
                || (a.isUserBuiltin === b.isUserBuiltin)
                || (a.isUnderDevelopment === b.isUnderDevelopment));
        };
        for (const oldExtension of this._allExtensions) {
            const newExtension = newExtensionsMap.get(ExtensionIdentifier.toKey(oldExtension.identifier));
            if (!newExtension) {
                toRemove.push(oldExtension.identifier);
                oldExtensionsMap.delete(ExtensionIdentifier.toKey(oldExtension.identifier));
                continue;
            }
            if (!extensionsAreTheSame(oldExtension, newExtension)) {
                // The new extension is different than the old one
                // (e.g. maybe it executes in a different location)
                toRemove.push(oldExtension.identifier);
                oldExtensionsMap.delete(ExtensionIdentifier.toKey(oldExtension.identifier));
                continue;
            }
        }
        for (const newExtension of allExtensions) {
            const oldExtension = oldExtensionsMap.get(ExtensionIdentifier.toKey(newExtension.identifier));
            if (!oldExtension) {
                toAdd.push(newExtension);
                continue;
            }
            if (!extensionsAreTheSame(oldExtension, newExtension)) {
                // The new extension is different than the old one
                // (e.g. maybe it executes in a different location)
                toRemove.push(oldExtension.identifier);
                oldExtensionsMap.delete(ExtensionIdentifier.toKey(oldExtension.identifier));
                continue;
            }
        }
        const myOldExtensionsSet = extensionIdentifiersArrayToSet(this._myExtensions);
        const myNewExtensionsSet = extensionIdentifiersArrayToSet(myExtensions);
        for (const oldExtensionId of this._myExtensions) {
            if (!myNewExtensionsSet.has(ExtensionIdentifier.toKey(oldExtensionId))) {
                myToRemove.push(oldExtensionId);
            }
        }
        for (const newExtensionId of myExtensions) {
            if (!myOldExtensionsSet.has(ExtensionIdentifier.toKey(newExtensionId))) {
                myToAdd.push(newExtensionId);
            }
        }
        const delta = { toRemove, toAdd, myToRemove, myToAdd };
        this.delta(delta);
        return delta;
    }
    delta(extensionsDelta) {
        const { toRemove, toAdd, myToRemove, myToAdd } = extensionsDelta;
        // First handle removals
        const toRemoveSet = extensionIdentifiersArrayToSet(toRemove);
        const myToRemoveSet = extensionIdentifiersArrayToSet(myToRemove);
        for (let i = 0; i < this._allExtensions.length; i++) {
            if (toRemoveSet.has(ExtensionIdentifier.toKey(this._allExtensions[i].identifier))) {
                this._allExtensions.splice(i, 1);
                i--;
            }
        }
        for (let i = 0; i < this._myExtensions.length; i++) {
            if (myToRemoveSet.has(ExtensionIdentifier.toKey(this._myExtensions[i]))) {
                this._myExtensions.splice(i, 1);
                i--;
            }
        }
        // Then handle additions
        for (const extension of toAdd) {
            this._allExtensions.push(extension);
        }
        for (const extensionId of myToAdd) {
            this._myExtensions.push(extensionId);
        }
    }
    containsExtension(extensionId) {
        for (const myExtensionId of this._myExtensions) {
            if (ExtensionIdentifier.equals(myExtensionId, extensionId)) {
                return true;
            }
        }
        return false;
    }
}
export class ExtensionIdentifierSet {
    [Symbol.toStringTag] = 'ExtensionIdentifierSet';
    _map = new Map();
    _toKey = ExtensionIdentifier.toKey;
    constructor(values) {
        if (values) {
            for (const value of values) {
                this.add(value);
            }
        }
    }
    get size() {
        return this._map.size;
    }
    add(value) {
        this._map.set(this._toKey(value), value);
        return this;
    }
    clear() {
        this._map.clear();
    }
    delete(value) {
        return this._map.delete(this._toKey(value));
    }
    has(value) {
        return this._map.has(this._toKey(value));
    }
    forEach(callbackfn, thisArg) {
        this._map.forEach(value => callbackfn.call(thisArg, value, value, this));
    }
    *entries() {
        for (const [_key, value] of this._map) {
            yield [value, value];
        }
    }
    keys() {
        return this._map.values();
    }
    values() {
        return this._map.values();
    }
    [Symbol.iterator]() {
        return this._map.values();
    }
}
export function extensionIdentifiersArrayToSet(extensionIds) {
    const result = new Set();
    for (const extensionId of extensionIds) {
        result.add(ExtensionIdentifier.toKey(extensionId));
    }
    return result;
}
function extensionDescriptionArrayToMap(extensions) {
    const result = new Map();
    for (const extension of extensions) {
        result.set(ExtensionIdentifier.toKey(extension.identifier), extension);
    }
    return result;
}
export function isProposedApiEnabled(extension, proposal) {
    if (!extension.enabledApiProposals) {
        return false;
    }
    return extension.enabledApiProposals.includes(proposal);
}
export function checkProposedApiEnabled(extension, proposal) {
    if (!isProposedApiEnabled(extension, proposal)) {
        throw new Error(`Extension '${extension.identifier.value}' CANNOT use API proposal: ${proposal}.\nIts package.json#enabledApiProposals-property declares: ${extension.enabledApiProposals?.join(', ') ?? '[]'} but NOT ${proposal}.\n The missing proposal MUST be added and you must start in extension development mode or use the following command line switch: --enable-proposed-api ${extension.identifier.value}`);
    }
}
export class ActivationTimes {
    codeLoadingTime;
    activateCallTime;
    activateResolvedTime;
    activationReason;
    constructor(codeLoadingTime, activateCallTime, activateResolvedTime, activationReason) {
        this.codeLoadingTime = codeLoadingTime;
        this.activateCallTime = activateCallTime;
        this.activateResolvedTime = activateResolvedTime;
        this.activationReason = activationReason;
    }
}
export class ExtensionPointContribution {
    description;
    value;
    constructor(description, value) {
        this.description = description;
        this.value = value;
    }
}
export const ExtensionHostLogFileName = 'exthost';
export const localExtHostLog = 'extHostLog';
export const remoteExtHostLog = 'remoteExtHostLog';
export const webWorkerExtHostLog = 'webWorkerExtHostLog';
export var ActivationKind;
(function (ActivationKind) {
    ActivationKind[ActivationKind["Normal"] = 0] = "Normal";
    ActivationKind[ActivationKind["Immediate"] = 1] = "Immediate";
})(ActivationKind || (ActivationKind = {}));
export function toExtension(extensionDescription) {
    return {
        type: extensionDescription.isBuiltin ? 0 /* ExtensionType.System */ : 1 /* ExtensionType.User */,
        isBuiltin: extensionDescription.isBuiltin || extensionDescription.isUserBuiltin,
        identifier: { id: getGalleryExtensionId(extensionDescription.publisher, extensionDescription.name), uuid: extensionDescription.uuid },
        manifest: extensionDescription,
        location: extensionDescription.extensionLocation,
        targetPlatform: extensionDescription.targetPlatform,
        validations: [],
        isValid: true
    };
}
export function toExtensionDescription(extension, isUnderDevelopment) {
    return {
        identifier: new ExtensionIdentifier(getExtensionId(extension.manifest.publisher, extension.manifest.name)),
        isBuiltin: extension.type === 0 /* ExtensionType.System */,
        isUserBuiltin: extension.type === 1 /* ExtensionType.User */ && extension.isBuiltin,
        isUnderDevelopment: !!isUnderDevelopment,
        extensionLocation: extension.location,
        ...extension.manifest,
        uuid: extension.identifier.uuid,
        targetPlatform: extension.targetPlatform,
        browserNlsBundleUris: extension.browserNlsBundleUris
    };
}
export class NullExtensionService {
    onDidRegisterExtensions = Event.None;
    onDidChangeExtensionsStatus = Event.None;
    onDidChangeExtensions = Event.None;
    onWillActivateByEvent = Event.None;
    onDidChangeResponsiveChange = Event.None;
    extensions = [];
    activateByEvent(_activationEvent) { return Promise.resolve(undefined); }
    activationEventIsDone(_activationEvent) { return false; }
    whenInstalledExtensionsRegistered() { return Promise.resolve(true); }
    getExtension() { return Promise.resolve(undefined); }
    readExtensionPointContributions(_extPoint) { return Promise.resolve(Object.create(null)); }
    getExtensionsStatus() { return Object.create(null); }
    getInspectPort(_extensionHostId, _tryEnableInspector) { return Promise.resolve(0); }
    getInspectPorts(_extensionHostKind, _tryEnableInspector) { return Promise.resolve([]); }
    stopExtensionHosts() { }
    async restartExtensionHost() { }
    async startExtensionHosts() { }
    async setRemoteEnvironment(_env) { }
    canAddExtension() { return false; }
    canRemoveExtension() { return false; }
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { basename, extUri } from 'vs/base/common/resources';
import { Range } from 'vs/editor/common/core/range';
import { MarkerSeverity, IMarkerData } from 'vs/platform/markers/common/markers';
import { isNonEmptyArray, flatten } from 'vs/base/common/arrays';
import { ResourceMap } from 'vs/base/common/map';
import { Emitter } from 'vs/base/common/event';
import { Hasher } from 'vs/base/common/hash';
import { withUndefinedAsNull } from 'vs/base/common/types';
import { splitLines } from 'vs/base/common/strings';
import { unsupportedSchemas } from 'vs/platform/markers/common/markerService';
export function compareMarkersByUri(a, b) {
    return extUri.compare(a.resource, b.resource);
}
function compareResourceMarkers(a, b) {
    const [firstMarkerOfA] = a.markers;
    const [firstMarkerOfB] = b.markers;
    let res = 0;
    if (firstMarkerOfA && firstMarkerOfB) {
        res = MarkerSeverity.compare(firstMarkerOfA.marker.severity, firstMarkerOfB.marker.severity);
    }
    if (res === 0) {
        res = a.path.localeCompare(b.path) || a.name.localeCompare(b.name);
    }
    return res;
}
export class ResourceMarkers {
    id;
    resource;
    path;
    name;
    _markersMap = new ResourceMap();
    _cachedMarkers;
    _total = 0;
    constructor(id, resource) {
        this.id = id;
        this.resource = resource;
        this.path = this.resource.fsPath;
        this.name = basename(this.resource);
    }
    get markers() {
        if (!this._cachedMarkers) {
            this._cachedMarkers = flatten([...this._markersMap.values()]).sort(ResourceMarkers._compareMarkers);
        }
        return this._cachedMarkers;
    }
    has(uri) {
        return this._markersMap.has(uri);
    }
    set(uri, marker) {
        this.delete(uri);
        if (isNonEmptyArray(marker)) {
            this._markersMap.set(uri, marker);
            this._total += marker.length;
            this._cachedMarkers = undefined;
        }
    }
    delete(uri) {
        const array = this._markersMap.get(uri);
        if (array) {
            this._total -= array.length;
            this._cachedMarkers = undefined;
            this._markersMap.delete(uri);
        }
    }
    get total() {
        return this._total;
    }
    static _compareMarkers(a, b) {
        return MarkerSeverity.compare(a.marker.severity, b.marker.severity)
            || extUri.compare(a.resource, b.resource)
            || Range.compareRangesUsingStarts(a.marker, b.marker);
    }
}
export class Marker {
    id;
    marker;
    relatedInformation;
    get resource() { return this.marker.resource; }
    get range() { return this.marker; }
    _lines;
    get lines() {
        if (!this._lines) {
            this._lines = splitLines(this.marker.message);
        }
        return this._lines;
    }
    constructor(id, marker, relatedInformation = []) {
        this.id = id;
        this.marker = marker;
        this.relatedInformation = relatedInformation;
    }
    toString() {
        return JSON.stringify({
            ...this.marker,
            resource: this.marker.resource.path,
            relatedInformation: this.relatedInformation.length ? this.relatedInformation.map(r => ({ ...r.raw, resource: r.raw.resource.path })) : undefined
        }, null, '\t');
    }
}
export class MarkerTableItem extends Marker {
    sourceMatches;
    codeMatches;
    messageMatches;
    fileMatches;
    ownerMatches;
    constructor(marker, sourceMatches, codeMatches, messageMatches, fileMatches, ownerMatches) {
        super(marker.id, marker.marker, marker.relatedInformation);
        this.sourceMatches = sourceMatches;
        this.codeMatches = codeMatches;
        this.messageMatches = messageMatches;
        this.fileMatches = fileMatches;
        this.ownerMatches = ownerMatches;
    }
}
export class RelatedInformation {
    id;
    marker;
    raw;
    constructor(id, marker, raw) {
        this.id = id;
        this.marker = marker;
        this.raw = raw;
    }
}
export class MarkersModel {
    cachedSortedResources = undefined;
    _onDidChange = new Emitter();
    onDidChange = this._onDidChange.event;
    get resourceMarkers() {
        if (!this.cachedSortedResources) {
            this.cachedSortedResources = [...this.resourcesByUri.values()].sort(compareResourceMarkers);
        }
        return this.cachedSortedResources;
    }
    resourcesByUri;
    constructor() {
        this.resourcesByUri = new Map();
    }
    reset() {
        const removed = new Set();
        for (const resourceMarker of this.resourcesByUri.values()) {
            removed.add(resourceMarker);
        }
        this.resourcesByUri.clear();
        this._total = 0;
        this._onDidChange.fire({ removed, added: new Set(), updated: new Set() });
    }
    _total = 0;
    get total() {
        return this._total;
    }
    getResourceMarkers(resource) {
        return withUndefinedAsNull(this.resourcesByUri.get(extUri.getComparisonKey(resource, true)));
    }
    setResourceMarkers(resourcesMarkers) {
        const change = { added: new Set(), removed: new Set(), updated: new Set() };
        for (const [resource, rawMarkers] of resourcesMarkers) {
            if (unsupportedSchemas.has(resource.scheme)) {
                continue;
            }
            const key = extUri.getComparisonKey(resource, true);
            let resourceMarkers = this.resourcesByUri.get(key);
            if (isNonEmptyArray(rawMarkers)) {
                // update, add
                if (!resourceMarkers) {
                    const resourceMarkersId = this.id(resource.toString());
                    resourceMarkers = new ResourceMarkers(resourceMarkersId, resource.with({ fragment: null }));
                    this.resourcesByUri.set(key, resourceMarkers);
                    change.added.add(resourceMarkers);
                }
                else {
                    change.updated.add(resourceMarkers);
                }
                const markersCountByKey = new Map();
                const markers = rawMarkers.map((rawMarker) => {
                    const key = IMarkerData.makeKey(rawMarker);
                    const index = markersCountByKey.get(key) || 0;
                    markersCountByKey.set(key, index + 1);
                    const markerId = this.id(resourceMarkers.id, key, index, rawMarker.resource.toString());
                    let relatedInformation = undefined;
                    if (rawMarker.relatedInformation) {
                        relatedInformation = rawMarker.relatedInformation.map((r, index) => new RelatedInformation(this.id(markerId, r.resource.toString(), r.startLineNumber, r.startColumn, r.endLineNumber, r.endColumn, index), rawMarker, r));
                    }
                    return new Marker(markerId, rawMarker, relatedInformation);
                });
                this._total -= resourceMarkers.total;
                resourceMarkers.set(resource, markers);
                this._total += resourceMarkers.total;
            }
            else if (resourceMarkers) {
                // clear
                this._total -= resourceMarkers.total;
                resourceMarkers.delete(resource);
                this._total += resourceMarkers.total;
                if (resourceMarkers.total === 0) {
                    this.resourcesByUri.delete(key);
                    change.removed.add(resourceMarkers);
                }
                else {
                    change.updated.add(resourceMarkers);
                }
            }
        }
        this.cachedSortedResources = undefined;
        if (change.added.size || change.removed.size || change.updated.size) {
            this._onDidChange.fire(change);
        }
    }
    id(...values) {
        const hasher = new Hasher();
        for (const value of values) {
            hasher.hash(value);
        }
        return `${hasher.value}`;
    }
    dispose() {
        this._onDidChange.dispose();
        this.resourcesByUri.clear();
    }
}

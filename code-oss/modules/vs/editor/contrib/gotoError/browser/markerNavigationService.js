/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { binarySearch } from 'vs/base/common/arrays';
import { Emitter } from 'vs/base/common/event';
import { DisposableStore, toDisposable } from 'vs/base/common/lifecycle';
import { LinkedList } from 'vs/base/common/linkedList';
import { compare } from 'vs/base/common/strings';
import { URI } from 'vs/base/common/uri';
import { Range } from 'vs/editor/common/core/range';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { IMarkerService, MarkerSeverity } from 'vs/platform/markers/common/markers';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
export class MarkerCoordinate {
    marker;
    index;
    total;
    constructor(marker, index, total) {
        this.marker = marker;
        this.index = index;
        this.total = total;
    }
}
let MarkerList = class MarkerList {
    _markerService;
    _configService;
    _onDidChange = new Emitter();
    onDidChange = this._onDidChange.event;
    _resourceFilter;
    _dispoables = new DisposableStore();
    _markers = [];
    _nextIdx = -1;
    constructor(resourceFilter, _markerService, _configService) {
        this._markerService = _markerService;
        this._configService = _configService;
        if (URI.isUri(resourceFilter)) {
            this._resourceFilter = uri => uri.toString() === resourceFilter.toString();
        }
        else if (resourceFilter) {
            this._resourceFilter = resourceFilter;
        }
        const compareOrder = this._configService.getValue('problems.sortOrder');
        const compareMarker = (a, b) => {
            let res = compare(a.resource.toString(), b.resource.toString());
            if (res === 0) {
                if (compareOrder === 'position') {
                    res = Range.compareRangesUsingStarts(a, b) || MarkerSeverity.compare(a.severity, b.severity);
                }
                else {
                    res = MarkerSeverity.compare(a.severity, b.severity) || Range.compareRangesUsingStarts(a, b);
                }
            }
            return res;
        };
        const updateMarker = () => {
            this._markers = this._markerService.read({
                resource: URI.isUri(resourceFilter) ? resourceFilter : undefined,
                severities: MarkerSeverity.Error | MarkerSeverity.Warning | MarkerSeverity.Info
            });
            if (typeof resourceFilter === 'function') {
                this._markers = this._markers.filter(m => this._resourceFilter(m.resource));
            }
            this._markers.sort(compareMarker);
        };
        updateMarker();
        this._dispoables.add(_markerService.onMarkerChanged(uris => {
            if (!this._resourceFilter || uris.some(uri => this._resourceFilter(uri))) {
                updateMarker();
                this._nextIdx = -1;
                this._onDidChange.fire();
            }
        }));
    }
    dispose() {
        this._dispoables.dispose();
        this._onDidChange.dispose();
    }
    matches(uri) {
        if (!this._resourceFilter && !uri) {
            return true;
        }
        if (!this._resourceFilter || !uri) {
            return false;
        }
        return this._resourceFilter(uri);
    }
    get selected() {
        const marker = this._markers[this._nextIdx];
        return marker && new MarkerCoordinate(marker, this._nextIdx + 1, this._markers.length);
    }
    _initIdx(model, position, fwd) {
        let found = false;
        let idx = this._markers.findIndex(marker => marker.resource.toString() === model.uri.toString());
        if (idx < 0) {
            idx = binarySearch(this._markers, { resource: model.uri }, (a, b) => compare(a.resource.toString(), b.resource.toString()));
            if (idx < 0) {
                idx = ~idx;
            }
        }
        for (let i = idx; i < this._markers.length; i++) {
            let range = Range.lift(this._markers[i]);
            if (range.isEmpty()) {
                const word = model.getWordAtPosition(range.getStartPosition());
                if (word) {
                    range = new Range(range.startLineNumber, word.startColumn, range.startLineNumber, word.endColumn);
                }
            }
            if (position && (range.containsPosition(position) || position.isBeforeOrEqual(range.getStartPosition()))) {
                this._nextIdx = i;
                found = true;
                break;
            }
            if (this._markers[i].resource.toString() !== model.uri.toString()) {
                break;
            }
        }
        if (!found) {
            // after the last change
            this._nextIdx = fwd ? 0 : this._markers.length - 1;
        }
        if (this._nextIdx < 0) {
            this._nextIdx = this._markers.length - 1;
        }
    }
    resetIndex() {
        this._nextIdx = -1;
    }
    move(fwd, model, position) {
        if (this._markers.length === 0) {
            return false;
        }
        const oldIdx = this._nextIdx;
        if (this._nextIdx === -1) {
            this._initIdx(model, position, fwd);
        }
        else if (fwd) {
            this._nextIdx = (this._nextIdx + 1) % this._markers.length;
        }
        else if (!fwd) {
            this._nextIdx = (this._nextIdx - 1 + this._markers.length) % this._markers.length;
        }
        if (oldIdx !== this._nextIdx) {
            return true;
        }
        return false;
    }
    find(uri, position) {
        let idx = this._markers.findIndex(marker => marker.resource.toString() === uri.toString());
        if (idx < 0) {
            return undefined;
        }
        for (; idx < this._markers.length; idx++) {
            if (Range.containsPosition(this._markers[idx], position)) {
                return new MarkerCoordinate(this._markers[idx], idx + 1, this._markers.length);
            }
        }
        return undefined;
    }
};
MarkerList = __decorate([
    __param(1, IMarkerService),
    __param(2, IConfigurationService)
], MarkerList);
export { MarkerList };
export const IMarkerNavigationService = createDecorator('IMarkerNavigationService');
let MarkerNavigationService = class MarkerNavigationService {
    _markerService;
    _configService;
    _serviceBrand;
    _provider = new LinkedList();
    constructor(_markerService, _configService) {
        this._markerService = _markerService;
        this._configService = _configService;
    }
    registerProvider(provider) {
        const remove = this._provider.unshift(provider);
        return toDisposable(() => remove());
    }
    getMarkerList(resource) {
        for (const provider of this._provider) {
            const result = provider.getMarkerList(resource);
            if (result) {
                return result;
            }
        }
        // default
        return new MarkerList(resource, this._markerService, this._configService);
    }
};
MarkerNavigationService = __decorate([
    __param(0, IMarkerService),
    __param(1, IConfigurationService)
], MarkerNavigationService);
registerSingleton(IMarkerNavigationService, MarkerNavigationService, 1 /* InstantiationType.Delayed */);

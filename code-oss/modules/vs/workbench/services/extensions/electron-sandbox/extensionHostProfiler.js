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
import { TernarySearchTree } from 'vs/base/common/ternarySearchTree';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { withNullAsUndefined } from 'vs/base/common/types';
import { Schemas } from 'vs/base/common/network';
import { URI } from 'vs/base/common/uri';
import { IV8InspectProfilingService } from 'vs/platform/profiling/common/profiling';
import { once } from 'vs/base/common/functional';
let ExtensionHostProfiler = class ExtensionHostProfiler {
    _port;
    _extensionService;
    _profilingService;
    constructor(_port, _extensionService, _profilingService) {
        this._port = _port;
        this._extensionService = _extensionService;
        this._profilingService = _profilingService;
    }
    async start() {
        const id = await this._profilingService.startProfiling({ port: this._port });
        return {
            stop: once(async () => {
                const profile = await this._profilingService.stopProfiling(id);
                await this._extensionService.whenInstalledExtensionsRegistered();
                const extensions = this._extensionService.extensions;
                return this._distill(profile, extensions);
            })
        };
    }
    _distill(profile, extensions) {
        const searchTree = TernarySearchTree.forUris();
        for (const extension of extensions) {
            if (extension.extensionLocation.scheme === Schemas.file) {
                searchTree.set(URI.file(extension.extensionLocation.fsPath), extension);
            }
        }
        const nodes = profile.nodes;
        const idsToNodes = new Map();
        const idsToSegmentId = new Map();
        for (const node of nodes) {
            idsToNodes.set(node.id, node);
        }
        function visit(node, segmentId) {
            if (!segmentId) {
                switch (node.callFrame.functionName) {
                    case '(root)':
                        break;
                    case '(program)':
                        segmentId = 'program';
                        break;
                    case '(garbage collector)':
                        segmentId = 'gc';
                        break;
                    default:
                        segmentId = 'self';
                        break;
                }
            }
            else if (segmentId === 'self' && node.callFrame.url) {
                let extension;
                try {
                    extension = searchTree.findSubstr(URI.parse(node.callFrame.url));
                }
                catch {
                    // ignore
                }
                if (extension) {
                    segmentId = extension.identifier.value;
                }
            }
            idsToSegmentId.set(node.id, segmentId);
            if (node.children) {
                for (const child of node.children) {
                    const childNode = idsToNodes.get(child);
                    if (childNode) {
                        visit(childNode, segmentId);
                    }
                }
            }
        }
        visit(nodes[0], null);
        const samples = profile.samples || [];
        const timeDeltas = profile.timeDeltas || [];
        const distilledDeltas = [];
        const distilledIds = [];
        let currSegmentTime = 0;
        let currSegmentId;
        for (let i = 0; i < samples.length; i++) {
            const id = samples[i];
            const segmentId = idsToSegmentId.get(id);
            if (segmentId !== currSegmentId) {
                if (currSegmentId) {
                    distilledIds.push(currSegmentId);
                    distilledDeltas.push(currSegmentTime);
                }
                currSegmentId = withNullAsUndefined(segmentId);
                currSegmentTime = 0;
            }
            currSegmentTime += timeDeltas[i];
        }
        if (currSegmentId) {
            distilledIds.push(currSegmentId);
            distilledDeltas.push(currSegmentTime);
        }
        return {
            startTime: profile.startTime,
            endTime: profile.endTime,
            deltas: distilledDeltas,
            ids: distilledIds,
            data: profile,
            getAggregatedTimes: () => {
                const segmentsToTime = new Map();
                for (let i = 0; i < distilledIds.length; i++) {
                    const id = distilledIds[i];
                    segmentsToTime.set(id, (segmentsToTime.get(id) || 0) + distilledDeltas[i]);
                }
                return segmentsToTime;
            }
        };
    }
};
ExtensionHostProfiler = __decorate([
    __param(1, IExtensionService),
    __param(2, IV8InspectProfilingService)
], ExtensionHostProfiler);
export { ExtensionHostProfiler };

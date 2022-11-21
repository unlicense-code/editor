/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { basename } from 'vs/base/common/path';
import { TernarySearchTree } from 'vs/base/common/ternarySearchTree';
import { URI } from 'vs/base/common/uri';
import { Utils } from 'vs/platform/profiling/common/profiling';
import { buildModel, BottomUpNode, processNode } from 'vs/platform/profiling/common/profilingModel';
export function create() {
    return new ProfileAnalysisWorker();
}
class ProfileAnalysisWorker {
    _requestHandlerBrand;
    analyseBottomUp(profile) {
        if (!Utils.isValidProfile(profile)) {
            return { kind: 1 /* ProfilingOutput.Irrelevant */, samples: [] };
        }
        const model = buildModel(profile);
        const samples = bottomUp(model, 5, false)
            .filter(s => !s.isSpecial);
        if (samples.length === 0 || samples[1].percentage < 10) {
            // ignore this profile because 90% of the time is spent inside "special" frames
            // like idle, GC, or program
            return { kind: 1 /* ProfilingOutput.Irrelevant */, samples: [] };
        }
        return { kind: 2 /* ProfilingOutput.Interesting */, samples };
    }
    analyseByUrlCategory(profile, categories) {
        // build search tree
        const searchTree = TernarySearchTree.forUris();
        searchTree.fill(categories);
        // cost by categories
        const model = buildModel(profile);
        const aggegrateByCategory = new Map();
        for (const node of model.nodes) {
            const loc = model.locations[node.locationId];
            let category;
            try {
                category = searchTree.findSubstr(URI.parse(loc.callFrame.url));
            }
            catch {
                // ignore
            }
            if (!category) {
                category = printCallFrame(loc.callFrame, false);
            }
            const value = aggegrateByCategory.get(category) ?? 0;
            const newValue = value + node.selfTime;
            aggegrateByCategory.set(category, newValue);
        }
        const result = [];
        for (const [key, value] of aggegrateByCategory) {
            result.push([key, value]);
        }
        return result;
    }
}
function isSpecial(call) {
    return call.functionName.startsWith('(') && call.functionName.endsWith(')');
}
function printCallFrame(frame, fullPaths) {
    let result = frame.functionName || '(anonymous)';
    if (frame.url) {
        result += '#';
        result += fullPaths ? frame.url : basename(frame.url);
        if (frame.lineNumber >= 0) {
            result += ':';
            result += frame.lineNumber + 1;
        }
    }
    return result;
}
function bottomUp(model, topN, fullPaths = false) {
    const root = BottomUpNode.root();
    for (const node of model.nodes) {
        processNode(root, node, model);
        root.addNode(node);
    }
    const result = Object.values(root.children)
        .sort((a, b) => b.selfTime - a.selfTime)
        .slice(0, topN);
    const samples = [];
    for (const node of result) {
        const sample = {
            selfTime: Math.round(node.selfTime / 1000),
            totalTime: Math.round(node.aggregateTime / 1000),
            location: printCallFrame(node.callFrame, fullPaths),
            url: node.callFrame.url,
            caller: [],
            percentage: Math.round(node.selfTime / (model.duration / 100)),
            isSpecial: isSpecial(node.callFrame)
        };
        // follow the heaviest caller paths
        const stack = [node];
        while (stack.length) {
            const node = stack.pop();
            let top;
            for (const candidate of Object.values(node.children)) {
                if (!top || top.selfTime < candidate.selfTime) {
                    top = candidate;
                }
            }
            if (top) {
                const percentage = Math.round(top.selfTime / (node.selfTime / 100));
                sample.caller.push({ percentage, location: printCallFrame(top.callFrame, false) });
                stack.push(top);
            }
        }
        samples.push(sample);
    }
    return samples;
}

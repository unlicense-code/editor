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
import { Emitter } from 'vs/base/common/event';
import { Iterable } from 'vs/base/common/iterator';
import { Disposable } from 'vs/base/common/lifecycle';
import { isDefined } from 'vs/base/common/types';
import { ByLocationTestItemElement } from 'vs/workbench/contrib/testing/browser/explorerProjections/hierarchalNodes';
import { TestItemTreeElement, TestTreeErrorMessage } from 'vs/workbench/contrib/testing/browser/explorerProjections/index';
import { NodeChangeList, peersHaveChildren } from 'vs/workbench/contrib/testing/browser/explorerProjections/nodeHelper';
import { refreshComputedState } from 'vs/workbench/contrib/testing/common/getComputedState';
import { ITestResultService } from 'vs/workbench/contrib/testing/common/testResultService';
import { ITestService } from 'vs/workbench/contrib/testing/common/testService';
import { TestId } from 'vs/workbench/contrib/testing/common/testId';
const computedStateAccessor = {
    getOwnState: i => i instanceof TestItemTreeElement ? i.ownState : 0 /* TestResultState.Unset */,
    getCurrentComputedState: i => i.state,
    setComputedState: (i, s) => i.state = s,
    getCurrentComputedDuration: i => i.duration,
    getOwnDuration: i => i instanceof TestItemTreeElement ? i.ownDuration : undefined,
    setComputedDuration: (i, d) => i.duration = d,
    getChildren: i => Iterable.filter(i.children.values(), (t) => t instanceof TestItemTreeElement),
    *getParents(i) {
        for (let parent = i.parent; parent; parent = parent.parent) {
            yield parent;
        }
    },
};
/**
 * Projection that lists tests in their traditional tree view.
 */
let HierarchicalByLocationProjection = class HierarchicalByLocationProjection extends Disposable {
    lastState;
    testService;
    results;
    updateEmitter = new Emitter();
    changes = new NodeChangeList();
    items = new Map();
    /**
     * Gets root elements of the tree.
     */
    get roots() {
        const rootsIt = Iterable.map(this.testService.collection.rootItems, r => this.items.get(r.item.extId));
        return Iterable.filter(rootsIt, isDefined);
    }
    /**
     * @inheritdoc
     */
    onUpdate = this.updateEmitter.event;
    constructor(lastState, testService, results) {
        super();
        this.lastState = lastState;
        this.testService = testService;
        this.results = results;
        this._register(testService.onDidProcessDiff((diff) => this.applyDiff(diff)));
        // when test results are cleared, recalculate all state
        this._register(results.onResultsChanged((evt) => {
            if (!('removed' in evt)) {
                return;
            }
            for (const inTree of [...this.items.values()].sort((a, b) => b.depth - a.depth)) {
                const lookup = this.results.getStateById(inTree.test.item.extId)?.[1];
                inTree.ownDuration = lookup?.ownDuration;
                refreshComputedState(computedStateAccessor, inTree, lookup?.ownComputedState ?? 0 /* TestResultState.Unset */).forEach(this.addUpdated);
            }
            this.updateEmitter.fire();
        }));
        // when test states change, reflect in the tree
        this._register(results.onTestChanged(ev => {
            let result = ev.item;
            if (result.ownComputedState === 0 /* TestResultState.Unset */) {
                const fallback = results.getStateById(result.item.extId);
                if (fallback) {
                    result = fallback[1];
                }
            }
            const item = this.items.get(result.item.extId);
            if (!item) {
                return;
            }
            // Skip refreshing the duration if we can trivially tell it didn't change.
            const refreshDuration = ev.reason === 1 /* TestResultItemChangeReason.OwnStateChange */ && ev.previousOwnDuration !== result.ownDuration;
            // For items without children, always use the computed state. They are
            // either leaves (for which it's fine) or nodes where we haven't expanded
            // children and should trust whatever the result service gives us.
            const explicitComputed = item.children.size ? undefined : result.computedState;
            item.retired = !!result.retired;
            item.ownState = result.ownComputedState;
            item.ownDuration = result.ownDuration;
            refreshComputedState(computedStateAccessor, item, explicitComputed, refreshDuration).forEach(this.addUpdated);
            this.addUpdated(item);
            this.updateEmitter.fire();
        }));
        for (const test of testService.collection.all) {
            this.storeItem(this.createItem(test));
        }
    }
    /**
     * Gets the depth of children to expanded automatically for the node,
     */
    getRevealDepth(element) {
        return element.depth === 0 ? 0 : undefined;
    }
    /**
     * @inheritdoc
     */
    getElementByTestId(testId) {
        return this.items.get(testId);
    }
    /**
     * @inheritdoc
     */
    applyDiff(diff) {
        for (const op of diff) {
            switch (op.op) {
                case 0 /* TestDiffOpType.Add */: {
                    const item = this.createItem(op.item);
                    this.storeItem(item);
                    break;
                }
                case 1 /* TestDiffOpType.Update */: {
                    const patch = op.item;
                    const existing = this.items.get(patch.extId);
                    if (!existing) {
                        break;
                    }
                    // parent needs to be re-rendered on an expand update, so that its
                    // children are rewritten.
                    const needsParentUpdate = existing.test.expand === 0 /* TestItemExpandState.NotExpandable */ && patch.expand;
                    existing.update(patch);
                    if (needsParentUpdate) {
                        this.changes.addedOrRemoved(existing);
                    }
                    else {
                        this.changes.updated(existing);
                    }
                    break;
                }
                case 3 /* TestDiffOpType.Remove */: {
                    const toRemove = this.items.get(op.itemId);
                    if (!toRemove) {
                        break;
                    }
                    this.changes.addedOrRemoved(toRemove);
                    const queue = [[toRemove]];
                    while (queue.length) {
                        for (const item of queue.pop()) {
                            if (item instanceof ByLocationTestItemElement) {
                                queue.push(this.unstoreItem(this.items, item));
                            }
                        }
                    }
                }
            }
        }
        if (diff.length !== 0) {
            this.updateEmitter.fire();
        }
    }
    /**
     * @inheritdoc
     */
    applyTo(tree) {
        this.changes.applyTo(tree, this.renderNode, () => this.roots);
    }
    /**
     * @inheritdoc
     */
    expandElement(element, depth) {
        if (!(element instanceof ByLocationTestItemElement)) {
            return;
        }
        if (element.test.expand === 0 /* TestItemExpandState.NotExpandable */) {
            return;
        }
        this.testService.collection.expand(element.test.item.extId, depth);
    }
    createItem(item) {
        const parentId = TestId.parentId(item.item.extId);
        const parent = parentId ? this.items.get(parentId) : null;
        return new ByLocationTestItemElement(item, parent, n => this.changes.addedOrRemoved(n));
    }
    addUpdated = (item) => {
        const cast = item;
        this.changes.updated(cast);
    };
    renderNode = (node, recurse) => {
        if (node instanceof TestTreeErrorMessage) {
            return { element: node };
        }
        if (node.depth === 0) {
            // Omit the test controller root if there are no siblings
            if (!peersHaveChildren(node, () => this.roots)) {
                return 1 /* NodeRenderDirective.Concat */;
            }
            // Omit roots that have no child tests
            if (node.children.size === 0) {
                return 0 /* NodeRenderDirective.Omit */;
            }
        }
        return {
            element: node,
            collapsible: node.test.expand !== 0 /* TestItemExpandState.NotExpandable */,
            collapsed: this.lastState.expanded[node.test.item.extId] !== undefined
                ? !this.lastState.expanded[node.test.item.extId]
                : node.depth > 0,
            children: recurse(node.children),
        };
    };
    unstoreItem(items, treeElement) {
        const parent = treeElement.parent;
        parent?.children.delete(treeElement);
        items.delete(treeElement.test.item.extId);
        if (parent instanceof ByLocationTestItemElement) {
            refreshComputedState(computedStateAccessor, parent, undefined, !!treeElement.duration).forEach(this.addUpdated);
        }
        return treeElement.children;
    }
    storeItem(treeElement) {
        treeElement.parent?.children.add(treeElement);
        this.items.set(treeElement.test.item.extId, treeElement);
        this.changes.addedOrRemoved(treeElement);
        const reveal = this.getRevealDepth(treeElement);
        if (reveal !== undefined || this.lastState.expanded[treeElement.test.item.extId]) {
            this.expandElement(treeElement, reveal || 0);
        }
        const prevState = this.results.getStateById(treeElement.test.item.extId)?.[1];
        if (prevState) {
            treeElement.retired = !!prevState.retired;
            treeElement.ownState = prevState.computedState;
            treeElement.ownDuration = prevState.ownDuration;
            refreshComputedState(computedStateAccessor, treeElement, undefined, !!treeElement.ownDuration).forEach(this.addUpdated);
        }
    }
};
HierarchicalByLocationProjection = __decorate([
    __param(1, ITestService),
    __param(2, ITestResultService)
], HierarchicalByLocationProjection);
export { HierarchicalByLocationProjection };

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { TestTreeErrorMessage } from 'vs/workbench/contrib/testing/browser/explorerProjections/index';
export const testIdentityProvider = {
    getId(element) {
        return element.treeId + '\0' + (element instanceof TestTreeErrorMessage ? 'error' : element.test.expand);
    }
};
/**
 * Removes nodes from the set whose parents don't exist in the tree. This is
 * useful to remove nodes that are queued to be updated or rendered, who will
 * be rendered by a call to setChildren.
 */
export const pruneNodesWithParentsNotInTree = (nodes, tree) => {
    for (const node of nodes) {
        if (node && node.parent && !tree.hasElement(node.parent)) {
            nodes.delete(node);
        }
    }
};
/**
 * Returns whether there are any children for other nodes besides this one
 * in the tree.
 *
 * This is used for omitting test provider nodes if there's only a single
 * test provider in the workspace (the common case)
 */
export const peersHaveChildren = (node, roots) => {
    for (const child of node.parent ? node.parent.children : roots()) {
        if (child !== node && child.children.size) {
            return true;
        }
    }
    return false;
};
export var NodeRenderDirective;
(function (NodeRenderDirective) {
    /** Omit node and all its children */
    NodeRenderDirective[NodeRenderDirective["Omit"] = 0] = "Omit";
    /** Concat children with parent */
    NodeRenderDirective[NodeRenderDirective["Concat"] = 1] = "Concat";
})(NodeRenderDirective || (NodeRenderDirective = {}));
const pruneNodesNotInTree = (nodes, tree) => {
    for (const node of nodes) {
        if (node && !tree.hasElement(node)) {
            nodes.delete(node);
        }
    }
};
/**
 * Helper to gather and bulk-apply tree updates.
 */
export class NodeChangeList {
    changedParents = new Set();
    updatedNodes = new Set();
    omittedNodes = new WeakSet();
    isFirstApply = true;
    updated(node) {
        this.updatedNodes.add(node);
    }
    addedOrRemoved(node) {
        this.changedParents.add(this.getNearestNotOmittedParent(node));
    }
    applyTo(tree, renderNode, roots) {
        pruneNodesNotInTree(this.changedParents, tree);
        pruneNodesNotInTree(this.updatedNodes, tree);
        const diffDepth = this.isFirstApply ? Infinity : 0;
        this.isFirstApply = false;
        for (let parent of this.changedParents) {
            while (parent && typeof renderNode(parent, () => []) !== 'object') {
                parent = parent.parent;
            }
            if (parent === null || tree.hasElement(parent)) {
                tree.setChildren(parent, this.renderNodeList(renderNode, parent === null ? roots() : parent.children), { diffIdentityProvider: testIdentityProvider, diffDepth });
            }
        }
        for (const node of this.updatedNodes) {
            if (tree.hasElement(node)) {
                tree.rerender(node);
            }
        }
        this.changedParents.clear();
        this.updatedNodes.clear();
    }
    getNearestNotOmittedParent(node) {
        let parent = node && node.parent;
        while (parent && this.omittedNodes.has(parent)) {
            parent = parent.parent;
        }
        return parent;
    }
    *renderNodeList(renderNode, nodes) {
        for (const node of nodes) {
            const rendered = renderNode(node, this.renderNodeList.bind(this, renderNode));
            if (rendered === 0 /* NodeRenderDirective.Omit */) {
                this.omittedNodes.add(node);
            }
            else if (rendered === 1 /* NodeRenderDirective.Concat */) {
                this.omittedNodes.add(node);
                if ('children' in node) {
                    for (const nested of this.renderNodeList(renderNode, node.children)) {
                        yield nested;
                    }
                }
            }
            else {
                this.omittedNodes.delete(node);
                yield rendered;
            }
        }
    }
}

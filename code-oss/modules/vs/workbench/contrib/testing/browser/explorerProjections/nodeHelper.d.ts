import { IIdentityProvider } from 'vs/base/browser/ui/list/list';
import { ObjectTree } from 'vs/base/browser/ui/tree/objectTree';
import { ITreeElement } from 'vs/base/browser/ui/tree/tree';
import { IActionableTestTreeElement, TestExplorerTreeElement, TestItemTreeElement } from 'vs/workbench/contrib/testing/browser/explorerProjections/index';
export declare const testIdentityProvider: IIdentityProvider<TestExplorerTreeElement>;
/**
 * Removes nodes from the set whose parents don't exist in the tree. This is
 * useful to remove nodes that are queued to be updated or rendered, who will
 * be rendered by a call to setChildren.
 */
export declare const pruneNodesWithParentsNotInTree: <T extends TestItemTreeElement>(nodes: Set<T | null>, tree: ObjectTree<TestExplorerTreeElement, any>) => void;
/**
 * Returns whether there are any children for other nodes besides this one
 * in the tree.
 *
 * This is used for omitting test provider nodes if there's only a single
 * test provider in the workspace (the common case)
 */
export declare const peersHaveChildren: (node: IActionableTestTreeElement, roots: () => Iterable<IActionableTestTreeElement>) => boolean;
export declare const enum NodeRenderDirective {
    /** Omit node and all its children */
    Omit = 0,
    /** Concat children with parent */
    Concat = 1
}
export declare type NodeRenderFn = (n: TestExplorerTreeElement, recurse: (items: Iterable<TestExplorerTreeElement>) => Iterable<ITreeElement<TestExplorerTreeElement>>) => ITreeElement<TestExplorerTreeElement> | NodeRenderDirective;
/**
 * Helper to gather and bulk-apply tree updates.
 */
export declare class NodeChangeList<T extends TestItemTreeElement> {
    private changedParents;
    private updatedNodes;
    private omittedNodes;
    private isFirstApply;
    updated(node: TestExplorerTreeElement): void;
    addedOrRemoved(node: TestExplorerTreeElement): void;
    applyTo(tree: ObjectTree<TestExplorerTreeElement, any>, renderNode: NodeRenderFn, roots: () => Iterable<T>): void;
    private getNearestNotOmittedParent;
    private renderNodeList;
}

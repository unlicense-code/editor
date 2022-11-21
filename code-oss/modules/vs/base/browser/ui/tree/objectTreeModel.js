/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { IndexTreeModel } from 'vs/base/browser/ui/tree/indexTreeModel';
import { TreeError } from 'vs/base/browser/ui/tree/tree';
import { Iterable } from 'vs/base/common/iterator';
export class ObjectTreeModel {
    user;
    rootRef = null;
    model;
    nodes = new Map();
    nodesByIdentity = new Map();
    identityProvider;
    sorter;
    onDidSplice;
    onDidChangeCollapseState;
    onDidChangeRenderNodeCount;
    get size() { return this.nodes.size; }
    constructor(user, list, options = {}) {
        this.user = user;
        this.model = new IndexTreeModel(user, list, null, options);
        this.onDidSplice = this.model.onDidSplice;
        this.onDidChangeCollapseState = this.model.onDidChangeCollapseState;
        this.onDidChangeRenderNodeCount = this.model.onDidChangeRenderNodeCount;
        if (options.sorter) {
            this.sorter = {
                compare(a, b) {
                    return options.sorter.compare(a.element, b.element);
                }
            };
        }
        this.identityProvider = options.identityProvider;
    }
    setChildren(element, children = Iterable.empty(), options = {}) {
        const location = this.getElementLocation(element);
        this._setChildren(location, this.preserveCollapseState(children), options);
    }
    _setChildren(location, children = Iterable.empty(), options) {
        const insertedElements = new Set();
        const insertedElementIds = new Set();
        const onDidCreateNode = (node) => {
            if (node.element === null) {
                return;
            }
            const tnode = node;
            insertedElements.add(tnode.element);
            this.nodes.set(tnode.element, tnode);
            if (this.identityProvider) {
                const id = this.identityProvider.getId(tnode.element).toString();
                insertedElementIds.add(id);
                this.nodesByIdentity.set(id, tnode);
            }
            options.onDidCreateNode?.(tnode);
        };
        const onDidDeleteNode = (node) => {
            if (node.element === null) {
                return;
            }
            const tnode = node;
            if (!insertedElements.has(tnode.element)) {
                this.nodes.delete(tnode.element);
            }
            if (this.identityProvider) {
                const id = this.identityProvider.getId(tnode.element).toString();
                if (!insertedElementIds.has(id)) {
                    this.nodesByIdentity.delete(id);
                }
            }
            options.onDidDeleteNode?.(tnode);
        };
        this.model.splice([...location, 0], Number.MAX_VALUE, children, { ...options, onDidCreateNode, onDidDeleteNode });
    }
    preserveCollapseState(elements = Iterable.empty()) {
        if (this.sorter) {
            elements = [...elements].sort(this.sorter.compare.bind(this.sorter));
        }
        return Iterable.map(elements, treeElement => {
            let node = this.nodes.get(treeElement.element);
            if (!node && this.identityProvider) {
                const id = this.identityProvider.getId(treeElement.element).toString();
                node = this.nodesByIdentity.get(id);
            }
            if (!node) {
                return {
                    ...treeElement,
                    children: this.preserveCollapseState(treeElement.children)
                };
            }
            const collapsible = typeof treeElement.collapsible === 'boolean' ? treeElement.collapsible : node.collapsible;
            const collapsed = typeof treeElement.collapsed !== 'undefined' ? treeElement.collapsed : node.collapsed;
            return {
                ...treeElement,
                collapsible,
                collapsed,
                children: this.preserveCollapseState(treeElement.children)
            };
        });
    }
    rerender(element) {
        const location = this.getElementLocation(element);
        this.model.rerender(location);
    }
    updateElementHeight(element, height) {
        const location = this.getElementLocation(element);
        this.model.updateElementHeight(location, height);
    }
    resort(element = null, recursive = true) {
        if (!this.sorter) {
            return;
        }
        const location = this.getElementLocation(element);
        const node = this.model.getNode(location);
        this._setChildren(location, this.resortChildren(node, recursive), {});
    }
    resortChildren(node, recursive, first = true) {
        let childrenNodes = [...node.children];
        if (recursive || first) {
            childrenNodes = childrenNodes.sort(this.sorter.compare.bind(this.sorter));
        }
        return Iterable.map(childrenNodes, node => ({
            element: node.element,
            collapsible: node.collapsible,
            collapsed: node.collapsed,
            children: this.resortChildren(node, recursive, false)
        }));
    }
    getFirstElementChild(ref = null) {
        const location = this.getElementLocation(ref);
        return this.model.getFirstElementChild(location);
    }
    getLastElementAncestor(ref = null) {
        const location = this.getElementLocation(ref);
        return this.model.getLastElementAncestor(location);
    }
    has(element) {
        return this.nodes.has(element);
    }
    getListIndex(element) {
        const location = this.getElementLocation(element);
        return this.model.getListIndex(location);
    }
    getListRenderCount(element) {
        const location = this.getElementLocation(element);
        return this.model.getListRenderCount(location);
    }
    isCollapsible(element) {
        const location = this.getElementLocation(element);
        return this.model.isCollapsible(location);
    }
    setCollapsible(element, collapsible) {
        const location = this.getElementLocation(element);
        return this.model.setCollapsible(location, collapsible);
    }
    isCollapsed(element) {
        const location = this.getElementLocation(element);
        return this.model.isCollapsed(location);
    }
    setCollapsed(element, collapsed, recursive) {
        const location = this.getElementLocation(element);
        return this.model.setCollapsed(location, collapsed, recursive);
    }
    expandTo(element) {
        const location = this.getElementLocation(element);
        this.model.expandTo(location);
    }
    refilter() {
        this.model.refilter();
    }
    getNode(element = null) {
        if (element === null) {
            return this.model.getNode(this.model.rootRef);
        }
        const node = this.nodes.get(element);
        if (!node) {
            throw new TreeError(this.user, `Tree element not found: ${element}`);
        }
        return node;
    }
    getNodeLocation(node) {
        return node.element;
    }
    getParentNodeLocation(element) {
        if (element === null) {
            throw new TreeError(this.user, `Invalid getParentNodeLocation call`);
        }
        const node = this.nodes.get(element);
        if (!node) {
            throw new TreeError(this.user, `Tree element not found: ${element}`);
        }
        const location = this.model.getNodeLocation(node);
        const parentLocation = this.model.getParentNodeLocation(location);
        const parent = this.model.getNode(parentLocation);
        return parent.element;
    }
    getElementLocation(element) {
        if (element === null) {
            return [];
        }
        const node = this.nodes.get(element);
        if (!node) {
            throw new TreeError(this.user, `Tree element not found: ${element}`);
        }
        return this.model.getNodeLocation(node);
    }
}
